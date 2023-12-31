import { AMOUNT_OF_CROWNSTONES_FOR_INDOOR_LOCALIZATION } from '../ExternalConfig'
import { LOGe } from '../logging/Log'
import { KEY_TYPES, STONE_TYPES } from "../Enums";

import DeviceInfo from 'react-native-device-info';
import { core } from "../Core";
import { FileUtil } from "./FileUtil";

import * as RNLocalize from "react-native-localize";
import { Get } from "./GetUtil";
import { PICTURE_GALLERY_TYPES } from "../views/scenesViews/constants/SceneConstants";
import {StoneAvailabilityTracker} from "../native/advertisements/StoneAvailabilityTracker";
import {FingerprintUtil} from "./FingerprintUtil";



export const DataUtil = {


  /**
   * Does any stone in this sphere have behaviour?
   * @param sphereId
   */
  isBehaviourUsed: function(sphereId: string) : boolean {
    let sphere = Get.sphere(sphereId);
    if (!sphere) { return false; }

    for (let stoneId in sphere.stones) {
      let stone = sphere.stones[stoneId];
      for (let behaviourId in stone.behaviours) {
        return true;
      }
    }

    return false;
  },


  /**
   * Are you in the sphere at the moment?
   * @param sphereId
   */
  inSphere: function(sphereId: string) : boolean {
    let sphere = Get.sphere(sphereId);
    if (!sphere) { return false; }

    return sphere.state.present;
  },


  /**
   * Call a callback on all stones in all spheres
   * @param state
   * @param callback
   */
  callOnAllSpheres: function(callback: (sphereId: string, sphere: SphereData) => void) {
    let state = core.store.getState()
    for (let sphereId in state.spheres) {
      callback(sphereId, state.spheres[sphereId])
    }
  },

  /**
   * Call a callback on all stones in all spheres
   * @param state
   * @param callback
   */
  callOnAllStones: function(callback: (sphereId: string, stoneId: string, stone: StoneData) => void) {
    let state = core.store.getState();
    for (let sphereId in state.spheres) {
      let stones = state.spheres[sphereId].stones;
      for (let locationId in stones) {
        callback(sphereId, locationId, stones[locationId])
      }
    }
  },
  /**
   * Call a callback on all stones in all spheres
   * @param state
   * @param callback
   */
  callOnAllLocations: function(callback: (sphereId: string, locationId: string, location: LocationData) => void) {
    let state = core.store.getState();
    for (let sphereId in state.spheres) {
      let locations = state.spheres[sphereId].locations;
      for (let locationId in locations) {
        callback(sphereId, locationId, locations[locationId])
      }
    }
  },


  /**
   * Call a callback on all stones in all spheres
   * @param state
   * @param sphereId
   * @param callback
   */
  callOnStonesInSphere: function(sphereId: string, callback: (stoneId: string, stone: StoneData) => void) {
    let state = core.store.getState();
    if (state && state.spheres && state.spheres[sphereId]) {
      let stones = state.spheres[sphereId].stones;
      let stoneIds = Object.keys(stones);
      for (let j = 0; j < stoneIds.length; j++) {
        callback(stoneIds[j], stones[stoneIds[j]])
      }
    }
    else {
      LOGe.info("DataUtil: Trying to call method on all stones in sphere but I cannot find stones in this sphere (or the sphere itself)");
    }
  },



  /**
   * Get the ID of the device (phone model) we are currently using.
   * @param state
   * @param deviceAddress
   * @returns {*}
   */
  getDeviceIdFromState: function(state, deviceAddress : string) : string {
    let deviceIds = Object.keys(state.devices);
    for (let i = 0; i < deviceIds.length; i++) {
      if (state.devices[deviceIds[i]].address === deviceAddress) {
        return deviceIds[i];
      }
    }
    return null;
  },


  getSphereFromHub: function(hub: HubData) : SphereData | null {
    let state = core.store.getState()
    for (let sphereId in state.spheres) {
      let sphere = state.spheres[sphereId];
      for (let hubId in sphere.hubs) {
        if (hubId === hub.id) {
          return sphere;
        }
      }
    }
    return null;
  },

  getLocationFromFingerprintId: function(fingerprintId: string) : LocationData | null {
    let state = core.store.getState()
    for (let sphereId in state.spheres) {
      let sphere = state.spheres[sphereId];
      for (let locationId in sphere.locations) {
        let location = sphere.locations[locationId];
        if (location.fingerprints.raw[fingerprintId] !== undefined) {
          return location;
        }
      }
    }
    return null;
  },


  getAuthorizationTokenFromSphere: function(sphere: SphereData) : string | null {
    return sphere.keys[KEY_TYPES.SPHERE_AUTHORIZATION_TOKEN]?.key ?? null;
  },


  getTapToToggleCalibration: function(state) : number {
    if (state && state.devices) {
      let deviceId = this.getDeviceIdFromState(state, state.user.appIdentifier);
      if (deviceId && state.devices[deviceId]) {
        let calibration = state.devices[deviceId].tapToToggleCalibration;
        if (calibration) {
          return calibration;
        }
      }
    }
    return null;
  },


  getDevice: function(state) {
    let deviceId = this.getDeviceIdFromState(state, state.user.appIdentifier);
    if (state.devices && deviceId && state.devices[deviceId]) {
      return state.devices[deviceId];
    }
    return null;
  },


  getHubByCloudId(sphereId, hubCloudId: string) : HubData | null {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) return null
    let hubs = sphere.hubs;
    if (!hubs) return null;
    let hubIds = Object.keys(hubs);
    for (let i = 0; i < hubIds.length; i++) {
      let hub = sphere.hubs[hubIds[i]];
      if (hub.config.cloudId === hubCloudId) {
        return hub;
      }
    }
    return null;
  },


  getHubByStoneId(sphereId, stoneId: string) : HubData | null {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) return null
    let hubs = sphere.hubs;
    if (!hubs) return null;
    let hubIds = Object.keys(hubs);
    for (let i = 0; i < hubIds.length; i++) {
      let hub = sphere.hubs[hubIds[i]];
      if (hub.config.linkedStoneId === stoneId) {
        return hub;
      }
    }
    return null;
  },


  getAllHubsWithStoneId(sphereId, stoneId: string) : HubData[] {
    let results = [];
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) return null
    let hubs = sphere.hubs;
    if (!hubs) return null;
    let hubIds = Object.keys(hubs);
    for (let i = 0; i < hubIds.length; i++) {
      let hub = sphere.hubs[hubIds[i]];
      if (hub.config.linkedStoneId === stoneId) {
        results.push(hub);
      }
    }
    return results;
  },


  getHubById(sphereId, hubId: string) : HubData | null {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) return null
    let hubs = sphere.hubs;
    if (!hubs) return null;
    let hubIds = Object.keys(hubs);
    return hubs[hubId] || null;
  },


  getBehaviour(sphereId, stoneId, behaviourId) {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) return null;
    let stone = sphere.stones[stoneId];
    if (!stone) return null;
    let behaviour = stone.behaviours[behaviourId];
    return behaviour || null;
  },


  getLocation(sphereId, locationId) {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) return null
    let location = sphere.locations[locationId];
    return location || null;
  },


  getPresentSphereId: function() : string {
    let state = core.store.getState();
    let sphereIds = Object.keys(state.spheres);
    for (let i = 0; i < sphereIds.length; i++ ) {
      if (state.spheres[sphereIds[i]].state.present === true) {
        return sphereIds[i];
      }
    }
    return null;
  },


  getPresentSphereIds: function() : string[] {
    let state = core.store.getState();
    let sphereIds = Object.keys(state.spheres);
    let result = [];
    for (let i = 0; i < sphereIds.length; i++ ) {
      if (state.spheres[sphereIds[i]].state.present === true) {
        result.push(sphereIds[i]);
      }
    }
    return result;
  },


  getReferenceId: function(state) : string {
    let sphereIds = Object.keys(state.spheres);
    let activeSphereId = state.app.activeSphere;
    if (activeSphereId && state.spheres[activeSphereId] && state.spheres[activeSphereId].state.present) {
      return activeSphereId;
    }

    for (let i = 0; i < sphereIds.length; i++ ) {
      if (state.spheres[sphereIds[i]].state.present === true) {
        return sphereIds[i];
      }
    }

    if (sphereIds.length > 0) {
      return sphereIds[0];
    }

    return 'unknown';
  },


  getSphereIdContainingMessage(message: MessageData) : string | null {
    let state = core.store.getState();
    for (let sphereId in state.spheres) {
      let sphere = state.spheres[sphereId];
      if (sphere.messages && sphere.messages[message.id]) {
        return sphereId;
      }
    }
    return null;
  },


  getAmountOfCrownstonesInLocation: function(sphereId: string, locationId?) : number {
    let stones = DataUtil.getStonesInLocation(sphereId, locationId);
    return Object.keys(stones).length;
  },


  getAmountOfDimmableStonesInLocation: function(sphereId: string, locationId?) : number {
    let stones = DataUtil.getStonesInLocation(sphereId, locationId);
    let amount = 0;

    for (let stoneId in stones) {
      let stone = stones[stoneId];
      if (stone.abilities.dimming.enabledTarget) {
        amount += 1;
      }
    }

    return amount;
  },

  getAmountOfActiveStonesInLocation: function(sphereId: string, locationId?) : number {
    let stones = DataUtil.getStonesInLocation(sphereId, locationId);
    let amount = 0;

    for (let stoneId in stones) {
      if (StoneAvailabilityTracker.isDisabled(stoneId) === false) {
        amount += 1;
      }
    }
    return amount;
  },

  areThereActiveStonesWithErrorsInLocation: function(sphereId: sphereId, locationId: locationId) : boolean {
    let stones = DataUtil.getStonesInLocation(sphereId, locationId);

    for (let stoneId in stones) {
      if (StoneAvailabilityTracker.isDisabled(stoneId) === false) {
        if (stones[stoneId].errors.hasError) {
          return true;
        }
      }
    }
    return false;
  },

  areThereStonesWithErrorsInLocation: function(sphereId: sphereId, locationId: locationId) : boolean {
    let stones = DataUtil.getStonesInLocation(sphereId, locationId);

    for (let stoneId in stones) {
      if (stones[stoneId].errors.hasError) {
        return true;
      }
    }
    return false;
  },

  getLocationsInSphere: function(sphereId: string) : Record<locationId, LocationData> {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];

    if (!sphere) { return {}; }

    return sphere.locations;
  },

  getLocationsInSphereAlphabetically: function(sphereId: string) : LocationData[] {
    let locations = DataUtil.getLocationsInSphere(sphereId);

    let locationArray = [];
    for (let locationId in locations) {
      locationArray.push({name: locations[locationId].config.name, id: locationId});
    }

    return locationArray.sort((a, b) =>  { return a.name > b.name ? 1 : -1});
  },

  getStonesInLocation: function(sphereId : string, locationId?) : {[stoneId: string]: StoneData} {
    let state = core.store.getState();
    let filteredStones = {};
    if (sphereId !== undefined) {
      let stones = state.spheres[sphereId].stones;
      let stoneIds = Object.keys(stones);
      stoneIds.forEach((stoneId) => {
        if (stones[stoneId].config.locationId === locationId || locationId === undefined) {
          filteredStones[stoneId] = stones[stoneId];
        }
      })
    }
    return filteredStones;
  },

  getStonesInLocationAlphabetically: function(sphereId : string, locationId?) : StoneData[] {
    let stonesInLocation = DataUtil.getStonesInLocation(sphereId, locationId);
    let result = [];

    for (let stoneId in stonesInLocation) {
      result.push(stonesInLocation[stoneId]);
    }

    result.sort((a, b) =>  { return a.config.name > b.config.name ? 1 : -1});
    return result;
  },

  getHubsInLocation: function(sphereId : string, locationId?) : {[hubId: string]: HubData} {
    let state = core.store.getState();
    let filteredHubs = {};
    if (sphereId !== undefined) {
      for (let [hubId, hub] of Object.entries<HubData>(state.spheres[sphereId].hubs)) {
        if (!hub.config.locationId && hub.config.linkedStoneId) {
          let pairedStone = Get.stone(sphereId, hub.config.linkedStoneId);
          if (pairedStone.config.locationId) {
            // self-repair
            core.store.dispatch({type:"UPDATE_HUB_LOCATION", sphereId: sphereId, hubId: hubId, data: {locationId: pairedStone.config.locationId}});
            hub.config.locationId = pairedStone.config.locationId;
          }
        }
        if (hub.config.locationId === locationId || locationId === undefined) {
          filteredHubs[hubId] = hub;
        }
      }
    }
    return filteredHubs;
  },


  getStonesInLocationArray: function(state : any, sphereId : string, locationId?) : any[] {
    let filteredStones = [];
    if (sphereId !== undefined) {
      let stones = state.spheres[sphereId].stones;
      let stoneIds = Object.keys(stones);
      stoneIds.forEach((stoneId) => {
        if (stones[stoneId].config.locationId === locationId || locationId === undefined) {
          filteredStones.push(stones[stoneId]);
        }
      })
    }
    return filteredStones;
  },


  getLocationFromStone: function(sphere, stone) {
    if (stone.config.locationId && sphere.locations[stone.config.locationId]) {
      return sphere.locations[stone.config.locationId];
    }
    else {
      return null;
    }
  },


  getLocationIdFromStone: function(sphereId, stoneId) {
    let stone = Get.stone(sphereId, stoneId);
    return stone.config.locationId;
  },


  getLocationUIdFromStone: function(sphereId, stoneId) {
    let stone = Get.stone(sphereId, stoneId);
    if (!stone) { return null; }
    let location = DataUtil.getLocation(sphereId, stone.config.locationId)
    if (!location) { return null }
    return location.config.uid;
  },



  getUserLocations(state, userId) : {[sphereId: string]: locationId[]} {
    let presentSphereMap = {};

    // first we determine in which sphere we are:
    for (let sphereId in state.spheres) {
      if (state.spheres[sphereId].state.present === true) {
        presentSphereMap[sphereId] = DataUtil.getUserLocationIdInSphere(state, sphereId, userId);
      }
    }

    return presentSphereMap;
  },


  getUserLocationIdInSphere: function(state, sphereId, userId) {
    let locationIds = Object.keys(state.spheres[sphereId].locations);
    for (let i = 0; i < locationIds.length; i++) {
      let location = state.spheres[sphereId].locations[locationIds[i]];
      if (location.presentUsers.indexOf(userId) !== -1) {
        return locationIds[i];
      }
    }
    return null;
  },


  userHasPlugsInSphere: function(state, sphereId) {
    let sphere = state.spheres[sphereId];
    if (!sphere) { return false }

    let stones = sphere.stones;
    let stoneIds = Object.keys(stones);

    for (let i = 0; i < stoneIds.length; i++) {
      if (stones[stoneIds[i]].config.type === STONE_TYPES.plug) {
        return true;
      }
    }

    return false;
  },


  getStoneIdFromHandle: function(state, sphereId, handle) {
    let stones = state.spheres[sphereId].stones;
    let stoneIds = Object.keys(stones);
    for (let i = 0; i < stoneIds.length; i++) {
      if (stones[stoneIds[i]].config.handle === handle) {
        return stoneIds[i]
      }
    }
  },


  getStoneName: function(sphereId, stoneId) {
    let state = core.store.getState();
    let sphere = state.spheres[sphereId];
    if (!sphere) { return ""; }
    let stone = sphere.stones[stoneId];
    if (!stone) { return ""; }
    return stone.config.name;
  },


  getStoneFromHandle: function(state, sphereId, handle) {
    let stoneId = DataUtil.getStoneIdFromHandle(state, sphereId, handle);
    return state.spheres[sphereId].stones[stoneId];
  },


  getDeviceSpecs: function(state) {
    let address = state.user.appIdentifier;
    let name = DeviceInfo.getDeviceNameSync();
    let description = DeviceInfo.getManufacturerSync() + " : " + DeviceInfo.getBrand() + ' : ' + DeviceInfo.getDeviceId();
    let os = DeviceInfo.getSystemName() + ' ' + DeviceInfo.getSystemVersion();
    let deviceType = DeviceInfo.getDeviceId();
    let model = DeviceInfo.getModel();
    let userAgent = null //|| DeviceInfo.getUserAgent();
    let locale = RNLocalize.getLocales()[0]?.languageCode || "default"

    return { name, address, description, os, userAgent, locale, deviceType, model };
  },

  getCurrentDeviceId: function(state) {
    let specs = DataUtil.getDeviceSpecs(state);

    let deviceIds = Object.keys(state.devices);
    for (let i = 0; i < deviceIds.length; i++) {
      if (state.devices[deviceIds[i]].address == specs.address) {
        return deviceIds[i];
      }
    }
    return null;
  },



  getSpheresWhereUserHasAccessLevel: function(state, accessLevel) {
    let items = [];
    for (let sphereId in state.spheres) {
      if (state.spheres.hasOwnProperty(sphereId)) {
        let sphere = state.spheres[sphereId];
        // there can be a race condition where the current user is yet to be added to spheres but a redraw during the creation process triggers this method
        if (sphere.users[state.user.userId] && sphere.users[state.user.userId].accessLevel === accessLevel) {
          items.push({id: sphereId, name: sphere.config.name});
        }
      }
    }
    return items;
  },

  getLayoutDataRooms: function(sphereId) {
    let state = core.store.getState();
    let initialPositions = {};
    let sphere = state.spheres[sphereId];
    let rooms = sphere.locations;

    let roomIdArray = Object.keys(rooms).sort();
    let usePhysics = false;

    for (let i = 0; i < roomIdArray.length; i++) {
      let room = rooms[roomIdArray[i]];
      initialPositions[roomIdArray[i]] = {x: room.layout.x, y: room.layout.y};
      if (room.layout.x === null || room.layout.y === null) {
        usePhysics = true;
      }
    }

    return { roomIdArray, initialPositions, usePhysics };
  },


  getUserLevelInSphere: function(state, sphereId) : string {
    if (!(state && state.user && state.user.userId)) {
      return null;
    }
    let userId = state.user.userId;
    let sphere = Get.sphere(sphereId);
    if (!sphere) {
      return null;
    }
    let keys : {[keyId: string]: EncryptionKeyData} = sphere.keys;

    let level = null;
    for (let [id, keyData] of Object.entries(keys)) {
      if (keyData.keyType === KEY_TYPES.ADMIN_KEY) {
        return 'admin'
      }
      else if (keyData.keyType === KEY_TYPES.MEMBER_KEY) {
        level = 'member';
      }
      else if (keyData.keyType === KEY_TYPES.BASIC_KEY && !level) {
        level = 'guest'
      }
    }

    return level;
  },


  verifyDatabase(includeStones : boolean) {
    let state = core.store.getState();

    // Catch a broken sphere.
    let sphereIds = Object.keys(state.spheres);
    for (let i = 0; i < sphereIds.length; i++) {
      let sphere = state.spheres[sphereIds[i]];
      if (DataUtil.verifyDatabaseSphere(sphere) === false) {
        return false;
      }

      if (includeStones === true) {
        if (DataUtil.verifyDatabaseStonesInSphere(sphere) === false) {
          return false;
        }
      }
    }
    return true;
  },


  verifyPicturesInDatabase(state) {
    let spheres = state.spheres;
    let pictures = [];
    if (state.user.picture || !state.user.picture && state.user.pictureId) {
      pictures.push({picturePath: state.user.picture, actionToClean: {type:"USER_REPAIR_PICTURE"}});
    }
    Object.keys(spheres).forEach((sphereId) => {
      let locations   = spheres[sphereId].locations;
      let scenes      = spheres[sphereId].scenes;
      let sphereUsers = spheres[sphereId].users;


      Object.keys(locations).forEach((locationId) => {
        let locationConfig = locations[locationId].config;
        if (locationConfig.pictureSource !== "STOCK" && (locationConfig.picture || !locationConfig.picture && locationConfig.pictureId)) {
          pictures.push({picturePath: locationConfig.picture, actionToClean: {type:"LOCATION_REPAIR_PICTURE", sphereId: sphereId, locationId: locationId}})
        }
      });
      Object.keys(sphereUsers).forEach((userId) => {
        if (sphereUsers[userId].picture || !sphereUsers[userId].picture && sphereUsers[userId].pictureId) {
          pictures.push({picturePath: sphereUsers[userId].picture, actionToClean: {type:"SPHERE_USER_REPAIR_PICTURE", sphereId: sphereId, userId: userId}})
        }
      });
      Object.keys(scenes).forEach((sceneId) => {
        if (
          scenes[sceneId].pictureSource === PICTURE_GALLERY_TYPES.CUSTOM || !scenes[sceneId].picture && scenes[sceneId].pictureId
        ) {
          pictures.push({picturePath: scenes[sceneId].picture, actionToClean: {type:"SPHERE_SCENE_REPAIR_PICTURE", sphereId: sphereId, sceneId: sceneId}})
        }
      });
    })

    FileUtil.index()
      .then((items) => {
        let itemsMap = {};
        items.forEach((item) => { itemsMap['file://' + item.path] = true; })
        let actions = [];
        pictures.forEach((pictureData) => {
          if (itemsMap[pictureData.picturePath] !== true) {
            actions.push(pictureData.actionToClean);
          }
        })
        if (actions.length > 0) {
          console.log("DISPATCHING CLEAN ACTIONS", actions)
          core.store.batchDispatch(actions);
        }
      })
  },


  verifyDatabaseSphere(sphere) {
    if (sphere.keys) {
      Object.keys(sphere.keys).forEach((keyId) => {
        let key = sphere.keys[keyId];
        if (key.ttl === 0) {
          if (!(key.keyType === KEY_TYPES.ADMIN_KEY ||key.keyType === KEY_TYPES.MEMBER_KEY || key.keyType === KEY_TYPES.BASIC_KEY)) {
            return false;
          }
        }
      })
    }

    if (!sphere.config.iBeaconUUID) { return false; }

    return true;
  },


  verifyDatabaseStonesInSphere(sphere) {
    let stoneIds = Object.keys(sphere.stones);
    for (let i = 0; i < stoneIds.length; i++) {
      let stone = sphere.stones[stoneIds[i]];
      if (!stone.config.iBeaconMajor ||
          !stone.config.iBeaconMinor ||
          !stone.config.macAddress) {
        return false;
      }
    }
    return true;
  },


  locationIdToUid(sphereId, locationId) {
    let location = DataUtil.getLocation(sphereId, locationId)
    if (!location) { return null }
    return location.config.uid;
  },


  getDevicePreferences(sphereId = null) {
    let state = core.store.getState();

    let trackingNumber = 0;
    let rssiOffset = 0;
    let ignoreForBehaviour = state.app.indoorLocalizationEnabled !== true;
    let tapToToggleEnabled = state.app.tapToToggleEnabled;

    // get device for rssi offset
    let device = DataUtil.getDevice(state);
    let randomDeviceToken = 0;
    let activeRandomDeviceToken = 0;
    let randomDeviceTokenValidated = false;
    if (device) {
      if (sphereId) {
        trackingNumber = device.trackingNumbers && device.trackingNumbers[sphereId] || 0;
      }
      randomDeviceToken          = device.randomDeviceToken;
      activeRandomDeviceToken    = device.activeRandomDeviceToken || 0;
      randomDeviceTokenValidated = device.randomDeviceTokenValidated;
      if (!randomDeviceToken) {
        randomDeviceTokenValidated = false;
        // TEMP HACK
        let token = Math.round(Math.random()*(1<<24));
        core.store.dispatch({type:"TRY_NEW_DEVICE_TOKEN", deviceId: DataUtil.getDeviceIdFromState(state, state.user.appIdentifier), data: { randomDeviceToken: token }})
        randomDeviceToken = token;
      }
      rssiOffset = device.rssiOffset || 0;
    }

    return {
      trackingNumber,
      rssiOffset,
      tapToToggleEnabled,
      ignoreForBehaviour,
      randomDeviceToken,
      activeRandomDeviceToken,
      randomDeviceTokenValidated,
      useTimeBasedNonce: state.user.developer && state.development.use_time_based_nonce
    }
  },


  isDeveloper() : boolean {
    let state = core.store.getState();
    return state?.user?.developer ?? false;
  }
};

