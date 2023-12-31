
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("SetupDeviceEntry", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component, useState } from "react";
import {
  Alert,
  TouchableOpacity,
  Text,
  View, ActivityIndicator, ViewStyle, Platform
} from "react-native";

import { SetupStateHandler } from '../../../native/setup/SetupStateHandler'
import { Icon } from '../Icon';
import { styles, colors} from '../../styles'
import {Util} from "../../../util/Util";
import { core } from "../../../Core";
import { IconButton } from "../IconButton";
import { SlideFadeInView } from "../animated/SlideFadeInView";
import { STONE_TYPES } from "../../../Enums";
import { tell } from "../../../logic/constellation/Tellers";
import { DraggableProps } from "../hooks/draggableHooks";
import { useTimeout } from "../hooks/timerHooks";
import { Get } from "../../../util/GetUtil";
import { DataUtil } from "../../../util/DataUtil";
import { HubUtil } from "../../../util/HubUtil";
import { useDatabaseChange } from "../hooks/databaseHooks";
import { NavigationUtil } from "../../../util/navigation/NavigationUtil";
import { BlurEntry, BlurEntryProps, DraggableBlurEntry, TappableBlurEntry } from "../BlurEntries";
import { DeviceEntryIcon } from "./submodules/DeviceEntryIcon";
import { HubEntryLabel, SetupDeviceEntryLabel } from "./submodules/DeviceLabels";
import { SetupDeviceEntryIcon } from "./submodules/SetupDeviceEntryIcon";


export class SetupDeviceEntry_addMenu extends Component<{handle, sphereId, callback: any, item?, restore?, testID?: string}, any> {
  baseHeight : any;
  setupEvents : any;
  rssiTimeout : any = null;

  constructor(props) {
    super(props);

    this.baseHeight = props.height || 100;

    this.state = {
      name: props.item.name,
      subtext: props.restore ? lang("I_need_to_be_setup_up_again") : lang("Tap_here_to_add_it_to_thi"),
      showRssi: false,
      rssi: null,
      pendingCommand: false,
    };

    this.setupEvents = [];
  }

  componentDidMount() {
    this.setupEvents.push(core.eventBus.on(Util.events.getSetupTopic(this.props.handle), (data) => {
    if (data.rssi < 0) {
      if (this.state.rssi === null) {
        this.setState({rssi: data.rssi, showRssi: true});
      }
      else {
        this.setState({rssi: Math.round(0.2 * data.rssi + 0.8 * this.state.rssi), showRssi: true});
      }
      clearTimeout(this.rssiTimeout);
      this.rssiTimeout = setTimeout(() => { this.setState({showRssi: false, rssi: null}) }, 5000);
    }
  }));
  }

  componentWillUnmount() { // cleanup
    clearTimeout(this.rssiTimeout);
    this.setupEvents.forEach((unsubscribe) => { unsubscribe(); });
  }

  _getIcon() {
    let color = colors.blinkColor1.hex;

    return (
      <View style={[{
        width:  60,
        height: 60,
        borderRadius:30,
        backgroundColor: color,
        }, styles.centered]}>
        <Icon name={this.props.item.icon} size={35} color={'#ffffff'} style={{ backgroundColor:'transparent' }} />
      </View>
    );
  }


  _getControl() {
    if (this.props.restore) { return; }

    let content;
    let action = null;
    if (this.state.pendingCommand === true) {
      content = <ActivityIndicator animating={true} size='large' />;
    }
    else {
      let iconSize = 40;
      content = (
        <IconButton name={"md-color-wand"}
          size={iconSize*0.8}
          buttonSize={iconSize}
          radius={iconSize*0.5}

          color={ colors.blinkColor1.rgba(1)}
          buttonStyle={{ backgroundColor: colors.white.hex, borderWidth: 2, borderColor: colors.blinkColor1.hex }}
        />
      );
      action = () => {
        this.setState({pendingCommand:true});
        tell(this.props.handle).setupPulse()
          .then(() => {  this.setState({pendingCommand: false})})
          .catch((err) => {
            Alert.alert(
              lang("_Something_went_wrong_____header"),
              lang("_Something_went_wrong_____body"),
      [{text:lang("_Something_went_wrong_____left")}]
            );
            this.setState({pendingCommand: false});
          })
      };
    }


    let wrapperStyle : ViewStyle = {height: this.baseHeight, width: 60, alignItems:'flex-end', justifyContent:'center'};
    if (action) {
      return (
        <TouchableOpacity onPress={() => { action() }} style={wrapperStyle} testID={`setupPulse${this.props.handle}`}>
          {content}
        </TouchableOpacity>
      );
    }
    else {
      return <View style={wrapperStyle}>{content}</View>;
    }
  }


