import { LiveComponent }          from "../LiveComponent";

import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("DevicePowerUsage", key)(a,b,c,d,e);
}
import * as React from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';


import { screenWidth, availableScreenHeight, deviceStyles, background } from "../styles";
import { Graph } from "../components/graph/Graph";
import { core } from "../../Core";
import { NativeBus } from "../../native/libInterface/NativeBus";
import { Background } from "../components/Background";
import { TopBarUtil } from "../../util/TopBarUtil";
import { PowerUsageCacher } from "../../backgroundProcesses/PowerUsageCacher";
import { SettingsBackground } from "../components/SettingsBackground";
import { SettingsScrollView } from "../components/SettingsScrollView";


export class DevicePowerUsage extends LiveComponent<any, any> {
  static options(props) {
    // let state = core.store.getState();
    // const stone = state.spheres[props.sphereId].stones[props.stoneId];
    return TopBarUtil.getOptions({ title: lang("Power_Usage"), closeModal: true});
  }

  unsubscribeNativeBusEvent;

  data : GraphData[] = [];
  hash : number = 0;
  uniqueElement = 0;
  debugInterval;

  constructor(props) {
    super(props);

    const store = core.store;
    const state = store.getState();
    const sphere = state.spheres[this.props.sphereId];
    const stone = sphere.stones[this.props.stoneId];
    this.data          = PowerUsageCacher.getData(this.props.sphereId, stone.config.handle);
    this.uniqueElement = PowerUsageCacher.getUniqueElement(this.props.sphereId, stone.config.handle);

    this.hash = Math.random();
  }

  componentDidMount() {
    const store = core.store;
    const state = store.getState();
    const sphere = state.spheres[this.props.sphereId];
    const stone = sphere.stones[this.props.stoneId];

    this.unsubscribeNativeBusEvent = core.nativeBus.on(NativeBus.topics.advertisement, (data: crownstoneAdvertisement) => {
      if (data.handle === stone.config.handle && data.serviceData.stateOfExternalCrownstone === false && data.serviceData.errorMode === false && data.serviceData.alternativeState === false) {
        let now = Date.now();
        // throttling; do not show repeated advertisements
        if (data.serviceData.uniqueElement === this.uniqueElement) {
          return;
        }

        this.uniqueElement = data.serviceData.uniqueElement;

        this.hash = Math.random();
        this.forceUpdate();
      }
    });

    // this.debugInterval = setInterval(() => {
    //   processData({serviceData:{
    //     uniqueElement: Math.random(),
    //     powerUsageReal: Math.random()*100
    //   }})
    // }, 500)
  }

  // __loadInitialDebugData() {
  //   let now = Date.now();
  //   for (let i = 50; i > 0; i--) {
  //     this.data.push({ x: now-i*1000, y: Math.max(0, Math.random() * 100) })
  //   }
  // }


  componentWillUnmount() {
    this.data = [];
    this.unsubscribeNativeBusEvent();
    clearInterval(this.debugInterval);
  }

  render() {
    const state = core.store.getState();
    const sphere = state.spheres[this.props.sphereId];
    const stone = sphere.stones[this.props.stoneId];

    let header = lang("Power_usage_");
    if (this.data.length > 0) {
      header += Math.round(this.data[this.data.length-1].y) + " W"
    }
    else {
      header += stone.state.currentUsage + " W"
    }

    return (
      <SettingsBackground>
        <SettingsScrollView>
          <View style={{ flexGrow: 1, alignItems:'center', paddingTop:30 }}>
            <Text style={deviceStyles.header}>{header}</Text>
            <View style={{height:30}} />
            <Graph width={screenWidth*0.95} height={availableScreenHeight/2} data={this.data} dataHash={this.hash} minimumRange={40} rangeStartsAtZero={true}/>
            <View style={{height:30}} />
            <Text style={[deviceStyles.explanation, {fontWeight:'bold'}]}>{ lang("Real_time_power_usage") }</Text>
            <Text style={deviceStyles.explanation}>{ lang("Stand_near_the_Crownstone") }</Text>
          </View>
        </SettingsScrollView>
      </SettingsBackground>
    )
  }
}
