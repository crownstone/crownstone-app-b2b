import { colors, screenWidth } from "../../../styles";
import { Text, TouchableOpacity } from "react-native";
import * as React from "react";


export function BehaviourSubmitButton(props : { callback:any, label: string, color?: string, width?: number, testID?: string }) {
  return (
    <TouchableOpacity
      onPress={props.callback}
      style={{
        width: props.width || 0.6*screenWidth,
        height:60,
        borderRadius:20,
        backgroundColor: props.color || colors.green.hex,
        alignItems:'center',
        justifyContent: 'center',
        borderColor: colors.white.rgba(0.9),
        borderWidth: 3
      }}
      testID={props.testID}>
       <Text style={{fontSize:17, fontWeight:'bold', color: colors.white.hex}}>{props.label}</Text>
    </TouchableOpacity>
)
}