  render() {
    let canSwitch = !(this.props.item.type === STONE_TYPES.guidestone || this.props.item.type === STONE_TYPES.crownstoneUSB || this.props.item.type === STONE_TYPES.hub);
    return (
      <View style={{flexDirection: 'column', height: this.baseHeight, flex: 1, overflow:'hidden'}} testID={this.props.testID}>
        <View style={{flexDirection: 'row', height: this.baseHeight, paddingRight: 0, paddingLeft: 0, flex: 1, overflow:'hidden'}}>
          <TouchableOpacity style={{paddingRight: 20, height: this.baseHeight, justifyContent: 'center', overflow:'hidden'}} testID={`selectSetupEntry${this.props.handle}`} onPress={() => { this.props.callback(); }}>
            {this._getIcon()}
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, height: this.baseHeight, overflow:'hidden'}} onPress={() => { this.props.callback(); }}>
            <SlideFadeInView visible={!this.state.pendingCommand} height={this.baseHeight} style={{justifyContent:'center'}}>
              <Text style={{fontSize: 17}}>{this.state.name}</Text>
              {this._getSubText()}
            </SlideFadeInView>
            <SlideFadeInView visible={ this.state.pendingCommand} height={this.baseHeight} style={{justifyContent:'center'}}>
              <Text style={{fontSize: 13}}>{ lang("Toggling____You_should_he") }</Text>
            </SlideFadeInView>
          </TouchableOpacity>
          { canSwitch && this._getControl() }
        </View>
      </View>
    );
  }



  _getSubText() {
    if (this.state.showRssi && SetupStateHandler.isSetupInProgress() === false) {
      if (this.state.rssi > -50) {
        return <View style={{flexDirection: 'column'}}>
          <Text style={{fontSize: 12}}>{this.state.subtext}</Text>
          <Text style={{fontSize: 12, color: colors.iosBlue.hex}}>{ lang("_Very_Near_") }</Text>
        </View>;
      }
      if (this.state.rssi > -75) {
        return <View style={{flexDirection: 'column'}}>
          <Text style={{fontSize: 12}}>{this.state.subtext}</Text>
          <Text style={{fontSize: 12, color: colors.iosBlue.hex}}>{ lang("_Near_") }</Text>
        </View>;
      }
      else if (this.state.rssi > -90) {
        return <View style={{flexDirection: 'column'}}>
          <Text style={{fontSize: 12}}>{this.state.subtext}</Text>
          <Text style={{fontSize: 12, color: colors.iosBlue.hex}}>{ lang("_Visible_") }</Text>
        </View>;
      }
      else if (this.state.rssi > -95) {
        return <View style={{flexDirection: 'column'}}>
          <Text style={{fontSize: 12}}>{this.state.subtext}</Text>
          <Text style={{fontSize: 12, color: colors.iosBlue.hex}}>{ lang("_Barely_visible_") }</Text>
        </View>;
      }
      else {
        return <View style={{flexDirection: 'column'}}>
          <Text style={{fontSize: 12}}>{this.state.subtext}</Text>
          <Text style={{fontSize: 12, color: colors.iosBlue.hex}}>{ lang("_Too_far_away_") }</Text>
        </View>;
      }
    }
    else {
      return <View style={{flexDirection: 'column'}}>
        <Text style={{fontSize: 12}}>{this.state.subtext}</Text>
        <Text style={{fontSize: 12, color: colors.iosBlue.hex}}>{''}</Text>
      </View>;
    }
  }
}


interface SetupDeviceEntryProps {
  item: { name: string, icon: string },
  testID?: string,
  sphereId?: string,
  handle?: string,
  callback?: () => void,
}


export function SetupDeviceEntry_RoomOverview(props: SetupDeviceEntryProps) {
  return (
    <TappableBlurEntry
      {...props}
      title={props.item.name}
      heightOffset={10}
      backgroundColor={colors.blue.rgba(Platform.OS === 'android' ? 0.9 : 0.7)}
      labelItem={<SetupDeviceEntryLabel />}
      iconItem={<SetupDeviceEntryIcon icon={props.item.icon} />}
      tapCallback={props.callback}
    />
  );
}
