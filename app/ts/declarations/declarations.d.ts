

// declare module 'react-native-image-resizer' {
//   const createResizedImage: any;
//   export default createResizedImage;
// }

type timestamp = number;
type rssi      = number;
type sigmoid   = number;
type uuid      = string;
declare const global: {
  __DEV__: boolean,
};

interface locationDataContainer {
  sphereId: string,
  locationId: string,
}

interface classificationContainer {
  timestamp:  number,
  sphereId:   string,
  locationId: string,
}

type map = { [proptype: string] : boolean } | {}
type numberMap = { [proptype: string] : number } | {}
type stringMap = { [proptype: string] : string } | {}
type colorString = string;

type PromiseCallback = (any) => Promise<any>
type voidCallback = () => void;
type unsubscriber = () => void;

interface color {
  hex:string,
  rgb?:{r:number,g:number,b:number},
  rgba?(number) : string,
  name?: string,
  hsv?:string,
  blend?(color, number) : color,
  hsvBlend?(color, number) : color,
}


interface UIBlinkSettings { left?: boolean, center?: boolean, right?: boolean };

interface colorInterface {
  csBlue:               color,
  csBlueDark:           color,
  csBlueDarker:         color,
  csBlueDarkerDesat:    color,
  csBlueLight:          color,
  csBlueLighter:        color,
  csBlueLightDesat:     color,
  csOrange:             color,
  lightCsOrange:        color,
  menuBackground:       color,
  menuText:             color,
  white:                color,
  black:                color,
  gray:                 color,
  darkGray:             color,
  darkGray2:            color,
  lightGray2:           color,
  lightGray:            color,
  purple:               color,
  darkPurple:           color,
  darkerPurple:         color,
  blue3:                color,
  blue:                 color,
  blueDark:             color,
  green:                color,
  green2:               color,
  lightGreen:           color,
  lightGreen2:          color,
  darkGreen:            color,
  red:                  color,
  darkRed:              color,
  menuRed:              color,
  iosBlue:              color,
  iosBlueDark:          color,
  lightBlue:            color,
  lightBlue2:           color,
  blinkColor1:          color,
  blinkColor2:          color,
  random() : any
}

type NativeBusTopic = "setupAdvertisement"              |
                      "dfuAdvertisement"                |
                      "advertisement"                   |
                      "crownstoneAdvertisementReceived" |
                      "unverifiedAdvertisementData"     |
                      "setupProgress"                   |
                      "dfuProgress"                     |
                      "bleStatus"                       |
                      "bleBroadcastStatus"              |
                      "locationStatus"                  |
                      "nearest"                         |
                      "nearestSetup"                    |
                      "tick"                            |
                      "iBeaconAdvertisement"            |
                      "enterSphere"                     |
                      "exitSphere"                      |
                      "enterRoom"                       |
                      "exitRoom"                        |
                      "currentRoom"                     |
                      "currentLocationKNN"              |
                      "libAlert"                        |
                      "libPopup"                        |
                      "classifierProbabilities"         |
                      "classifierResult"                |
                      "callbackUrlInvoked"              |
                      "localizationPausedState"         |
                      "connectedToPeripheral"           |
                      "disconnectedFromPeripheral"


interface NativeBusTopics {
  setupAdvertisement:              string,
  dfuAdvertisement:                string,
  advertisement:                   string,
  crownstoneAdvertisementReceived: string,
  unverifiedAdvertisementData:     string,
  setupProgress:                   string,
  dfuProgress:                     string,
  bleStatus:                       string,
  bleBroadcastStatus:              string,
  locationStatus:                  string,

  nearest:                         string,
  nearestSetup:                    string,

  tick:                            string,
  iBeaconAdvertisement:            string,
  enterSphere:                     string,
  exitSphere:                      string,

  libAlert:                        string,
  libPopup:                        string,

  callbackUrlInvoked:              string,
  localizationPausedState:         string,
  connectedToPeripheral:           string,
  disconnectedFromPeripheral:      string,
}

interface NativeBus {
  emit: (topic: string, data: any) => void,
  topics: NativeBusTopics,
  on(topic : string, callback) : () => void,
  clearAllEvents() : void,
}