export const getAmountOfStonesInLocation = function(state, sphereId, locationId) {
  let counter = 0;
  if (sphereId !== undefined) {
    let stones = state.spheres[sphereId].stones;
    let stoneIds = Object.keys(stones);
    stoneIds.forEach((stoneId) => {
      if (stones[stoneId].config.locationId === locationId || locationId === undefined) {
        counter += 1;
      }
    })
  }
  return counter;
};

// TODO: replace by dataUtil method
export const getFloatingStones = function(state, sphereId) {
  let floatingStones = [];
  if (sphereId !== undefined) {
    let stones = state.spheres[sphereId].stones;
    let stoneIds = Object.keys(stones);
    stoneIds.forEach((stoneId) => {
      if (stones[stoneId].config.locationId === null || stones[stoneId].config.locationId === undefined) {
        floatingStones.push(stones[stoneId]);
      }
    })
  }
  return floatingStones;
};


export const getPresentUsersInLocation = function(state, sphereId, locationId, all = false) {
  let users = [];
  if (!locationId || !sphereId) {
    return users;
  }

  if (!(state && state.spheres && state.spheres[sphereId] && state.spheres[sphereId].locations && state.spheres[sphereId].locations[locationId])) {
    return users;
  }

  const location = state.spheres[sphereId].locations[locationId];

  let presentUsers = location.presentUsers;
  if (all) {
    presentUsers = Object.keys(state.spheres[sphereId].users)
  }
  presentUsers.forEach((userId) => {
    if (userId === state.user.userId) {
      users.push({id: userId, data: state.user});
    }
    else {
      users.push({id: userId, data: state.spheres[sphereId].users[userId]});
    }
  });

  return users
};


