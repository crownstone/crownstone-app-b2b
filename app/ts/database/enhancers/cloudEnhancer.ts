import { CLOUD }                       from '../../cloud/cloudAPI'
import { Util }                        from '../../util/Util'
import { LOGd, LOGi, LOGv, LOGe, LOGw} from '../../logging/Log'
import { Permissions}                  from "../../backgroundProcesses/PermissionManager";
import { LOG_LEVEL}                    from "../../logging/LogLevels";
import { MapProvider}                  from "../../backgroundProcesses/MapProvider";
import { core }                        from "../../Core";
import { BATCH }                       from "../reducers/BatchReducer";
import { PICTURE_GALLERY_TYPES }       from "../../views/scenesViews/constants/SceneConstants";
import { LocationTransferNext }        from "../../cloud/sections/newSync/transferrers/LocationTransferNext";
import { HubTransferNext }             from "../../cloud/sections/newSync/transferrers/HubTransferNext";
import { BehaviourTransferNext }       from "../../cloud/sections/newSync/transferrers/BehaviourTransferNext";
import { SceneTransferNext }           from "../../cloud/sections/newSync/transferrers/SceneTransferNext";
import { SphereTransferNext }          from "../../cloud/sections/newSync/transferrers/SphereTransferNext";
import { UserTransferNext }            from "../../cloud/sections/newSync/transferrers/UserTransferNext";
import { StoneTransferNext }           from "../../cloud/sections/newSync/transferrers/StoneTransferNext";
import { SyncNext }                    from "../../cloud/sections/newSync/SyncNext";
import { Get }                         from "../../util/GetUtil";
import { FingerprintTransferNext }     from "../../cloud/sections/newSync/transferrers/FingerprintTransferNext";
import { MessageReadTransferNext }     from "../../cloud/sections/newSync/transferrers/MessageReadTransferNext";
import { MessageDeletedTransferNext }  from "../../cloud/sections/newSync/transferrers/MessageDeletedTransferNext";
import { MessageTransferNext } from "../../cloud/sections/newSync/transferrers/MessageTransferNext";
import {STREAM_FULL_LOGS} from "../../ExternalConfig";

export function CloudEnhancer({ getState }) {
  return (next) => (action) => {
    let highestLogLevel = 0;
    if (action.type === BATCH && action.payload && Array.isArray(action.payload)) {
      for (let i = 0; i < action.payload.length; i++) {
        if (action.payload[i].__logLevel) { highestLogLevel = Math.max(action.payload[i].__logLevel); }
      }
    }
    else {
      highestLogLevel = action.__logLevel;
    }
    if (STREAM_FULL_LOGS) {
      LOGi.store('will dispatch', action);
    }
    else {
      switch (highestLogLevel) {
        case LOG_LEVEL.verbose:
          LOGv.store('will dispatch', action); break;
        case LOG_LEVEL.debug:
          LOGd.store('will dispatch', action); break;
        case LOG_LEVEL.info:
          LOGi.store('will dispatch', action); break;
        case LOG_LEVEL.warning:
          LOGw.store('will dispatch', action); break;
        case LOG_LEVEL.error:
          LOGe.store('will dispatch', action); break;
        case LOG_LEVEL.none:
          break;
        default:
          LOGi.store('will dispatch', action);
      }
    }

    // required for some of the actions
    let oldState = getState();

    // Call the next dispatch method in the middleware chain.
    let returnValue = next(action);

    // state after update
    let newState = getState();

    //LOGd.info("isNew state:", getState())
    if (action.type === BATCH && action.payload && Array.isArray(action.payload)) {
      action.payload.forEach((action) => {
        handleAction(action, returnValue, newState, oldState);
      })
    }
    else {
      handleAction(action, returnValue, newState, oldState);
    }
    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  }
}

