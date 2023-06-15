
import { Languages } from "../../Languages"

function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("RoomIconSelection", key)(a,b,c,d,e);
}
import * as React from 'react'; import { Component } from 'react';
import {
  ScrollView
} from 'react-native';

import { Background }  from '../components/Background'
import { IconSelection }  from '../components/IconSelection'
import { background, colors} from "../styles";
import { NavigationUtil } from "../../util/navigation/NavigationUtil";
import { TopBarUtil } from "../../util/TopBarUtil";
import {SettingsBackground} from "../components/SettingsBackground";
import { SettingsScrollView } from "../components/SettingsScrollView";


var miscellaneousList = [];
for (let i = 0; i < 256; i++) {
  miscellaneousList.push("rn-" + i)
};


let listOfIcons = {
  plants: [
    "fiCS1-forest",
    "fiCS1-tree",
    "fiCS1-sun",
    "fiCS1-botanical",
    "fiHS-bonsai",
    "fiHS-cactus",
    "fiHS-flower",
    "fiHS-flower-1",
    "fiHS-plant",
    "fiHS-plant-1",
    "fiHS-plant-2",
    "fiHS-plant-3",
    "fiHS-tulips",
    "fiCS1-vase",
    'c1-plant',
    'c1-tree',
    'c1-tree-pot',
  ],
  bathroom: [
    "fiCS1-furniture-and-household-12",
    "fiHS-washing-machine-1",
    "fiHS-washing-machine",
    "fiHS-bathtub",
    "fiHS-bathtub-1",
    "fiHS-bathtub-2",
    "fiHS-shower-2",
    "fiHS-sink",
    "fiHS-sink-1",
    "fiCS1-bathroom",
    "fiCS1-bathroom-1",
    "fiCS1-toilet",
    "fiCS1-bathtub",
    "fiCS1-shower",
    "fiCS1-faucet",
    "fiCS1-bathroom-2",
    'c1-showertub',
    'c1-sink1',
    'c1-sink2',
    'c1-sink3',
    'c1-sink4',
    'c1-toiletroll2',
    'c1-toiletPaper',
    'c1-washingMachine',
    'c1-washingmachine2',
    'c1-medicine',
    'c1-testtube',
    'c1-wcsign',
    'c1-medicine-bottle',
    "c1-manWomanSign",
    "c1-womanSign",
    "c1-hairDryer",
    "c1-toothbrush",
    "c1-toilet1",
    "c1-toilet2",
    'c1-rain1',
  ],
  kitchen: [
    "fiCS1-coffee-machine",
    "fiHS-stove",
    "fiHS-stove-1",
    "fiHS-tap",
    "fiCS1-glass",
    "fiCS1-dinner",
    'c1-foodWine',
    'c1-cutlery',
    'c1-forkKnife',
    'c1-blender3',
    'c1-cocktailGlass1',
    'c1-cocktailGlass2',
    'c1-drink',
    'c1-boiler',
    'c1-droplet',
    'c1-soup',
    'c1-blender4',
    'c1-dinnerbulb',
    'c1-coffee2',
    'c1-coffee3',
    'c1-coffee1',
    'c1-cupboard',
    'c1-plate',
    'c1-plate2',
    'c1-beer',
    'c1-microwave',
    'c1-oven',
    'c1-oven2',
  ],
  livingRoom: [
    "fiHS-armchair",
    "fiHS-armchair-1",
    "fiHS-armchair-2",
    "fiHS-armchair-3",
    "fiHS-armchair-4",
    "fiHS-armchair-5",
    "fiHS-armchair-6",
    "fiHS-chair",
    "fiHS-chair-1",
    "fiHS-chair-2",
    "fiHS-chair-3",
    "fiHS-couch",
    "fiHS-couch-1",
    "fiHS-sofa-2",
    "fiHS-sofa-6",
    "fiHS-sofa-7",
    "fiHS-livingroom-1",
    "fiHS-livingroom-2",
    "fiCS1-couch",
    "fiCS1-sofa",
    "fiHS-fireplace",
    "fiHS-fireplace-1",
    "fiHS-fireplace-2",
    "fiHS-fireplace-3",
    "fiHS-television",
    "fiHS-television-1",
    "fiHS-television-2",
    "fiHS-television-3",
    "fiHS-television-4",
    "fiCS1-chimney",
    'c1-rockingChair',
    'c1-tvSetup',
    'c1-tv1',
    'c1-tvSetup2',
    'c1-bookshelf',
    'c1-musicPlayer',
    'c1-couch',
    'c1-chair',
    'c1-bookshelf2',
    'c1-bookshelf2-lines',
    'c1-clock',
    'c1-fireplace',
    'c1-curtains',
    'c1-tv',
    'c1-tv2',
  ],
  bedRoom: [
    "fiHS-bed",
    "fiHS-bed-1",
    "fiHS-bed-2",
    "fiCS1-bunk",
    "fiCS1-hostel",
    "fiCS1-bed",
    'c1-bunkBeds',
    'c1-bed',
    'c1-babyCarriage',
    'c1-bed-couch',
    'c1-bedpost',
    'c1-massage',
    'c1-baby',
    'c1-makeupTable',
    'c1-mannequin',
    'c1-closet1',
    'c1-closet2',
    'c1-closet3',
    'c1-closet4',
    'c1-closet5',
    'c1-closet6',
    'c1-shirt2',
    'c1-shirt3',
  ],
  office: [
    "fiCS1-desk-5",
    "fiCS1-chair",
    "fiCS1-desk-chair",
    "fiCS1-desk-chair-1",
    "fiCS1-desk-2",
    "fiCS1-desk-3",
    "fiCS1-desk-4",
    "fiE-agenda",
    "fiE-picture-1",
    "fiE-picture-2",
    "fiHS-desk",
    "fiHS-desk-2",
    "fiHS-office-chair-10",
    "fiHS-office-chair-11",
    "fiHS-office-chair-2",
    "fiHS-office-chair-3",
    "fiHS-office-chair-4",
    "fiHS-office-chair-5",
    "fiHS-office-chair-6",
    "fiHS-office-chair-7",
    "fiHS-office-chair-8",
    "fiHS-office-chair-9",
    'c1-officeChair',
    'c1-desk',
    'c1-archive',
    'c1-computerDesk',
    'c1-laptop',
  ],
  garage: [
    'c1-car1',
    'c1-drill1',
    'c1-powerSaw',
    'c1-grinder',
    'c1-drill2',
    'c1-garage',
    'c1-weights',
    'c1-circular-saw',
    'c1-hammer',
    'c1-motorbike',
    'c1-bike',
  ],
  play: [
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
    "c1-console",
    "c1-controller1",
    "c1-controller2",
    "c1-controller3",
    "c1-controller4",
    'c1-dvd',
    'c1-lab',
    'c1-microscope',
    'c1-robot',
    'c1-movieCamera',
    'c1-theaterLight',
    'c1-weight',
    'c1-projector',
  ],
  miscellaneous: miscellaneousList,
  hallway: [
    "fiHS-door-2",
    "fiHS-door-3",
    "fiHS-door-4",
    "fiHS-door-5",
    "fiHS-door-6",
    "fiCS1-dungeon",
    "fiHS-hanger",
    "fiHS-hanger-1",
    "fiHS-stairs",
    "fiHS-stairs-1",
    "fiCS1-stairs",
    "fiCS1-stairs-1",
    'c1-door-plant',
    'c1-tree-thing',
    'c1-stairs',
    'c1-door-plant-lines',
    'c1-signpost',
  ],
  music: [
    "fiCS1-speakers",
    "fiCS1-drum",
    "fiCS1-electric-guitar",
    "fiCS1-violin",
    "fiE-microphone",
    "fiE-microphone-1",
    "fiCS1-turntable-1",
    "fiCS1-music",
    "fiCS1-turntable",
    "fiCS1-workstation",
    'c1-rec',
    'c1-speakers1',
    'c1-speaker2',
    'c1-speakers3',
    'c1-band',
    'c1-drums',
    'c1-musicalNotes',
    'c1-musicNote',
    'c1-musicCompose',
    'c1-dance2',
  ],
  furniture: [
    "fiHS-bookshelf-4",
    "fiHS-chest-of-drawers",
    "fiHS-chest-of-drawers-1",
    "fiHS-chest-of-drawers-2",
    "fiHS-chest-of-drawers-5",
    "fiHS-chest-of-drawers-6",
    "fiHS-closet-2",
    "fiHS-closet-3",
    "fiHS-closet-4",
    "fiHS-dressing",
    "fiHS-wardrobe",
    "fiHS-wardrobe-1",
    "fiHS-wardrobe-2",
    "fiHS-bookshelf",
    "fiHS-bookshelf-1",
    "fiHS-bookshelf-2",
    "fiHS-bookshelf-3",
    "fiHS-desk-3",
    "fiHS-dressing-2",
    "fiHS-library",
    "fiHS-nightstand",
    "fiHS-nightstand-1",
    "fiHS-nightstand-2",
    "fiHS-table",
    "fiHS-table-1",
    "fiHS-table-2",
    "fiHS-table-3",
    "fiHS-table-4",
    "fiHS-table-5",
    "fiHS-table-6",
    "fiCS1-flower"
  ],
};

