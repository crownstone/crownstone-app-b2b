import localization_en_us from "./languages/en/us/en_us";
import localization_nl_nl from "./languages/nl/nl/nl_nl";
import { core } from "./Core";
import AsyncStorage from "@react-native-async-storage/async-storage";
const DEFAULT_STRING = "TRANSLATION_IN_PROGRESS";
const LANGUAGE_KEY = "CROWNSTONE_LANGUAGE";

import * as RNLocalize from "react-native-localize";

class LanguageManager {

  usingBaseLanguage = false;
  textSource = null;
  activeLocale = null;
  persistedLocale = null;

  defaultLanguage = 'en_us'


  constructor() {
    this.usingBaseLanguage = true;
    this.textSource = localization_en_us;
    this.getFromDisk()
    let locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      for (let i = 0; i < locales.length; i++) {
        let language = locales[i].languageCode;
        if (language === "en") {
          this.defaultLanguage = 'en_us';
          break;
        }
        else if (language === "nl") {
          this.defaultLanguage = 'nl_nl';
          break;
        }
      }
    }
  }



  get(file, key) : (a?,b?,c?,d?,e?) => string{
    return (a,b,c,d,e) => {
      // this will avoid 1000 "Back" references
      if (this.textSource[file] === undefined || this.textSource[file][key] === undefined) {
        if (!this.textSource['__UNIVERSAL'][key]) {
          if (this.usingBaseLanguage === false) {
            if (localization_en_us[file] === undefined || localization_en_us[file][key] === undefined) {
              if (!localization_en_us['__UNIVERSAL'][key]) {
                console.warn("Could not find", key, " in file", file, " and universal");
                return "__MISSING_STRING__"
              }
              else {
                return localization_en_us['__UNIVERSAL'][key](a,b,c,d,e);
              }
            }
            else {
              return localization_en_us[file][key](a,b,c,d,e);
            }
          }
          else {
            console.warn("Could not find", key, " in file", file, " and universal");
            return "__MISSING_STRING__"
          }

        }

        return this.textSource['__UNIVERSAL'][key](a,b,c,d,e);
        // return str
        // return "#" + str;
      }
      return this.textSource[file][key](a,b,c,d,e);
    }
  }

  updateLocale() {
    let state = core.store.getState();
    if (state && state.user) {
      this.setLocale(state.user.language);
    }
    else {
      this.setLocale(this.defaultLanguage)
    }
  }

  setLocale(locale : string) {
    this.activeLocale = locale || this.defaultLanguage;
    switch (this.activeLocale) {
      case 'nl_nl':
        this.usingBaseLanguage = false;
        this.textSource = localization_nl_nl;
        break;
      case 'en_us':
      case null:
      default:
        this.usingBaseLanguage = true;
        this.textSource = localization_en_us;
        break;
    }
    if (this.activeLocale !== this.persistedLocale) {
      this.persist();
    }
  }

  getFromDisk() {
    AsyncStorage.getItem("LANGUAGE_KEY")
      .then((result) => {
        if (result) {
          this.persistedLocale = result;
          this.setLocale(result);
        }
        else {
          this.setLocale(this.defaultLanguage);
          this.persistedLocale = null;
        }
      })
      .catch((err) => { })
  }

  persist() {
    if (this.activeLocale && this.persistedLocale !== this.activeLocale) {
      AsyncStorage.setItem("LANGUAGE_KEY", this.activeLocale)
    }
  }
}

export const Languages = new LanguageManager();