export const getCurrentPowerUsageInLocation = function(sphereId, locationId) {
  let usage = 0;
  let stones = DataUtil.getStonesInLocation(sphereId, locationId);
  let stoneIds = Object.keys(stones);

  for (let i = 0; i < stoneIds.length; i++) {
    usage += stones[stoneIds[i]].state.currentUsage
  }

  return usage
};



export const getLocationNamesInSphere = function(state, sphereId) {
  let roomNames = {};
  let rooms = state.spheres[sphereId].locations;
  for (let roomId in rooms) {
    if (rooms.hasOwnProperty(roomId)) {
      let room = rooms[roomId];
      roomNames[room.config.name] = true;
    }
  }
  return roomNames;
};




export const prepareStoreForUser = function() {
  const state = core.store.getState();
  let spheres = state.spheres;
  let sphereIds = Object.keys(spheres);
  let actions = [];
  sphereIds.forEach((sphereId) => {
    let locations = spheres[sphereId].locations;
    let locationIds = Object.keys(locations);

    locationIds.forEach((locationId) => {
      actions.push({type: 'CLEAR_USERS_IN_LOCATION', sphereId: sphereId, locationId: locationId});
    });

    let stones = spheres[sphereId].stones;
    let stoneIds = Object.keys(stones);

    stoneIds.forEach((stoneId) => {
      actions.push({type:'CLEAR_STONE_USAGE', sphereId:sphereId, stoneId:stoneId});
    });
  });

  core.store.batchDispatch(actions);
};