function handleAction(action : DatabaseAction, returnValue, newState, oldState) {
  // do not sync actions that have been triggered BY the cloud sync mechanism.
  if (action.__triggeredBySync === true || action.__test === true || action.__purelyLocal === true || action.__noEvents === true) {
    return returnValue;
  }

  switch (action.type) {
    case 'USER_APPEND':
      break;
    case 'USER_UPDATE':
      handleUserInCloud(action, newState);
      break;


    case 'ADD_SCENE':
    case 'UPDATE_SCENE':
      handleSceneInCloud(action, newState, oldState);
      break;
    case 'REMOVE_SCENE':
      removeSceneInCloud(action, newState, oldState);
      break;

    case 'ADD_STONE':
    case 'UPDATE_STONE_CONFIG':
    // case 'UPDATE_MESH_NETWORK_ID':
      handleStoneInCloud(action, newState);
      break;
    case 'UPDATE_STONE_LOCATION':
      handleStoneLocationUpdateInCloud(action, newState, oldState);
      break;
    case 'UPDATE_LOCATION_CONFIG':
      handleLocationInCloud(action, newState, oldState);
      break;
    case 'SET_SPHERE_TIMEZONE':
    case 'SET_SPHERE_GPS_COORDINATES':
    case 'UPDATE_SPHERE_CONFIG':
      handleSphereInCloud(action, newState);
      break;
    case 'UPDATE_SPHERE_USER':
      handleSphereUserInCloud(action, newState);
      break;

    case 'USER_EXIT_LOCATION':
      handleUserLocationExit(action, newState);
      break;
    case 'USER_ENTER_LOCATION':
      handleUserLocationEnter(action, newState);
      break;
    case 'UPDATE_DEVICE_CONFIG':
      handleDeviceInCloud(action, newState);
      break;

    case 'ADD_STONE_BEHAVIOUR':
    case 'UPDATE_STONE_BEHAVIOUR':
    case 'MARK_STONE_BEHAVIOUR_FOR_DELETION':
      handleBehaviourInCloud(action, newState);
      break;
    case 'REMOVE_STONE_BEHAVIOUR':
      removeBehaviourInCloud(action, newState, oldState);
      break;
    case 'REMOVE_ALL_BEHAVIOURS_OF_STONE':
      removeAllBehavioursForStoneInCloud(action, newState);
      break;

    case "UPDATE_STONE_STATE":
      handleStoneState(action, newState, oldState);
      break;
    case "UPDATE_STONE_SWITCH_STATE":
      handleStoneState(action, newState, oldState, true);
      break;

    case "ADD_MESSAGE":
      handleMessageAdd(action, newState); break;
    case "REMOVE_MESSAGE":
      handleMessageRemove(action, newState, oldState); break;
    case "MARK_MESSAGE_AS_READ":
      handleMessageMarkedAsRead(action, newState); break;
    case "MARK_MESSAGE_AS_DELETED":
      handleMessageMarkedAsDeleted(action, newState); break;

    case "ADD_INSTALLATION":
    case "UPDATE_INSTALLATION_CONFIG":
      handleInstallation(action, newState);
      break;

    case "SET_SPHERE_STATE":
      handleSphereStateOnDevice(action, newState);
      break;

    case "UPDATE_HUB_CONFIG":
    case "UPDATE_HUB_LOCATION":
      handleHubUpdate(action, newState);
      break;


    case "MARK_ABILITY_AS_SYNCED":
      handleAbilityUpdate(action, newState);
      break;


    case 'ADD_FINGERPRINT_V2':
      // create fingerprint
      createFingerprint(action, newState);
      break;
    case 'UPDATE_FINGERPRINT_V2':
      // update fingerprint
      updateFingerprint(action, newState);
      break;
    case 'REMOVE_ALL_FINGERPRINTS_V2':
      // delete events for all fingerprints
      deleteAllFingerprints(action, oldState);
      break;
    case 'REMOVE_FINGERPRINT_V2':
      deleteFingerprint(action, oldState);
      break;

  }
}


function createFingerprint(action : DatabaseAction, newState) {
  let fingerprint = Get.fingerprint(action.sphereId, action.locationId, action.fingerprintId);
  if (!fingerprint.createdByUser || !fingerprint.createdOnDeviceType) { return; }

  FingerprintTransferNext.createOnCloud(action.sphereId, action.locationId, fingerprint).catch();


}


function updateFingerprint(action : DatabaseAction, newState) {
  let fingerprint = Get.fingerprint(action.sphereId, action.locationId, action.fingerprintId);
  if (!fingerprint?.cloudId) { return; }
  if (!fingerprint.createdByUser || !fingerprint.createdOnDeviceType) { return; }

  FingerprintTransferNext.updateOnCloud(action.sphereId, fingerprint).catch();
}


