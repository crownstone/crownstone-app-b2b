import * as React from 'react';
import {
  Linking,
  Platform,
} from "react-native";
import { colors} from "../styles";
import { core } from "../../core";
import { Pagination } from 'react-native-snap-carousel';
import { AnimatedBackground } from "../components/animated/AnimatedBackground";
import { ScanningForSetupCrownstones } from "./ScanningForSetupCrownstones";
import { NavigationUtil } from "../../util/NavigationUtil";
import { TopbarImitation } from "../components/TopbarImitation";
import { Interview } from "../components/Interview";
import { LiveComponent } from "../LiveComponent";


export class AddCrownstone extends LiveComponent<any, any> {
  static navigationOptions = {
    header: null
  };

  interviewState;
  interviewData;

  _interview : Interview;
  responseHeaders : any;
  selectedOptions = [];
  constructor(props) {
    super(props);

    this.interviewData = {
      presence: null,
      time: null,
      timeDetails: {},
      option: null,
      switchCraft: false,
      dimming: false,
      always: false,
      locked: false,
    };


    this.state = { activeSlide : 0, slides: [this.getCards().start], slideIds: ['start'], finished: false, transitioningToSlide: undefined };

    this.selectedOptions = [];
    this.responseHeaders = {};
  }

  getCards() : interviewCards {
    return {
      start: {
        header:"Let's add a Crownstone!",
        subHeader:"What sort of Crownstone would you like to add?",
        optionsCenter: true,
        options: [
          {label: "Plug",          image: require('../../images/addCrownstone/plugs.png'),      nextCard: 'installingPlug',              response: "A Plug it is!"},
          {label: "Built-in One",  image: require('../../images/addCrownstone/builtin-v2.png'), nextCard: 'installingBuiltinOne_step1',  response: "Let's add a Built-in One!"},
          {label: "Built-in Zero", image: require('../../images/addCrownstone/builtin-v1.png'), nextCard: 'installingBuiltinZero_step1', response: "Let's add a Built-in Zero!"},
          {label: "I don't have\nCrownstones yet...", image: require('../../images/addCrownstone/buy.png'), nextCard: 'buy',             response: "Let's buy Crownstones!"},
        ]
      },
      buy: {
        textColor: colors.white.hex,
        subHeader: "Tap the button below to go to the shop!",
        backgroundImage: require('../../images/backgrounds/builtinDarkBackground.png'),
        optionsBottom: true,
        options: [
          {label: "Visit the Shop!", textAlign:'right', onSelect: () => { Linking.openURL('https://shop.crownstone.rocks/?launch=en&ref=http://crownstone.rocks/en/').catch(err => {}); }},
        ]
      },
      installingPlug: {
        subHeader:"Insert the plug into a power outlet and hold your phone close by. Tap next when you're ready!",
        backgroundImage: require('../../images/backgrounds/plugBackground.png'),
        options: [
          {label: "Next", textAlign:'right', onSelect: () => { NavigationUtil.navigate("ScanningForSetupCrownstones", { sphereId: this.props.sphereId }) }},
        ]
      },
      installingBuiltinZero_step1: {
        subHeader: "Is the Built-in Zero already installed?",
        backgroundImage: require('../../images/backgrounds/builtinZeroBackground.png'),
        options: [
          {label: "Yes, behind a socket.",    nextCard: "installingBuiltin_endSocket"},
          {label: "Yes, at a ceiling light.", nextCard: "installingBuiltin_endLight"},
          {label: "Not yet!",                 nextCard: "installingBuiltin_step2"},
        ]
      },
      installingBuiltinOne_step1: {
        subHeader: "Is your Built-in One already installed?",
        backgroundImage: require('../../images/backgrounds/builtinOneBackground.png'),
        options: [
          {label: "Yes, behind a socket.",    nextCard: "installingBuiltin_endSocket"},
          {label: "Yes, at a ceiling light.", nextCard: "installingBuiltin_endLight"},
          {label: "Not yet!",                 nextCard: "installingBuiltin_step2"},
        ]
      },
      installingBuiltin_step2: {
        header: "Installation",
        subHeader: "Do you wish to use this Crownstone behind a power socket or with a ceiling light?",
        backgroundImage: require('../../images/backgrounds/installationBackground.png'),
        options: [
          {label: "Behind a socket.",      image: require('../../images/addCrownstone/socket.png'),        nextCard: "installingBuiltin_instructions_socket"},
          {label: "With a ceiling light.", image: require('../../images/addCrownstone/ceilingLights.png'), nextCard: "installingBuiltin_instructions_light"},
        ]
      },
      installingBuiltin_instructions_socket: {
        header: "Installing behind a socket",
        subHeader: "Please follow the instructions in the manual for the installation.\n\nIn future releases, we will have a complete install guide here.",
        backgroundImage: require('../../images/backgrounds/socketBackground.png'),
        options: [
          {label: "OK. I have installed it!",    nextCard: "installingBuiltin_endSocket"},
        ]
      },
      installingBuiltin_instructions_light: {
        header: "Installing in a ceiling light",
        subHeader: "Please follow the instructions in the manual for the installation.\n\nIn future releases, we will have a complete install guide here.",
        backgroundImage: require('../../images/backgrounds/ceilingLightBackground.png'),
        options: [
          {label: "OK. I have installed it!",    nextCard: "installingBuiltinOne_endLight"},
        ]
      },
      installingBuiltinOne_endSocket: {
        header: "Let's get close!",
        subHeader: "Hold your phone close to the socket with the Crownstone.\n\nMake sure the power is back on and press next to continue!",
        backgroundImage: require('../../images/backgrounds/socketBackground.png'),
        options: [
          {label: "Next", textAlign:'right', onSelect: () => { NavigationUtil.navigate("ScanningForSetupCrownstones", { sphereId: this.props.sphereId }) }},
        ]
      },
      installingBuiltinOne_endLight: {
        header: "Let's get close!",
        subHeader: "Hold your phone near the ceiling light with the Crownstone.\n\nMake sure the power is back on and press next to continue!",
        backgroundImage: require('../../images/backgrounds/ceilingLightBackground.png'),
        options: [
          {label: "Next", textAlign:'right', onSelect: () => { NavigationUtil.navigate("ScanningForSetupCrownstones", { sphereId: this.props.sphereId }) }},
        ]
      },
    }
  }




  render() {
    let backgroundImage = core.background.light;
    let textColor = colors.csBlueDark.hex;
    if (this._interview) {
      backgroundImage = this._interview.getBackgroundFromCard() || backgroundImage;
      textColor = this._interview.getTextColorFromCard() || textColor;
    }

    return (
      <AnimatedBackground fullScreen={true} image={backgroundImage} hideOrangeBar={true} dimStatusBar={true}>
        <TopbarImitation leftStyle={{color: textColor}} left={Platform.OS === 'android' ? null : "Back to overview"} leftAction={() => { NavigationUtil.backTo("Main"); }} leftButtonStyle={{width: 300}} style={{backgroundColor:'transparent', paddingTop:0}} />
        <Interview
          ref={     (i) => { this._interview = i; }}
          getCards={ () => { return this.getCards();}}
          update={   () => { this.forceUpdate() }}
        />
      </AnimatedBackground>
    );
  }
}
