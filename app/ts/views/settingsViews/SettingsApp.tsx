import { LiveComponent }          from "../LiveComponent";

import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("SettingsApp", key)(a,b,c,d,e);
}
import * as React from 'react';

import {Alert, ScrollView} from 'react-native';
import { Bluenet }    from '../../native/libInterface/Bluenet'
import { CLOUD }      from '../../cloud/cloudAPI'
import { LOG }        from '../../logging/Log'
import { colors }     from "../styles";
import { Util }       from "../../util/Util";
import { core }       from "../../Core";
import { TopBarUtil } from "../../util/TopBarUtil";
import { SliderBar }  from "../components/editComponents/SliderBar";
import { DataUtil }   from "../../util/DataUtil";
import { Icon }       from "../components/Icon";
import { ListEditableItems }       from '../components/ListEditableItems'
import {SettingsBackground, SettingsNavbarBackground} from "../components/SettingsBackground";
import {LocalizationCore} from "../../localization/LocalizationCore";
import {Get} from "../../util/GetUtil";
import { NavigationUtil } from "../../util/navigation/NavigationUtil";
import { SettingsScrollView } from "../components/SettingsScrollView";


export class SettingsApp extends LiveComponent<any, any> {
  static options(props) {
    return TopBarUtil.getOptions({title: lang("App_Settings"), closeModal: props.isModal});
  }

  unsubscribe : any;