function deleteFingerprint(action : { type: "REMOVE_ALL_FINGERPRINTS_V2" | "REMOVE_FINGERPRINT_V2", sphereId: sphereId, locationId: locationId, fingerprintId?: fingerprintId } | DatabaseAction, oldState) {
  let existingSphere = oldState.spheres[action.sphereId];
  if (!existingSphere) {
    return; }
  let existingLocation = existingSphere.locations[action.locationId];
  if (!existingLocation) {
    return;
  }

  const fireRemovalEvent = (localFingerprintId, cloudFingerprintId) => {
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_REMOVE_FINGERPRINTS',
      eventId: 'remove'+ localFingerprintId,
      data: {
        localId: localFingerprintId,
        locationId: action.locationId,
        sphereId: action.sphereId,
        cloudId: cloudFingerprintId,
      }
    });
  }

  if (action.type === "REMOVE_ALL_FINGERPRINTS_V2") {
    let fingerprints = existingLocation.fingerprints.raw;
    for (let fingerprintId in fingerprints) {
      if (fingerprints[fingerprintId].cloudId) {
        fireRemovalEvent(fingerprints[fingerprintId].id, fingerprints[fingerprintId].cloudId);
      }
    }
  }
  else {
    let deletedFingerprint = existingLocation.fingerprints.raw[action.fingerprintId];

    if (deletedFingerprint && deletedFingerprint.cloudId) {
      fireRemovalEvent(action.fingerprintId, deletedFingerprint.cloudId);
    }
  }

}


function deleteAllFingerprints(action: DatabaseAction, oldState) {
  let existingSphere = oldState.spheres[action.sphereId];
  if (!existingSphere) { return; }

  for (let locationId in existingSphere.locations) {
    let location = existingSphere.locations[locationId];
    for (let fingerprintId in location.fingerprints.raw) {
      deleteFingerprint({sphereId: action.sphereId, locationId: locationId, fingerprintId: fingerprintId}, oldState);
    }
  }
}


function handleHubUpdate(action : DatabaseAction, state) {
  let sphere = state.spheres[action.sphereId];
  if (!sphere) { return; }
  let hub = sphere.hubs[action.hubId] as HubData;
  if (hub && hub.config.cloudId) {
    CLOUD.updateHub(hub.config.cloudId, HubTransferNext.mapLocalToCloud(hub))
      .then((updatedHub) => {
        if (
          hub.config.ipAddress !== updatedHub.localIPAddress ||
          hub.config.httpPort  !== updatedHub.httpPort       ||
          hub.config.httpsPort !== updatedHub.httpsPort) {
            core.store.dispatch({
              type:"UPDATE_HUB_CONFIG",
              __purelyLocal: true,
              sphereId: action.sphereId,
              hubId: action.hubId,
              data: {
                ipAddress: updatedHub.localIPAddress,
                httpPort:  updatedHub.httpPort,
                httpsPort: updatedHub.httpsPort,
                updatedAt: new Date(updatedHub.updatedAt).valueOf()
              }
            });
        }
      })
  }
}


function handleAbilityUpdate(action: DatabaseAction, state) {
  let sphere = state.spheres[action.sphereId];
  if (!sphere) { return; }
  let stone = sphere.stones[action.stoneId];
  if (stone && stone.config.cloudId) {
    SyncNext.partialStoneSync(action.stoneId, "ABILITIES")
      .catch((err) => {})
  }
}


// user in this case is self, the owner of the phone
function handleUserInCloud(action: DatabaseAction, state) {
  if (action.data.picture) {
    // in case the user has a pending delete profile picture request, we will finish this immediately so a new
    // picture will not be deleted.
    core.eventBus.emit("submitCloudEvent",{type: 'FINISHED_SPECIAL_USER', id: 'removeProfilePicture' });
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_SPECIAL_USER',
      eventId: 'uploadProfilePicture',
      data: { specialType: 'uploadProfilePicture' }
    });
  }
  else if (action.data.picture === null) {
    core.eventBus.emit("submitCloudEvent",{type: 'FINISHED_SPECIAL_USER', id: 'uploadProfilePicture' });
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_SPECIAL_USER',
      eventId: 'removeProfilePicture',
      data: { specialType: 'removeProfilePicture' }
    });
  }

  UserTransferNext.updateOnCloud(state.user).catch(() => {});
}



function handleStoneInCloud(action: DatabaseAction, state) {
  _handleStone(action, state);
}

