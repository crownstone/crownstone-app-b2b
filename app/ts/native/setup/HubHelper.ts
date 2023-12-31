import { LOG, LOGi, LOGw } from "../../logging/Log";
import { CLOUD }                 from '../../cloud/cloudAPI'
import { Scheduler } from "../../logic/Scheduler";
import { MapProvider } from "../../backgroundProcesses/MapProvider";
import { HubReplyError} from "../../Enums";
import { core } from "../../Core";
import { xUtil } from "../../util/StandAloneUtil";
import { DataUtil } from "../../util/DataUtil";
import { Get } from "../../util/GetUtil";
import { connectTo } from "../../logic/constellation/Tellers";
import { CommandAPI } from "../../logic/constellation/Commander";
import { CodedTypedError, CodedError } from "../../util/Errors";
import { HubTransferNext } from "../../cloud/sections/newSync/transferrers/HubTransferNext";
import {SyncNext} from "../../cloud/sections/newSync/SyncNext";


const networkError = 'network_error';

export class HubHelper {
  /**
   * This will setup a hub. It requires the linked stone object to be setupped already.
   * @param sphereId
   * @param name // this name is shared with the stone object that we linked to it.
   * @returns {Promise<T>}
   */
  setup(sphereId, stoneId: string) : Promise<{ hubId: string, cloudId: string }> {
    LOGi.info("HubHelper: setup called", sphereId, stoneId);
    return this._setup(sphereId, stoneId, true);
  }

  setUartKey(sphereId, stoneId: string) : Promise<{ hubId: string, cloudId: string }> {
    LOGi.info("HubHelper: setup setUartKey", sphereId, stoneId);
    try {
      return this._setup(sphereId, stoneId, false);
    }
    catch (err : any) {
      // in case the hub advertention is lying and the hub is not setup, set it up now.
      if (err?.code === 3 && err?.errorType === HubReplyError.IN_SETUP_MODE) {
        LOGw.info("Setting up the hub now, the advertisment was lying...");
        return this._setup(sphereId, stoneId, true);
      }
      else { throw err; }
    }
  }

