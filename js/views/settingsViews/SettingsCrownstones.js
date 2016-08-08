import React, { Component } from 'react'
import {
  Alert,
  Dimensions,
  TouchableHighlight,
  PixelRatio,
  ScrollView,
  Switch,
  Text,
  View
} from 'react-native';

import { Background } from './../components/Background'
import { DeviceOverview } from '../components/DeviceOverview'
import { ListEditableItems } from './../components/ListEditableItems'
import { getGroupContentFromState, getRoomName } from './../../util/dataUtil'
var Actions = require('react-native-router-flux').Actions;
import { styles, colors } from './../styles'
var Icon = require('react-native-vector-icons/Ionicons');

export class SettingsCrownstones extends Component {

  _getGroups(state, accessLevel) {
    let items = [];
    for (let groupId in state.groups) {
      if (state.groups.hasOwnProperty(groupId)) {
        let group = state.groups[groupId];
        if (group.users[state.user.userId].accessLevel === accessLevel) {
          items.push({id: groupId, name: group.config.name});
        }
      }
    }

    return items;
  }


  _getItems() {
    let items = [];

    const store = this.props.store;
    const state = store.getState();

    let groupNames = this._getGroups(state, 'admin');
    groupNames.forEach((group) => {
      let stones = getGroupContentFromState(state, group.id);
      let stoneIds = Object.keys(stones);
      if (stoneIds.length > 0) {
        items.push({label:"CROWNSTONES IN GROUP '" + group.name + "'",  type:'explanation', below:false});
        stoneIds.forEach((stoneId) => {
          let stone = stones[stoneId];
          items.push({__item:
            <TouchableHighlight
              key={stoneId + '_entry'}
              onPress={() => {Actions.deviceEdit({groupId:this.props.groupId, stoneId, locationId:this.props.locationId})}}
              style={{flex:1}}>
              <View style={styles.listView}>
                <DeviceOverview
                  icon={stone.device.config.icon}
                  stoneName={stone.stone.config.name}
                  deviceName={stone.device.config.name}
                  locationName={getRoomName(state, group.id, stone.stone.config.locationId)}
                />
                </View>
              </TouchableHighlight>})
        })
      }
      items.push({
        label: 'Add a Crownstone to this Group',
        icon: <Icon name="ios-add-circle" size={30} color={colors.green.hex} style={{position:'relative', top:2}} />,
        style: {color:colors.blue.hex},
        type: 'button',
        callback: () => {
          Actions.setupAddPluginStep1();
        }
      })
    });



    items.push({type:'spacer'});
    items.push({
      label: 'Recover a Crownstone',
      style: {color:colors.blue.hex},
      type: 'button',
      callback: () => {
      }
    });
    items.push({label:'If you want to reset a Crownstone because it is not responding correctly, click here and follow the instructions.',  type:'explanation', below:true});
    items.push({type:'spacer'});

    return items;
  }

  render() {

    return (
      <Background>
        <ScrollView>
          <ListEditableItems items={this._getItems()} />
        </ScrollView>
      </Background>
    );
  }
}
