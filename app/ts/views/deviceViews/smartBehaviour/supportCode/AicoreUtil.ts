import { Languages } from "../../../../Languages";
function lang(key,a?,b?,c?,d?,e?) {
  return Languages.get("AicoreUtil", key)(a,b,c,d,e);
}


import {
  AICORE_LOCATIONS_TYPES,
  AICORE_PRESENCE_TYPES,
  AICORE_TIME_DETAIL_TYPES,
  AICORE_TIME_TYPES
} from "../../../../Enums";
import { MapProvider } from "../../../../backgroundProcesses/MapProvider";
import { core } from "../../../../Core";
import { AicoreTimeData } from "./AicoreTimeData";
import { AicoreBehaviour } from "./AicoreBehaviour";
import { AicoreTwilight } from "./AicoreTwilight";
import { BEHAVIOUR_TYPES } from "../../../../database/reducers/stoneSubReducers/behaviours";
import { DAY_INDICES_MONDAY_START, DAY_INDICES_SUNDAY_START } from "../../../../Constants";
import { Util } from "../../../../util/Util";
import { AMOUNT_OF_CROWNSTONES_FOR_INDOOR_LOCALIZATION } from "../../../../ExternalConfig";
import { Alert } from "react-native";
import {
  enoughCrownstonesInLocationsForIndoorLocalization
} from "../../../../util/DataUtil";
import {FingerprintUtil} from "../../../../util/FingerprintUtil";
const SunCalc = require('suncalc');


