import {CLOUD} from "../cloud/cloudAPI";
import {LOG, LOGe} from "../logging/Log";
import {FileUtil} from "./FileUtil";
import {Languages} from "../Languages";
import {core} from "../Core";
import {xUtil} from "./StandAloneUtil";
import {ALWAYS_DFU_UPDATE_BOOTLOADER, ALWAYS_DFU_UPDATE_FIRMWARE} from "../ExternalConfig";

const RNFS = require('react-native-fs');
const sha1 = require('sha-1');

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("DfuUtil", key)(a,b,c,d,e);
}


let RELEASE_NOTES_ERROR = lang("Could_not_download_releas");
let RELEASE_NOTES_NA    = lang("Release_notes_not_availab");

export const DfuUtil = {
  getFirmwareInformation: function(version, hardwareVersion) {
    return CLOUD.getFirmwareDetails(version, hardwareVersion, false)
      .then((result) => {
        if (result === null) {
          throw new Error("No firmware available.");
        }
        return result;
      })
  },

  getBootloaderInformation: function(version, hardwareVersion) {
    return CLOUD.getBootloaderDetails(version, hardwareVersion, false)
      .then((result) => {
        if (result === null) {
          throw new Error("No bootloader available.");
        }
        return result;
      })
  },

  downloadFirmware: function(firmwareCandidate) {
    return _download(firmwareCandidate,'firmware');
  },

  downloadBootloader: function(bootloaderCandidate) {
    return _download(bootloaderCandidate,'bootloader');
  },

  getReleaseNotes: function(sphereId, userConfig : UserData) {
    let updateData = DfuUtil.getUpdatableStones(sphereId);

    let highestFirmwareVersion = Object.keys(updateData.versionsObj).sort((a,b) => { return a > b ? -1 : 1 })[0]
    let hardwareVersion        = updateData.versionsObj[highestFirmwareVersion];

    return DfuUtil.getFirmwareInformation(highestFirmwareVersion, hardwareVersion)
      .then((newFirmwareDetails) => {
        let releaseNotes = newFirmwareDetails.releaseNotes;
        if (typeof releaseNotes === 'object') {
          // the first hit should be the locale of the user, then fallback on english, then fallback on the first key (if no keys exist)
          let userLanguage = Languages.activeLocale;
          releaseNotes = releaseNotes[userLanguage.split("_")[0]] ||
                         releaseNotes['en'] ||
                         releaseNotes[Object.keys(releaseNotes)[0]];
        }
        // final fallback, release notes not available.
        releaseNotes = releaseNotes ||
                       RELEASE_NOTES_NA;
        return {notes:releaseNotes, version: highestFirmwareVersion};
      })
      .catch((err) => {
        LOGe.dfu("DfuUtil: Could not download release notes...", err?.message);
        let errorMessage = RELEASE_NOTES_ERROR;
        if (userConfig.firmwareVersionsAvailable[hardwareVersion.substr(0,11)] === undefined) {
          errorMessage += "\nNo firmware available form hardwareVersion: " + hardwareVersion + "\n"
        }
        if (userConfig.bootloaderVersionsAvailable[hardwareVersion.substr(0,11)] === undefined) {
          errorMessage += "\nNo bootloader available form hardwareVersion: " + hardwareVersion + "\n"
        }

        return {notes:errorMessage, version: null};
      })
  },

  getUpdatableStones: function(sphereId) : {stones: {[key:string]: any}, amountOfStones: number, versionsObj: any}  {
    let state = core.store.getState();
    let stones = state.spheres[sphereId].stones;
    let stoneIds = Object.keys(stones);

    let updatableStones = {};
    let versionsAvailable = {};
    stoneIds.forEach((stoneId) => {
      let stone = stones[stoneId];
      if (!stone.config.hardwareVersion) { return; }

      let availableFW = state.user.firmwareVersionsAvailable[stone.config.hardwareVersion.substr(0,11)];
      if (!availableFW) { return; }

      if (xUtil.versions.isLower(stone.config.firmwareVersion, availableFW) || ALWAYS_DFU_UPDATE_BOOTLOADER || ALWAYS_DFU_UPDATE_FIRMWARE) {
        if (versionsAvailable[availableFW] === undefined) {
          versionsAvailable[availableFW] = stone.config.hardwareVersion;
        }
        updatableStones[stoneId] = stone;
      }
    });

    return { stones: updatableStones, amountOfStones: Object.keys(updatableStones).length, versionsObj: versionsAvailable };
  }
}

function _download(sourceDetails, type) {
  // set path depending on ios or android
  let toPath = FileUtil.getPath(type + '.zip');

  // remove the file we will write to if it exists
  return FileUtil.safeDeleteFile(toPath)
    .then(() => {
      return CLOUD.downloadFile(sourceDetails.downloadUrl, toPath, {
        start: (data) => {
          LOG.dfu("DfuUtil: start DOWNLOAD", data);
        },
        progress: (data) => {
          LOG.dfu("DfuUtil: progress DOWNLOAD", data);
        },
        success: (data) => {
          LOG.dfu("DfuUtil: success DOWNLOAD", data);
        },
      })
    })
    .then((resultPath) => {
      LOG.dfu("DfuUtil: Downloaded file", resultPath);
      return RNFS.readFile(resultPath, 'ascii');
    })
    .then((fileContent) => {
      return new Promise((resolve, reject) => {
        let hash = sha1(fileContent);
        LOG.dfu("DfuUtil:", type, "HASH", '"' + hash + '"', '"' + sourceDetails.sha1hash + '"');
        if (hash === sourceDetails.sha1hash) {
          LOG.dfu("DfuUtil: Verified hash");
          resolve(toPath);
        }
        else {
          return FileUtil.safeDeleteFile(toPath)
            .then(() => {  reject(new Error("Invalid hash"));})
            .catch(() => { reject(new Error("Invalid hash"));});
        }
      })
    })
    .catch((err) => {
      LOGe.dfu("DfuUtil: Could not download file", err?.message);
      return FileUtil.safeDeleteFile(toPath)
        .catch(() => { throw err; })
        .then(() => { throw err; })
    })
}

