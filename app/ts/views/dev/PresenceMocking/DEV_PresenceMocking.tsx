//
// import { Languages } from "../../../Languages"
//
// function lang(key,a?,b?,c?,d?,e?) {
//   return Languages.get("DEV_PresenceMocking", key)(a,b,c,d,e);
// }
import React from "react";
import { Background } from "../../components/Background";
import { core } from "../../../Core";
import { TopBarUtil } from "../../../util/TopBarUtil";
import { LiveComponent } from "../../LiveComponent";
import { View, Text, ScrollView} from "react-native";
import { BroadcastStateManager } from "../../../backgroundProcesses/BroadcastStateManager";
import { BackButton, RoomEntry, SphereEntry } from "../user/DEV_UserDataSpheres";
import { availableScreenHeight, background, colors, screenWidth } from "../../styles";
import { SettingsNavbarBackground } from "../../components/SettingsBackground";
import { SettingsScrollView } from "../../components/SettingsScrollView";

export class DEV_PresenceMocking extends LiveComponent<any, any> {
  static options(props) {
    return TopBarUtil.getOptions({title: "Presence Mocking"})
  }

  constructor(props) {
    super(props);

    this.state = {sphereId: null, locationId: null};
  }


  getSpheres() {
    let state = core.store.getState();
    let spheres = state.spheres;
    let sphereIds = Object.keys(spheres);

    let sortedSphereIds = [];

    sphereIds.forEach((sphereId) => {
      sortedSphereIds.push({name: spheres[sphereId].config.name, id: sphereId, uid: spheres[sphereId].config.uid})
    })

    sortedSphereIds.sort((a,b) => { return a.name < b.name ? -1 : 1 })

    let result = []
    sortedSphereIds.forEach((sphereData) => {
      let sphereId = sphereData.id;
      result.push(
        <SphereEntry
          key={sphereId}
          sphere={spheres[sphereId]}
          sphereId={sphereId}
          callback={() => {
            this.setState({sphereId: sphereId})
            BroadcastStateManager._updateLocationState(sphereId, null);
            BroadcastStateManager._reloadDevicePreferences();
          }}
        />
      );
    })

    return result;
  }

  getRooms() {
    let state = core.store.getState();
    let sphere = state.spheres[this.state.sphereId];
    let locations = sphere.locations;
    let locationIds = [];
    Object.keys(locations).forEach((locationId) => {
      locationIds.push({name: locations[locationId].config.name, id: locationId});
    })

    locationIds.sort((a,b) => { return a.name < b.name ? -1 : 1 })

    let result = []
    locationIds.forEach((locationData) => {
      let locationId = locationData.id;
      result.push(
        <RoomEntry
          key={locationId}
          location={locations[locationId]}
          locationId={locationId}
          selected={this.state.locationId == locationId}
          callback={() => {
            this.setState({locationId: locationId})
            BroadcastStateManager._updateLocationState(this.state.sphereId, locationId);
            BroadcastStateManager._reloadDevicePreferences();
          }}
        />
      );
    })

    result.push(<View key={'locSpacer'} style={{height:40, width:screenWidth}} />);
    result.push(<BackButton key={'backButton'} callback={() => { this.setState({sphereId: null, locationId: null});}} />);

    return result;
  }

  render() {
    return (
      <SettingsNavbarBackground>
        <SettingsScrollView keyboardShouldPersistTaps="never" style={{width: screenWidth, height:availableScreenHeight}}>
          <View style={{flexDirection:'column', alignItems:'center', justifyContent: 'center', minHeight: availableScreenHeight, width: screenWidth}}>
            <View style={{height:30, width:screenWidth}} />
            <Text style={{fontSize:30, fontWeight:"bold"}}>{ this.state.sphereId ? "Mock which room?" : "Select Sphere to mock." }</Text>
            <View style={{height:20, width:screenWidth}} />
            <View style={{height:1, width:screenWidth, backgroundColor: colors.black.rgba(0.2)}} />
            { this.state.sphereId === null ? this.getSpheres() : this.getRooms() }
          </View>
        </SettingsScrollView>
      </SettingsNavbarBackground>
    );
  }
}


