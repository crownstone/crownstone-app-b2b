import { MapProvider } from "../../../../backgroundProcesses/MapProvider";
import { Get } from "../../../../util/GetUtil";
import { SyncSphereInterface } from "./base/SyncSphereInterface";
import { HubTransferNext } from "../transferrers/HubTransferNext";
import { SyncNext } from "../SyncNext";
import { SyncUtil } from "../../../../util/SyncUtil";



export class HubSyncer extends SyncSphereInterface<HubData, HubDataConfig, cloud_Hub, cloud_Hub_settable> {

  constructor(options: SyncInterfaceOptions) {
    super(HubTransferNext, options)
  }

  getLocalId() {
    return this.globalCloudIdMap.hubs[this.cloudId] || MapProvider.cloud2localMap.hubs[this.cloudId];
  }


  _mapCloudToLocal(cloudHub: cloud_Hub) {
    let localStoneId    = this.globalCloudIdMap.stones[cloudHub.linkedStoneId] ?? MapProvider.cloud2localMap.stones[cloudHub.linkedStoneId] ?? cloudHub.linkedStoneId;
    let localLocationId = this.globalCloudIdMap.locations[cloudHub.locationId] ?? MapProvider.cloud2localMap.locations[cloudHub.locationId] ?? cloudHub.locationId;
    return HubTransferNext.mapCloudToLocal(cloudHub, localStoneId, localLocationId);
  }


  createLocal(cloudData: cloud_Hub) {
    let newData = HubTransferNext.getCreateLocalAction(this.localSphereId, this._mapCloudToLocal(cloudData))
    this.actions.push(newData.action)
    this.globalCloudIdMap.hubs[this.cloudId] = newData.id;
  }


  updateLocal(cloudData: cloud_Hub) {
    this.actions.push(HubTransferNext.getUpdateLocalAction(this.localSphereId, this.localId, this._mapCloudToLocal(cloudData)));
  }


  setReplyWithData(reply: SyncRequestSphereData) {
    let hub = Get.hub(this.localSphereId, this.localId);
    if (!hub) { return null; }
    SyncUtil.constructReply(reply,['hubs', this.cloudId],
      HubTransferNext.mapLocalToCloud(hub)
    );
  }

  static prepare(sphere: SphereData) : {[itemId:string]: RequestItemCoreType} {
    return SyncNext.gatherRequestData(sphere,{key:'hubs', type:'hub'});
  }
}