interface background {
  main                   : any,
  menu                   : any,
  mainDarkLogo           : any,
  mainRemoteNotConnected : any,
  mainDark               : any,
  light                  : any,
  lightBlur              : any,
  lightBlurLighter       : any,
  lightBlurBW            : any,
  detailsDark            : any,
}


interface coreStore {
  getState: () => ReduxAppState,
  dispatch: (action: DatabaseAction) => void,
  batchDispatch: (actions: DatabaseAction[]) => void
}
interface core {
  permissionState: {
    location: string,
    bluetooth: string,
    bluetoothType: 'SCANNER' | 'BROADCASTER',
  },
  bleState: {
    bleAvailable: boolean,
    bleBroadcastAvailable: boolean,
  },
  store: coreStore,
  eventBus: any,
  nativeBus: NativeBus,
}

interface base_core {
  store: any,
  sessionMemory: {
    loginEmail: string,
    cameraSide: string,
    cacheBusterUniqueElement: number,
    developmentEnvironment: boolean,
  }
}


type onSelectResult = boolean | void | string | Promise
interface interviewOption {
  label: string,
  subLabel?: string,
  icon?: any,
  image?: imageData,
  nextCard?: string,
  dangerous?: boolean,
  response?: string,
  dynamicResponse?: (value: {textfieldState: string, customElementState: any}) => string | string,
  textAlign?: string,
  onSelect?: (value: interviewReturnData) => onSelectResult,
  editable?: boolean,
  theme?: "default" | "create",
  testID?: string,
}

interface imageData {
  source:        any, // image require(...)
  sourceWidth?:  number,
  sourceHeight?: number,
  width?:        number,
  height?:       number,
  tintColor?:    string,
}

interface interviewReturnData {
  customElementState: any,
  textfieldState: any
}

interface interviewCard {
  header?: string,
  headerMaxNumLines?: number,
  subHeader?: string,
  explanation?: string,
  optionsExplanation?: string,
  textColor?: string,
  image?: imageData,
  component?: any,
  editableItem?: (state, setState) => any,
  backgroundImage?: any
  hasTextInputField?: boolean
  textInputTestID?: string,
  placeholder?: string
  optionsHiddenIfNotOnTop?: boolean,
  optionsAlwaysOnTop?: boolean,
  optionsCenter?: boolean,
  optionsBottom?: boolean
  options: interviewOption[],
  testID?: string,
  scrollViewtestID?: string,
}

interface interviewCards {
  start: interviewCard,
  [key: string]: interviewCard,
}

interface onScreenNotificationPayload {
  source: string,
  id: string,
  label: string,
  sphereId?: string,
  icon?: string,
  iconSize?: number,
  iconColor?: string,
  backgroundColor? : string,
  callback: () => void
}

type StackData = { component: any } | { stack: any } | { bottomTabs: any }

interface GraphData {
  x: number,
  y: number,
}

interface HubDataReply {
  protocolVersion: number,
  type:            string, // is the string name of the ReplyTypes. As of writing: success | error | dataReply
  errorType:       number // can be null
  dataType:        number // can be null
  message:         string // default empty string ""
}

interface triggerFormat {
  [sphereId: string]: {
    [stoneId: string] : {
      [ownerId: string] : {
        [uuid: string] : {
          rssiRequirement: number,
          action: () => void,
          timesToTrigger: number,
          timesTriggered: number,
          triggeredIds: map,
          timeout?:number,
          promise?: {resolve: (stoneId) => void, reject: (err) => void}
        }
      }
    }
  }
}

interface logFormat {
  [key: string]: {sphereId: string, t: number, rssi: number, lastNotifiedRssi: number, handle: string,}
}

interface sphereLogFormat {
  [key: string]: {[key: string] : {t: number, rssi: number, handle: string }}
}

type PartialRecord<K extends keyof any, T> = Partial<Record<K,T>>;

// a number will show that number, a string will show that string, a boolean true will only draw an empty circle
// null, 0, false or undefined will not show the badge.
type BadgeIndicator = number | string | boolean
