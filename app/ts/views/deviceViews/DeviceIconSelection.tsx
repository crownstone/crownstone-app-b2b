
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("DeviceIconSelection", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView} from 'react-native';

import { Background }  from '../components/Background'
import { IconSelection }  from '../components/IconSelection'
import { NavigationUtil } from "../../util/NavigationUtil";
import { core } from "../../core";
import { TopBarUtil } from "../../util/TopBarUtil";
import { LiveComponent } from "../LiveComponent";
import { background, colors } from "../styles";




let listOfIcons = {
  ceilingLights: [
    "fiCS1-bar",
    "fiCS1-chandelier", 
    "fiCS1-chandelier-1",
    "fiCS1-chandeliers",
    "fiCS1-flame",
    "fiCS1-dining-table",
    "fiCS1-furniture-and-household-10",
    "fiCS1-furniture-and-household-13",
    "fiCS1-furniture-and-household-14",
    "fiCS1-furniture-and-household-15",
    "fiCS1-invention", 
    "fiCS1-indoor", 
    "fiCS1-lamp-16",
    "fiCS1-lamp-17",
    "fiCS1-lamp-18",
    "fiCS1-lamp-19",
    "fiCS1-lamp-20",
    "fiCS1-lamp-21",
    "fiCS1-light-6", 
    "fiCS1-spotlight", 
    "fiCS1-spotlight-1", 
    "fiCS1-spotlight-2", 
    "fiCS1-stage",
    "c1-lamp2", 
    "c1-christmasLights",
    "fiHS-lights", 
    "fiCS1-furniture-and-household-9",
    "fiCS1-lamp-2", 
    "fiHS-chandelier", 
    "fiHS-lamp-4",
    "c1-lamp7"
  ],
  furnitureLights: [
    "fiCS1-desk",
    "fiCS1-furniture-and-household-11",
    "fiCS1-lamp",
    "fiCS1-night-stand",
    "fiHS-armchair-7",
    "fiCS1-furniture-and-household",
    "fiCS1-living-room-1",
    "fiCS1-living-room",
    "fiHS-bookcase-1",
    "fiHS-chest-of-drawers-7",
    "fiHS-desk-1",
    "fiCS1-desk-1"
  ],
  standingLights: [
    "fiCS1-desk-lamp",
    "fiCS1-desk-lamp-1",
    "fiCS1-desk-lamp-2",
    "fiCS1-floor",
    "fiCS1-floor-1",
    "fiCS1-floor-2",
    "fiCS1-floor-3",
    "fiCS1-furniture-and-household-1",
    "fiCS1-furniture-and-household-2",
    "fiCS1-furniture-and-household-3",
    "fiCS1-furniture-and-household-4",
    "fiCS1-furniture-and-household-5",
    "fiCS1-furniture-and-household-6",
    "fiCS1-furniture-and-household-7",
    "fiCS1-lamp-1",
    "fiCS1-lamp-3",
    "fiCS1-lamp-4",
    "fiCS1-lamp-5",
    "fiCS1-lamp-6",
    "fiCS1-lamp-7",
    "fiCS1-lamp-8",
    "fiCS1-lamp-9",
    "fiCS1-lamp-10",
    "fiCS1-lamp-11",
    "fiCS1-lamp-12",
    "fiCS1-lamp-13",
    "fiCS1-lamp-14",
    "fiCS1-lamp-15",
    "fiCS1-lamp-22",
    "fiCS1-lamps",
    "fiCS1-light",
    "fiCS1-light-1",
    "fiCS1-light-2",
    "fiCS1-light-3",
    "fiCS1-light-4",
    "fiCS1-street-lamp",
    "fiCS1-street-lamp-1",
    "fiCS1-street-lamp-2",
    "fiCS1-table-lamp",
    "fiHS-hanger-2",
    "fiHS-lamp",
    "fiHS-lamp-1",
    "fiHS-lamp-2",
    "fiHS-lamp-5",
    "fiHS-lamp-6",
    "fiHS-lamp-7",
    "fiHS-living-room",
    "fiHS-shower-1",
    "c1-deskLight",
    "c1-lamp1",
    "c1-lamp3",
    "c1-lamp5",
    "c1-lamp6",
    "c1-desklamp",
    "c1-studiolight",
    "c1-standingLamp"
  ],
  wallMountedLights: [
    "fiCS1-furniture-and-household-8",
    "fiCS1-lamp-23",
    "fiCS1-lamp-24",
    "fiCS1-lamppost",
    "fiCS1-light-5",
    "fiHS-lamp-3",
    "fiCS1-street-lamp-3",
    "fiCS1-streetlight"
  ],
  miscLights:[
    "fiCS1-idea",
    "fiCS1-illuminated",
    "fiCS1-light-bulb",
    "fiCS1-lightbulb",
    "fiE-idea",
    "fiHS-light-bulb",
    "fiHS-light-bulb-1",
    "fiHS-light-bulb-2",
    "fiHS-light-bulb-3",
    "fiHS-light-bulb-4",
    "fiHS-light-bulb-5",
    "fiHS-light-bulb-6",
    "fiHS-light-bulb-7",
    "fiHS-light-bulb-8",
    "fiHS-light-bulb-9",
    "c1-bulb",
    "c1-theaterLight",
    "fiCS1-flashlight"
  ],
  entertainment: [
    "fiCS1-knight",
    "fiCS1-queen",
    "fiCS1-rook",
    "fiCS1-symbols",
    "fiCS1-game-console",
    "fiCS1-gamer",
    "fiCS1-game-console-1",
    "fiCS1-game-controller",
    "fiCS1-game-controller-1",
    "fiCS1-game-console-2",
    'c1-console',
    'c1-controller1',
    'c1-controller2',
    'c1-controller3',
    'c1-controller4',
  ],
  screens: [
    "fiE-television-1",
    "fiCS1-television",
    "fiCS1-imac",
    "fiCS1-monitor",
    "c1-tv",
    "c1-tv1",
    "c1-tv2",
    "c1-projector",
    'c1-monitor',
    'c1-screen',
  ],
  miscellaneous: [
    'c1-chatBubbles',
    'c1-people',
    'c1-pool',
    'c1-crosshairs',
    'c1-crosshairsPin',
    'c1-Pin',
    'c1-skull',
    'c1-xmastree',
    'c1-house',
    'c1-safety-pin',
    'c1-wheel-barrow',
    'c1-squiggly',
    'c1-stars',
    'c1-wheel-barrow-lines',
    'c1-massage',
    'c1-weights',
    'c1-cinema',
    'c1-fireplace',
    'c1-curtains',
    'c1-nuclear-circle',
    'c1-meditation',
    'c1-makeupTable',
    'c1-iron1',
    'c1-musicNote',
    'c1-musicCompose',
    'c1-dance2',
    'c1-movieCamera',
    'c1-band',
    'c1-drums',
    'c1-musicalNotes',
    'c1-mannequin',
    'c1-radiator',
    'c1-thermometer',
    'c1-wheelchair2',
    'c1-recordPlayer',
    'c1-waterSensor',
    'c1-windSensor',
    "fiHS-radiator-3",
    "fiHS-radiator-4",
    "fiHS-sandwich-maker",
    "fiHS-window",
    "fiHS-window-1",
    "fiHS-window-6",
  ],
  tools: [
    "fiCS1-saw",
    "fiCS1-drill",
    'c1-drill1',
    'c1-powerSaw',
    'c1-grinder',
    'c1-drill2',
    'c1-circularSaw',
    'c1-hammer'
  ],
  sockets: [
    "c1-socket",
    "c1-socket2",
    "fiCS1-plugin",
    "fiCS1-socket",
    "fiCS1-socket-1",
    "fiCS1-socket-2",
    "fiCS1-socket-3",
    "fiCS1-socket-4",
    "fiCS1-plugin-1",
    "fiCS1-socket-5",
    "fiCS1-socket-6",
    "fiCS1-plug",
    "fiCS1-plugin-2",
  ],
  tech: [
    "fiCS1-flash",
    "fiCS1-servers",
    "fiCS1-electric-device",
    "fiE-video-camera-1",
    "fiE-video-player-1",
    "fiE-wifi",
    "fiE-wifi-1",
    "fiHS-air-conditioner",
    "fiHS-air-conditioner-1",
    "fiHS-cooler",
    "c1-dvd",
    "c1-fan2",
    "c1-lab",
    "c1-microscope",
    "c1-atom",
    "c1-recycler",
    "c1-nuclear",
    "c1-appleLogo",
    "fiHS-vacuum-cleaner",
    "c1-vacuum",
    "c1-vacuum2",
    "c1-robot",
    "c1-wifiLogo",
    "c1-router",
    "c1-musicPlayer",
    "c1-speakers1",
    "c1-speakers3",
    "c1-speaker2",
    "c1-speaker",
    'c2-crownstone',
    'c2-plugin',
    'c2-pluginFilled',
    'c2-pluginFront',
  ],
  music: [
    "fiCS1-headphones",
    "fiCS1-headphones-1",
    "fiCS1-speakers",
    "fiCS1-workstation",
    "fiCS1-turntable",
    "fiCS1-music",
    "fiCS1-turntable-1",
    "fiCS1-drum",
    "fiCS1-electric-guitar",
    "fiCS1-violin",
    "fiE-compact-disc",
    "fiE-compact-disc-1",
    "fiE-microphone",
    "fiE-microphone-1",
    "fiE-server",
  ],
  office: [
    "fiCS1-printer",
    "fiCS1-printer-1",
    "fiE-print",
    'c1-scanner',
    'c1-scanner2',
    'c1-hdd1',
    'c1-hdd2',
    'c1-transmitHdd',
    'c1-laptop',
    'c1-computer',
    'c1-pc',
    'c1-printer',
    'c1-archive',
    'c1-fan',
    'c1-alarm1',
    'c1-alarm2',
    'c1-airco',
    'c1-airco2',
    'c1-alarmClock',
    'c1-cube1',
    'c1-cube2',
  ],
  bedRoom: [
    'c1-shirt1',
    'c1-weight',
    'c1-shirt2',
    'c1-shirt3',
    'c1-iron',
    'c1-speechbubble',
    'c1-bedOnWheels',
    'c1-baby',
    'c1-babyCarriage',
  ],
  kitchen: [
    "fiCS1-coffee-cup",
    "fiCS1-coffee-machine",
    "fiCS1-tea-cup",
    "fiHS-blender",
    "fiHS-boiler",
    "fiHS-dishwasher",
    "fiHS-food-steamer",
    "fiHS-fridge",
    "fiHS-fridge-1",
    "fiHS-fridge-2",
    "fiHS-heater",
    "fiHS-hood",
    "fiHS-juicer",
    "fiHS-meat-grinder",
    "fiHS-microwave",
    "fiHS-microwave-1",
    "fiHS-mixer",
    "fiHS-mixer-1",
    "fiHS-mixer-2",
    "fiHS-mixer-3",
    "fiHS-sewing-machine",
    "fiHS-coffee-machine",
    "fiHS-cooker",
    'c1-foodWine',
    'c1-blender1',
    'c1-blender2',
    'c1-blender3',
    'c1-fridge',
    'c1-fridge2',
    'c1-fridge3',
    'c1-fridge4',
    'c1-inductionCooker',
    'c1-forkKnife',
    'c1-cocktailGlass1',
    'c1-drink',
    'c1-boiler',
    'c1-coffee1',
    'c1-plate',
    'c1-beer',
    'c1-cocktailGlass2',
    'c1-blender4',
    'c1-dinnerbulb',
    'c1-plate2',
    'c1-coffee2',
    'c1-soup',
    'c1-oven',
    'c1-oven2',
    'c1-oven3',
    'c1-cleaver',
    'c1-coffeepot',
    'c1-coffee3',
    'c1-coffeemachine',
    'c1-coffee4',
    'c1-coffeebean',
    'c1-mixer',
    'c1-toaster',
    'c1-exhaustHood',
    'c1-exhaustHood2',
    'c1-microwave',
  ],
  rides: [
    'c1-car1',
    'c1-bike',
    'c1-motorbike',
  ],
  furniture: [
    'c1-stellingkast',
    'c1-chillChair1',
    'c1-chillChair2',
    'c1-portrait',
    'c1-closet1',
    'c1-closet2',
    'c1-closet3',
    'c1-desk',
    'c1-bed',
    'c1-tvSetup',
    'c1-rockingChair',
    'c1-bunkBeds',
    'c1-officeChair',
    'c1-tvSetup2',
    'c1-computerDesk',
    'c1-cupboard',
    'c1-couch',
    'c1-chair',
    'c1-bookshelf',
    'c1-bed-couch',
  ],
  outside: [
    'c1-cat',
    'c1-horse',
    'c1-frost1',
    'c1-frost2',
    'c1-rain1',
    'c1-fire1',
    'c1-weather1',
    'c1-tree',
    'c1-sun',
    'c1-sunrise',
    'c1-leaf',
    'c1-plant',
    'c1-droplet',
    'c1-tree-pot',
    'c1-arrow-target',
    'c1-garage',
    "fiCS1-forest",
    "fiCS1-tree",
    "fiCS1-sun",
    "fiCS1-botanical"
  ],
  bathroom: [
    'c1-sink1',
    'c1-sink2',
    'c1-sink3',
    'c1-sink4',
    'c1-washingMachine',
    'c1-toiletPaper',
    'c1-toiletroll2',
    'c1-showertub',
    'c1-washingmachine2',
    'c1-wcsign',
    'c1-swimming-circle',
    'c1-medicine',
    'c1-testtube',
    'c1-medicine-bottle',
    'c1-wheel-chair',
    'c1-hairDryer',
    'c1-hairIron',
    'c1-hairIron2',
    'c1-hairCurler',
    'c1-iron2',
    'c1-shaver1',
    'c1-shaver2',
    'c1-toothbrush',
    "fiCS1-furniture-and-household-12",
    "fiHS-washing-machine",
    "fiHS-washing-machine-1",
    "fiHS-water-heater"
  ],
  // __new: []
};

