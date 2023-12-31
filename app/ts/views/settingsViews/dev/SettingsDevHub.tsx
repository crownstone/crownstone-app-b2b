import * as React from 'react';
import { LiveComponent } from "../../LiveComponent";
import { background, colors, deviceStyles } from "../../styles";
import { IconButton } from "../../components/IconButton";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { ListEditableItems } from "../../components/ListEditableItems";
import { DebugIcon } from "../../components/DebugIcon";
import { DataUtil } from "../../../util/DataUtil";
import { HUB_API } from "../../../cloud/localHub/HubApi";
import { core } from "../../../Core";
import { NavigationUtil } from "../../../util/navigation/NavigationUtil";
import {SettingsBackground, SettingsNavbarBackground} from "../../components/SettingsBackground";
import {TopBarUtil} from "../../../util/TopBarUtil";


export class SettingsDevHub extends LiveComponent<{ sphereId: string, stoneId: string }, any> {
  static options(props) {
    return TopBarUtil.getOptions({title: 'Developer settings', closeModal: true});
  }

  developerSettings: HubDevOptions = {}

  constructor(props) {
    super(props);

    this.state = {
      developerControllerEnabled: false,
      obtainedSettings: false,
    };

    this.initialize();
  }

  async initialize() {
    let hub = DataUtil.getHubByStoneId(this.props.sphereId, this.props.stoneId);
    let success = await HUB_API.enableDeveloperController(hub, () => { NavigationUtil.back(); });
    if (success) {
      this.setState({developerControllerEnabled: true});
      try {
        this.developerSettings = await HUB_API.getDeveloperOptions(hub);
        this.setState({obtainedSettings: true})
      }
      catch (err : any) {
        Alert.alert("Something went wrong", err,[{text:"Damn.."}]);
      }
    }
  }

  render() {
    let hub = DataUtil.getHubByStoneId(this.props.sphereId, this.props.stoneId);
    if (!hub) {
      return (
        <SettingsBackground>
          <View style={{flex:0.25}} />
          <Text style={deviceStyles.header}>No hub instance available...</Text>
          <View style={{flex:0.25}} />
          <DebugIcon sphereId={this.props.sphereId} stoneId={this.props.stoneId} />
        </SettingsBackground>
      );
    }

    if (!this.state.obtainedSettings) {
      return (
        <SettingsBackground>
          <View style={{flex:0.25}} />
          <ActivityIndicator size={"large"} />
          <View style={{flex:0.25}} />
        </SettingsBackground>
      )
    }

    let devOptions = [];
    if (this.state.developerControllerEnabled) {
      devOptions.push({
        label: "Disable dev controller",
        type: 'button',
        style: { color: colors.iosBlue.hex },
        icon: <IconButton name="ios-cog" size={22} color="#fff" buttonStyle={{ backgroundColor: colors.csOrange.hex }}/>,
        callback: async () => {
          core.eventBus.emit("showLoading", "Enabling developer controller...")
          let success = await HUB_API.disableDeveloperController(hub);
          core.eventBus.emit("hideLoading")
          if (success) {
            Alert.alert("Done!",
              "Since you disabled the developer mode, we'll return to the previous screen.",[
                {text:"Great!", onPress: () => { NavigationUtil.dismissModal() }}], {cancelable:false}); }
        }
      });
    }
    else {
      devOptions.push({
        label: "Enable dev controller",
        type: 'button',
        style: { color: colors.iosBlue.hex },
        icon: <IconButton name="ios-cog" size={22} color="#fff" buttonStyle={{ backgroundColor: colors.csOrange.hex }}/>,
        callback: async () => {
          core.eventBus.emit("showLoading", "Enabling developer controller...")
          let success = await HUB_API.enableDeveloperController(hub);
          core.eventBus.emit("hideLoading")
          if (success) { Alert.alert("Done!","What's next?",[{text:"OK"}]); }
        }
      });
    }
    devOptions.push({
      label: "Enable log controller",
      type: 'button',
      style: { color: colors.iosBlue.hex },
      icon: <IconButton name="ios-copy" size={22} color="#fff" buttonStyle={{ backgroundColor: colors.green.hex }}/>,
      callback: async () => {
        core.eventBus.emit("showLoading", "Enabling logging controller...")
        let success = await HUB_API.enableLoggingController(hub);
        core.eventBus.emit("hideLoading")
        if (success) { Alert.alert("Done!","What's next?",[{text:"OK"}]); }
      }
    });
    devOptions.push({type:'explanation', label:"AVAILABLE OPTIONS"})
    devOptions.push({
      label: "Act on switch events",
      value: this.developerSettings?.actOnSwitchCommands ?? true,
      type: 'switch',
      disabled: this.state.obtainedSettings === false,
      icon: <IconButton name="md-power" size={22}  color="#fff" buttonStyle={{backgroundColor: colors.green.hex}}/>,
      callback: async (newValue) => {
        this.developerSettings.actOnSwitchCommands = newValue;

        core.eventBus.emit("showLoading","Updating options...")
        try {
          await HUB_API.pushDeveloperOptions(hub, this.developerSettings);
          this.forceUpdate()
          core.eventBus.emit("hideLoading")
        }
        catch (err:any) {
          Alert.alert(
            "Something went wrong", String(err),[{text:"Damn..", onPress:() => { core.eventBus.emit("hideLoading")}}],
            { cancelable: false }
          );
        }
      }
    });
    devOptions.push({type:'explanation', label:"Act on switch events will toggle Crownstones based on incoming switch commands via the SSE server (when a switch command is sent to the Crownstone cloud)."})


    return (
      <SettingsBackground>
        <View style={{flex:0.25}} />
        <Text style={deviceStyles.header}>Hub developer options</Text>
        <View style={{flex:0.1}} />
        <ListEditableItems items={devOptions} separatorIndent={true}/>
        <View style={{flex:0.1}} />
        <View style={{flex:0.25}} />
      </SettingsBackground>
    );
  }
}

