import {NETWORK_REQUEST_TIMEOUT, SILENCE_CLOUD} from '../ExternalConfig'
import {LOG, LOGe, LOGi} from '../logging/Log'
import {prepareEndpointAndBody, prepareHeaders} from "./cloudUtil";
import {defaultHeaders} from './sections/cloudApiBase'
import {Scheduler} from "../logic/Scheduler";
import {xUtil} from "../util/StandAloneUtil";
import {FileUtil} from "../util/FileUtil";
import {CloudAddresses} from "../backgroundProcesses/indirections/CloudAddresses";

const RNFS = require('react-native-fs');
let emptyFunction = function() {};


let downloadIndex = 0;

/**
 * This method communicates with the cloud services.
 *
 * @param options        // { endPoint: '/users/', data: JSON, type:'body'/'query' }
 * @param method
 * @param headers
 * @param id
 * @param accessToken
 * @param doNotStringify
 */
export async function request(
  options : any,
  method : string,
  headers : HeaderObject = defaultHeaders,
  id : string,
  accessToken : string,
  doNotStringify? : boolean) : Promise<CloudResponse<any>> {
  // append _accessToken, data that goes into the query and insert ids
  let { endPoint, body } = prepareEndpointAndBody(options, id, doNotStringify);

  headers = prepareHeaders(options, headers, accessToken);

  // setup the request configuration
  let requestConfig = { method, headers, body };

  let logToken = xUtil.getToken();


  let url = endPoint;
  if (endPoint.substr(0,4) !== 'http') {
    url = CloudAddresses.cloud_v1 + endPoint;
  }

  LOG.cloud(method,"requesting from URL:", url, "config:", requestConfig, logToken);

  // the actual request
  return new Promise((resolve, reject) => {
    // this will eliminate all cloud requests.
    if (SILENCE_CLOUD === true) {
      throw new Error("Cloud Disabled due to SILENCE_CLOUD == true. Set this to false in ExternalConfig.js to turn the cloud back on.");
    }

    let requestDidTimeout = false;
    let finishedRequest = false;


    // add a timeout for the fetching of data.
    let cancelFallbackCallback = Scheduler.scheduleCallback(() => {
      requestDidTimeout = true;
      if (finishedRequest !== true)
        reject(new Error('Network ' + method + ' request to ' + url + ' failed by timeout'))
    }, NETWORK_REQUEST_TIMEOUT,'NETWORK_REQUEST_TIMEOUT');


    let responseHandler = new ResponseHandler();
    let failedRequest = false;
    fetch(url, requestConfig as any)
      .catch((connectionError) => {
        if (requestDidTimeout === false) {
          cancelFallbackCallback();
          failedRequest = true;
          reject(new Error('Network request to ' + url + ' failed'));
        }
      })
      .then((response) => {
        if (requestDidTimeout === false && failedRequest == false) {
          cancelFallbackCallback();
          return responseHandler.handle(response);
        }
      })
      .catch((parseError) => {
        // TODO: cleanly fix this
        LOGe.cloud("ERROR DURING PARSING:", parseError, "from request to:", CloudAddresses.cloud_v1 + endPoint, "using config:", requestConfig);
        return '';
      })
      .then((parsedResponse) => {
        if (requestDidTimeout === false && failedRequest == false) {
          LOG.cloud("REPLY from", endPoint, " is: ", {status: responseHandler.status, data: parsedResponse}, logToken);
          finishedRequest = true;
          resolve({status: responseHandler.status, data: parsedResponse});
        }
      })
      .catch((err) => {
        if (requestDidTimeout === false) {
          finishedRequest = true;
          reject(err);
        }
      })
  });
}

export class ResponseHandler {
  status = 0;

