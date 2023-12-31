import { NativeModules } from 'react-native';
import { DISABLE_NATIVE } from '../../ExternalConfig'
import { LOGi } from "../../logging/Log";
import {BridgeConfig} from "./BridgeConfig";
import {BridgeMock} from "../../backgroundProcesses/testing/BridgeMock";

export let Bluenet : BridgeInterface;
export let Bluenet_direct : BridgeInterface; // used for UI testing

type vibrationType = "error" | "success" | "warning" |  "medium" | "heavy";

const BluenetAPI = {
  clearTrackedBeacons:      () => { console.log("BluenetBridgeCall: clearTrackedBeacons: "); },        // called through BluenetPromiseWrapper --> must be promise.
  rerouteEvents:            () => { console.log("BluenetBridgeCall: rerouteEvents:       "); },
  isReady:                  () => { console.log("BluenetBridgeCall: isReady:             "); },                    // called through BluenetPromiseWrapper --> must be promise.
  connect:                  () => { console.log("BluenetBridgeCall: connect:             "); },                    // called through BluenetPromiseWrapper --> must be promise.
  disconnectCommand:        () => { console.log("BluenetBridgeCall: disconnectCommand:   "); },          // called through BluenetPromiseWrapper --> must be promise.
  phoneDisconnect:          () => { console.log("BluenetBridgeCall: phoneDisconnect:     "); },            // called through BluenetPromiseWrapper --> must be promise.
  resetBle:                 () => { console.log("BluenetBridgeCall: resetBle:            "); },
  startScanning:            () => { console.log("BluenetBridgeCall: startScanning:       "); },
  startScanningForCrownstones:           () => { console.log("BluenetBridgeCall: startScanningForCrownstones:           "); },
  startScanningForCrownstonesUniqueOnly: () => { console.log("BluenetBridgeCall: startScanningForCrownstonesUniqueOnly: "); },
  stopScanning:             () => { console.log("BluenetBridgeCall: stopDFU:    "); },
  requestBleState:          () => { console.log("BluenetBridgeCall: requestBleState: "); },// Send events "bleStatus" and "locationStatus" with the current state.
  requestEnableBle:         () => { console.log("BluenetBridgeCall: requestEnableBle: "); },// Send events "bleStatus" and "locationStatus" with the current state.

  requestLocation:          () => { console.log("BluenetBridgeCall: requestLocation:          "); },// Should return data {"latitude": number, "longitude": number}. Called through BluenetPromiseWrapper --> must be promise.
  requestLocationPermission:() => { console.log("BluenetBridgeCall: requestLocationPermission:"); },// Request for location permission during tutorial.
  trackIBeacon:             () => { console.log("BluenetBridgeCall: trackIBeacon:             "); },// Add the UUID to the list of tracked iBeacons, associate it with given sphereId, and start tracking.
  stopTrackingIBeacon:      () => { console.log("BluenetBridgeCall: stopTrackingIBeacon:      "); },// Remove the UUID from the list of tracked iBeacons.
  pauseTracking:            () => { console.log("BluenetBridgeCall: pauseTracking:            "); },// Stop tracking, but keep the list of tracked iBeacon UUIDs. Stop sending any tracking events: iBeacon, enter/exit region. Assume all tracked iBeacon UUIDs are out the region.
  resumeTracking:           () => { console.log("BluenetBridgeCall: resumeTracking:           "); },// Start tracking again, with the list that is already there.

  getMACAddress:            () => { console.log("BluenetBridgeCall: getMACAddress:         "); },             // called through BluenetPromiseWrapper --> must be promise.
  commandFactoryReset:      () => { console.log("BluenetBridgeCall: commandFactoryReset:   "); },       // called through BluenetPromiseWrapper --> must be promise.
  recover:                  () => { console.log("BluenetBridgeCall: recover:               "); },                   // called through BluenetPromiseWrapper --> must be promise.
  setupCrownstone:          () => { console.log("BluenetBridgeCall: setupCrownstone:       "); },           // called through SetupCrownstone in BLEUtil
  quitApp:                  () => { console.log("BluenetBridgeCall: quitApp:               "); NativeModules.BluenetJS.quitApp() },                   // Used to quit the app during logout
  enableLoggingToFile:      () => { console.log("BluenetBridgeCall: enableLoggingToFile:   "); },
  enableExtendedLogging:    () => { console.log("BluenetBridgeCall: enableExtendedLogging: "); },
  clearLogs:                () => { console.log("BluenetBridgeCall: clearLogs:             "); },
  crash:                    () => { console.log("BluenetBridgeCall: crash!                 "); },

  // mesh
  multiSwitch:              () => { console.log("BluenetBridgeCall: multiSwitch:             "); },
  getHardwareVersion:       () => { console.log("BluenetBridgeCall: getHardwareVersion:      "); },
  getBootloaderVersion:     () => { console.log("BluenetBridgeCall: getBootloaderVersion:    "); },
  getFirmwareVersion:       () => { console.log("BluenetBridgeCall: getFirmwareVersion:      "); },
  getUICR:                  () => { console.log("BluenetBridgeCall: geUICR:                  "); },
  bootloaderToNormalMode:   () => { console.log("BluenetBridgeCall: bootloaderToNormalMode:  "); },
  setTime:                  () => { console.log("BluenetBridgeCall: setTime:                 "); },
  meshSetTime:              () => { console.log("BluenetBridgeCall: meshSetTime:             "); },
  batterySaving:            () => { console.log("BluenetBridgeCall: batterySaving:           "); }, // Called with true when app goes to background, lib can stop parsing service data. Can be called multiple times in short time.
  setBackgroundScanning:    () => { console.log("BluenetBridgeCall: setBackgroundScanning:   "); },

  viewsInitialized:         () => { console.log("BluenetBridgeCall: viewsInitialized:  "); },
  lockSwitch:               () => { console.log("BluenetBridgeCall: lockSwitch:        "); },
  allowDimming:             () => { console.log("BluenetBridgeCall: allowDimming:      "); },
  setSwitchCraft:           () => { console.log("BluenetBridgeCall: setSwitchCraft:    "); },
  sendNoOp:                 () => { console.log("BluenetBridgeCall: sendNoOp:          "); },
  sendMeshNoOp:             () => { console.log("BluenetBridgeCall: sendMeshNoOp:      "); },


  getSwitchState:           () => { console.log("BluenetBridgeCall:  getSwitchState:   "); },
  putInDFU:                 () => { console.log("BluenetBridgeCall:  putInDFU:         "); },
  performDFU:               () => { console.log("BluenetBridgeCall:  repair:       "); },
  restartCrownstone:        () => { console.log("BluenetBridgeCall:  restartCrownstone:"); },
  clearKeySets:             () => { console.log("BluenetBridgeCall:  clearKeysets:     "); },
  setKeySets:               () => { console.log("BluenetBridgeCall:  setKeySets:       "); },
  setupFactoryReset:        () => { console.log("BluenetBridgeCall:  setupFactoryReset:"); },
  setupPutInDFU:            () => { console.log("BluenetBridgeCall:  setupPutInDFU:    "); },
  toggleSwitchState:        () => { console.log("BluenetBridgeCall:  toggleSwitchState:"); },
  getTrackingState:         () => { console.log("BluenetBridgeCall:  getTrackingState: "); },
  setDevicePreferences:     () => { console.log("BluenetBridgeCall:  setDevicePreferences: "); },
  setLocationState:         () => { console.log("BluenetBridgeCall:  setLocationState: "); },
  startAdvertising:         () => { console.log("BluenetBridgeCall:  startAdvertising: "); },
  stopAdvertising:          () => { console.log("BluenetBridgeCall:  stopAdvertising: "); },

  setCrownstoneNames:       () => { console.log("BluenetBridgeCall:  setCrownstoneNames: "); },
  setupPulse:               () => { console.log("BluenetBridgeCall:  setupPulse: "); },

  subscribeToNearest:       () => { console.log("BluenetBridgeCall:  subscribeToNearest "); },
  unsubscribeNearest:       () => { console.log("BluenetBridgeCall:  unsubscribeNearest "); },
  subscribeToUnverified:    () => { console.log("BluenetBridgeCall:  subscribeToUnverified "); },
  unsubscribeUnverified:    () => { console.log("BluenetBridgeCall:  unsubscribeUnverified "); },

  initBroadcasting:            () => { console.log("BluenetBridgeCall:  initBroadcasting "); },
  checkBroadcastAuthorization: () => { console.log("BluenetBridgeCall:  checkBroadcastAuthorization "); },

  isPeripheralReady:           () => { console.log("BluenetBridgeCall: isPeripheralReady"); },
  setSwitchState:              () => { console.log("BluenetBridgeCall: setSwitchState"); },
  isDevelopmentEnvironment:    () => { console.log("BluenetBridgeCall: isDevelopmentEnvironment"); return true; },
  clearErrors:                 () => { console.log("BluenetBridgeCall: clearErrors"); },
  broadcastSwitch:             () => { console.log("BluenetBridgeCall: broadcastSwitch"); },
  addBehaviour:                () => { console.log("BluenetBridgeCall: addBehaviour"); },
  updateBehaviour:             () => { console.log("BluenetBridgeCall: updateBehaviour"); },
  removeBehaviour:             () => { console.log("BluenetBridgeCall: removeBehaviour"); },
  getBehaviour:                () => { console.log("BluenetBridgeCall: getBehaviour"); },
  switchRelay:                 () => { console.log("BluenetBridgeCall: switchRelay"); },
  switchDimmer:                () => { console.log("BluenetBridgeCall: switchDimmer"); },
  getResetCounter:             () => { console.log("BluenetBridgeCall: getResetCounter"); },
  getSwitchcraftThreshold:     () => { console.log("BluenetBridgeCall: getSwitchcraftThreshold"); },
  getMaxChipTemp:              () => { console.log("BluenetBridgeCall: getMaxChipTemp"); },
  getDimmerCurrentThreshold:   () => { console.log("BluenetBridgeCall: getDimmerCurrentThreshold"); },
  getDimmerTempUpThreshold:    () => { console.log("BluenetBridgeCall: getDimmerTempUpThreshold"); },
  getDimmerTempDownThreshold:  () => { console.log("BluenetBridgeCall: getDimmerTempDownThreshold"); },
  getVoltageZero:              () => { console.log("BluenetBridgeCall: getVoltageZero"); },
  getCurrentZero:              () => { console.log("BluenetBridgeCall: getCurrentZero"); },
  getPowerZero:                () => { console.log("BluenetBridgeCall: getPowerZero"); },
  getVoltageMultiplier:        () => { console.log("BluenetBridgeCall: getVoltageMultiplier"); },
  getCurrentMultiplier:        () => { console.log("BluenetBridgeCall: getCurrentMultiplier"); },
  setSwitchcraftThreshold:     () => { console.log("BluenetBridgeCall: setSwitchcraftThreshold"); },
  setMaxChipTemp:              () => { console.log("BluenetBridgeCall: setMaxChipTemp"); },
  setDimmerCurrentThreshold:   () => { console.log("BluenetBridgeCall: setDimmerCurrentThreshold"); },
  setDimmerTempUpThreshold:    () => { console.log("BluenetBridgeCall: setDimmerTempUpThreshold"); },
  setDimmerTempDownThreshold:  () => { console.log("BluenetBridgeCall: setDimmerTempDownThreshold"); },
  setVoltageZero:              () => { console.log("BluenetBridgeCall: setVoltageZero"); },
  setCurrentZero:              () => { console.log("BluenetBridgeCall: setCurrentZero"); },
  setPowerZero:                () => { console.log("BluenetBridgeCall: setPowerZero"); },
  setVoltageMultiplier:        () => { console.log("BluenetBridgeCall: setVoltageMultiplier"); },
  setCurrentMultiplier:        () => { console.log("BluenetBridgeCall: setCurrentMultiplier"); },
  setUartState:                () => { console.log("BluenetBridgeCall: setUartState"); },

  setTapToToggle:                      () => { console.log("BluenetBridgeCall: setTapToToggle"); },
  setTapToToggleThresholdOffset:       () => { console.log("BluenetBridgeCall: setTapToToggleThresholdOffset"); },


  setSunTimes:                         () => { console.log("BluenetBridgeCall: setSunTimes"); },
  setSunTimesViaConnection:            () => { console.log("BluenetBridgeCall: setSunTimesViaConnection"); },
  turnOnMesh:                          () => { console.log("BluenetBridgeCall: turnOnMesh"); },
  turnOnBroadcast:                     () => { console.log("BluenetBridgeCall: turnOnBroadcast"); },
  broadcastBehaviourSettings:          () => { console.log("BluenetBridgeCall: broadcastBehaviourSettings"); },

  syncBehaviours:                      () => { console.log("BluenetBridgeCall: syncBehaviours"); },
  getBehaviourMasterHash:              () => { console.log("BluenetBridgeCall: getBehaviourMasterHash"); },
  setTimeViaBroadcast:                 () => { console.log("BluenetBridgeCall: setTimeViaBroadcast"); },
  broadcastExecute:                    () => { console.log("BluenetBridgeCall: broadcastExecute"); },

  transferHubTokenAndCloudId:          () => { console.log("BluenetBridgeCall: transferHubTokenAndCloudId"); },
  setUartKey:                          () => { console.log("BluenetBridgeCall: setUartKey"); },
  requestCloudId:                      () => { console.log("BluenetBridgeCall: requestCloudId"); },
  factoryResetHub:                     () => { console.log("BluenetBridgeCall: factoryResetHub"); },
  factoryResetHubOnly:                 () => { console.log("BluenetBridgeCall: factoryResetHubOnly"); },

  cancelConnectionRequest:             () => { console.log("BluenetBridgeCall: cancelConnectionRequest"); },
  getBehaviourDebugInformation:        () => { console.log("BluenetBridgeCall: getBehaviourDebugInformation"); },
  getTapToToggleThresholdOffset:       () => { console.log("BluenetBridgeCall: getTapToToggleThresholdOffset"); },
  canUseDynamicBackgroundBroadcasts:   () => { console.log("BluenetBridgeCall: canUseDynamicBackgroundBroadcasts"); },
  registerTrackedDevice:               () => { console.log("BluenetBridgeCall: registerTrackedDevice"); },
  trackedDeviceHeartbeat:              () => { console.log("BluenetBridgeCall: trackedDeviceHeartbeat"); },
  broadcastUpdateTrackedDevice:        () => { console.log("BluenetBridgeCall: broadcastUpdateTrackedDevice"); },
  getCrownstoneUptime:                 () => { console.log("BluenetBridgeCall: getCrownstoneUptime"); },
  getAdcRestarts:                      () => { console.log("BluenetBridgeCall: getAdcRestarts"); },
  getSwitchHistory:                    () => { console.log("BluenetBridgeCall: getSwitchHistory"); },
  getPowerSamples:                     () => { console.log("BluenetBridgeCall: getPowerSamples"); },
  getMinSchedulerFreeSpace:            () => { console.log("BluenetBridgeCall: getMinSchedulerFreeSpace"); },
  getLastResetReason:                  () => { console.log("BluenetBridgeCall: getLastResetReason"); },
  getGPREGRET:                         () => { console.log("BluenetBridgeCall: getGPREGRET"); },
  getAdcChannelSwaps:                  () => { console.log("BluenetBridgeCall: getAdcChannelSwaps"); },
  setSoftOnSpeed:                      () => { console.log("BluenetBridgeCall: setSoftOnSpeed"); },
  getSoftOnSpeed:                      () => { console.log("BluenetBridgeCall: getSoftOnSpeed"); },

  getConstants:                         () => { console.log("BluenetBridgeCall: getConstants"); },
  addListener:                          () => { console.log("BluenetBridgeCall: addListener"); },
  removeListeners:                      () => { console.log("BluenetBridgeCall: removeListener"); },

  useHighFrequencyScanningInBackground: () => {console.log("BluenetBridgeCall: useHighFrequencyScanningInBackground"); },
  getLaunchArguments:                   () => {console.log("BluenetBridgeCall: getLaunchArguments"); },
  gotoOsAppSettings:                    () => {console.log("BluenetBridgeCall: gotoSystemSettings"); },
  gotoOsLocationSettings:               () => {console.log("BluenetBridgeCall: gotoOsLocationSettings"); },
  requestBlePermission:                 () => {console.log("BluenetBridgeCall: requestBlePermission"); },
  vibrate:                              (type: vibrationType) => {console.log("BluenetBridgeCall: vibrate"); },
  setDefaultDimValue:                   () => {console.log("BluenetBridgeCall: setDefaultDimValue"); },
  setDoubleTapSwitchcraft:              () => {console.log("BluenetBridgeCall: setDoubleTapSwitchcraft"); },

};

