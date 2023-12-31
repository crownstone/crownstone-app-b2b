import { LiveComponent }          from "../LiveComponent";

import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("SetupCrownstone", key)(a,b,c,d,e);
}
import * as React from 'react';
import {
  Platform,
  TouchableOpacity,
  View
} from "react-native";
import { core } from "../../Core";
import { Interview } from "../components/Interview";
import { IconCircle } from "../components/IconCircle";
import {colors, screenHeight, screenWidth, statusBarHeight, styles, topBarHeight, viewPaddingTop} from "../styles";
import { NavigationUtil } from "../../util/navigation/NavigationUtil";
import { xUtil } from "../../util/StandAloneUtil";
import { SetupStateHandler } from "../../native/setup/SetupStateHandler";
import { AnimatedBackground } from "../components/animated/AnimatedBackground";
import { SetupCircle } from "../components/animated/SetupCircle";
import { Icon } from "../components/Icon";
import KeepAwake from 'react-native-keep-awake';
import { TopBarUtil } from "../../util/TopBarUtil";
import { BleUtil } from "../../util/BleUtil";
import { getRandomDeviceIcon } from "../deviceViews/DeviceIconSelection";
import { Scheduler } from "../../logic/Scheduler";
import { connectTo } from "../../logic/constellation/Tellers";
import { CommandAPI } from "../../logic/constellation/Commander";
import {CustomTopBarWrapper} from "../components/CustomTopBarWrapper";

