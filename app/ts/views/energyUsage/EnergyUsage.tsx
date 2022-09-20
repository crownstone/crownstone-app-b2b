
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("EnergyUsage", key)(a,b,c,d,e);
}
import * as React from 'react';
import { useState } from "react";
import {
  colors,
  screenWidth,
  statusBarHeight, styles,
  tabBarHeight,
  topBarHeight
} from "../styles";
import { TouchableOpacity, View, Text, ScrollView, ViewStyle, Alert } from "react-native";
import { BackgroundCustomTopBarNavbar } from "../components/Background";
import { TopBarBlur } from "../components/NavBarBlur";
import { HeaderTitle } from "../components/HeaderTitle";
import { Get } from "../../util/GetUtil";
import { useDatabaseChange } from "../components/hooks/databaseHooks";
import { EnergyGraphAxisSvg } from "./graphs/StaticEnergyGraphSphereSvg";
import { TimeButton } from "./components/TimeButton";
import { xUtil } from "../../util/StandAloneUtil";
import { MONTH_INDICES, MONTH_LABEL_MAP } from "../../Constants";
import { Icon } from "../components/Icon";
import {getDayData, getMonthData, getWeekData, getYearData} from "./MockEnergyDataGeneration";
import {LiveRoomList} from "./components/LiveLists";
import {RoomList} from "./components/HistoricalDataLists";


let cachedData = null;

export function EnergyUsage(props) {
  return (
    <BackgroundCustomTopBarNavbar testID={'energyUsageTab'}>
      <EnergyUsageContent />
    </BackgroundCustomTopBarNavbar>
  );
}


function EnergyUsageContent(props) {
  useDatabaseChange(['updateActiveSphere', 'changeSphereFeatures']);
  let [mode, setMode] = useState<GRAPH_TYPE>("LIVE");
  let [startDate, setStartDate] = useState<number>(Date.now());

  let activeSphere = Get.activeSphere();
  if (!activeSphere) {
    return <ContentNoSphere />;
  }

  let indicator;

  switch(mode) {
    case "LIVE":
      break;
    case "DAY":
    case "WEEK":
    case "MONTH":
    case "YEAR":
      // TODO: get sphere feature for energy usage.
  }


  switch(mode) {
    case "LIVE":
      break;
    case "DAY":
      cachedData = getDayData(startDate);
      indicator = xUtil.getDateFormat(cachedData.startTime)
      break;
    case "WEEK":
      cachedData = getWeekData(startDate);
      indicator = `${xUtil.getDateFormat(cachedData.startTime)} - ${xUtil.getDateFormat(cachedData.startTime+7*24*3600000)}`;
      break;
    case "MONTH":
      cachedData = getMonthData(startDate);
      indicator = `${MONTH_LABEL_MAP(MONTH_INDICES[new Date(cachedData.startTime).getMonth()])} ${new Date(cachedData.startTime).getFullYear()}`;
      break;
    case "YEAR":
      cachedData = getYearData(startDate);
      indicator = new Date(cachedData.startTime).getFullYear()
      break;
  }

  let leftRightStyle : ViewStyle = {flex:1, justifyContent:'center', alignItems:'center'}

  return (
    <React.Fragment>
      <ScrollView contentContainerStyle={{paddingTop: topBarHeight-statusBarHeight, alignItems:'center', justifyContent:"center", paddingBottom:2*tabBarHeight}}>
        <View style={{flexDirection:'row', justifyContent:'space-evenly', width: screenWidth}}>
          <TimeButton selected={mode == "LIVE"}  label={ lang("LIVE")}   callback={() => { setMode("LIVE");  }} />
          <TimeButton selected={mode == "DAY"}   label={ lang("Day")}    callback={() => { setMode("DAY");   }} />
          <TimeButton selected={mode == "WEEK"}  label={ lang("Week")}   callback={() => { setMode("WEEK");  }} />
          <TimeButton selected={mode == "MONTH"} label={ lang("Months")} callback={() => { setMode("MONTH"); }} />
          <TimeButton selected={mode == "YEAR"}  label={ lang("Years")}  callback={() => { setMode("YEAR");  }} />
        </View>
        {
          mode !== "LIVE" && (
            <React.Fragment>
              <View style={{flexDirection:'row', justifyContent:'space-around',width: screenWidth, padding:10}}>
                <TouchableOpacity style={leftRightStyle} onPress={() => {}}>
                  <Icon name={'enty-chevron-small-left'} size={23} color={colors.black.hex} />
                </TouchableOpacity>
                <Text style={{fontWeight:'bold'}}>{indicator}</Text>
                <TouchableOpacity style={leftRightStyle} onPress={() => {}}>
                  <Icon name={'enty-chevron-small-right'} size={23} color={colors.black.hex} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{backgroundColor: colors.csBlue.hex, height:40, ...styles.centered, width: screenWidth}}
                onPress={showDemoAlert}
              >
                <Text style={{color: colors.white.hex, fontWeight: 'bold'}}>{ lang("DEMO_MODE") }</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={showDemoAlert}><EnergyGraphAxisSvg data={cachedData} type={mode} width={0.9*screenWidth} height={200} /></TouchableOpacity>
              <RoomList mode={mode} data={cachedData} /> : <LiveRoomList />
            </React.Fragment>
          )
        }
      </ScrollView>
      <TopBarBlur xlight>
        <EnergyUsageHeader mode={mode} />
      </TopBarBlur>
    </React.Fragment>
  );
}


export function showDemoAlert() {
  Alert.alert(
lang("_Coming_soon___Were_worki_header"),
lang("_Coming_soon___Were_worki_body"),
[{text:lang("_Coming_soon___Were_worki_left")}]
  );
}


export function ContentNoSphere(props) {
  return (
    <View style={{flex:1, alignItems:'flex-start', justifyContent:'center', paddingTop:topBarHeight}}>
      <View style={{flex:1}} />
      <Text style={{fontSize:22, fontWeight:'bold', padding:30}}>{ lang("No_sphere_selected___") }</Text>
      <Text style={{fontSize:16, fontWeight:'bold', padding:30}}>{ lang("Go_to_the_overview_and_se") }</Text>
      <View style={{flex:3}} />
    </View>
  );
}


function EnergyUsageHeader(props: {mode: GRAPH_TYPE}) {
  return (
    <View style={{paddingLeft:15}}>
      <HeaderTitle title={props.mode === "LIVE" ? 'Power usage' : 'Energy usage'} />
    </View>
  );
}