export const AicoreUtil = {

  extractActionString(behaviour : behaviour | twilight) {
    if (behaviour.action.type === "DIM_WHEN_TURNED_ON") {
      return lang("Ill_dim_to___instead", Math.round(behaviour.action.data ))
    }
    if (behaviour.action.data < 100) {
      return lang("dimmed_at__", Math.round(behaviour.action.data))
    }
    else if (behaviour.action.data == 100) {
      return lang("on")
    }
  },

  extractPresenceStrings(behaviour : behaviour) : {presencePrefix: string, presenceStr: string} {
    let presencePrefix = null;
    let presenceStr = null;
    switch (behaviour.presence.type) {
      case AICORE_PRESENCE_TYPES.SOMEBODY:
        presencePrefix = lang("if");
        presenceStr   = lang("somebody");
        break;
      case AICORE_PRESENCE_TYPES.NOBODY:
        presencePrefix = lang("if")
        presenceStr   = lang("nobody")
        break;
      case AICORE_PRESENCE_TYPES.SPECIFIC_USERS:
        presenceStr = null; break; // TODO: implement profiles
      case AICORE_PRESENCE_TYPES.IGNORE:
        presenceStr = null; break;
    }

    return { presencePrefix, presenceStr };
  },

  extractLocationStrings(behaviour : behaviour, sphereId: string) {
    let locationPrefix = "";
    let locationStr = "";
    let locationPostfix = "";
    if (behaviour.presence.type !== AICORE_PRESENCE_TYPES.IGNORE) {
      // @ts-ignore
      let pd = behaviour.presence.data;

      switch (pd.type) {
        case AICORE_LOCATIONS_TYPES.SPHERE:
          locationPrefix = lang("is")
          locationPostfix = lang("locationPostfix")
          locationStr = lang("home")
          break;
        case AICORE_LOCATIONS_TYPES.LOCATION:
          if (pd.locationIds.length > 0) {
            locationPrefix = lang("is_in_the")
            locationPostfix = lang("locationPostfix")
            // we will now construct a roomA_name, roomB_name or roomC_name line.
            locationStr = AicoreUtil.getLocationNameFromUid(sphereId, pd.locationIds[0]);
            if (pd.locationIds.length > 1) {
              for (let i = 1; i < pd.locationIds.length - 1; i++) {
                let locationUid = pd.locationIds[i];
                let locationName = AicoreUtil.getLocationNameFromUid(sphereId, locationUid);
                locationStr += ", " + locationName;
              }

              locationStr += lang("_or_") + AicoreUtil.getLocationNameFromUid(sphereId, pd.locationIds[pd.locationIds.length - 1]);
            }
          }
      }
    }

    return { locationPrefix, locationStr, locationPostfix };
  },


  extractTimeString(behaviour : behaviour | twilight, forceBetween = false) {
    let timeStr = "";

    let time = behaviour.time;
    // @ts-ignore
    if (time.type === undefined || time.type != AICORE_TIME_TYPES.ALL_DAY) {
      let tr = time as aicoreTimeRange;
      let noOffset = (tr.from as aicoreTimeDataSun).offsetMinutes === 0 && (tr.to as aicoreTimeDataSun).offsetMinutes === 0;
      if ((tr.from.type === AICORE_TIME_DETAIL_TYPES.SUNRISE && tr.to.type === AICORE_TIME_DETAIL_TYPES.SUNSET) && noOffset) {
        // "while the sun is up"
        if (AicoreUtil.isTwilight(behaviour)) {
          timeStr = lang("while_the_sun_is_up_twilight");
        }
        else {
          timeStr = lang("while_the_sun_is_up");
        }
      }
      else if ((tr.from.type === AICORE_TIME_DETAIL_TYPES.SUNSET && tr.to.type === AICORE_TIME_DETAIL_TYPES.SUNRISE) && noOffset) {
        // "while its dark outside"
        if (AicoreUtil.isTwilight(behaviour)) {
          timeStr = lang("while_its_dark_outside_twilight");
        }
        else {
          timeStr = lang("while_its_dark_outside");
        }
      }
      else if (tr.from.type === AICORE_TIME_DETAIL_TYPES.CLOCK && tr.to.type === AICORE_TIME_DETAIL_TYPES.CLOCK || forceBetween) {
        // this makes "between X and Y"
        let fromStr = AicoreUtil.getTimeStr(tr.from);
        let toStr   = AicoreUtil.getTimeStr(tr.to);
        timeStr = lang("between__and_", fromStr,toStr);
      }
      else if (tr.from.type === AICORE_TIME_DETAIL_TYPES.CLOCK && (tr.to.type === AICORE_TIME_DETAIL_TYPES.SUNRISE || tr.to.type === AICORE_TIME_DETAIL_TYPES.SUNSET)) {
        // this makes "from xxxxx until xxxxx"
        let fromStr = AicoreUtil.getTimeStr(tr.from);
        let toStr   = AicoreUtil.getTimeStr(tr.to);
        timeStr = lang("from__until_", fromStr,toStr);
      }
      else if (tr.to.type === AICORE_TIME_DETAIL_TYPES.CLOCK && (tr.from.type === AICORE_TIME_DETAIL_TYPES.SUNRISE || tr.from.type === AICORE_TIME_DETAIL_TYPES.SUNSET)) {
        // this makes "from xxxxx until xxxxx"
        let fromStr = AicoreUtil.getTimeStr(tr.from);
        let toStr   = AicoreUtil.getTimeStr(tr.to);
        timeStr = lang("from__until_", fromStr,toStr);
      }
      else {
        // these are "from xxxxx to xxxxx"
        let fromStr = AicoreUtil.getTimeStr(tr.from);
        let toStr   = AicoreUtil.getTimeStr(tr.to);
        timeStr = lang("from__to_", fromStr,toStr);
      }
    }

    return timeStr;
  },

  isTwilight(behaviour : behaviour | twilight) {
    return behaviour.action.type === "DIM_WHEN_TURNED_ON";
  },


  extractEndConditionStrings(behaviour : behaviour) {
    let endConditionPrefix = "";
    let endConditionStr= "";
    if (behaviour.endCondition && behaviour.endCondition.type) {
      switch (behaviour.endCondition.presence.data.type) {
        case "SPHERE":
          endConditionPrefix += lang("Afterwards__Ill");
          endConditionStr += lang("stay_on_if_someone_is_stil");
          break;
        case "LOCATION":
          endConditionPrefix += lang("Afterwards__Ill");
          endConditionStr += lang("stay_on_if_someone_is_sti");
          break;
      }
    }
    return {endConditionPrefix, endConditionStr};
  },


  getLocationNameFromUid(sphereId: string, locationUID: number) {
    let locationData = MapProvider.locationUIDMap[sphereId][locationUID]
    if (locationData) {
      return locationData.name;
    }
    return lang("_deleted_location_");
  },


  getSunsetTimeString(sphereId: string) {
    let sunTimes = Util.getSunTimes(sphereId);
    let sunsetTime  = sunTimes.sunset;
    return AicoreUtil.getClockTimeStr(new Date(sunsetTime).getHours(), new Date(sunsetTime).getMinutes());
  },

  getClockTimeStr(hours, minutes) {
    return hours + ":" + (minutes < 10 ? "0" + minutes : minutes);
  },

  getSunTimeStr(timeObj : aicoreTimeDataSun) {
    // TYPE IS SUNSET/SUNRISE
    let obj = (timeObj as aicoreTimeDataSun);
    let str = "";
    if (obj.offsetMinutes !== 0) {
      let getTimeNotation = function(mins) {
        mins = Math.abs(mins);
        if (mins%60 === 0) {
          let hours = mins/60;
          if (hours === 1) {
            return lang("__hour");
          }
          return lang("_hours", hours)
        }
        else if (mins < 60) {
          return lang("_minutes", mins)
        }
        else {
          return lang("_hrs___mins", Math.floor(mins/60),mins%60)
        }
      };

      if (obj.offsetMinutes < 0) {
        str += lang("_before_", getTimeNotation(obj.offsetMinutes))
      }
      else {
        str += lang("_after_", getTimeNotation(obj.offsetMinutes))
      }
    }
    if (obj.type === "SUNSET") {
      str += lang("sunset")
    }
    else if (obj.type === "SUNRISE") {
      str += lang("sunrise")
    }
    return str;
  },

  getTimeStr(timeObj: aicoreTimeData) {
    if (timeObj.type === "CLOCK") {
      // TYPE IS CLOCK
      let obj = (timeObj as aicoreTimeDataClock).data;
      return AicoreUtil.getClockTimeStr(obj.hours, obj.minutes);
    }
    else {
      return AicoreUtil.getSunTimeStr(timeObj);
    }
  },

  isSameTime(fromTime : AicoreTimeData, toTime: AicoreTimeData) : boolean {
    return AicoreUtil.getTimeStr(fromTime.data) === AicoreUtil.getTimeStr(toTime.data);
  },


  getWordLength(word) {
    let result = 0;
    let letterWidthMap = { I: 4, " ": 5, m: 16, w: 16, rest: 11, ".": 2 };
    for (let i = 0; i < word.length; i++) {
      if (word[i]) {
        result += letterWidthMap[word[i]] || letterWidthMap.rest;
      }
    }
    return result;
  },

  getTimeStrInTimeFormat(timeObj : aicoreTimeData, sphereId) {
    let timeData = AicoreUtil.getClockTime(timeObj, sphereId);
    return AicoreUtil.getClockTimeStr(timeData.hours, timeData .minutes);
  },

  getClockTime(timeObj, sphereId) {
    if (timeObj.type === "CLOCK") {
      // TYPE IS CLOCK
      let obj = (timeObj as aicoreTimeDataClock).data;
      return {hours:obj.hours, minutes: obj.minutes}
    }
    else {
      let state = core.store.getState();
      let sphere = state.spheres[sphereId];

      // position of Crownstone HQ.
      let lat = 51.923611570463152;
      let lon = 4.4667693378575288;
      if (sphere) {
        lat = sphere.config.latitude  || lat;
        lon = sphere.config.longitude || lon;
      }
      let baseTime = 0;
      let times = SunCalc.getTimes(new Date(), lat, lon);

      let obj = (timeObj as aicoreTimeDataSun);
      if (obj.type === "SUNSET") {
        baseTime = new Date(times.sunset).valueOf();
      }
      else if (obj.type === "SUNRISE") {
        baseTime = new Date(times.sunriseEnd).valueOf();
      }


      if (obj.offsetMinutes !== 0) {
        baseTime += 60*1000*obj.offsetMinutes;
      }

      return {hours: new Date(baseTime).getHours(), minutes: new Date(baseTime).getMinutes()}
    }
  },

  isTimeBeforeOtherTime(time, otherTime, sphereId) {
    return AicoreUtil.getMinuteDifference(time, otherTime, sphereId) > 0;
  },

  getMinuteDifference(time, otherTime, sphereId) {
    let timeValue  = AicoreUtil.getMinuteValue(time, sphereId);
    let otherValue  = AicoreUtil.getMinuteValue(otherTime, sphereId);
    return timeValue - otherValue;
  },

  getMinuteValue(time, sphereId) {
    let timeData = AicoreUtil.getClockTime(time, sphereId);
    return timeData.hours*60 + timeData.minutes;
  },


  /**
   * A and B are full behaviours from the database;
   * @param a
   * @param b
   */
  aStartsBeforeB(a, b, sphereId) : boolean {
    let aR = null;
    let bR = null;
    if (a.type === BEHAVIOUR_TYPES.twilight) {
      aR = new AicoreTwilight(a.data);
    }
    else {
      aR = new AicoreBehaviour(a.data);
    }
    if (b.type === BEHAVIOUR_TYPES.twilight) {
      bR = new AicoreTwilight(b.data);
    }
    else {
      bR = new AicoreBehaviour(b.data);
    }


    if (bR.behaviour.time.type === "ALL_DAY" && aR.behaviour.time.type === "ALL_DAY") { return false; }
    if (aR.behaviour.time.type === "ALL_DAY" && bR.behaviour.time.type !== "ALL_DAY") { return true; }
    if (aR.behaviour.time.type !== "ALL_DAY" && bR.behaviour.time.type === "ALL_DAY") { return false; }

    return AicoreUtil.isTimeBeforeOtherTime(aR.behaviour.time.from, bR.behaviour.time.from, sphereId)
  },


  /**
   * A and B are full behaviours from the database;
   * @param a
   * @param b
   */
  endsNextDay(behaviourData, sphereId) : boolean {
    let behaviour : AicoreBehaviour | AicoreTwilight = null;
    if (behaviourData.type === BEHAVIOUR_TYPES.twilight) {
      behaviour = new AicoreTwilight(behaviourData.data);
    }
    else {
      behaviour = new AicoreBehaviour(behaviourData.data);
    }

    if (behaviour.behaviour.time.type === "RANGE") {
      let fromTime = AicoreUtil.getMinuteValue(behaviour.behaviour.time.from, sphereId);
      let toTime   = AicoreUtil.getMinuteValue(behaviour.behaviour.time.to, sphereId);

      return fromTime >= toTime
    }
    else {
      // all day
      return true;
    }


  },

  //
  // /**
  //  * A and B are full behaviours from the database;
  //  * This will return the induced overlap if you enable A on the forDay, given that behaviour B already exists.
  //  * @param a
  //  * @param b
  //  * @param forDay ("Mon", "Tue" etc.
  //  */
  // getOverlapData(a, b, forDay, sphereId) {
  //   let aR = null;
  //   let bR = null;
  //
  //   let result = {
  //     overlapMins:           0,
  //     aPercentageOverlapped: 0,
  //     bPercentageOverlapped: 0,
  //     aUsesPresence:         aR.isUsingPresence(),
  //     bUsesPresence:         bR.isUsingPresence()
  //   }
  //
  //   // only comparible data types can be compared.
  //   if (a.type !== b.type) {
  //     return result;
  //   }
  //
  //   if (a.type === BEHAVIOUR_TYPES.twilight) { aR = new AicoreTwilight(a.data);  }
  //   else                                     { aR = new AicoreBehaviour(a.data); }
  //   if (b.type === BEHAVIOUR_TYPES.twilight) { bR = new AicoreTwilight(b.data);  }
  //   else                                     { bR = new AicoreBehaviour(b.data); }
  //
  //
  //
  //   let aTime = aR.behaviour.time;
  //   let bTime = bR.behaviour.time;
  //
  //   let today       = dayArray.indexOf(forDay);
  //   let previousDay = (today + 6) % 7;
  //
  //   let midNight = 24*60;
  //   let dayMinutesStart = 4*60;
  //   let dayLength = 24*60;
  //
  //   let bYesterday = b.activeDays[dayArray[previousDay]];
  //   let bToday     = b.activeDays[forDay];
  //
  //   if (aTime.type === "ALL_DAY" && bTime.type === "ALL_DAY" && bToday) {
  //     result.overlapMins = dayLength;
  //     result.aPercentageOverlapped = 1;
  //     result.bPercentageOverlapped = 1;
  //     return result;
  //   }
  //   else if (aTime.type === "ALL_DAY" && bTime.type === "ALL_DAY") { // this implies that they are not active on the same day
  //     // no overlap
  //     return result;
  //   }
  //   else if (aTime.type === "ALL_DAY" && bTime.type !== "ALL_DAY") {
  //     // the day lasts from 04:00 until 04:00 the next day.
  //
  //     // if we enable A, this means that the new timeslots are:
  //     // 04:00 - 23:59:00 today and 00:00 - 04:00 tomorrow.
  //
  //     let bMinutesStart = AicoreUtil.getMinuteValue(bTime.from, sphereId);
  //     let bMinutesEnd   = AicoreUtil.getMinuteValue(bTime.to,   sphereId);
  //     let bCrossDay     = bMinutesStart >= bMinutesEnd;
  //     let bLength = bCrossDay ? midNight - bMinutesStart + bMinutesEnd : bMinutesEnd - bMinutesStart;
  //
  //     if (bCrossDay) {
  //       if (bYesterday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([dayMinutesStart, midNight], [0, bMinutesEnd]);
  //       }
  //       if (bToday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([dayMinutesStart, midNight], [bMinutesStart, midNight]);
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0,       dayMinutesStart],  [0,          bMinutesEnd]);
  //       }
  //     }
  //     else if (bToday) {
  //       result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([dayMinutesStart, midNight], [bMinutesStart, bMinutesEnd]);
  //     }
  //
  //     result.aPercentageOverlapped = result.overlapMins / dayLength;
  //     result.bPercentageOverlapped = result.overlapMins / bLength;
  //     return result;
  //   }
  //   else if (aTime.type !== "ALL_DAY" && bTime.type === "ALL_DAY") {
  //     // if we enable A, this means that the new timeslots are:
  //     // IF we are crossDay:
  //     // aMinutesStart - 23:59:59 today and 00:00 - aMinutesEnd tomorrow.
  //     // IF not:
  //     // aMinutesStart - aMinutesEnd
  //
  //     let aMinutesStart = AicoreUtil.getMinuteValue(aTime.from, sphereId);
  //     let aMinutesEnd   = AicoreUtil.getMinuteValue(aTime.to,   sphereId);
  //     let aCrossDay = aMinutesStart >= aMinutesEnd;
  //     let aLength = aCrossDay ? midNight - aMinutesStart + aMinutesEnd : aMinutesEnd - aMinutesStart;
  //
  //     if (aCrossDay) {
  //       if (bYesterday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, dayMinutesStart], [aMinutesStart, midNight]);
  //       }
  //       if (bToday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([dayMinutesStart, midNight], [aMinutesStart, midNight]);
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, dayMinutesStart], [0, aMinutesEnd]);
  //       }
  //     }
  //     else if (bToday) {
  //       result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([dayMinutesStart, midNight], [aMinutesStart, aMinutesEnd]);
  //     }
  //
  //     result.aPercentageOverlapped = result.overlapMins / aLength;
  //     result.bPercentageOverlapped = result.overlapMins / dayLength;
  //     return result;
  //   }
  //
  //   // handle individual clock times.
  //   // if we enable A, this means that the new timeslots are:
  //   // IF we are crossDay:
  //   // aMinutesStart - 23:59:00 today and 00:00 - aMinutesEnd tomorrow.
  //   // IF not:
  //   // aMinutesStart - aMinutesEnd
  //
  //   let aMinutesStart = AicoreUtil.getMinuteValue(aTime.from, sphereId);
  //   let aMinutesEnd   = AicoreUtil.getMinuteValue(aTime.to,   sphereId);
  //   let aCrossDay = aMinutesStart > aMinutesEnd;
  //   let aLength = aCrossDay ? midNight - aMinutesStart + aMinutesEnd : aMinutesEnd - aMinutesStart;
  //
  //   let bMinutesStart = AicoreUtil.getMinuteValue(bTime.from, sphereId);
  //   let bMinutesEnd   = AicoreUtil.getMinuteValue(bTime.to,   sphereId);
  //   let bCrossDay     = bMinutesStart > bMinutesEnd;
  //   let bLength = bCrossDay ? midNight - bMinutesStart + bMinutesEnd : bMinutesEnd - bMinutesStart;
  //
  //   if (aCrossDay) {
  //     if (bCrossDay) {
  //       if (bYesterday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, bMinutesEnd], [aMinutesStart, midNight]);
  //       }
  //       if (bToday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, midNight], [aMinutesStart,midNight]);
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, bMinutesEnd],          [0, aMinutesEnd]);
  //       }
  //     }
  //     else if (bToday) {
  //       result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, bMinutesEnd], [aMinutesStart, midNight]);
  //     }
  //   }
  //   else {
  //     if (bCrossDay) {
  //       if (bYesterday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, bMinutesEnd], [aMinutesStart, aMinutesEnd]);
  //       }
  //       if (bToday) {
  //         result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, midNight], [aMinutesStart,aMinutesEnd]);
  //       }
  //     }
  //     else if (bToday) {
  //       result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, bMinutesEnd], [aMinutesStart, aMinutesEnd]);
  //     }
  //   }
  //
  //   result.aPercentageOverlapped = result.overlapMins / aLength;
  //   result.bPercentageOverlapped = result.overlapMins / bLength;
  //   return result;
  // },

  canBehaviourUseIndoorLocalization(sphereId, endLine: string, behaviour=null) {
    if (!behaviour || behaviour.isUsingSingleRoomPresence() || behaviour.isUsingMultiRoomPresence() || behaviour.hasLocationEndCondition()) {
      let state = core.store.getState();

      // are there enough?
      let enoughForLocalization = enoughCrownstonesInLocationsForIndoorLocalization(sphereId);

      // do we need more fingerprints?
      let requiresFingerprints = FingerprintUtil.requireMoreFingerprintsBeforeLocalizationCanStart(sphereId);

      if (enoughForLocalization === false) {
        Alert.alert(
          lang("Indoor_localization_not_a"),
          lang("We_need_at_least__Crownst", AMOUNT_OF_CROWNSTONES_FOR_INDOOR_LOCALIZATION,endLine), [{text:lang("OK")}]
        );
        return false;
      }
      else if (enoughForLocalization && requiresFingerprints) {
        Alert.alert(
          lang("Not_all_rooms_are_trained"),
          lang("Make_sure_you_train_all_t"), [{text:lang("OK")}]
        );
        return true;
      }

      return true;
    }

  },

  /**
   * A and B are full behaviours from the database;
   * This will return the induced overlap if you enable A on the forDay, given that behaviour B already exists.
   * @param a
   * @param b
   * @param forDay ("Mon", "Tue" etc.
   */
  getOverlapData(a, b, forDay, sphereId) {
    let aR = null;
    let bR = null;

    let result = {
      overlapMins:           0,
      aPercentageOverlapped: 0,
      bPercentageOverlapped: 0,
    }

    // only comparible data types can be compared.
    if (a.type !== b.type) {
      return result;
    }

    if (a.type === BEHAVIOUR_TYPES.twilight) { aR = new AicoreTwilight(a.data);  }
    else                                     { aR = new AicoreBehaviour(a.data); }
    if (b.type === BEHAVIOUR_TYPES.twilight) { bR = new AicoreTwilight(b.data);  }
    else                                     { bR = new AicoreBehaviour(b.data); }

    let aTime = aR.behaviour.time;
    let bTime = bR.behaviour.time;

    let today       = DAY_INDICES_MONDAY_START.indexOf(forDay);
    let previousDay = (today + 6) % 7;

    let midNight = 24*60;
    let dayMinutesStart = 4*60;
    let dayLength = 24*60;

    let bYesterday = b.activeDays[DAY_INDICES_MONDAY_START[previousDay]];
    let bToday     = b.activeDays[forDay];

    let aMinutesStart = 0;
    let aMinutesEnd   = 0;
    let aCrossDay     = false;
    let aLength       = 0;

    let bMinutesStart = 0;
    let bMinutesEnd   = 0;
    let bCrossDay     = false;
    let bLength       = 0;


    if (aTime.type === "ALL_DAY" && bTime.type === "ALL_DAY" && bToday) {
      result.overlapMins = dayLength;
      result.aPercentageOverlapped = 1;
      result.bPercentageOverlapped = 1;
      return result;
    }
    else if (aTime.type === "ALL_DAY" && bTime.type === "ALL_DAY") { // this implies that they are not active on the same day
      // no overlap
      return result;
    }
    if (aTime.type === "ALL_DAY") {
      aMinutesStart = dayMinutesStart;
      aMinutesEnd   = dayMinutesStart;
      aCrossDay = aMinutesStart >= aMinutesEnd;
      aLength = aCrossDay ? midNight - aMinutesStart + aMinutesEnd : aMinutesEnd - aMinutesStart;
    }
    else {
      aMinutesStart = AicoreUtil.getMinuteValue(aTime.from, sphereId);
      aMinutesEnd   = AicoreUtil.getMinuteValue(aTime.to,   sphereId);
      aCrossDay = aMinutesStart > aMinutesEnd;
      aLength = aCrossDay ? midNight - aMinutesStart + aMinutesEnd : aMinutesEnd - aMinutesStart;
    }

    if (bTime.type === "ALL_DAY") {
      bMinutesStart = dayMinutesStart;
      bMinutesEnd   = dayMinutesStart;
      bCrossDay = bMinutesStart >= bMinutesEnd;
      bLength = bCrossDay ? midNight - bMinutesStart + bMinutesEnd : bMinutesEnd - bMinutesStart;
    }
    else {
      bMinutesStart = AicoreUtil.getMinuteValue(bTime.from, sphereId);
      bMinutesEnd   = AicoreUtil.getMinuteValue(bTime.to,   sphereId);
      bCrossDay = bMinutesStart > bMinutesEnd;
      bLength = bCrossDay ? midNight - bMinutesStart + bMinutesEnd : bMinutesEnd - bMinutesStart;
    }

    if (aCrossDay) {
      if (bCrossDay) {
        if (bYesterday) {
          result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, bMinutesEnd], [aMinutesStart, midNight]);
        }
        if (bToday) {
          result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, midNight], [aMinutesStart,midNight]);
          result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, bMinutesEnd],          [0, aMinutesEnd]);
        }
      }
      else if (bToday) {
        result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, bMinutesEnd], [aMinutesStart, midNight]);
      }
    }
    else {
      if (bCrossDay) {
        if (bYesterday) {
          result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([0, bMinutesEnd], [aMinutesStart, aMinutesEnd]);
        }
        if (bToday) {
          result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, midNight], [aMinutesStart,aMinutesEnd]);
        }
      }
      else if (bToday) {
        result.overlapMins += AicoreUtil._getOverlapBetweenTimeSlots([bMinutesStart, bMinutesEnd], [aMinutesStart, aMinutesEnd]);
      }
    }

    result.aPercentageOverlapped = result.overlapMins / aLength;
    result.bPercentageOverlapped = result.overlapMins / bLength;
    return result;
  },

  _getOverlapBetweenTimeSlots(firstTimeSlot : number[], secondTimeSlot: number[]) : number {
    let minutesOverlap = 0;

    let slotStart = firstTimeSlot[0] < firstTimeSlot[1] ? firstTimeSlot[0] : firstTimeSlot[1];
    let slotEnd =   firstTimeSlot[0] < firstTimeSlot[1] ? firstTimeSlot[1] : firstTimeSlot[0];

    let secondSlotStart = secondTimeSlot[0] < secondTimeSlot[1] ? secondTimeSlot[0] : secondTimeSlot[1];
    let secondSlotEnd   = secondTimeSlot[0] < secondTimeSlot[1] ? secondTimeSlot[1] : secondTimeSlot[0];

    if (secondSlotStart < slotStart && secondSlotEnd > slotStart) { // we start outside of slot en the slot is overlapping with the target
      if (secondSlotEnd <= slotEnd) {
        minutesOverlap += secondSlotEnd - slotStart;
      }
      else {
        // larger than timeslot, the slot is fully engulfed
        minutesOverlap += slotEnd - slotStart;
      }
    }
    else if (secondSlotStart >= slotStart && secondSlotStart < slotEnd) { // we start inside slot
      if (secondSlotEnd <= slotEnd) {
        minutesOverlap += secondSlotEnd - secondSlotStart;
      }
      else {
        // larger than timeslot
        minutesOverlap += slotEnd - secondSlotStart;
      }
    }

    return minutesOverlap;
  },


  getBehaviourSummary(sphereId: string, behaviourData) {
    let behaviour : AicoreTwilight | AicoreBehaviour = null;
    if (behaviourData.type === BEHAVIOUR_TYPES.twilight) { behaviour = new AicoreTwilight(behaviourData.data);  }
    else                                                 { behaviour = new AicoreBehaviour(behaviourData.data); }

    return {
      usingSingleRoomPresence: behaviour.isUsingSingleRoomPresence(),
      usingMultiRoomPresence:  behaviour.isUsingMultiRoomPresence(),
      usingSpherePresence:     behaviour.isUsingSpherePresence(),
      type:                    behaviourData.type,
      label:                   behaviour.getSentence(sphereId),
    }
  },


  getActiveTurnOnPercentage(sphereId:string, stone) {
    let behaviours = stone.behaviours;
    let behaviourIds = Object.keys(behaviours);

    let dimAmount = 100;

    for (let i = 0; i < behaviourIds.length; i++) {
      let behaviourData = behaviours[behaviourIds[i]];
      let behaviour : AicoreTwilight | AicoreBehaviour = null;
      if (behaviourData.type === BEHAVIOUR_TYPES.twilight) { behaviour = new AicoreTwilight(behaviourData.data);  }
      else                                            { behaviour = new AicoreBehaviour(behaviourData.data); }

      let currentDay = DAY_INDICES_SUNDAY_START[new Date().getDay()];
      if (behaviourData.activeDays[currentDay]) {
        if (behaviour.isCurrentlyActive(sphereId)) {
          dimAmount = Math.min(dimAmount, behaviour.getDimPercentage());
        }
      }
    }

    return dimAmount;
  }
};
