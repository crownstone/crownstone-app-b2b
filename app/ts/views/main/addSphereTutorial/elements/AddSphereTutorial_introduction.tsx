
import { Languages } from "../../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("AddSphereTutorial_introduction", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';



import { screenHeight, screenWidth, topBarHeight } from "../../../styles";
import { ScaledImage } from "../../../components/ScaledImage";
import { tutorialStyle } from "../AddSphereTutorial";


export class AddSphereTutorial_introduction extends Component<any, any> {
  render() {
    return (
      <ScrollView style={{height: screenHeight - topBarHeight, width: screenWidth}} testID={"AddSphereTutorial_introduction"}>
        <View style={{flex:1, alignItems:'center', padding: 20}}>
          <Text style={tutorialStyle.header}>{ lang("What_is_a_Sphere_") }</Text>
          <View style={{width: screenWidth, height: 0.06*screenHeight}} />
          <ScaledImage source={require("../../../../../assets/images/tutorial/Sphere_with_house.png")} sourceHeight={490} sourceWidth={490} targetHeight={200} />
          <View style={{width: screenWidth, height: 0.06*screenHeight}} />
          <Text style={tutorialStyle.text}>{ lang("Spheres_are_individual__s") }</Text>
          <View style={{width: screenWidth, height: 0.12*screenHeight}} />
        </View>
      </ScrollView>
    )
  }
}