export const getRandomRoomIcon = () => {
  let allKeys = Object.keys(listOfIcons);
  let key = allKeys[Math.floor(Math.random()*allKeys.length)];
  return listOfIcons[key][Math.floor(Math.random()*listOfIcons[key].length)]
};

export class RoomIconSelection extends Component<{navigation:any, callback(icon: string) : void, icon: string, backgrounds: any}, any> {
  static options(props) {
    return TopBarUtil.getOptions({title: lang("Pick_an_Icon") });
  }

  constructor(props) {
    super(props)
  }

  render() {
    let categories = [
      {key: 'hallway', label: lang("Hallway")},
      {key: 'livingRoom', label: lang("Living_Room")},
      {key: 'kitchen', label: lang("Kitchen")},
      {key: 'bathroom', label: lang("Bathroom")},
      {key: 'office', label: lang("Office")},
      {key: 'bedRoom', label: lang("Bedroom")},
      {key: 'garage', label: lang("Garage")},
      {key: 'play', label: lang("Play_Room")},
      {key: 'furniture', label: lang("Furniture")},
      {key: 'music', label: lang("Music_Room")},
      {key: 'plants', label: lang("Nature___Outside")},
      {key: 'miscellaneous', label: lang("Miscellaneous")},
    ];

    return (
      <SettingsBackground testID={"RoomIconSelection"}>
        <SettingsScrollView>
          <IconSelection
            categories={categories}
            icons={listOfIcons}
            iconColor={colors.csBlue.hex}
            iconBackgroundColor={colors.white.rgba(0.3)}
            selectedIcon={this.props.icon}
            callback={(newIcon) => {
              this.props.callback(newIcon);
              NavigationUtil.back();
            }}
          />
        </SettingsScrollView>
      </SettingsBackground>
    );
  }
}