export const canUseIndoorLocalizationInSphere = function (sphereId: string, state = null) {
  if (state === null) {
    state = core.store.getState();
  }
  if (state.app.indoorLocalizationEnabled === false) {
    return false;
  }

  // if we do not have a sphereId return false
  if (!sphereId || !state)
    return false;

  // are there enough?
  let enoughForLocalization = enoughCrownstonesInLocationsForIndoorLocalization(sphereId);

  // do we need more fingerprints?
  let requiresFingerprints = FingerprintUtil.requireMoreFingerprintsBeforeLocalizationCanStart(sphereId);

  // we have enough and we do not need more fingerprints.
  return !requiresFingerprints && enoughForLocalization;
};


export const enoughCrownstonesForIndoorLocalization = function(sphereId) : boolean {
  let sphere = Get.sphere(sphereId);
  if (!sphere) { return false; }

  return Object.keys(sphere.stones).length >= AMOUNT_OF_CROWNSTONES_FOR_INDOOR_LOCALIZATION;
};


export const enoughCrownstonesInLocationsForIndoorLocalization = function(sphereId) {
  let state = core.store.getState();
  if (!(state?.spheres?.[sphereId]?.stones)) {
    return false;
  }

  let stoneIds = Object.keys(state.spheres[sphereId].stones);
  let count = 0;

  stoneIds.forEach((stoneId) => {
    let stone = state.spheres[sphereId].stones[stoneId];
    if (stone.config.locationId !== undefined && stone.config.locationId !== null) {
      count += 1;
    }
  });
  return count >= AMOUNT_OF_CROWNSTONES_FOR_INDOOR_LOCALIZATION;
};
