import {Alert} from 'react-native'
import {applyMiddleware, createStore} from 'redux'
import CrownstoneReducer from './reducer'
import {CloudEnhancer} from './enhancers/cloudEnhancer'
import {EventEnhancer} from './enhancers/eventEnhancer'
import {LOG, LOGe} from '../logging/Log'
import {PersistenceEnhancer} from "./enhancers/persistenceEnhancer";
import {Persistor} from "./persistor/Persistor";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {batchActions, enableBatching} from "./reducers/BatchReducer";
import {migrateBeforeInitialization} from "../backgroundProcesses/migration/StoreMigration";
import {core} from "../Core";
import { CloudAddresses } from "../backgroundProcesses/indirections/CloudAddresses";

const LOGGED_IN_USER_ID_STORAGE_KEY = 'CrownstoneLoggedInUser';
const CLOUD_ADDRESSES_STORAGE_KEY   = 'CrownstoneCloudAddresses';

class StoreManagerClass {
  store : any;
  storeInitialized : any;
  storageKey : any;
  storageKeyBase : string;
  writeToDiskTimeout : any;
  unsubscribe : any;
  persistor : Persistor;

  constructor() {
    this.store = {};
    this.storeInitialized = false;

    this.storageKey = null;
    this.storageKeyBase = 'CrownstoneStore_';

    this.writeToDiskTimeout = null;
    this.unsubscribe = null;

    this.persistor = new Persistor();

    this._init();
  }

  _init() {
    AsyncStorage.getItem(CLOUD_ADDRESSES_STORAGE_KEY) // this will just contain a string of the logged in user.
      .then((cloudAddresses) => {
        if (cloudAddresses !== null) {
          let addressData = JSON.parse(cloudAddresses);
          CloudAddresses.cloud_v1 = addressData.cloud_v1;
          CloudAddresses.cloud_v2 = addressData.cloud_v2;
          CloudAddresses.sse      = addressData.sse;
        }
      })
      .catch((err) => { LOGe.store("StoreManager: Could not get cloudAddresses from AsyncStorage", err?.message)});


    AsyncStorage.getItem(LOGGED_IN_USER_ID_STORAGE_KEY) // this will just contain a string of the logged in user.
      .then((userId) => {
        this._initializeStore(userId);
      })
      .catch((err) => { LOGe.store("StoreManager: Could not get store from AsyncStorage", err?.message)});

  }

  async persistCloudAddresses() {
    let addresData = JSON.stringify(CloudAddresses);
    await AsyncStorage.setItem(CLOUD_ADDRESSES_STORAGE_KEY, addresData);
  }

  _initializeStore(userId) {
    LOG.info("StoreManager: initializing Store");
    this.store = createStore(
      enableBatching(CrownstoneReducer),
      {},
      applyMiddleware(CloudEnhancer, EventEnhancer, PersistenceEnhancer)
    );
    this.store.batchDispatch = (actions) => { return batchActions(this.store, actions); };

    migrateBeforeInitialization()
      .then(() => {
        if (userId !== null) {
          this.persistor.initialize(userId, this.store)
            .then(() => {
              // we emit the storeInitialized event just in case of race conditions.
              this.storeInitialized = true;
              // this setTimeout ensures that any errors that crash the app will not trigger a DatabaseFailure message
              setTimeout(() => { core.eventBus.emit('storeManagerInitialized'); } , 0)
            })
            .catch((err) => {
              LOGe.store("StoreManager: failed to initialize.", err?.message);
              Alert.alert("Problem with the database.","Please log in again.",[{text:"OK", onPress: () => {
                  this.persistor.endSession();
                  this.storeInitialized = true;
                  core.eventBus.emit('storeManagerInitialized');
                }
              }],{cancelable: false});
            })
        }
        else {
          // we emit the storeInitialized event just in case of race conditions.
          this.storeInitialized = true;
          core.eventBus.emit('storeManagerInitialized');
        }
      })
  }


  /**
   * This will get the data of this user from the database in case it is available.
   * Once we have received it, we will hydrate the store with it.
   * @param userId
   */
  userLogIn(userId) {
    return this.persistor.initialize(userId, this.store)
      .catch((err) => {
        LOGe.store("StoreManager: failed to log in user.", err?.message);
        throw err;
      })
  }


  /**
   * this should be called when the setup procedure has been successful
   * @param userId
   * @returns {*|Promise.<TResult>}
   */
  finalizeLogIn(userId) {
    // write to database that we are logged in.
    return AsyncStorage.setItem(LOGGED_IN_USER_ID_STORAGE_KEY, userId)
      .then((result) => { console.log("Stored logged in state", userId) })
      .catch((err) => {
        LOGe.store("StoreManager: finalize login failed. ", err?.message);
      })
  }


  /**
   * When we log out, we first write all we have to the disk.
   */
  userLogOut() : Promise<void> {
    return new Promise((resolve, reject) => {
      // will only do something if we are indeed logged in, denoted by the presence of the user key.
      if (this.persistor.initialized) {
        this.persistor.persistFull()
          .then(() => {
            return AsyncStorage.setItem(LOGGED_IN_USER_ID_STORAGE_KEY, "");
          })
          .then(() => {
            return this.persistor.endSession();
          })
          .then(() => {
            this.store.dispatch({type: "USER_LOGGED_OUT_CLEAR_STORE"});
          })
          .then(() => {
            resolve();
          })
          .catch((err) => {
            LOGe.store("StoreManager: Could not log out.", err?.message);
            reject(err);
          })
      }
      else {
        resolve();
      }
    })
  }

  destroyActiveUser() {
    return this.persistor.destroyActiveUser();
  }

  getStore() {
    return this.store;
  }

  isInitialized() {
    return this.storeInitialized;
  }
}

export const StoreManager = new StoreManagerClass();
