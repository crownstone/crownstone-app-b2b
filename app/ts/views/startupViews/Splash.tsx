
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("Splash", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Image,
  Text,
  View, TextStyle
} from "react-native";
import { Background } from './../components/Background'
import {background, colors, setInsets, styles} from "./../styles";

import DeviceInfo from 'react-native-device-info';
import {useSafeAreaInsets} from "react-native-safe-area-context";

let versionStyle : TextStyle = {
  backgroundColor:"transparent",
  color: colors.csBlueDarker.rgba(0.4),
  fontWeight:'300',
  fontSize: 10,
};

export class Splash extends Component<any, any> {
  render() {
    let factor = 0.2;

    return (
      <Background fullScreen={true} image={background.main}>
        <InsetSetter />
        <View style={{flexDirection:'column', alignItems:'center', justifyContent: 'center', flex: 1}}>
          <View style={{flex:0.85}} />
          <Image source={require('../../../assets/images/crownstoneLogoWithText.png')} style={{width:factor * 998, height: factor*606, tintColor: colors.black.hex}}/>
          <View style={{flex:2}} />
          <Text style={versionStyle}>{ lang("version__",DeviceInfo.getReadableVersion()) }</Text>
          <View style={{flex:0.5}} />
        </View>
      </Background>
    );
  }
}


function InsetSetter(props) {
  let insets = useSafeAreaInsets();
  setInsets(insets);

  return <React.Fragment/>
}