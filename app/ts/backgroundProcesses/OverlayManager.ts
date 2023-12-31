import { core } from "../Core";
import { NavigationUtil } from "../util/navigation/NavigationUtil";
import { Alert } from "react-native";
import { LOGe, LOGi } from "../logging/Log";
import { OnScreenNotifications } from "../notifications/OnScreenNotifications";


class OverlayManagerClass {
  _initialized : boolean = false;
  _initializedStateOverlays : boolean = false;

  loadingState = false;

  init() {
    if (this._initialized === false) {
      core.eventBus.on('showAicoreTimeCustomizationOverlay', (data) => { NavigationUtil.showOverlay('AicoreTimeCustomizationOverlay',{data: data}); })

      // alert from the lib(s)
      core.nativeBus.on(core.nativeBus.topics.libAlert, (data) => {
        Alert.alert(data.header, data.body,[{text: data.buttonText }]);
      })

      // message popup from the lib
      core.nativeBus.on(core.nativeBus.topics.libPopup,(data) => {
        NavigationUtil.showOverlay('LibMessages',{data: data});
      });

      // hardware errors
      core.eventBus.on('showListOverlay',      (data) => { NavigationUtil.showOverlay('ListOverlay',{data: data}); });
      core.eventBus.on('showDimLevelOverlay',  (data) => { NavigationUtil.showOverlay('DimLevelOverlay',   {data: data}); })
      core.eventBus.on('showPopup',            (data) => { NavigationUtil.showOverlay('OptionPopup',   {data: data}); })
      core.eventBus.on('showLoading',          (data) => { this.loadingState = true; NavigationUtil.showOverlay('Processing',    {data: data}); })
      core.eventBus.on('hideLoading',          () => {     this.loadingState = false; })
      core.eventBus.on('showProgress',         (data) => { this.loadingState = true; NavigationUtil.showOverlay('Processing',    {data: data}); })
      core.eventBus.on('showCustomOverlay',    (data) => { NavigationUtil.showOverlay('SimpleOverlay', {data: data}); })
      core.eventBus.on('showSelectCrownstoneOverlay',    (data) => { NavigationUtil.showOverlay('SelectCrownstoneOverlay', data); })
      core.eventBus.on('showNumericOverlay',   (data) => { NavigationUtil.showOverlay('NumericOverlay',{data: data}); })
      core.eventBus.on('showTextInputOverlay', (data) => { NavigationUtil.showOverlay('TextInputOverlay',{data: data}); })
    }
    this._initialized = true;
  }

  initStateOverlays() {
    if (this._initializedStateOverlays === false) {
      // ble status popup
      core.nativeBus.on(core.nativeBus.topics.bleStatus, (status) => {
        core.permissionState.bluetooth = status;
        LOGi.info("OverlayManager: Received bleStatus status", status)
        switch (status) {
          case "poweredOff":
          case "unauthorized":
          case "manualPermissionRequired":
            core.bleState.bleAvailable = false;
            NavigationUtil.showOverlay('BleStateOverlay', { notificationType: status, type: "SCANNER" });
            break;
          default:
            core.bleState.bleAvailable = true;
            OnScreenNotifications.removeAllNotificationsFrom("BleStateOverlay");
        }
      });
      core.nativeBus.on(core.nativeBus.topics.bleBroadcastStatus, (status) => {
        LOGi.info("OverlayManager: Received bleBroadcastStatus status", status)
        switch (status) {
          case "restricted":
          case "denied":
            core.bleState.bleBroadcastAvailable = false;
            NavigationUtil.showOverlay('BleStateOverlay', { notificationType: status, type: "BROADCASTER" });
            break;
          default:
            core.bleState.bleBroadcastAvailable = true;
        }
      });

      // location permission updates.
      core.nativeBus.on(core.nativeBus.topics.locationStatus, (status) => {
        core.permissionState.location = status;
        LOGi.info("OverlayManager: Received locations status", status)
        switch (status) {
          case "off":
          case "unknown":
          case "noPermission":
          case "manualPermissionRequired":
          case "foreground":
            NavigationUtil.showOverlay('LocationPermissionOverlay',{status: status});
            break;
          case "on":
            OnScreenNotifications.removeAllNotificationsFrom("LocationPermissionOverlay");
            break;
          default:
            LOGe.info("OverlayManager: UNKNOWN PERMISSION FOR LOCATION", status);
        }
      });
    }
    this._initializedStateOverlays = true;
  }
}

export const OverlayManager = new OverlayManagerClass();