function _handleStone(action: DatabaseAction, state) {
  if (!Permissions.inSphere(action.sphereId).canUpdateCrownstone) { return; }

  let sphere = state.spheres[action.sphereId];
  let stone  = sphere.stones[action.stoneId];

  StoneTransferNext.updateOnCloud(action.sphereId, stone)
    .catch(() => {});
}

function handleStoneLocationUpdateInCloud(action: DatabaseAction, state, oldState) {
  let sphereId   = action.sphereId;
  let stoneId    = action.stoneId;
  let locationId = action.data.locationId;

  if (MapProvider.local2cloudMap.locations[locationId] === undefined) {
    // console.log("NO CLOUD ID FOR THIS ENTRY");
    // the location is not synced to the cloud yet... We should wait for a sync to properly handle this.
    return;
  }

  let stone = Get.stone(sphereId, stoneId);
  if (!stone) { return; }

  StoneTransferNext.updateOnCloud(action.sphereId, stone)
}


function handleLocationInCloud(action: DatabaseAction, state, oldState) {
  let locationBeforeAction = oldState.spheres?.[action.sphereId]?.locations?.[action.locationId] || {config: {}};
  if (action.data.picture && action.data.pictureSource === "CUSTOM") {
    // in case the user has a pending delete location picture request, we will finish this immediately so a new
    // picture will not be deleted.
    core.eventBus.emit("submitCloudEvent",{type: 'FINISHED_SPECIAL_LOCATIONS', eventId: 'removeLocationPicture' + action.locationId });
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_SPECIAL_LOCATIONS',
      eventId: 'uploadLocationPicture' + action.locationId,
      data: {
        localId: action.locationId,
        sphereId: action.sphereId,
        specialType: 'uploadLocationPicture'
      }
    })
  }
  else if (action.data.picture === null || (action.data.pictureSource === "STOCK" && action.data.pictureId === null && locationBeforeAction.config.pictureId !== null)) {
    // in case the user has a pending upload location picture request, we will finish this immediately so a new
    // picture will not be uploaded.
    core.eventBus.emit("submitCloudEvent",{type: 'FINISHED_SPECIAL_LOCATIONS', eventId: 'uploadLocationPicture' + action.locationId });
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_SPECIAL_LOCATIONS',
      eventId: 'removeLocationPicture'+ action.locationId,
      data: {
        localId: action.locationId,
        sphereId: action.sphereId,
        specialType: 'removeLocationPicture'
      }
    });
  }


  let sphere   = state.spheres[action.sphereId];
  let location = sphere.locations[action.locationId];

  LocationTransferNext.updateOnCloud(action.sphereId, location)
    .catch(() => {});
}



function handleSceneInCloud(action: DatabaseAction, newState, oldState) {
  let existingSphere = oldState.spheres[action.sphereId];
  let newSphere = newState.spheres[action.sphereId];
  if (!existingSphere || !newSphere) { return }

  // existing scene is the one BEFORE this action.
  let existingScene = existingSphere.scenes[action.sceneId];
  if (existingScene && existingScene.cloudId) {
    if (action.data.picture && action.data.pictureSource === PICTURE_GALLERY_TYPES.CUSTOM) {
      // in case the user has a pending delete scene picture request, we will finish this immediately so a new
      // picture will not be deleted.
      core.eventBus.emit("submitCloudEvent", {
        type: 'FINISHED_SPECIAL_SCENES',
        eventId: 'removeScenePicture' + action.sceneId
      });
      core.eventBus.emit("submitCloudEvent", {
        type: 'CLOUD_EVENT_SPECIAL_SCENES',
        eventId: 'uploadScenePicture' + action.sceneId,
        data: {
          localId: action.sceneId,
          cloudId: existingScene.cloudId,
          sphereId: action.sphereId,
          specialType: 'uploadScenePicture'
        },
      });
    }
    else if (existingScene.pictureSource === PICTURE_GALLERY_TYPES.CUSTOM &&
      (action.data.picture === null || action.data.pictureSource === PICTURE_GALLERY_TYPES.STOCK)
    ) {
      // in case the user has a pending upload scene picture request, we will finish this immediately so a new
      // picture will not be uploaded.
      // This is only in the case of an existing scene and picture.
      core.eventBus.emit("submitCloudEvent", {
        type: 'FINISHED_SPECIAL_SCENES',
        eventId: 'uploadScenePicture' + action.sceneId
      });
      core.eventBus.emit("submitCloudEvent", {
        type: 'CLOUD_EVENT_SPECIAL_SCENES',
        eventId: 'removeScenePicture' + action.sceneId,
        data: {
          localId: action.sceneId,
          sphereId: action.sphereId,
          specialType: 'removeScenePicture'
        },
      });
    }
  }


  let scene = newSphere.scenes[action.sceneId];

  if (action.type === "ADD_SCENE") {
    SceneTransferNext.createOnCloud(action.sphereId, scene)
      .then(() => {
        let newState = core.store.getState();
        let sphere = newState.spheres[action.sphereId];
        let scene = sphere.scenes[action.sceneId];

        // upload the image if there is a custom image.
        if (scene.pictureSource === PICTURE_GALLERY_TYPES.CUSTOM) {
          core.eventBus.emit("submitCloudEvent", {
            type: 'CLOUD_EVENT_SPECIAL_SCENES',
            eventId: 'uploadScenePicture' + action.sceneId,
            data: {
              localId: action.sceneId,
              cloudId: scene.cloudId,
              sphereId: action.sphereId,
              specialType: 'uploadScenePicture'
            }
          });
        }
      })
      .catch(() => {});
  }
  else {
    SceneTransferNext.updateOnCloud(action.sphereId, scene)
      .catch(() => { });
  }
}


