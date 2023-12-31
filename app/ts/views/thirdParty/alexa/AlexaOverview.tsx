
import { Languages } from "../../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("AlexaOverview", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';
import {Background} from "../../components/Background";
import { background, styles } from "../../styles";
import {ScaledImage} from "../../components/ScaledImage";
import { TopBarUtil } from "../../../util/TopBarUtil";
import { SettingsScrollView } from "../../components/SettingsScrollView";
import { SettingsBackground } from "../../components/SettingsBackground";


export class AlexaOverview extends Component<any, any> {
  static options(props) {
    return TopBarUtil.getOptions({title:  lang('Amazon_Alexa')});
  }


  render() {
    return (
      <SettingsBackground testID={"AlexaOverview"}>
        <SettingsScrollView>
          <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
            <View style={{height:20}} />
            <Text style={styles.title}>{ lang("Working_with_Alexa") }</Text>
            <View style={{height:20}} />
            <ScaledImage source={require('../../../../assets/images/thirdParty/logo/amazonAlexa.png')} sourceWidth={264} sourceHeight={265} targetWidth={128} style={128} />
            <View style={{height:20}} />
            <Text style={styles.header}>{ lang("Crownstone_is_now_availab") }</Text>
            <Text style={styles.explanation}>{ lang("You_can_now_go_to_your_Al") }</Text>
            <Text style={styles.explanation}>{ lang("You_will_receive_a_list_o") }</Text>
            <Text style={styles.explanation}>{ lang("When_you_tell_Alexa_to_sw") }</Text>
            <Text style={styles.explanation}>{ lang("Were_hard_at_work_adding_") }</Text>
            <Text style={styles.explanation}>{ lang("Expect_more_to_come_and_e") }</Text>
            <View style={{height:100}} />
          </View>
        </SettingsScrollView>
      </SettingsBackground>
    );
  }
}
