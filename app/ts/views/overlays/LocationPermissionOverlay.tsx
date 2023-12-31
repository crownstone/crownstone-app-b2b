
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("LocationPermissionOverlay", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Alert, Linking, Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Icon }         from '../components/Icon'
import {styles, colors, screenHeight, screenWidth} from '../styles'
import { Bluenet } from "../../native/libInterface/Bluenet";
import { core } from "../../Core";
import { NavigationUtil } from "../../util/navigation/NavigationUtil";
import { SimpleOverlayBox } from "../components/overlays/SimpleOverlayBox";
import { OnScreenNotifications } from "../../notifications/OnScreenNotifications";

export class LocationPermissionOverlay extends Component<any, any> {
  unsubscribe : any;

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      notificationType: props.status,
      waitingOnPermission: false,
      showRequestFailed: false
    };
    this.unsubscribe = [];
  }

  componentDidMount() {
    this.setState({ visible: true });
    this.unsubscribe.push(core.nativeBus.on(core.nativeBus.topics.locationStatus, (status) => {
      switch (status) {
        case "off":
          if (this.state.waitingOnPermission) {
            this.setState({showRequestFailed: true, notificationType: status})
            if (Platform.OS === 'ios') {
              Alert.alert(
                lang("_Request_not_allowed______header"),
                lang("_Request_not_allowed______body"),
                [{text:lang("_Request_not_allowed______left"), onPress:() => {
                Linking.openURL('app-settings:')
              }}])
            }
            return;
          }
          this.setState({notificationType: status});
          break;
        case "on":
          this.setState({visible: false, notificationType: status, waitingOnPermission: false, showRequestFailed: false},
            () => {  NavigationUtil.closeOverlay(this.props.componentId); });
          break;
        case "unknown":
          this.setState({notificationType: status});
          break;
        case "noPermission":
          this.setState({notificationType: status});
          break;
        default:
          this.setState({notificationType: status});
          break;
      }
    }));
  }

  componentWillUnmount() {
    this.unsubscribe.forEach((callback) => {callback()});
    this.unsubscribe = [];
  }

  _getTitle() {
    switch (this.state.notificationType) {
      case "foreground":
        return lang("Only_while_in_app_permiss");
      case "manualPermissionRequired":
        return lang("ManualPermission_title");
      case "on":
        return lang("Location_Services_are_on_");
      case "off":
        return lang("Location_Services_are_dis");
      case "noPermission":
        return lang("Location_permission_missi");
      default: // "unknown":
        return lang("Starting_Location_Service");
    }
  }

  _getOnScreenNotificationTitle() {
    switch (this.state.notificationType) {
      case "on":
        return 'Ready';
      case "off":
        return lang("Location_disabled");
      case "foreground":
      case "manualPermissionRequired":
      case "noPermission":
        return lang("Permission_required");
      default: // "unknown":
        return lang("Location_disabled");
    }
  }

  _getText() {
    switch (this.state.notificationType) {
      case "foreground":
        return lang("Crownstone_cannot_react_t");
      case "manualPermissionRequired":
        if (Platform.OS === 'ios') {
          return lang("ManualPermission_body");
        }
        else {
          return lang("ManualPermission_body_android");
        }
      case "on":
        return lang("Everything_is_great_");
      case "off":
      case "noPermission":
        return lang("Without_location_services");
      default: // "unknown":
        return lang("This_should_not_take_long");
    }
  }

  _getToAppSettingsButton() {
    return (
      <PopupButton
        callback={() => { this.setState({waitingOnPermission: true}); Bluenet.gotoOsLocationSettings() }}
        label={lang("toAppSettings")}
      />
    );
  }

  _getButton() {
    if (Platform.OS === 'android') {
      switch (this.state.notificationType) {
        case "on": return <React.Fragment />;
        case "off":
          return (
            <PopupButton
              callback={() => { Bluenet.gotoOsLocationSettings() }}
              label={lang("Turn_on")}
            />
          );
        case "noPermission":
          return (
            <PopupButton
              callback={() => { Bluenet.requestLocationPermission() }}
              label={lang("Request_Permission")}
            />
          );
        case "manualPermissionRequired":
        default:
          return (
            <PopupButton
              callback={() => { Bluenet.gotoOsAppSettings() }}
              label={lang("Request_Permission")}
            />
          );
      }
    }


    switch (this.state.notificationType) {
      case "manualPermissionRequired":
      case "foreground":
        return this._getToAppSettingsButton()
      case "off":
      case "noPermission":
        return (
          <PopupButton
            callback={() => { this.setState({waitingOnPermission: true}); Bluenet.requestLocationPermission() }}
            label={lang("Request_Permission")}
          />
        );
    }
  }


  render() {
    return (
      <SimpleOverlayBox
        visible={this.state.visible}
        overrideBackButton={false}
        canClose={true}
        closeCallback={() => {
          NavigationUtil.closeOverlay(this.props.componentId);
          OnScreenNotifications.setNotification({
            source: "LocationPermissionOverlay",
            id: "LocationPermissionState",
            label: this._getOnScreenNotificationTitle(),
            icon: "c1-locationPin1",
            backgroundColor: colors.csOrange.rgba(0.5),
            callback: () => {
              NavigationUtil.showOverlay('LocationPermissionOverlay', {status: core.permissionState.location});
            }
          })
        }}
      >
        <View style={{flex:1, alignItems:'center'}}>
          <View style={{flex:1}} />
          <Icon
            name="c1-locationPin1"
            size={Math.min(120,Math.min(0.30*screenHeight, 0.5*screenWidth))}
            color={colors.blue.hex}
          />
          <View style={{flex:1}} />
          <Text style={{fontSize: 16, fontWeight: 'bold', color: colors.black.hex, padding:20, textAlign:'center'}}>
            {this._getTitle()}
          </Text>
          <Text style={{fontSize: 12, fontWeight: 'bold',  color: colors.black.hex, padding:20, textAlign:'center'}}>
            {this._getText()}
          </Text>
          <View style={{flex:1}} />
          { Platform.OS === 'android' &&  this._getButton() }
          { Platform.OS === 'ios'     &&  (
            this.state.showRequestFailed ?
              <React.Fragment>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.blue.hex, padding: 25, textAlign: 'center' }}>{ lang("Request_failed____Youll_h") }</Text>
                {this._getToAppSettingsButton()}
              </React.Fragment>
              : this._getButton()
            )
          }
          <View style={{flex:1}} />
        </View>
      </SimpleOverlayBox>
    );
  }
}


export function PopupButton(props : {label: string, callback: () => void}) {
  return (
    <TouchableOpacity
      onPress={props.callback}
      style={[styles.centered, {
        width: 0.6 * screenWidth,
        height: 50,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: colors.blue.hex,
      }]}>
      <Text style={{fontSize: 15, fontWeight: 'bold', color: colors.blue.hex}}>{props.label}</Text>
    </TouchableOpacity>
  );
}