function removeSceneInCloud(action: DatabaseAction, state, oldState) {
  let existingSphere = oldState.spheres[action.sphereId];
  if (existingSphere) {
    let existingScene = existingSphere.scenes[action.sceneId];

    if (existingScene && existingScene.cloudId) {
      core.eventBus.emit("submitCloudEvent", {
        type: 'CLOUD_EVENT_REMOVE_SCENES',
        eventId: 'remove'+ action.sceneId,
        data: {
          localId: action.sceneId,
          sphereId: action.sphereId,
          cloudId: existingScene.cloudId,
        }
      });
    }
  }
}

function handleSphereInCloud(action: DatabaseAction, state) {
  let sphere = state.spheres[action.sphereId];

  SphereTransferNext.updateOnCloud(sphere)
    .catch(() => {})
}

function handleSphereUserInCloud(action, state) {

}

function handleSphereStateOnDevice(action: DatabaseAction, state) {
  let deviceId = Util.data.getCurrentDeviceId(state);
  if (deviceId) {
    if (state.user.uploadLocation === true) {
      if (action.data.present === true) {
        CLOUD.forDevice(deviceId).inSphere(action.sphereId).catch(() => {});
      }
      else {
        CLOUD.forDevice(deviceId).exitSphere(action.sphereId).catch(() => { });  // will also clear location
      }
    }
    else {
      CLOUD.forDevice(deviceId).exitSphere("*").catch(() => { });  // will also clear location
    }
  }
}


function handleUserLocationEnter(action: DatabaseAction, state) {
  // only update the cloud if this is from the ACTIVE user
  if (action.data.userId === state.user.userId) {
    if (state.user.uploadLocation === true) {
      let deviceId = Util.data.getCurrentDeviceId(state);
      if (deviceId) {
        CLOUD.forDevice(deviceId).inLocation(action.sphereId, action.locationId).catch(() => {});
      }
    }
  }
}

function handleUserLocationExit(action: DatabaseAction, state) {
  // we do not need to do anything here since the user leaving is the user entering another room. On sphere exit, both are cleared.
}


function handleStoneState(action: DatabaseAction, state, oldState, pureSwitch = false) {
  let sphereId = action.sphereId;
  let stoneId = action.stoneId;

  if (state.user.uploadSwitchState === true && pureSwitch === true) {
    let stone = state.spheres[sphereId].stones[stoneId];

    CLOUD.forStone(stoneId).updateStoneSwitchState(stone.state.state).catch(() => {});
  }
}

function removeBehaviourInCloud(action: DatabaseAction, state, oldState) {
  let sphereId = action.sphereId;
  let stoneId = action.stoneId;
  let behaviourId = action.behaviourId;

  let sphere = oldState.spheres[sphereId];
  if (!sphere) { return }
  let stone = sphere.stones[stoneId];
  if (!stone) { return }
  let behaviour = stone.behaviours[behaviourId];
  if (!behaviour) { return }

  if (behaviour.cloudId) {
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_REMOVE_BEHAVIOURS',
      eventId: 'remove'+ action.behaviourId,
      data: {
        localId: action.behaviourId,
        sphereId: action.sphereId,
        stoneId: action.stoneId,
        cloudId: behaviour.cloudId,
      }
    });
  }
}

