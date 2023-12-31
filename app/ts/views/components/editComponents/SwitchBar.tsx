
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("SwitchBar", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Animated,
  Switch,
  TouchableOpacity,
  Platform,
  Text,
  View
} from 'react-native';

import {styles, colors, screenWidth, LARGE_ROW_SIZE, NORMAL_ROW_SIZE, MID_ROW_SIZE, menuStyles} from "../../styles";

export class SwitchBar extends Component<any, any> {

  animationAllowed;

  constructor(props) {
    super(props);

    this.state = {experimental: props.experimental, leftPos: new Animated.Value(0), opacity: new Animated.Value(props.experimental ? 1 : 0)};
    this.animationAllowed = true;

    if (props.experimental) {
      this.loop();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.experimental !== this.props.experimental) {
      if (this.props.experimental === true) {
        Animated.timing(this.state.opacity, {toValue: 1, useNativeDriver: false, duration: 200}).start();
        this.loop()
      }
      else {
        this.state.opacity.setValue(0);
        this.cancelLoop();
      }
    }
  }

  componentWillUnmount() {
    this.cancelLoop();
  }

  cancelLoop() {
    this.animationAllowed = false;
    this.state.leftPos.stopAnimation();
  }

  loop() {
    this.animationAllowed = true;
    let duration = 20000;
    Animated.timing(this.state.leftPos, {toValue: screenWidth - 540 - 50, useNativeDriver: false, duration: duration}).start(() => {
      if (this.animationAllowed) {
        Animated.timing(this.state.leftPos, {toValue: 20, useNativeDriver: false, duration: duration}).start(() => {
          if (this.animationAllowed) {
            this.loop()
          }
        })
      }
    })
  }

  _getButton(navBarHeight, fontColor) {
    let style = [menuStyles.listView, {height: navBarHeight}, this.props.wrapperStyle];

    if (this.props.disabled) {
      style.push({backgroundColor: colors.lightGray.rgba(0.3)})
      fontColor = menuStyles.disabledListView.color;
    }

    let helpColor = colors.black.rgba(0.5);
    if (this.props.experimental) {
      style =  [menuStyles.listView,{position:'absolute', top:0, left:0, overflow:'hidden', height: navBarHeight, width: screenWidth, backgroundColor:"transparent"}];
      helpColor = colors.white.hex;
    }

    return (
      <View style={style}>
        {this.props.largeIcon  !== undefined ? <View style={[styles.centered, {width: 80, paddingRight: 20}]}>{this.props.largeIcon}</View> : undefined}
        {this.props.mediumIcon !== undefined ? <View style={[styles.centered, {width: 0.15 * screenWidth, paddingRight: 15}]}>{this.props.mediumIcon}</View> : undefined}
        {this.props.icon       !== undefined ? <View style={[styles.centered, {width:0.12 * screenWidth, paddingRight:15}]}>{this.props.icon}</View> : undefined}
        {this.props.iconIndent === true ? <View style={[styles.centered, {width:0.12 * screenWidth, paddingRight:15}]} /> : undefined }
        <Animated.Text style={[menuStyles.listTextLarge, this.props.style, {color: fontColor}]}>{this.props.label}</Animated.Text>
        <View style={{flex:1}} />
        {
          this.props.hasHelp ? <TouchableOpacity onPress={() => {this.props.onHelp(); }} style={{borderColor: helpColor, borderWidth: 1, width:30, height:30, borderRadius:15, alignItems:'center', justifyContent:'center'}}>
                                <Text style={{color: helpColor, fontSize: 20}}>?</Text>
                               </TouchableOpacity>
                             : undefined
        }
        { this.props.hasHelp ? <View style={{flex:0.75}} /> : undefined }
        <Switch
          disabled={this.props.disabled || false}
          value={this.props.value}
          onValueChange={(newValue) => {
            if (this.props.setActiveElement) {
              this.props.setActiveElement();
            }
            this.props.callback(newValue);
          }}
          testID={this.props.testID}
        />
      </View>
    )
  }

  render() {
    let navBarHeight = this.props.barHeight || NORMAL_ROW_SIZE;
    if (this.props.largeIcon || this.props.size === "large")        { navBarHeight = LARGE_ROW_SIZE; }
    else if (this.props.mediumIcon || this.props.size === "medium") { navBarHeight = MID_ROW_SIZE; }
    else if (this.props.icon)                                       { navBarHeight = NORMAL_ROW_SIZE; }

    if (this.props.experimental) {
      let fontColor = this.state.opacity.interpolate({
        inputRange: [0,1],
        outputRange: [colors.black.hex,  colors.white.hex]
      });

      return (
        <View style={{height: navBarHeight , width: screenWidth, backgroundColor: colors.menuBackground.hex}}>
          <Animated.View style={{position:'absolute', top:0, left:0, overflow:'hidden', height: navBarHeight, width: screenWidth, opacity: this.state.opacity}}>
            <Animated.View style={{position:'absolute', top: Platform.OS === 'android' ? -24 : -17, left: this.state.leftPos}}>
              <Text style={{color:colors.white.rgba(0.1), fontSize:70, fontWeight:'bold', fontStyle:'italic', width: 540}}>{ lang("EXPERIMENTAL",this.props.experimentalLabel) }</Text>
            </Animated.View>
          </Animated.View>
          { this._getButton(navBarHeight, fontColor) }
        </View>
      )
    }
    else {
      return this._getButton(navBarHeight, undefined);
    }
  }
}
