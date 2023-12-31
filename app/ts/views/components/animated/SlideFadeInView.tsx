import * as React from 'react'; import { Component } from 'react';
import {
  Animated,
  
} from 'react-native';

export class SlideFadeInView extends Component<{visible, height, delay?, duration?, style?, pointerEvents?}, any> {
  visible : boolean;
  height  : number;

  constructor(props) {
    super(props);

    this.state = {
      viewOpacity: new Animated.Value(props.visible ? 1 : 0),
      viewHeight:  new Animated.Value(props.visible ? (props.height || (props.style && props.style.height)) : 0)
    };
    this.height =  props.height || (props.style && props.style.height);
    this.visible = props.visible || false;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let delay = this.props.delay || 0;
    let duration = this.props.duration || 200;
    let height = this.props.height || (this.props.style && this.props.style.height);
    if (this.visible !== this.props.visible) {
      let animations = [];
      if (this.props.visible === true) {
        animations.push(Animated.timing(this.state.viewOpacity, {
          toValue:  1,
          delay:    delay + 0.2*duration,
          duration: duration,
          useNativeDriver: false
        }));
        animations.push(Animated.timing(this.state.viewHeight, {
          toValue:  height,
          delay:    delay,
          duration: duration,
          useNativeDriver: false
        }))
      }
      else {
        animations.push(Animated.timing(this.state.viewOpacity, {toValue: 0, delay:delay, useNativeDriver: false, duration:duration}));
        animations.push(Animated.timing(this.state.viewHeight,  {toValue: 0, delay:delay, useNativeDriver: false, duration:duration}));
      }
      Animated.parallel(animations).start();
      this.visible = this.props.visible;
    }
    else if (this.visible && this.height !== height) {
      Animated.timing(this.state.viewHeight, {toValue: height, delay: delay, useNativeDriver: false, duration: duration }).start(() => { this.height = height; })
    }
  }

  render() {
    return (
      <Animated.View style={[this.props.style,{overflow:'hidden', opacity:this.state.viewOpacity, height: this.state.viewHeight}]} pointerEvents={this.props.pointerEvents}>
        {this.props.children}
      </Animated.View>
    );
  }
}


export class SlideSideFadeInView extends Component<{visible, width, delay?, duration?, style?}, any> {
  visible : boolean;
  width : number;

  constructor(props) {
    super(props);

    this.state = {
      viewOpacity: new Animated.Value(props.visible ? 1 : 0),
      viewWidth:   new Animated.Value(props.visible ? (props.width || (props.style && props.style.width)) : 0)
    };
    this.width =  props.width || (props.style && props.style.width);
    this.visible = props.visible || false;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    let delay = this.props.delay || 0;
    let duration = this.props.duration || 200;
    let width = this.props.width || (this.props.style && this.props.style.width);
    if (this.visible !== this.props.visible) {
      let animations = [];
      if (this.props.visible === true) {
        animations.push(Animated.timing(this.state.viewOpacity, {
          toValue:  1,
          delay:    delay + 0.2*duration,
          duration: duration,
          useNativeDriver: false
        }));
        animations.push(Animated.timing(this.state.viewWidth, {
          toValue:  width,
          delay:    delay,
          duration: duration,
          useNativeDriver: false
        }))
      }
      else {
        animations.push(Animated.timing(this.state.viewOpacity, {toValue: 0, delay:delay, useNativeDriver: false, duration:duration}));
        animations.push(Animated.timing(this.state.viewWidth,   {toValue: 0, delay:delay, useNativeDriver: false, duration:duration}));
      }
      Animated.parallel(animations).start();
      this.visible = this.props.visible;
    }
    else if (this.visible && this.width !== width) {
      Animated.timing(this.state.viewWidth, {toValue: width, delay: delay, useNativeDriver: false, duration: duration }).start(() => { this.width = width; })
    }
  }

  render() {
    return (
      <Animated.View style={[this.props.style,{overflow:'hidden', opacity:this.state.viewOpacity, width: this.state.viewWidth}]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

