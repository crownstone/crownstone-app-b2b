import * as React from 'react';
import { useRef, useState } from "react";
import { Text, TouchableOpacity, View} from "react-native";

import {appStyleConstants, colors, rowstyles} from "../../styles";
import {StoneUtil} from "../../../util/StoneUtil";
import {SlideSideFadeInView} from "../animated/SlideFadeInView";
import {NavigationUtil} from "../../../util/navigation/NavigationUtil";
import {DeviceEntryIcon} from "./submodules/DeviceEntryIcon";
import { Get } from "../../../util/GetUtil";

import { SettingsIconRight } from "../EditIcon";
import {DeviceDimSlider, DeviceDimTopPadding, DeviceSwitchControl} from "./submodules/DeviceEntrySwitchControls";
import {DeviceEntryLabel} from "./submodules/DeviceLabels";
import { useDatabaseChange } from "../hooks/databaseHooks";
import { DraggableProps, useDraggable } from "../hooks/draggableHooks";
import { useCleanup } from "../hooks/timerHooks";
import { Blur } from '../Blur';


interface DeviceEntryProps extends DraggableProps {
  sphereId: sphereId,
  stoneId: stoneId,
  dimMode: boolean,
  editMode: boolean,
  viewingRemotely: boolean
}

export function DeviceEntry(props: DeviceEntryProps) {
  let stone = Get.stone(props.sphereId, props.stoneId);
  if (!stone) {return <React.Fragment />;}
  let [percentage, setPercentage] = useState(stone.state.state);
  let timeoutRef                  = useRef(null);
  let storedSwitchState           = useRef(stone.state.state);

  // clear the timeout on unmount and store a possibly unstored value.
  useCleanup(() => {
    clearInterval(timeoutRef.current);
    StoneUtil.safeStoreUpdate(props.sphereId, props.stoneId, storedSwitchState.current);
  });

  // update the switchstate based on the changes in the store
  useDatabaseChange({updateStoneState: props.stoneId}, () => {
    let stone = Get.stone(props.sphereId, props.stoneId);
    if (!stone || !stone.state) { return; }
    if (stone.state.state !== percentage) {
      setPercentage(stone.state.state)
    }
  });

  // include draggable
  let {dragging, triggerDrag} = useDraggable(props.isBeingDragged, props.eventBus, props.dragAction);


  // switch method for when the button or dimmer is touched. Has a timed-out store included, which is cleaned up in useCleanup
  let _switch = async (stone, switchState) => {
    await StoneUtil.multiSwitch(stone, switchState,true, true).catch(() => {});

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      storedSwitchState.current = StoneUtil.safeStoreUpdate(props.sphereId, props.stoneId, storedSwitchState.current);
    }, 3000);
  }

  return (
    <TouchableOpacity activeOpacity={props.editMode ? 0.5 : 1.0} onLongPress={() => { if (props.editMode) { triggerDrag(); } }} style={{flexDirection:'row'}}>
      <SlideSideFadeInView visible={dragging} width={40} />
      <Blur
        blurType={"light"}
        blurAmount={5}
        style={{
          flexDirection:'row',
          height: 70,
          flex:1,
          backgroundColor: colors.white.rgba(0.4),
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: appStyleConstants.roundness,
          alignItems:'center',
          paddingLeft: 15,
        }}>
        <DeviceEntryIcon stone={stone} stoneId={props.stoneId} />
        <View style={{ flex:1}}>
          <DeviceDimTopPadding stone={stone} dimMode={props.dimMode} editMode={props.editMode} />
          <Text style={{...rowstyles.title, paddingLeft:15}}>{stone.config.name}</Text>
          <DeviceDimSlider
            stone={stone}
            dimMode={props.dimMode}
            editMode={props.editMode}
            value={percentage}
            onChange={(value) => {
              _switch(stone, value);
              setPercentage(value);
            }}
          />
          <DeviceEntryLabel
            stone={stone}
            dimMode={props.dimMode}
            editMode={props.editMode}
          />
        </View>
        <SlideSideFadeInView visible={props.editMode} width={60}>
          <SettingsIconRight style={{height:55}} onPress={() => {  NavigationUtil.launchModal( "DeviceOverview",{sphereId: props.sphereId, stoneId: props.stoneId, viewingRemotely: props.viewingRemotely}); }}/>
        </SlideSideFadeInView>
        <DeviceSwitchControl stone={stone} editMode={props.editMode} dimMode={props.dimMode} setPercentage={(value) => { setPercentage(value); }} />
      </Blur>
    </TouchableOpacity>
  );
}
