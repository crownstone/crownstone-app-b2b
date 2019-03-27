import * as React from 'react'; import { Component } from 'react';
import { colors} from '../views/styles'
import { Views }                     from './Views'
import {
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator,
  HeaderMode
} from "react-navigation";
import { TabIcon } from "./TabIcon";
import { Languages } from "../Languages";
import { Initializer } from "./Initializer";
import { TextStyle } from "react-native";



import { Provider, connect } from 'react-redux';


interface headerModeObj {
  headerMode: HeaderMode
}
const defaultMode : headerModeObj = {
  headerMode: 'float',
}
const hiddenHeaderMode : headerModeObj = {
  headerMode: 'none',
}

interface defaultHeaderStyle {
  headerStyle: any,
  headerTitleStyle : TextStyle,
  headerBackTitleStyle : TextStyle,
  headerTintColor: string,
}
const defaultHeaderStyle : defaultHeaderStyle = {
  headerStyle: {
    backgroundColor: colors.menuBackground.hex,
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerBackTitleStyle: {
    fontSize:14,
    fontWeight: 'bold',
  }
}
const defaultHeader = {
  ...defaultMode,
  defaultNavigationOptions: {
    ...defaultHeaderStyle
  },
}
const defaultBackButtonHeaderStyle = {
  ...defaultMode,
  defaultNavigationOptions: {
    ...defaultHeaderStyle,
  }
}



const EditSphereStack = createStackNavigator(
  {
    SphereEdit : Views.SphereEdit,
    SphereEditSettings : Views.SphereEditSettings,
    SphereRoomOverview : Views.SphereRoomOverview,
    SphereCrownstoneOverview : Views.SphereCrownstoneOverview,
    SphereRoomArranger : Views.SphereRoomArranger,
    SphereUserOverview : Views.SphereUserOverview,
    SphereInvitedUser : Views.SphereInvitedUser,
    SphereUser : Views.SphereUser,
    SphereBehaviour : Views.SphereBehaviour,
    SphereIntegrations : Views.SphereIntegrations,
  },
  {
    ...defaultBackButtonHeaderStyle
  }
);

const MainStack = createStackNavigator(
  {
    SphereOverview: Views.SphereOverview,
    RoomOverview:   Views.RoomOverview,
    DeviceOverview: Views.DeviceOverview,
  },
  {
    ...defaultHeader
  }
);

const MessageStack = createStackNavigator(
  {
    MessageInbox: Views.MessageInbox,
  },
  {
    ...defaultHeader
  }
);
const SettingsStack = createStackNavigator(
  {
    SettingsOverview:      Views.SettingsOverview,
    SettingsDiagnostics:   Views.SettingsDiagnostics,
    SettingsProfile:       Views.SettingsProfile,
    SettingsPrivacy:       Views.SettingsPrivacy,
    SettingsApp:           Views.SettingsApp,
    SettingsMeshOverview:  Views.SettingsMeshOverview,
    SettingsStoneBleDebug: Views.SettingsStoneBleDebug,
    SettingsMeshTopology:  Views.SettingsMeshTopology,
    SettingsLogging:       Views.SettingsLogging,
    SettingsBleDebug:      Views.SettingsBleDebug,
    SettingsMeshDebug:     Views.SettingsMeshDebug,
    SettingsDeveloper:     Views.SettingsDeveloper,
    SettingsFAQ:           Views.SettingsFAQ,
    SettingsLocalizationDebug:  Views.SettingsLocalizationDebug,
    SettingsBleTroubleshooting: Views.SettingsBleTroubleshooting,
  },
  {
    ...defaultHeader
  }
);

const TabNavigator = createBottomTabNavigator(
  {
    Main:           MainStack,
    Messages:       MessageStack,
    Settings:       SettingsStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let name = "";
        let icon = "";
        let badgeOnMessages = false;
        switch (routeName) {
          case "Main":
            name = Languages.get("Tabs","Overview")();
            icon = "ios-color-filter-outline";
            break;
          case "Messages":
            name = Languages.get("Tabs","Messages")();
            icon = "ios-mail";
            badgeOnMessages = true;
            break;
          case "Settings":
            name = Languages.get("Tabs","Settings")();
            icon = "ios-cog";
            break;
        }
        return <TabIcon iconString={icon} focused={focused} tabTitle={name} badgeOnMessages={badgeOnMessages} />
      },
    }),
    tabBarOptions: {
      activeBackgroundColor: colors.menuBackground.hex,
      inactiveBackgroundColor: colors.menuBackground.hex,
      activeTintColor: colors.menuTextSelected.hex,
      inactiveTintColor: colors.white.hex,
      showLabel: false
    },
  }
);



const InitialStack = createStackNavigator(
  {
    LoginSplash:        Views.LoginSplash,
    Login:              Views.Login,
    Logout:             Views.Logout,
    Register:           Views.Register,
    RegisterConclusion: Views.RegisterConclusion,
    Tutorial:           Views.Tutorial,
  },
  {
    ...defaultHeader
  }
);


const RoomTrainingStack = createStackNavigator(
  {
    RoomTraining_roomSize:     Views.RoomTraining_roomSize,
    RoomTraining:              Views.RoomTraining,
  },
  {
    ...defaultHeader
  }
);


const AppStack = createStackNavigator(
  {
    Main: {
      screen: TabNavigator,
    },
    EditSphereMenu: {
      screen: EditSphereStack
    },
    SphereUserInvite: {
      screen:  wrap("SphereUserInvite"),
    },
    PictureView: {
      screen:  wrap("PictureView"),
    },
    CameraRollView: {
      screen:  wrap("CameraRollView"),
    },
    AiStart: {
      screen:  wrap("AiStart"),
    },
    RoomTrainingStack: {
      screen: RoomTrainingStack,
    },
    RoomSelection: {
      screen:  wrap("RoomSelection"),
    },
    RoomIconSelection: {
      screen:  wrap("RoomIconSelection"),
    },
    RoomAdd: {
      screen:  wrap("RoomAdd"),
    },
    AddItemsToSphere: {
      screen: wrap("AddItemsToSphere"),
    },
    RoomEdit: {
      screen: wrap("RoomEdit"),
    },
    ToonAdd: {
      screen:  wrap("ToonAdd"),
    },
    AddSphereTutorial: {
      screen:  wrap("AddSphereTutorial"),
    },
  },
  {
    initialRouteName: "Main",
    mode: 'modal',
    headerMode: 'none',
  }
);

export const RootStack = createSwitchNavigator(
  {
    Splash: {
      screen: Initializer,
    },
    NewUser: {
      screen: InitialStack,
    },
    AppBase: {
      screen: AppStack
    },
  },
  {
    initialRouteName: "Splash",
    ...hiddenHeaderMode,
  }
)


/**
 * this is a convenience method that will create a new stack navigator for each modal so that it has a header.
 * @param view
 */
function wrap(view) {
  let obj = {};
  obj[view] = {
    screen: Views[view],
  }
  return createStackNavigator(
    obj,
    {
      ...defaultHeader,
      navigationOptions: {gesturesEnabled: false},
    }
  )
}