  componentDidMount() {
    this.unsubscribe = core.eventBus.on("databaseChange", (data) => {
      let change = data.change;
      if (change.changeAppSettings || change.changeSphereFeatures) {
        this.forceUpdate();
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  _getExplanation(rssiOffset) {
    if (!rssiOffset || rssiOffset === 0) {
      return lang("Tap_to_toggle_when_the_ph")
    }
    else if (rssiOffset > 0 && rssiOffset <= 5) {
      return lang("Tap_to_toggle_when_the_pho")
    }
    else if (rssiOffset > 5) {
      return lang("Tap_to_toggle_when_the_phon")
    }
    else if (rssiOffset < 0 && rssiOffset >= -5) {
      return lang("Tap_to_toggle_when_the_phone")
    }
    else if (rssiOffset < -5) {
      return lang("Tap_to_toggle_when_the_phone_")
    }
  }

  _getExplanationHeight(rssiOffset) {
    if (!rssiOffset || rssiOffset === 0) {
      return 40;
    }
    else if (rssiOffset > 0 && rssiOffset <= 5) {
      return 40;
    }
    else if (rssiOffset > 5) {
      return 40;
    }
    else if (rssiOffset < 0 && rssiOffset >= -5) {
      return 40;
    }
    else if (rssiOffset < -5) {
      return 60;
    }
  }

  _getItems() {
    const store = core.store;
    let state = store.getState();

    let items = [];

    items.push({ label: lang("LANGUAGE"), type: 'explanation', below: false });
    let dropDownItems = [];
    dropDownItems.push({ label: lang("English"),    value: 'en_us' });
    dropDownItems.push({ label: lang("Nederlands"), value: 'nl_nl' });
    items.push({
      type: 'dropdown',
      label: lang("Language"),
      buttons: false,
      icon: <Icon name="md-globe" size={28} color={ colors.green.hex } />,
      value: state.user.language || Languages.defaultLanguage,
      dropdownHeight: 130,
      items: dropDownItems,
      callback: (value) => {
        // store.dispatch({ type: 'UPDATE_APP_SETTINGS', data: { language: value } });
        store.dispatch({ type: 'USER_UPDATE', data: { language: value } });
        Languages.updateLocale();
        core.eventBus.emit("FORCE_RERENDER")
      }
    });


    items.push({label: lang("FEATURES"), type: 'explanation', below: false});
    items.push({
      label: lang("Use_Tap_To_Toggle"),
      value: state.app.tapToToggleEnabled,
      type: 'switch',
      testID: 'tapToToggle_switch',
      icon: <Icon name="md-color-wand" size={25} color={colors.purple.hex} />,
      callback:(newValue) => {
        store.dispatch({
          type: 'UPDATE_APP_SETTINGS',
          data: { tapToToggleEnabled: newValue }
        });
    }});


    if (state.app.tapToToggleEnabled) {
      let deviceId = Util.data.getCurrentDeviceId(state);
      let device = state.devices[deviceId];
      items.push({
        __item: (
          <SliderBar
            label={ lang("Sensitivity")}
            sliderHidden={true}
            icon={<Icon name="ios-options" size={25} color={colors.darkPurple.hex} />}
            callback={(value) => {
              let deviceId = Util.data.getCurrentDeviceId(state);
              core.store.dispatch({ type: "SET_RSSI_OFFSET", deviceId: deviceId, data: {rssiOffset: -value}})
              this.forceUpdate();
            }}
            min={-16}
            max={16}
            value={-1 * (device?.rssiOffset ?? -40)}
            explanation={this._getExplanation(-device.rssiOffset)}
            explanationHeight={this._getExplanationHeight(-device.rssiOffset)}
            testID={"SliderBar"}
          />
        )});
    }

    if (state.app.indoorLocalizationEnabled) {
      items.push({label: lang("Tap_to_toggle_allows_you_"), type: 'explanation', below: true});
    }
    else {
      items.push({label: lang("If_indoor_localization_is"), type: 'explanation', below: true});
    }


    items.push({
      label: lang("Use_Indoor_localization"),
      value: state.app.indoorLocalizationEnabled,
      type: 'switch',
      testID:"useIndoorLocalization",
      icon: <Icon name="c1-locationPin1" size={22} color={colors.blue.hex}/>,
      callback: (newValue) => {
        store.dispatch({
          type: 'UPDATE_APP_SETTINGS',
          data: {indoorLocalizationEnabled: newValue}
        });

        LOG.info("BackgroundProcessHandler: Set background processes to", newValue);
        Bluenet.setBackgroundScanning(newValue);

        if (newValue === false) {
          LocalizationCore.disableLocalization();

          // REMOVE USER FROM ALL SPHERES AND ALL LOCATIONS IN THE CLOUD
          let deviceId = Util.data.getCurrentDeviceId(state);
          if (deviceId) {
            CLOUD.forDevice(deviceId).exitSphere("*").catch(() => { });  // will also clear location
          }

          // remove user from all locations in the app
          let userId = state.user.userId as string;
          let actions = [];
          DataUtil.callOnAllLocations((sphereId, locationId, location) => {
            if (location.presentUsers.indexOf(userId) !== -1) {
              actions.push({
                type: 'USER_EXIT_LOCATION',
                sphereId: sphereId,
                locationId: locationId,
                data: {userId: state.user.userId}
              });
            }
          })

          if (actions.length > 0) {
            core.store.batchDispatch(actions);
          }
        }
        else {
          LocalizationCore.enableLocalization();
        }
      }
    });
    items.push({
      label: lang("Indoor_localization_allow"),
      type: 'explanation',
      below: true
    });

    items.push({
      label: lang("ENERGY_HISTORY__EXPERIMEN"),
      type: 'explanation', alreadyPadded:true
    });
    items.push({
      label: lang("Show_energy_history"),
      value: state.app.showEnergyData,
      type: 'switch',
      testID: 'energyHistory',
      icon: <Icon name="fa-bar-chart" size={25} color={colors.darkPurple.hex} />,
      callback:(newValue) => {
        store.dispatch({
          type: 'UPDATE_APP_SETTINGS',
          data: { showEnergyData: newValue }
        });
    }});
    items.push({
      label: lang("Enabling_energy_history_r"),
      type: 'explanation', alreadyPadded:true
    });

    items.push({
      label: lang("CUSTOM_CLOUDS"),
      type: 'explanation',
    });

    items.push({
      label: lang("Customize_cloud_address"),
      type: 'button',
      icon: <Icon name="fa5-cloud" size={22} color={colors.csBlue.hex}/>,
      style:{color:colors.csBlue.hex},
      callback: () => {
        NavigationUtil.launchModal("CloudChoice");
      }
    });

    items.push({
      label: lang("You_can_run_your_cloud_lo"),
      type: 'explanation',
      below: true
    });



    let revokeItems = [];
    let spheres = core.store.getState().spheres;
    for (let sphereId in spheres) {
      if (Get.energyCollectionPermission(sphereId)) {
        revokeItems.push({
          type:'button',
          label: lang("Revoke_for_",spheres[sphereId].config.name),
          callback: async () => {
            try {
              await CLOUD.forSphere(sphereId).setEnergyUploadPermission(false)
              core.store.dispatch({type: 'REMOVE_SPHERE_FEATURE', sphereId: sphereId, featureId: 'ENERGY_COLLECTION_PERMISSION'});
            }
            catch (err) {
              Alert.alert(
                lang("_Could_not_revoke_permiss_header"),
                lang("_Could_not_revoke_permiss_body"),
                [{text:lang("_Could_not_revoke_permiss_left")}]);
            }
          }
        })
      }
    }

    if (revokeItems.length > 0) {
      items.push({type: 'explanation', label: lang("ENERGY_COLLECTION_PERMISS"), alreadyPadded:false});
      items = items.concat(revokeItems);
    }

    items.push({type: 'spacer'});
    items.push({type: 'spacer'});





    return items;
  }

  render() {
    if (this.props.isModal) {
      return (
        <SettingsBackground>
          <SettingsScrollView keyboardShouldPersistTaps="always">
            <ListEditableItems items={this._getItems()} separatorIndent={true} />
          </SettingsScrollView>
        </SettingsBackground>
      );
    }
    return (
      <SettingsNavbarBackground testID={"SettingsApp"}>
        <SettingsScrollView keyboardShouldPersistTaps="always">
          <ListEditableItems items={this._getItems()} separatorIndent={true} />
        </SettingsScrollView>
      </SettingsNavbarBackground>
    );
  }
}