if (DISABLE_NATIVE === true && BridgeConfig.mockBluenet === false) {
  // console.log("!----------- --- --- --- -- -- -- - - - -- -- -- --- --- --- -----------!");
  // console.log("!-----------  NATIVE CALLS ARE DISABLED BY EXTERNALCONFIG.JS -----------!");
  // console.log("!----------- --- --- --- -- -- -- - - - -- -- -- --- --- --- -----------!");
  //@ts-ignore
  Bluenet = BluenetAPI;
}
else if (NativeModules.BluenetJS) {
  // @ts-ignore
  if (global.__DEV__  || BridgeConfig.mockBluenet) {
    let wrappedBluenet = {};
    Object.keys(NativeModules.BluenetJS).forEach((key) => {
      wrappedBluenet[key] = function(param, param2, param3, param4, param5) {
        let bluenetArguments = [];
        // @ts-ignore
        for (let i = 0; i < arguments.length; i++) {
          // @ts-ignore
          if (arguments[i] !== undefined) {
            // @ts-ignore
            bluenetArguments.push(arguments[i])
          }
        }
        if (key === "loadFingerprint") {
          LOGi.info("BLUENET CALL:", key, '<redacted>');
        }
        else {
          LOGi.info("BLUENET CALL:", key, bluenetArguments);
        }
        if (BridgeConfig.mockBluenet) {
          return BridgeMock.callBluenet(key, bluenetArguments);
        }
        return NativeModules.BluenetJS[key].apply(this, bluenetArguments);
      }
    })
    //@ts-ignore
    Bluenet        = wrappedBluenet;
    //@ts-ignore
    Bluenet_direct = NativeModules.BluenetJS;
  }
  else {
    //@ts-ignore
    Bluenet        = NativeModules.BluenetJS;
    //@ts-ignore
    Bluenet_direct = NativeModules.BluenetJS;
  }

  let API_Keys = Object.keys(BluenetAPI);
  let notImplemented = [];
  for (let i = 0; i < API_Keys.length; i++) {
    if (Bluenet[API_Keys[i]] === undefined) {
      notImplemented.push(API_Keys[i])
    }
  }
  if (notImplemented.length > 0) {
    console.error("Unimplemented method in Bridge file:", notImplemented);
  }

  let existingKeys = Object.keys(Bluenet);
  let extraMethods = [];
  for (let i = 0; i < existingKeys.length; i++) {
    if (BluenetAPI[existingKeys[i]] === undefined) {
      extraMethods.push(existingKeys[i])
    }
  }
  if (extraMethods.length > 0) {
    console.warn("Additional methods detected in Bridge file:", extraMethods);
  }
}