function removeAllBehavioursForStoneInCloud(action: DatabaseAction, state) {
  // this is only used for devs, so we won't wrap it in the events
  let stoneId = action.stoneId;
  CLOUD.forStone(stoneId).deleteAllBehaviours()
}

function handleBehaviourInCloud(action: DatabaseAction, state) {
  let sphereId = action.sphereId;
  let stoneId = action.stoneId;
  let behaviourId = action.behaviourId;

  let sphere = state.spheres[sphereId];
  if (!sphere) { return }
  let stone = sphere.stones[stoneId];
  if (!stone) { return }
  let behaviour = stone.behaviours[behaviourId];
  if (!behaviour) { return }

  if (behaviour.cloudId !== null) {
    BehaviourTransferNext.updateOnCloud(stoneId, behaviour)
      .catch((err) => { console.log("Error handleBehaviourInCloud",err); })
  }
  else {
    if (action.type === "ADD_STONE_BEHAVIOUR") {
      BehaviourTransferNext.createOnCloud(sphereId, stoneId, behaviour)
        .catch((err) => { console.log("Error handleBehaviourInCloud",err); })
    }
  }
}

function handleDeviceInCloud(action: DatabaseAction, state) {
  let deviceId = action.deviceId;
  if (!deviceId) {
    LOGe.store("handleDeviceInCloud: invalid device id: ", deviceId);
    return;
  }  
  let deviceConfig = state.devices[deviceId];
  let data = {
    name: deviceConfig.name,
    address: deviceConfig.address,
    description: deviceConfig.description,
    tapToToggleCalibration: deviceConfig.tapToToggleCalibration,
    updatedAt: deviceConfig.updatedAt
  };

  if (state.user.uploadDeviceDetails) {
    data["os"] = deviceConfig.os;
    data["deviceType"] = deviceConfig.deviceType;
    data["model"] = deviceConfig.model;
    data["userAgent"] = deviceConfig.userAgent;
    data["locale"] = deviceConfig.locale;
  }

  CLOUD.updateDevice(deviceId, data).catch(() => {});
}



function handleInstallation(action: DatabaseAction, state) {
  let installationId = action.installationId;
  if (!installationId) {
    LOGe.store("handleDeviceInCloud: invalid installationId: ", installationId);
    return;
  }
  let installationConfig = state.installations[installationId];
  let data = {
    deviceToken: installationConfig.deviceToken,
    updatedAt: installationConfig.updatedAt
  };

  CLOUD.updateInstallation(installationId, data).catch(() => {});
}




async function handleMessageMarkedAsRead(action: DatabaseAction, state) {
  try {
    await MessageReadTransferNext.createOnCloud(action.sphereId, action.messageId);
  }
  catch (err : any) {
    LOGe.cloud("CloudEnhancer: Error marking message as read", err);
  }
}


async function handleMessageMarkedAsDeleted(action: DatabaseAction, state) {
  try {
    await MessageDeletedTransferNext.createOnCloud(action.sphereId, action.messageId);
  }
  catch (err : any) {
    LOGe.cloud("CloudEnhancer: Error marking message as deleted", err);
  }
}

async function handleMessageAdd(action: DatabaseAction, state) {
  try {
    if (action.data.cloudId === undefined) {
      let message = Get.message(action.sphereId, action.messageId);
      await MessageTransferNext.createOnCloud(action.sphereId, message);
    }
  }
  catch (err : any) {
    LOGe.cloud("CloudEnhancer: Error creating message", err);
  }
}

function handleMessageRemove(action, state, oldState) {
  let message = oldState.spheres[action.sphereId].messages[action.messageId];
  if (!message.cloudId) {
    return;
  }

  // if user is sender, delete in cloud.
  if (message.senderId === oldState.user.userId) {
    core.eventBus.emit("submitCloudEvent", {
      type: 'CLOUD_EVENT_REMOVE_MESSAGES',
      eventId: action.messageId,
      data: {
        sphereId: action.sphereId,
        localId: action.messageId,
        cloudId: message.cloudId
      }
    });
  }
}