export class SetupCrownstone extends LiveComponent<{
  restoration: boolean,
  sphereId: string,
  unownedVerfiedSphereId?: string,
  setupItem: any,
  componentId: any,
  unownedVerified: boolean
}, any> {

  static options(props) {
    return {topBar:{visible: false}}
  }


  _interview: any;
  randomIcon: string;
  storeEvents = [];
  abort = false;
  newCrownstoneState : any;
  constructor(props) {
    super(props);

    this.randomIcon = getRandomDeviceIcon();

    this.newCrownstoneState = {
      name:           null,
      icon:           this.randomIcon,
      location:       {id:null, name: null, icon:null},
      configFinished: false,
      setupFinished:  false,
      newStoneId:     null,
    };

    this.state = {allowBack: true};
  }

  componentDidMount() {
    this.storeEvents.push(core.eventBus.on("databaseChange", (data) => {
      let change = data.change;
      if (
        change.updateLocationConfig ||
        change.changeLocations
      ) {
        this.forceUpdate();
      }
    }));

    if (this.props.restoration) {
      this._startSetup();
    }
  }

  componentWillUnmount() {
    this.storeEvents.forEach((unsub) => { unsub(); });
  }


  _disableBackButton() {
    this.setState({allowBack: false});
  }


  async _startSetup() {
    this._disableBackButton();
    this.abort = false;

    if (this.props.unownedVerified) {
      let api: CommandAPI;
      try {
        api = await connectTo(this.props.setupItem.handle, this.props.unownedVerfiedSphereId);
        await api.commandFactoryReset();
      }
      catch(err) {
        this._interview.setLockedCard("problem");
        return;
      }
      finally {
        if (api) { await api.end(); }
      }
      await Scheduler.delay(2000);
      await BleUtil.detectSetupCrownstone(this.props.setupItem.handle);
    }

    try {
      await SetupStateHandler.setupStone(this.props.setupItem.handle, this.props.sphereId)
        .catch((err) => { if (this.abort === false) { return Scheduler.delay(2000) } throw err; })
        .catch((err) => { if (this.abort === false) { return SetupStateHandler.setupStone(this.props.setupItem.handle, this.props.sphereId); } throw err;})
        .catch((err) => { if (this.abort === false) { return Scheduler.delay(2000) } throw err; })
        .catch((err) => { if (this.abort === false) { return SetupStateHandler.setupStone(this.props.setupItem.handle, this.props.sphereId); } throw err;})
        .then((newStoneData : any) => {
          this.newCrownstoneState.newStoneId    = newStoneData.id;
          this.newCrownstoneState.setupFinished = true;

          let wrapUp = () => {
            if (this.newCrownstoneState.configFinished) {
              this._wrapUp();
            }
          };

          if (newStoneData.familiarCrownstone === true) {
            let state = core.store.getState();
            let sphere = state.spheres[this.props.sphereId];
            if (!sphere) { return wrapUp(); }
            let stone = sphere.stones[newStoneData.id];
            if (!stone) { return wrapUp(); }
            let location = sphere.locations[stone.config.locationId];

            this.newCrownstoneState.name = stone.config.name;
            this.newCrownstoneState.icon = stone.config.icon;
            this.newCrownstoneState.configFinished = true;
            this.newCrownstoneState.location = {id:null, name: null, icon:null};
            this.newCrownstoneState.location.id =   location ? stone.config.locationId : null;
            this.newCrownstoneState.location.name = location ? location.config.name    : null;
            this.newCrownstoneState.location.icon = location ? location.config.icon    : null;

            if (this.props.restoration) {
              return wrapUp();
            }

            // this check is here because the user MIGHT go back somehow, destroying the view
            if (this._interview) {
              this._interview.setLockedCard("iKnowThisOne");
            }
            return;
          }
          else {
            wrapUp();
          }
        })
        .catch((err) => {
          if (this.abort === true) {
            return this._interview.setLockedCard("aborted");
          }

          if (err?.code) {
            if (err?.code === 1) {
              this._interview.setLockedCard("problemBle");
            }
            else if (err?.code === "network_error") {
              this._interview.setLockedCard("problemCloud");
            }
            else {
              this._interview.setLockedCard("problemBle");
            }
          }
          this._interview.setLockedCard("problemBle");
        })
    }
    catch (err : any) {
      this._interview.setLockedCard("problem");
    }


  }

  _wrapUp() {
    core.store.dispatch({
      type: "UPDATE_STONE_CONFIG",
      sphereId: this.props.sphereId,
      stoneId: this.newCrownstoneState.newStoneId,
      data: {
        name: this.newCrownstoneState.name,
        icon: this.newCrownstoneState.icon,
        locationId: this.newCrownstoneState.location.id
      }
    });

    // navigate the interview to the finished state.
    if (this.props.restoration) {
      return NavigationUtil.dismissModal()
    }

    if (this.abort) {
      this._interview.setLockedCard("successWhileAborting")
    }
    else {
      this._interview.setLockedCard("setupMore")
    }
  }

  getCards() : interviewCards {
    let state = core.store.getState();

    let namePlaceholder = lang("My_New_Crownstone");

    let sphereId = this.props.sphereId;

    let sphere = state.spheres[sphereId];
    if (!sphere) return null;
    let locations = sphere.locations;
    let locationIds = Object.keys(locations);
    let locationElements = [];
    locationIds.forEach((locationId) => {
      locationElements.push({
        id: locationId,
        name: locations[locationId].config.name,
        icon: locations[locationId].config.icon,
        cloudId: locations[locationId].config.cloudId
      });
    });
    locationElements.sort((a,b) => { return a.name < b.name ? -1 : 1});

    let roomOptions : interviewOption[] = [];
    locationElements.forEach((location) => {
      roomOptions.push({
        label: location.name,
        icon: location.icon,
        testID: `crownstoneInLocation${location.cloudId}`,
        nextCard: 'waitToFinish',
        response: lang("Im_almost_done_"),
        onSelect: () => {
          this.newCrownstoneState.location       = location;
          this.newCrownstoneState.configFinished = true;
          if (this.newCrownstoneState.setupFinished === true) {
            this._wrapUp();
            return false;
          }
        }
      })
    });

    roomOptions.push({
      label: lang("add_a_new_room_"),
      icon: "md-cube",
      testID:"createRoom",
      theme: 'create',
      onSelect: () => {
        NavigationUtil.navigate( "RoomAdd", {sphereId: sphereId, isModal: false});
      }
    });

    let failedOptions = [
      {
        label: lang("OK__try_again_"),
        testID:'addCrownstone_tryAgain',
        onSelect: (result) => {
          this.newCrownstoneState.setupFinished = false;
          this.newCrownstoneState.configFinished = false;
          if (this.props.restoration) {
            this._startSetup();
            this.newCrownstoneState.configFinished = true;
            return this._interview.resetStackToCard("start");
          }
          else if (!this.newCrownstoneState.name) {
            return this._interview.resetStackToCard("start");
          }
          else if (!this.newCrownstoneState.icon) {
            this._startSetup();
            return this._interview.resetStackToCard("icon");
          }
          else if (!this.newCrownstoneState.location.id) {
            this._startSetup();
            return this._interview.resetStackToCard("rooms");
          }
          else {
            this._startSetup();
            this.newCrownstoneState.configFinished = true;
            return this._interview.resetStackToCard("waitToFinish");
          }
        }
      },
      {
        label: lang("Ill_try_again_later___"),
        testID:'addCrownstone_tryLater',
        onSelect: (result) => { NavigationUtil.dismissModal(); }
      },
    ];

    let successOptions = [
      {
        label: lang("Add_more_Crownstones_"),
        testID:'addCrownstone_addMore',
        onSelect: (result) => {
          NavigationUtil.back();
        }
      },
      {
        label: lang("Take_me_to__",this.newCrownstoneState.location.name),
        testID:'addCrownstone_goToRoom',
        onSelect: (result) => {
          NavigationUtil.dismissAllModalsAndNavigate("RoomOverview", {sphereId: this.props.sphereId, locationId: this.newCrownstoneState.location.id });
        }
      },
    ];

    let restorationCard = {
      header: lang("Restoring_Crownstone___"),
      subHeader: lang("This_should_only_take_a_m"),
      testID:'addCrownstone_restoration',
      backgroundImage: require('../../../assets/images/backgrounds/fadedLightBackground.jpg'),
      component: (
        <View style={{...styles.centered, flex:1}}>
          <View style={{width:0.6*screenWidth, height:0.6*screenWidth}}>
            <SetupCircle radius={0.3*screenWidth} />
          </View>
        </View>
      ),
      options: [
        {
          label: lang("Aborting___Abort",this.abort),
          testID: 'abort',
          onSelect: (result) => { this.abort = true; this.forceUpdate(); },
          dangerous: true,
        }
      ]
    }

    let problemCards = {
      problemCloud: {
        header: lang("Something_went_wrong__"),
        subHeader: lang("Please_verify_that_you_ar"),
        textColor: colors.white.hex,
        testID:'addCrownstone_problemCloud',
        backgroundImage: require('../../../assets/images/backgrounds/somethingWrongBlue.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <View>
              <Icon name="ios-cloudy-night" size={0.3*screenHeight} color={colors.white.rgba(0.8)} />
            </View>
          </View>
        ),
        optionsBottom: true,
        options: failedOptions
      },
      problemBle: {
        header: lang("Something_went_wrong__"),
        subHeader: lang("Please_restart_the_Blueto"),
        textColor: colors.white.hex,
        testID:'addCrownstone_problemBle',
        backgroundImage: require('../../../assets/images/backgrounds/somethingWrongBlue.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <View>
              <Icon name="ios-bluetooth" size={0.25*screenHeight} color={colors.white.rgba(0.8)} />
            </View>
          </View>
        ),
        optionsBottom: true,
        options: failedOptions
      },
      problem: {
        header:lang("Something_went_wrong__"),
        subHeader: lang("Please_try_again_later_"),
        testID:'addCrownstone_problem',
        textColor: colors.white.hex,
        backgroundImage: require('../../../assets/images/backgrounds/somethingWrongBlue.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <View>
              <Icon name="ios-alert" size={0.3*screenHeight} color={colors.white.rgba(0.8)} />
            </View>
          </View>
        ),
        optionsBottom: true,
        options: [
          {
            label: lang("Ill_try_again_later___"),
            onSelect: (result) => { NavigationUtil.dismissModal(); }
          },
        ]
      },
      aborted: {
        header:lang("Aborted_"),
        subHeader: lang("The_Crownstone_was_not_ad"),
        testID:'addCrownstone_aborted',
        textColor: colors.white.hex,
        backgroundImage: require('../../../assets/images/backgrounds/somethingWrongBlue.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <View>
              <Icon name="ios-alert" size={0.3*screenHeight} color={colors.white.rgba(0.8)} />
            </View>
          </View>
        ),
        optionsBottom: true,
        options: [
          {
            label: lang("Ill_try_again_later___"),
            onSelect: (result) => { NavigationUtil.dismissModal(); }
          },
        ]
      }
    }

    if (this.props.restoration) {
      return {
        start: restorationCard,
        ...problemCards
      }
    }



    return {
      start: {
        header:lang("Lets_get_started_"),
        subHeader: lang("What_shall_I_call_this_Cr"),
        hasTextInputField: true,
        testID:'addCrownstone_namePhase',
        textInputTestID:'crownstoneName',
        placeholder: namePlaceholder,
        options: [
          {
            label: lang("Next"),
            textAlign:'right',
            nextCard: 'icon',
            testID: 'name_next',
            dynamicResponse: (value) => { if (value.textfieldState === '') { return lang("Default_name_it_is_");} else { return lang("Thats_a_good_name_")}},
            onSelect: (result) => {
              let name = result.textfieldState;
              if (name == "") {
                this.newCrownstoneState.name = namePlaceholder;
              }
              else {
                this.newCrownstoneState.name = name;
              }

              this._startSetup();
              return true
            }}
        ]
      },
      icon: {
        header: lang("Lets_pick_an_icon_"),
        subHeader: lang("Lets_give_this_Crownstone"),
        explanation: lang("You_can_always_change_thi"),
        testID: 'addCrownstone_iconPhase',
        editableItem: (state, setState) => {
          return (
            <TouchableOpacity onPress={() => {
              NavigationUtil.launchModal( "DeviceIconSelection",{
                icon: state,
                closeModal:true,
                callback: (newIcon) => {
                  setState(newIcon);
                }
              });
            }}
              testID={"crownstoneIcon"}>
              <IconCircle
                icon={state || this.randomIcon}
                size={0.5*screenWidth}
                iconSize={0.25*screenWidth}
                color={colors.white.hex}
                borderColor={colors.csOrange.hex}
                backgroundColor={colors.csBlueDark.hex}
                showEdit={true}
                borderWidth={8}
              />
            </TouchableOpacity>
          );
        },
        options: [
          {label: lang("Next"), testID:'icon_next', textAlign:'right', nextCard: 'rooms', response: lang("Cool__so_thatll_be_my_ico"),
            onSelect: (result) => {
              let icon = result.customElementState || this.randomIcon;
              this.newCrownstoneState.icon = icon;
            }}
        ]
      },
      rooms: {
        header: lang("Lets_pick_a_room_"),
        testID:'addCrownstone_roomPhase',
        scrollViewtestID:'addCrownstone_roomPhase_scroll',
        subHeader: lang("In_which_room_did_you_put", xUtil.capitalize(this.newCrownstoneState.name)),
        optionsBottom: true,
        options: roomOptions
      },
      waitToFinish: {
        header: lang("Working_on_it_"),
        subHeader: lang("Setting_up_your_new_Crown"),
        testID:'addCrownstone_waitToFinish',
        backgroundImage: require('../../../assets/images/backgrounds/fadedLightBackground.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <View style={{width:0.6*screenWidth, height:0.6*screenWidth}}>
              <SetupCircle radius={0.3*screenWidth} />
            </View>
          </View>
        ),
        options: [
          {
            label: lang("Aborting___Abort",this.abort,true),
            onSelect: (result) => { this.abort = true; this.forceUpdate(); },
            dangerous: true,
          }
        ]
      },
      setupMore: {
        header:lang("Thats_it_"),
        testID:'addCrownstone_setupMore',
        subHeader: lang("Would_you_like_to_setup_m"),
        backgroundImage: require('../../../assets/images/backgrounds/fadedLightBackgroundGreen.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <Icon name="ios-checkmark-circle" size={0.5*screenWidth} color={colors.white.rgba(0.8)} />
          </View>
        ),
        optionsBottom: true,
        options: successOptions
      },
      successWhileAborting: {
        header:lang("Setup_complete_"),
        subHeader: lang("This_Crownstone_was_added"),
        testID:'addCrownstone_successWhileAborting',
        textColor: colors.white.hex,
        backgroundImage: require('../../../assets/images/backgrounds/somethingWrongBlue.jpg'),
        component: (
          <View style={{...styles.centered, flex:1}}>
            <Icon name="ios-checkmark-circle" size={0.4*screenWidth} color={colors.white.rgba(0.8)} />
          </View>
        ),
        optionsBottom: true,
        options: successOptions
      },
      iKnowThisOne: {
        header:lang("I_know_this_one_"),
        testID:'addCrownstone_iKnowThisOne',
        subHeader: lang("This_Crownstone_was_alrea", this.newCrownstoneState.name,this.newCrownstoneState.location.name),
        backgroundImage: require('../../../assets/images/backgrounds/fadedLightBackgroundGreen.jpg'),
        optionsBottom: true,
        options: successOptions
      },
      ...problemCards
    }
  }


  render() {
    let backgroundImage = require('../../../assets/images/backgrounds/fadedLightBackground.jpg');
    if (this._interview) {
      backgroundImage = this._interview.getBackgroundFromCard() || backgroundImage;
    }
    return (
      <AnimatedBackground fullScreen={true} image={backgroundImage} testID={'SetupCrownstone'}>
        <KeepAwake />
        <CustomTopBarWrapper
          left={Platform.OS === 'android' ? null : lang("Back")}
          leftAction={() => { if (this._interview.back() === false) { NavigationUtil.back();} }}
          notBack={!this.state.allowBack}
          title={this.props.restoration ? lang("Restoring_Crownstone") : lang("New_Crownstone")}
          style={{backgroundColor:'transparent', paddingTop:0}}
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
