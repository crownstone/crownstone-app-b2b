
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("DeviceSmartBehaviour_TypeSelector", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  Platform
} from "react-native";

import { colors, screenHeight, screenWidth } from "../../styles";
import { core } from "../../../Core";
import { NavigationUtil } from "../../../util/navigation/NavigationUtil";
import { Interview } from "../../components/Interview";
import { AnimatedBackground } from "../../components/animated/AnimatedBackground";
import { AicoreBehaviour } from "./supportCode/AicoreBehaviour";
import { AicoreTwilight } from "./supportCode/AicoreTwilight";
import { DataUtil } from "../../../util/DataUtil";
import { AicoreUtil } from "./supportCode/AicoreUtil";
import { ABILITY_TYPE_ID } from "../../../database/reducers/stoneSubReducers/abilities";
import {SafeAreaView} from "react-native-safe-area-context";
import { CustomTopBarWrapper } from "../../components/CustomTopBarWrapper";

export class DeviceSmartBehaviour_TypeSelector extends Component<any, any> {
  static options = {
    topBar: { visible: false, height: 0 }
  };

  interviewData;

  _interview : Interview;
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
  }

  getOptions(examples : AicoreBehaviour[] | AicoreTwilight[], typeLabel, twilight=false) : interviewOption[] {
    let options = [];

    examples.forEach((behaviour) => {
      options.push({
        label: behaviour.getSentence(this.props.sphereId),
        onSelect: () => {
          if (AicoreUtil.canBehaviourUseIndoorLocalization(this.props.sphereId, lang("Pick_a_different_example_"), behaviour) === false) {
            return false;
          }

          NavigationUtil.navigate( "DeviceSmartBehaviour_Editor", {
            twilightBehaviour: twilight, data: behaviour, sphereId: this.props.sphereId, stoneId: this.props.stoneId, behaviourId: null, typeLabel: typeLabel})
        }
      })
    })

    return options;
  }

  getCards() : interviewCards {
    let presenceExamples   = this._getPresenceExamples();
    let twilightExamples   = this._getTwilightModeExamples();
    let smartTimerExamples = this._getSmartTimerExamples();

    return {
      start: {
        header: lang("What_sort_of_behaviour_sh"),
        subHeader:lang("Pick_a_type_to_start_with"),
        optionsBottom: true,
        textColor: colors.white.hex,
        options: [
          {
            label: lang("Presence_aware"),
            subLabel: '"' + presenceExamples[0].getSentence(this.props.sphereId) + '"',
            image: { source: require('../../../../assets/images/icons/presence.png'), sourceWidth: 292, sourceHeight: 399, width: 0.15*screenWidth },
            nextCard: 'presence'
          },
          {
            label: lang("Smart_timer"),
            subLabel: '"' + smartTimerExamples[0].getSentence(this.props.sphereId) + '"',
            image: { source: require('../../../../assets/images/icons/smartTimer.png'), sourceWidth: 398, sourceHeight: 398, width: 0.175*screenWidth },
            nextCard: 'smartTimer'
          },
          {
            label: lang("Twilight_mode"),
            subLabel: '"' + twilightExamples[0].getSentence(this.props.sphereId) + '"',
            image: { source: require('../../../../assets/images/icons/twilight.png'), sourceWidth: 529, sourceHeight: 398, width: 0.18*screenWidth },
            onSelect: () => {
              let state = core.store.getState();
              let sphere = state.spheres[this.props.sphereId];
              let stone = sphere.stones[this.props.stoneId]
              if (stone.abilities.dimming.enabledTarget === true) {
                return 'twilight';
              }
              return "dimmingRequired";
            },
          }],
      },
      presence: {
        header: lang("Presence_Aware_Behaviour"),
        headerMaxNumLines: 1,
        textColor: colors.white.hex,
        backgroundImage: require('../../../../assets/images/backgrounds/presence.jpg'),
        subHeader: lang("Pick_an_example_and_change"),
        image: { source: require('../../../../assets/images/icons/presence.png'), sourceWidth: 292, sourceHeight: 399, height: 0.2*screenHeight, tintColor: colors.white.hex  },
        optionsBottom: true,
        options: this.getOptions(presenceExamples, lang("Presence_Aware"))
      },
      smartTimer: {
        header: lang("Smart_Timer"),
        headerMaxNumLines: 1,
        textColor: colors.white.hex,
        backgroundImage: require('../../../../assets/images/backgrounds/smartTimer.jpg'),
        subHeader: lang("Pick_an_example_and_chang"),
        image: { source: require('../../../../assets/images/icons/smartTimer.png'), sourceWidth: 292, sourceHeight: 399, height: 0.2*screenHeight, tintColor: colors.white.hex },
        optionsBottom: true,
        options: this.getOptions(smartTimerExamples, lang("Smart_Timer"))
      },
      dimmingRequired: {
        header: lang("Dimming_required"),
        headerMaxNumLines: 1,
        textColor: colors.white.hex,
        subHeader: lang("Twilight_requires_me_to_b"),
        backgroundImage: require('../../../../assets/images/backgrounds/twilight.jpg'),
        optionsBottom: true,
        options: [
          {
            label: lang("Yes__enable_dimming_"),
            onSelect: () => {
              core.store.dispatch({type:'UPDATE_ABILITY', sphereId: this.props.sphereId, stoneId: this.props.stoneId, abilityId: ABILITY_TYPE_ID.dimming, data: {enabledTarget: true}});
              return "twilight";
            }
          },
          {
            label: lang("Not_right_now__"),
            onSelect: () => {
              setTimeout(() => {this._interview.back()},100)
              return false;
            }
          },
        ]
      },
      twilight: {
        header: lang("Twilight_Mode"),
        headerMaxNumLines: 1,
        textColor: colors.white.hex,
        subHeader: lang("Pick_an_example_and_change_"),
        backgroundImage: require('../../../../assets/images/backgrounds/twilight.jpg'),
        image: { source: require('../../../../assets/images/icons/twilight.png'), sourceWidth: 292, sourceHeight: 399, height: 0.25*screenHeight, tintColor: colors.white.hex },
        optionsBottom: true,
        options: this.getOptions(twilightExamples, lang("Twilight_Mode"), true)
      },
    }
  }


  _getLocationUids(amount) {
    let state = core.store.getState();
    let sphere = state.spheres[this.props.sphereId];
    let locationIds = Object.keys(sphere.locations);
    let usedLocationIds = [];
    for (let i = 0; i < locationIds.length && i < amount; i++) {
      usedLocationIds.push(sphere.locations[locationIds[i]].config.uid);
    }

    return usedLocationIds;
  }

  _getPresenceExamples() {
    let examples : AicoreBehaviour[] = [];
    examples.push(new AicoreBehaviour().setPresenceInSphere().setTimeWhenDark());
    examples.push(new AicoreBehaviour().setPresenceInLocations(this._getLocationUids(2)).setTimeAllday());
    examples.push(new AicoreBehaviour().ignorePresence().setTimeFrom(15,0).setTimeToSunset().setEndConditionWhilePeopleInSphere());
    return examples;
  }
  _getSmartTimerExamples() {
    let locationId = DataUtil.getLocationIdFromStone(this.props.sphereId, this.props.stoneId);

    let examples : AicoreBehaviour[] = [];
    examples.push(new AicoreBehaviour().ignorePresence().setTimeFrom(15,0).setTimeToSunset().setEndConditionWhilePeopleInLocation(DataUtil.locationIdToUid(this.props.sphereId,locationId)));
    examples.push(new AicoreBehaviour().setPresenceInSphere().setTimeFromSunset(30).setTimeTo(23,0));
    examples.push(new AicoreBehaviour().ignorePresence().setTimeFrom(18,0).setTimeTo(22,0));
    return examples;
  }
  _getTwilightModeExamples() {
    let examples : AicoreTwilight[] = [];
    examples.push(new AicoreTwilight().setDimPercentage(50).setTimeWhenDark());
    examples.push(new AicoreTwilight().setDimPercentage(30).setTimeFrom(23,30).setTimeToSunrise());
    return examples;
  }


  render() {
    let backgroundImage = require('../../../../assets/images/backgrounds/behaviourMix.jpg');
    let textColor = colors.white.hex;
    if (this._interview) {
      backgroundImage = this._interview.getBackgroundFromCard() || backgroundImage;
      textColor = this._interview.getTextColorFromCard() || textColor;
    }

    return (
      <AnimatedBackground fullScreen={true} image={backgroundImage}>
        <CustomTopBarWrapper
          leftStyle={{color: textColor}}
          left={Platform.OS === 'android' ? null : lang("Back")}
          leftAction={() => { if (this._interview.back() === false) { NavigationUtil.dismissModal(); }}}
          leftButtonStyle={{width: 300}} style={{backgroundColor:'transparent', paddingTop:0}}
        >
          <Interview
            backButtonOverrideViewNameOrId={this.props.componentId}
            ref={     (i) => { this._interview = i; }}
            getCards={ () => { return this.getCards();}}
            update={   () => { this.forceUpdate() }}
          />
        </CustomTopBarWrapper>
      </AnimatedBackground>
    );
  }
}

