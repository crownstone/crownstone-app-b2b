import { LiveComponent }          from "../LiveComponent";

import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("RoomPictureSelection", key)(a,b,c,d,e);
}
import * as React from 'react';
import { Alert, ScrollView, Image, View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
const sha1 = require('sha-1');


import { ListEditableItems } from './../components/ListEditableItems'
import { TopBarUtil } from "../../util/TopBarUtil";
import {SettingsBackground} from "../components/SettingsBackground";
import {Get} from "../../util/GetUtil";
import {
  colors,
  getRoomStockImage,
  menuStyles,
  RoomStockBackground,
  screenHeight,
  screenWidth,
  styles
} from "../styles";
import {Icon} from "../components/Icon";
import {SelectedCornerIcon} from "../components/IconCircleEdit";
import {SelectPicture} from "../components/PictureCircle";
import { NavigationUtil } from "../../util/navigation/NavigationUtil";
import { Component } from "react";
import { core } from "../../Core";
import { SettingsScrollView } from "../components/SettingsScrollView";


export class RoomPictureSelection extends LiveComponent<{
  picture: string,
  selectImage: (name:string, source: PICTURE_SOURCE) => void,
  sphereId: sphereId,
  locationId: locationId
}, any> {
  static options(props) {
    return TopBarUtil.getOptions({title: lang("Select_Image"), closeModal: true});
  }

  constructor(props) {
    super(props);

    this.state = { selecting: false };
  }

  _getItems() {
    let items = [];

    items.push({
      type:"navigation",
      icon: <Icon name={'ion5-camera'} size={26} color={colors.csBlue.hex} />,
      label: lang("Custom_background_picture"),
      testID: 'customBackgroundPicture',
      callback: () => {
        this.setState({selecting:true});
        let unsubscribe = core.eventBus.on("hidePopup")
        SelectPicture((uri) => {
          this.props.selectImage(uri, "CUSTOM");
          setTimeout(() => { NavigationUtil.dismissModal(); }, 500);
        }, () => {this.setState({selecting:false});});
      }
    })
    items.push({
      type:"info",
      label: lang("Stock_background_picture_"),
    })

    items.push({
      type:"custom",
      item: <ImageSelector
        picture={this.props.picture}
        callback={(name) => {
          this.props.selectImage(name, "STOCK");
          NavigationUtil.dismissModal();
        }}/>
    })

    
    return items;
  }

  render() {
    return (
      <SettingsBackground testID={"RoomPictureSelection"}>
        <SettingsScrollView testID={'RoomPictureSelection_scrollview'}>
          <ListEditableItems items={this._getItems()} />
        </SettingsScrollView>
        { this.state.selecting &&
          <View style={{...styles.fullscreen, ...styles.centered, backgroundColor: colors.black.rgba(0.5) }}>
            <ActivityIndicator size={"large"} />
          </View>
        }
      </SettingsBackground>
    );
  }
}

function ImageSelector({picture, callback}) {
  let rows = [];
  let rowIndex = 0;
  let columnIndex = 0;
  for (let stockImage in RoomStockBackground) {
    if (rows[rowIndex] === undefined) {
      rows.push([]);
    }
    rows[rowIndex].push(stockImage);
    columnIndex++;
    if (columnIndex === 4) {
      rowIndex++;
      columnIndex = 0;
    }
  }
  return (
    <View style={[menuStyles.listView,{flexDirection: 'column', paddingBottom: 10, paddingHorizontal: 0}]}>
      {rows.map((rowData, index) => { return <ImageRow key={"imageRow"+index} data={rowData} selectedName={picture} callback={callback} /> })}
    </View>
  );
}

function ImageRow({data, selectedName, callback}) {
  return (
    <View style={{paddingHorizontal:5, flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
      {data.map((key) => <RoomImage name={key} selected={selectedName === key} callback={callback}/> )}
    </View>
  )
}

function RoomImage({name, selected, callback}) {
  let aspect = screenHeight / screenWidth;
  let margin = 7;
  let count = 4;
  let width = (screenWidth-(1+count)*margin)/count;


  return (
    <TouchableOpacity style={{marginRight:margin, marginBottom: margin}} onPress={() => { callback(name); }} testID={`stockImage_${name}`}>
      <Image source={RoomStockBackground[name]} style={{width: width, height: width * aspect, borderRadius: 20}} />
      { selected &&  <SelectedCornerIcon inner size={30} /> }
    </TouchableOpacity>
  )
}