  async handle(response) {
    this.status = response.status;
    if (response &&
      response.headers &&
      response.headers.map &&
      response.headers.map['content-type'] &&
      response.headers.map['content-type'].length > 0) {

      // since RN 0.57, the response seems to have changed from what it was before. Presumably due to changes in Fetch.
      // This could also be part of our cloud changes, this will work for both types of data now.
      let responseHeaders = response.headers.map['content-type'];
      if (!Array.isArray(responseHeaders) && typeof responseHeaders === 'string') {
        responseHeaders = responseHeaders.split("; ");
      }

      if (response && response._bodyBlob && response._bodyBlob.size === 0) {
        return '';
      }
      // this part: responseHeaders[0].substr(0,16) === 'application/json' is legacy. It's ugly and imprecise, but we will keep it for legacy for now.
      else if (responseHeaders[0].substr(0,16) === 'application/json' || responseHeaders.indexOf("application/json") !== -1) {
        if (response.headers.map['content-length'] &&
          response.headers.map['content-length'].length > 0 &&
          response.headers.map['content-length'][0] == 0) {
          // LOGd.info("Error: JSON-CONTENT IS EMPTY", response);
          return response.json(); // this is a promise
        }
        // LOGd.info("JSON CONTENT", response);
        return response.json(); // this is a promise
      }
      else {
        return response.text();
      }
    }
    return response.text(); // this is a promise
  }
}

/**
 * 
 * @param options
 * @param id
 * @param accessToken
 * @param toPath
 * @param beginCallback
 * @param progressCallback
 * @param successCallback
 * @returns {Promise}
 */
export function download(options, id, accessToken, toPath, beginCallback = emptyFunction, progressCallback = emptyFunction, successCallback = emptyFunction) {
  // append _accessToken, data that goes into the query and insert ids
  let {endPoint} = prepareEndpointAndBody(options, id);

  let headers = prepareHeaders(options, defaultHeaders, accessToken);

  // this will automatically try to download to a temp file. When not possible it will remove the temp file and resolve with null
  return downloadFile(CloudAddresses.cloud_v1 + endPoint, toPath, headers, {begin: beginCallback, progress: progressCallback, success: successCallback});
}

export async function downloadFile(url, targetPath, headers : HeaderObject, callbacks) {
  return new Promise(async (resolve, reject) => {
    // get a temp path
    let downloadSessionId = downloadIndex++ + "_DOWNLOAD_TEMP_FILE"
    let tempFilename = downloadSessionId + '.tmp';
    let tempPath = FileUtil.getPath(tempFilename);
    tempPath = 'file://' + tempPath.replace("file://","");
    targetPath = 'file://' + targetPath.replace("file://","");

    // ensure the tempfile does not exist
    await FileUtil.safeDeleteFile(tempPath);

    LOGi.cloud('CloudCore:DownloadFile: ',downloadSessionId,'download requesting from URL:', url, 'temp:', tempPath, 'target:', targetPath);

    // download the file.
    RNFS.downloadFile({
      headers: headers,
      fromUrl: url,
      toFile: tempPath,
      begin: callbacks.begin,
      progress: callbacks.progress
    }).promise
      .then((status) => {
        if (status.statusCode !== 200) {
          // remove the temp file if the download failed
          return FileUtil.safeDeleteFile(tempPath)
            .then(() => {
              LOGi.cloud('CloudCore:DownloadFile:',downloadSessionId,' Download was not status 200:', status);
              callbacks.success();
              resolve(null);
            })
            .catch((err) => {
              LOGe.cloud("CloudCore:DownloadFile:",downloadSessionId," Could not delete file", tempPath, ' err:', err?.message);
              throw err;
            });
        }
        else {
          return FileUtil.safeMoveFile(tempPath, targetPath)
            .then(() => {
              // if we have renamed the file, we resolve the promise so we can store the changed filename.
              LOGi.cloud('CloudCore:DownloadFile:',downloadSessionId,' Downloaded file successfully:', targetPath);
              callbacks.success();
              resolve(targetPath);
            })
            .catch((err) => {
              LOGe.cloud("CloudCore:DownloadFile:",downloadSessionId," Could not move file", tempPath, ' to ', targetPath, 'err:', err?.message);
              throw err;
            });
        }
      })
      .catch((err) => {
        LOGe.cloud("CloudCore:DownloadFile: ",downloadSessionId,"Could not download file err:", err?.message);
        FileUtil.safeDeleteFile(tempPath).catch((err) => { LOGe.cloud("CloudCore:DownloadFile: ",downloadSessionId," Could not delete file", tempPath, 'err:', err?.message); });
        reject(err);
      })
  });
}