export const getRandomDeviceIcon = function() {
  let keys = Object.keys(listOfIcons);
  let index = Math.floor(Math.random()*keys.length);
  let set = listOfIcons[keys[index]];
  return set[Math.floor(Math.random()*set.length)]
}
export const getRandomHubIcon = function() {
  let keys = [
    'c1-router',
    'c2-crownstone',
    'c1-hdd2',
    'c1-house',
  ];
  let index = Math.floor(Math.random()*keys.length);
  return keys[index];
}

export class DeviceIconSelection extends LiveComponent<{callback(icon: string) : void, icon: string, backgrounds: any, closeModal:boolean}, any> {
  static options(props) {
    if (props.closeModal) {
      return TopBarUtil.getOptions({title:  lang("Pick_an_Icon"), closeModal: true });
    }
    return TopBarUtil.getOptions({title:  lang("Pick_an_Icon") });
  }

  constructor(props) {
    super(props)
  }

  render() {

    let categories = [
      // {key: '__new'                                    , label: lang("__new")},
      {key: 'ceilingLights',     label: lang("ceilingLights")},
      {key: 'furnitureLights',   label: lang("furnitureLights")},
      {key: 'standingLights',    label: lang("standingLights")},
      {key: 'wallMountedLights', label: lang("wallMountedLights")},
      {key: 'miscLights',        label: lang("miscLights")},
      {key: 'screens',           label: lang("Screens")},
      {key: 'entertainment',     label: lang("Entertainment")},
      {key: 'tech',              label: lang("Tech")},
      {key: 'office',            label: lang("Office")},
      {key: 'music',             label: lang("Music")},
      {key: 'furniture',         label: lang("Furniture")},
      {key: 'bathroom',          label: lang("Bathroom")},
      {key: 'bedRoom',           label: lang("Bedroom")},
      {key: 'sockets',           label: lang("Sockets")},
      {key: 'tools',             label: lang("Tools")},
      {key: 'kitchen',           label: lang("Kitchen")},
      {key: 'outside',           label: lang("Outside")},
      {key: 'rides',             label: lang("Rides")},
      {key: 'miscellaneous',     label: lang("Miscellaneous")},
    ];

    return (
      <Background hasNavBar={false} image={background.light}>
        <ScrollView>
          <IconSelection
            categories={categories}
            icons={listOfIcons}
            iconColor={colors.csBlue.hex}
            iconBackgroundColor={colors.white.rgba(0.3)}
            selectedIcon={this.props.icon}
            callback={(newIcon) => {
              this.props.callback(newIcon);
              if (this.props.closeModal) {
                NavigationUtil.dismissModal();
                return;
              }
              NavigationUtil.back();
            }}
          />
        </ScrollView>
      </Background>
    );
  }
}