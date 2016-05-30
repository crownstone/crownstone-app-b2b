import { createStore, combineReducers } from 'redux'
import { update, getTime } from './reducerUtil'
import {
  behaviourReducerOnHomeEnter,
  behaviourReducerOnHomeExit,
  behaviourReducerOnRoomEnter,
  behaviourReducerOnRoomExit,
  scheduleReducer,
} from './shared'

let defaultSettings = {
  config: {
    name: undefined,
    applianceId: undefined,
    locationId: undefined,
    macAddress: undefined,
    iBeaconMajor: undefined,
    iBeaconMinor: undefined,
    initializedSuccessfully: false,
    updatedAt: getTime()
  },
  state: {
    state: 1.0,
    currentUsage: 0,
    updatedAt: getTime()
  },
  schedule: { // this schedule will be overruled by the appliance if applianceId is not undefined.
    updatedAt: getTime()
  },
  behaviour: { // this behaviour will be overruled by the appliance if applianceId is not undefined.
    onHomeEnter: { /* toggleState */ },
    onHomeExit:  { /* toggleState */ },
    onRoomEnter: { /* toggleState */ },
    onRoomExit:  { /* toggleState */ }
  }
};


let stoneConfigReducer = (state = defaultSettings.config, action = {}) => {
  switch (action.type) {
    case 'ADD_STONE':
    case 'UPDATE_STONE_CONFIG':
      if (action.data) {
        let newState = {...state};
        newState.name        = update(action.data.name,     newState.name);
        newState.locationId  = update(action.data.locationId, newState.locationId);
        newState.applianceId = update(action.data.applianceId, newState.applianceId);
        newState.macAddress  = update(action.data.macAddress, newState.macAddress);
        newState.iBeaconMajor = update(action.data.iBeaconMajor, newState.iBeaconMajor);
        newState.iBeaconMinor = update(action.data.iBeaconMinor, newState.iBeaconMinor);
        newState.initializedSuccessfully = update(action.data.initializedSuccessfully, newState.initializedSuccessfully);
        newState.updatedAt   = getTime();
        return newState;
      }
      return state;
    default:
      return state;
  }
};

let stoneStateReducer = (state = defaultSettings.state, action = {}) => {
  switch (action.type) {
    case 'UPDATE_STONE_STATE':
      if (action.data) {
        let newState          = {...state};
        newState.state        = update(action.data.state,        newState.state);
        newState.currentUsage = update(action.data.currentUsage, newState.currentUsage);
        newState.updatedAt   = getTime();
        return newState;
      }
      return state;
    default:
      return state;
  }
};

let stoneStatisticsReducer = (state = [], action = {}) => {
  switch (action.type) {
    default:
      return state;
  }
};

let stoneBehavioursReducer = combineReducers({
  onHomeEnter: behaviourReducerOnHomeEnter,
  onHomeExit: behaviourReducerOnHomeExit,
  onRoomEnter: behaviourReducerOnRoomEnter,
  onRoomExit: behaviourReducerOnRoomExit,
});


let combinedStoneReducer = combineReducers({
  config: stoneConfigReducer,
  state: stoneStateReducer,
  behaviour: stoneBehavioursReducer,
  schedule: scheduleReducer,
  statistics: stoneStatisticsReducer
});

// stonesReducer
export default (state = {}, action = {}) => {
  switch (action.type) {
    case 'REMOVE_STONE':
      let stateCopy = {...state};
      delete stateCopy[action.stoneId];
      return stateCopy;
    default:
      if (action.stoneId !== undefined) {
        return {
          ...state,
          ...{[action.stoneId]:combinedStoneReducer(state[action.stoneId], action)}
        };
      }
      return state;
  }
};