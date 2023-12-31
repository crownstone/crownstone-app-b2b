
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("TimePicker", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  
  DatePickerIOS,
  TouchableOpacity,
  Text,
  View
} from 'react-native';

import { SlideFadeInView }  from '../animated/SlideFadeInView'
import {menuStyles, styles} from '../../styles'


export class TimePicker extends Component<any, any> {
  render() {
    // TODO: Wait for RN to fix the checking.
    let formatTime = (time) => {
      let hours = this.props.value.getHours();
      let mins = this.props.value.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      mins = mins < 10 ? '0' + mins : mins;
      return hours + ':' + mins;
    };
    return (
      <View>
        <TouchableOpacity onPress={() => {this.props.setActiveElement()}}>
          <View style={[menuStyles.listView, {height:this.props.barHeight}]}>
            <Text style={[menuStyles.listTextLarge, this.props.labelStyle]}>{this.props.label}</Text>
            <Text style={[{flex:1, fontSize:16, textAlign:'right'}, this.props.valueStyle]}>{formatTime(this.props.value)}</Text>
          </View>
        </TouchableOpacity>
        <SlideFadeInView height={216} visible={this.props.activeElement == this.props.elementIndex} >
          <View style={{flex:1, backgroundColor:'#fff', alignItems:'center', justifyContent:'center'}} >
            <DatePickerIOS
              date={this.props.value}
              mode="time"
              timeZoneOffsetInMinutes={0}
              onDateChange={this.props.callback}
              minuteInterval={10}
            />
          </View>
        </SlideFadeInView>
      </View>
    );
  }
}
