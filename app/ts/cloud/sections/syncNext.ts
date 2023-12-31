/**
 * Created by alex on 25/08/16.
 */
import {cloudApiBase} from "./cloudApiBase";
import {MapProvider} from "../../backgroundProcesses/MapProvider";
import {CloudAddresses} from "../../backgroundProcesses/indirections/CloudAddresses";


export const syncNext = {

  syncNext: function (data, background = true) {
    return cloudApiBase._setupRequest(
      'POST',
      CloudAddresses.cloud_v2 + 'sync',
      {data, background: background},
      'body'
    );
  },

  syncNextSphere: function (localSphereId: string, data, background = true) {
    let cloudSphereId = MapProvider.local2cloudMap.spheres[localSphereId] || localSphereId; // the OR is in case a cloudId has been put into this method.
    return cloudApiBase._setupRequest(
      'POST',
      CloudAddresses.cloud_v2 + `spheres/${cloudSphereId}/sync`,
      {data, background: background},
      'body'
    );
  },

  syncNextStone: function (localStoneId: string, data, background = true) {
    let cloudStoneId = MapProvider.local2cloudMap.stones[localStoneId] || localStoneId; // the OR is in case a cloudId has been put into this method.
    return cloudApiBase._setupRequest(
      'POST',
      CloudAddresses.cloud_v2 + `stones/${cloudStoneId}/sync`,
      {data, background: background},
      'body'
    );
  },
};