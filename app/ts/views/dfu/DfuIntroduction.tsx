
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("DfuIntroduction", key)(a,b,c,d,e);
}
import * as React from 'react';
import {
  Platform, View
} from "react-native";
import {background, colors, screenHeight, styles} from "../styles";
import { AnimatedBackground } from "../components/animated/AnimatedBackground";
import { NavigationUtil } from "../../util/navigation/NavigationUtil";
import { Interview } from "../components/Interview";
import { LiveComponent } from "../LiveComponent";
import { core } from "../../Core";
import { DfuUtil } from "../../util/DfuUtil";
import { Icon } from "../components/Icon";
import { DfuStateHandler } from "../../native/firmware/DfuStateHandler";
import { SafeAreaView } from "react-native-safe-area-context";
import {CustomTopBarWrapper} from "../components/CustomTopBarWrapper";

export class DfuIntroduction extends LiveComponent<any, any> {
  static options = {
    topBar: { visible: false, height:0, title: {text: lang("DFU_Introduction")} }
  };

  interviewData;
  _interview : Interview;
  constructor(props) {
    super(props);

    let stateData = {
      releaseNotes: lang("Downloading___"),
      inSphere:     false,
      version:      null,
    };

    this.interviewData = {};

    let state = core.store.getState();
    let sphereId = this.props.sphereId;
    let sphere = state.spheres[sphereId];
    if (sphere && sphere.state.present === true || DfuStateHandler.sphereHasDfuCrownstone(sphereId)) {
      stateData.inSphere = true;
    }
    this.state = stateData;

    DfuUtil.getReleaseNotes(sphereId, state.user)
      .then((result) => {
        this.setState({ releaseNotes: result.notes, version: result.version });
      })
  }

  getCards() : interviewCards {
    return {
      start: {
        header:lang("There_is_an_update_availa"),
        subHeader:lang("This_process_can_take_a_f"),
        optionsBottom: true,
        image: {
          source: require("../../../assets/images/builtinLevelUp.png"),
          sourceWidth: 450,
          sourceHeight: 440,
          height: 0.25 * screenHeight,
        },
        options: [
          {label: lang("Not_right_now___"), onSelect: () => { NavigationUtil.dismissModal(); }},
          {label: lang("Lets_do_it_"), nextCard: 'updateInformation'},
        ]
      },
      updateInformation: {
        header:lang("Heres_whats_new_"),
        subHeader: this.state.version ? lang("Version", this.state.version) : this.state.releaseNotes,
        explanation: this.state.version ? this.state.releaseNotes : undefined,
        image: {
          source: require("../../../assets/images/builtinLevelUp.png"),
          sourceWidth: 450,
          sourceHeight: 440,
          height: 0.25 * screenHeight,
        },
        optionsBottom: true,
        options: [
          {label: lang("Start_the_update_"), onSelect: () => { NavigationUtil.navigate("DfuScanning", {sphereId: this.props.sphereId})}},
        ]
      },
    }
  }

  getNotInSphereCard() : interviewCards {
    return {
      start: {
        header: lang("There_is_an_update_availab"),
        subHeader: lang("____but_need_to_be_in_you"),
        optionsBottom: true,
        component: (
          <View style={{...styles.centered, flex:1}}>
            <View>
              <Icon name="c1-house" size={100} color={colors.black.rgba(0.3)} />
            </View>
          </View>
        ),
        options: [
          {label: lang("Ill_try_again_later_"), onSelect: () => { NavigationUtil.dismissModal() }},
        ]
      },
    }
  }


  render() {
    let backgroundImage = background.main;
    let textColor = colors.black.hex;
    if (this._interview) {
      backgroundImage = this._interview.getBackgroundFromCard() || backgroundImage;
      textColor = this._interview.getTextColorFromCard() || textColor;
    }

    return (
      <AnimatedBackground fullScreen={true} image={backgroundImage}>
        <CustomTopBarWrapper
          leftStyle={{color: textColor}}
          left={Platform.OS === 'android' ? null : lang("Back")}
          leftAction={() => { if (this._interview.back() === false) {NavigationUtil.dismissModal();} }}
          leftButtonStyle={{width: 300}}
          style={{backgroundColor:'transparent', paddingTop:0}}
        >
        <Interview
          backButtonOverrideViewNameOrId={this.props.componentId}
          ref={     (i) => { this._interview = i; }}
          getCards={ () => { return (this.state.inSphere ?  this.getCards() : this.getNotInSphereCard() ); }}
          update={   () => { this.forceUpdate() }}
        />
        </CustomTopBarWrapper>
      </AnimatedBackground>
    );
  }
}

