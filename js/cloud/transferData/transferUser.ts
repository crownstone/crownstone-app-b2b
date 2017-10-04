import { CLOUD } from "../cloudAPI";
import { LOG }   from "../../logging/Log";


import { transferUtil } from "./shared/transferUtil";


type transferUserToCloudData = {
  localData: any,
  cloudId:   string,
}

type transferUserToLocalData = {
  cloudData: any,
}


let fieldMap : fieldMap = [
  {local:'firstName',                           cloud:'firstName'},
  {local:'lastName',                            cloud:'lastName'},
  {local:'email',                               cloud:'email'},
  {local:'isNew',                               cloud:'new'},
  {local:'pictureId',                           cloud:'profilePicId'},
  {local:'userId',                              cloud:'id',                          cloudToLocalOnly: true},
  {local:'uploadLocation',                      cloud:'uploadLocation'},
  {local:'uploadSwitchState',                   cloud:'uploadSwitchState'},
  {local:'uploadPowerUsage',                    cloud:'uploadPowerUsage'},
  {local:'uploadHighFrequencyPowerUsage',       cloud:'uploadHighFrequencyPowerUsage'},
  {local:'uploadDeviceDetails',                 cloud:'uploadDeviceDetails'},
  {local:'updatedAt',                           cloud:'updatedAt'},

  // these are not handled by this script.
  {local:'firmwareVersionsAvailable',           cloud:null},
  {local:'bootloaderVersionsAvailable',         cloud:null},

  // these are used for local config.
  {local:'accessToken',                         cloud: null},
  {local:'passwordHash',                        cloud: null},
  {local:'picture',                             cloud: null},
  {local:'betaAccess',                          cloud: null},
  {local:'seenTapToToggle',                     cloud: null},
  {local:'seenTapToToggleDisabledDuringSetup',  cloud: null},
  {local:'seenRoomFingerprintAlert',            cloud: null},
  {local:'appIdentifier',                       cloud: null},
  {local:'developer',                           cloud: null},
  {local:'logging',                             cloud: null},

];

export const transferUser = {

  updateOnCloud: function( data : transferUserToCloudData ) {
    let payload = {};
    transferUtil.fillFieldsForCloud(payload, data.localData, fieldMap);

    CLOUD.forUser(data.cloudId).updateUserData(data)
      .then(() => { })
      .catch((err) => {
        LOG.error("Transfer-User: Could not update user in cloud", err);
        throw err;
      });
  },

  updateLocal: function( actions, data: transferUserToLocalData) {
    return transferUtil._handleLocal(
      actions,
      'USER_UPDATE',
      {},
      data,
      fieldMap
    );
  },



};