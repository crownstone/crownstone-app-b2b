import { xUtil } from "../../../../util/StandAloneUtil";
import { CLOUD } from "../../../cloudAPI";
import { core } from "../../../../Core";


export const SphereTransferNext : TransferTool<SphereData, SphereDataConfig, cloud_Sphere, cloud_Sphere_settable> = {

  // this will be used for NEW data and REQUESTED data in the v2 sync process.
  mapLocalToCloud(localData: SphereData) : cloud_Sphere_settable {
    return {
      name: localData.config.name,
      uid:  localData.config.uid,
      uuid: localData.config.iBeaconUUID,
      gpsLocation: {
        lat: localData.config.latitude,
        lng: localData.config.longitude,
      },
      timezone:  localData.config.timezone,
      updatedAt: new Date(localData.config.updatedAt).toISOString(),
    }
  },

  mapCloudToLocal(cloudItem: cloud_Sphere) : Partial<SphereDataConfig> {
    return {
      name:              cloudItem.name,
      iBeaconUUID:       cloudItem.uuid, // ibeacon uuid
      uid:               cloudItem.uid,
      cloudId:           cloudItem.id,
      latitude:          cloudItem.gpsLocation?.lat || null,
      longitude:         cloudItem.gpsLocation?.lng || null,
      timezone:          cloudItem.timezone || null,
      updatedAt:         new Date(cloudItem.updatedAt).valueOf(),
    }
  },


  getCreateLocalAction(data: Partial<SphereDataConfig>) : {id: string, action: DatabaseAction } {
    let newId = xUtil.generateLocalId();
    let action : DatabaseAction = {type:"ADD_SPHERE", sphereId: newId, data: data };
    return {id: newId, action};
  },


  getUpdateLocalCloudIdAction(localItemId: string, cloudId: string) : DatabaseAction {
    return {type:"UPDATE_SPHERE_CLOUD_ID", sphereId: localItemId, data: {cloudId}};
  },


  getUpdateLocalAction(localItemId: string, data: Partial<SphereDataConfig>) : DatabaseAction {
    return {type:"UPDATE_SPHERE_CONFIG", sphereId: localItemId, data: data }
  },


  getRemoveFromLocalAction(localItemId: string) : DatabaseAction {
    return {type:"REMOVE_SPHERE", sphereId: localItemId };
  },


  async createOnCloud(userId: string, data: SphereData) : Promise<cloud_Sphere> {
    let cloudItem = await CLOUD.forUser(userId).createSphere(SphereTransferNext.mapLocalToCloud(data));
    core.store.dispatch(SphereTransferNext.getUpdateLocalCloudIdAction(data.id, cloudItem.id));
    return cloudItem;
  },


  async updateOnCloud(data: SphereData) : Promise<void> {
    await CLOUD.updateSphere(data.id, SphereTransferNext.mapLocalToCloud(data))
  },


  async removeFromCloud(localId: string) : Promise<void> {
    await CLOUD.deleteSphere(localId);
  },

  createLocal(data: Partial<any>) {
    let newItemData = SphereTransferNext.getCreateLocalAction(data);
    core.store.dispatch(newItemData.action);
    return newItemData.id;
  }
}