  async _setup(sphereId, stoneId: string, createHubOnline: boolean) : Promise<{ hubId: string, cloudId: string }> {
    // this will ignore things like tap to toggle and location based triggers so they do not interrupt.
    let stone = Get.stone(sphereId, stoneId);
    let handle = stone.config.handle;
    if (!stone) {
      throw new CodedError(1,"Invalid stone.");
    }
    if (!stone.config.handle) {
      throw new CodedError(2, "No handle.");
    }

    let uartKey = null;
    let hubToken = null;
    let hubCloudId = null;
    let hubId = xUtil.getUUID();
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 24 / 20 });
    // download UART key from this stone in the cloud
    let keyData = await CLOUD.getKeys(sphereId, stoneId);
    if (keyData.length === 1) {
      let stoneKeys = keyData[0].stoneKeys[stone.config.cloudId] || [];
      for (let i = 0; i < stoneKeys.length; i++) {
        if (stoneKeys[i].keyType === "UART_DEVICE_KEY") {
          uartKey = stoneKeys[i].key;
          break;
        }
      }
    }

    if (!uartKey) {
      throw new CodedError(10,"No Uart Key available.");
    }
    // we now have everything we need to create a hub.
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 26 / 20 });
    if (createHubOnline) {
      // generate token
      hubToken = xUtil.getHubHexToken();
      // Create hub in cloud
      let hubData = await CLOUD.forSphere(sphereId).createHub({
        token: hubToken,
        name: stone.config.name,
        linkedStoneId: stone.config.cloudId,
        locationId: stone.config.locationId
      });
      core.store.dispatch({
        type: "ADD_HUB",
        sphereId,
        hubId: hubId,
        data: { cloudId: hubData.id, linkedStoneId: stoneId, locationId: stone.config.locationId }
      })
      hubCloudId = hubData.id;
    }
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 28 / 20 });

    let commander = await connectTo(handle);
    LOG.info("hubSetupProgress: connected");
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 30 / 20 });
    if (createHubOnline) {
      LOG.info("hubSetupProgress: token and sphereId being prepared...");
      let tokenResult = await commander.transferHubTokenAndCloudId(hubToken, hubCloudId);
      core.eventBus.emit("setupInProgress", { handle: handle, progress: 32 / 20 });
      if (tokenResult.type === 'error') {
        try { await CLOUD.deleteHub(hubCloudId); } catch (e) {}
        core.store.dispatch({type: "REMOVE_HUB", sphereId, hubId: hubId});
        throw new CodedTypedError(15, tokenResult.errorType,"Something went wrong during the transferHubTokenAndCloudId");
      }
      LOG.info("hubSetupProgress: token and sphereId has been transferrred");
    }

    if (!createHubOnline) {
      LOG.info("hubSetupProgress: Requesting cloud Id...");
      let requestedData = await commander.requestCloudId();
      if (requestedData.type === 'error') {
        throw new CodedTypedError(3,requestedData.errorType,"Something went wrong while requesting CloudId " + JSON.stringify(requestedData) );
      }
      hubCloudId = requestedData.message;
    }
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 34 / 20 });

    await commander.setUartKey(uartKey);
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 36 / 20 });
    await commander.end();
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 38 / 20 });

    if (!createHubOnline) {
      hubId = await this._setLocalHub(sphereId, stoneId, hubCloudId);
    }

    core.eventBus.emit("setupInProgress", { handle: handle, progress: 39 / 20 });
    await Scheduler.delay(3000, 'wait for hub to initialize');
    core.eventBus.emit("setupInProgress", { handle: handle, progress: 40 / 20 });
    await Scheduler.delay(500, 'wait for hub to initialize');

    await SyncNext.partialSphereSync(sphereId, "HUBS");

    return { hubId: hubId, cloudId: hubCloudId };
  }


  /**
   * this method will ask the hub for it's cloud id. It will then do the following:
   * _setLocalHub
   * @param sphereId
   * @param stoneId
   */
  async createLocalHubInstance(sphereId, stoneId: string) : Promise<string> {
    // this will ignore things like tap to toggle and location based triggers so they do not interrupt.
    let stone = Get.stone(sphereId, stoneId);
    let handle = stone.config.handle;
    if (!stone)               { throw new CodedError(1, "Invalid stone."); }
    if (!stone.config.handle) { throw new CodedError(2, "No handle.");     }
    let hubCloudId = null;

    // we now have everything we need to create a hub.
    let api : CommandAPI;
    try {
      api = await connectTo(handle);
      LOG.info("hubSetupProgress: Requesting cloud Id...");
      let hubId;
      try {
        let requestedData = await api.requestCloudId();
        if (requestedData.type === 'error') {
          throw new CodedTypedError(3, requestedData.errorType, "Something went wrong while requesting CloudId");
        }
        hubCloudId = requestedData.message;
        hubId = await this._setLocalHub(sphereId, stoneId, hubCloudId);
      }
      catch (err : any) {
        if (err?.message === "HUB_REPLY_TIMEOUT") {
          hubId = xUtil.getUUID();
          core.store.dispatch({
            type:"ADD_HUB", sphereId, hubId,
            data: { cloudId: null, linkedStoneId: stoneId }
          });
        }
        else {
          throw err;
        }
      }
      return hubId;
    }
    finally {
      if (api) { await api.end(); }
    }
  }


  /**
   * 1 - Check if we have a hub with this ID in our local database.
   * 2 - if 1 fails, Check if we have access to this cloud id in the cloud.
   * 3 - if 1 and 2 fail, Create a entry in our local database to apply the hub data to. else create local entry with the corresponding cloud data.
   * @param sphereId
   * @param stoneId
   * @param hubCloudId
   */
  async _setLocalHub(sphereId, stoneId, hubCloudId) {
    let hubId = xUtil.getUUID();
    let type : ACTION_TYPE = "ADD_HUB";

    if (!hubCloudId) {
      core.store.dispatch({
        type, sphereId, hubId,
        data: { cloudId: null, linkedStoneId: stoneId }
      });
      return hubId;
    }
    LOG.info("Check if the hub is already in our database...");
    let existingHub = DataUtil.getHubByCloudId(sphereId, hubCloudId);
    LOG.info(existingHub);
    if (existingHub) {
      type = "UPDATE_HUB_CONFIG";
      hubId = existingHub.id;
    }

    try {
        LOG.info("Check if we have access to that hub in the cloud...");
        let hubData = await CLOUD.getHub(hubCloudId);
        // it must be in the same sphere in order for this to work.
        if (hubData.sphereId === (MapProvider.local2cloudMap.spheres[sphereId] || sphereId)) {
          core.store.dispatch({
            type, sphereId, hubId,
            data: type === "ADD_HUB" ? HubTransferNext.mapCloudToLocal(hubData) : {
              cloudId: hubCloudId,
              linkedStoneId: stoneId
            }
          });
        }
        else {
          throw new Error("DIFFERENT_SPHERE");
        }
    }
    catch (e) {
      LOG.info("Nope. we dont have it.",e);
      core.store.dispatch({
        type, sphereId, hubId,
        data: { cloudId: null, linkedStoneId: stoneId }
      });
    }
    return hubId;
  }


  async factoryResetHub(sphereId, stoneId) : Promise<void> {
    let stone = Get.stone(sphereId, stoneId);
    let handle = stone.config.handle;
    let api : CommandAPI;
    try {
      LOG.info("hubFactoryResetProgress: connecting");
      api = await connectTo(handle);
      LOG.info("hubFactoryResetProgress: connected");

      LOG.info("hubFactoryResetProgress: Factory resetting...");
      let result = await api.factoryResetHub();
      if (result.type === 'error') {
        throw new CodedTypedError(3,result.errorType,"Something went wrong while resetting hub" );
      }

      await Scheduler.delay(2000, 'wait for hub to initialize');
    }
    finally {
      if (api) { await api.end(); }
    }



    // we load the setup into the promise manager with priority so we are not interrupted
  }

  async factoryResetHubOnly(sphereId, stoneId) : Promise<void> {
    let stone = Get.stone(sphereId, stoneId);
    let handle = stone.config.handle;

    let api : CommandAPI;
    try {
      LOG.info("hubFactoryResetHubONLYProgress: connecting");
      api = await connectTo(handle);

      LOG.info("hubFactoryResetHubONLYProgress: connected");
      LOG.info("hubFactoryResetHubONLYProgress: Factory resetting hub only...");
      let result = await api.factoryResetHubOnly();
      if (result.type === 'error') {
        throw new CodedTypedError(3, result.errorType,"Something went wrong while resetting hub only." );
      }
      await Scheduler.delay(2000, 'wait for hub to initialize');
    }
    finally {
      if (api) { await api.end(); }
    }
  }

  async getCloudIdFromHub(sphereId, stoneId) : Promise<string> {
    let stone = Get.stone(sphereId, stoneId);
    let handle = stone.config.handle;

    let api : CommandAPI;
    try {
      LOG.info("getCloudIdFromHub: connecting");
      api = await connectTo(handle);

      LOG.info("getCloudIdFromHub: connected");
      LOG.info("getCloudIdFromHub: Requesting cloud Id...");
      let result = await api.requestCloudId();
      if (result.type === 'error') {
        throw new CodedTypedError(3,result.errorType,"Something went wrong while getting CloudId");
      }
      LOG.info("getCloudIdFromHub: disconnecting");
      return result.message;
    }
    finally {
      if (api) { await api.end(); }
    }
  }

}
