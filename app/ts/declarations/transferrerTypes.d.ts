interface TransferSphereTool<LocalData,LocalDataSettable,CloudData,CloudDataSettable> {

  mapLocalToCloud(localData: LocalData) : CloudDataSettable

  mapCloudToLocal(cloudLocation: CloudData, ...args) : Partial<LocalDataSettable>

  getCreateLocalAction(localSphereId: string, data: Partial<LocalDataSettable>, idOverride?: string) : {id: string, action: DatabaseAction }

  createLocal(localSphereId: string, data: Partial<LocalDataSettable>) : string

  getUpdateLocalAction(localSphereId: string, localItemId: string, data: Partial<LocalDataSettable>) : DatabaseAction

  getRemoveFromLocalAction(localSphereId: string, localItemId: string) : DatabaseAction

  getUpdateLocalCloudIdAction(localSphereId: string, localItemId: string, cloudId: string) : DatabaseAction

  createOnCloud(localSphereId: string, data: LocalData) : Promise<CloudData>

  updateOnCloud(localSphereId: string, data: LocalData) : Promise<void>

  removeFromCloud(localSphereId: string, localId: string) : Promise<void>
}

interface TransferAbilityTool<LocalData,LocalDataSettable,CloudData,CloudDataSettable> {

  mapLocalToCloud(localData: LocalData) : CloudDataSettable

  mapCloudToLocal(cloudLocation: CloudData, ...args) : Partial<LocalDataSettable>

  getCreateLocalAction(localSphereId: string, localStoneId: string, localAbilityId:string, data: Partial<LocalDataSettable>) : {id: string, action: DatabaseAction }

  createLocal(localSphereId: string, localStoneId: string, localAbilityId:string, data: Partial<LocalDataSettable>) : string

  getUpdateLocalAction(localSphereId: string, localStoneId: string, localAbilityId:string, localItemId: string, data: Partial<LocalDataSettable>) : DatabaseAction

  getRemoveFromLocalAction(localSphereId: string, localStoneId: string, localAbilityId:string, localItemId: string) : DatabaseAction

  getUpdateLocalCloudIdAction(localSphereId: string, localStoneId: string, localAbilityId:string, localItemId: string, cloudId: string) : DatabaseAction

  createOnCloud(localSphereId: string, localStoneId: string, localAbilityId:string, data: LocalData) : Promise<CloudData>

  updateOnCloud(localStoneId: string, localAbilityId: string, data: LocalData) : Promise<void>

  removeFromCloud(localStoneId: string, localAbilityId: string, localId:string) : Promise<void>
}

interface TransferStoneTool<LocalData,LocalDataSettable,CloudData,CloudDataSettable> {

  mapLocalToCloud(localData: LocalData) : CloudDataSettable

  mapCloudToLocal(cloudData: CloudData, ...args) : Partial<LocalDataSettable>

  getCreateLocalAction(localSphereId: string, localStoneId: string, data: Partial<LocalDataSettable>) : {id: string, action: DatabaseAction }

  createLocal(localSphereId: string, localStoneId: string, data: Partial<LocalDataSettable>) : string

  getUpdateLocalAction(localSphereId: string, localStoneId: string, localItemId: string, data: Partial<LocalDataSettable>) : DatabaseAction

  getRemoveFromLocalAction(localSphereId: string, localStoneId: string, localItemId: string) : DatabaseAction

  getUpdateLocalCloudIdAction(localSphereId: string, localStoneId: string, localItemId: string, cloudId: string) : DatabaseAction

  createOnCloud(localSphereId: string, localStoneId: string, data: LocalData) : Promise<CloudData>

  updateOnCloud(localStoneId: string, data: LocalData) : Promise<void>

  removeFromCloud(localStoneId: string, localId: string) : Promise<void>
}


interface TransferMessageTool<LocalData,LocalDataSettable,CloudData,CloudDataSettable> {

  mapLocalToCloud(localData: LocalData) : CloudDataSettable

  mapCloudToLocal(cloudData: CloudData, ...args) : Partial<LocalDataSettable>

  getCreateLocalAction(localSphereId: string, localMessageId: string, data: Partial<LocalDataSettable>) : {id: string, action: DatabaseAction }

  createLocal(localSphereId: string, localMessageId: string, data: Partial<LocalDataSettable>) : string

  getUpdateLocalAction(localSphereId: string, localMessageId: string, data: Partial<LocalDataSettable>) : DatabaseAction

  getRemoveFromLocalAction(localSphereId: string, localMessageId: string) : DatabaseAction

  getUpdateLocalCloudIdAction(localSphereId: string, localMessageId: string, cloudId: string) : DatabaseAction

  createOnCloud(localSphereId: string, localMessageId: string) : Promise<CloudData>

  updateOnCloud(localMessageId: string, data: LocalData) : Promise<void>

  removeFromCloud(localMessageId: string) : Promise<void>
}


interface TransferLocationTool<LocalData,LocalDataSettable,CloudData,CloudDataSettable> {

  mapLocalToCloud(localData: LocalData) : CloudDataSettable

  mapCloudToLocal(cloudData: CloudData, ...args) : Partial<LocalDataSettable>

  getCreateLocalAction(localSphereId: string, localLocationId: string, data: Partial<LocalDataSettable>) : {id: string, action: DatabaseAction }

  createLocal(localSphereId: string, localLocationId: string, data: Partial<LocalDataSettable>) : string

  getUpdateLocalAction(localSphereId: string, localLocationId: string, localItemId: string, data: Partial<LocalDataSettable>) : DatabaseAction

  getRemoveFromLocalAction(localSphereId: string, localLocationId: string, localItemId: string) : DatabaseAction

  getUpdateLocalCloudIdAction(localSphereId: string, localLocationId: string, localItemId: string, cloudId: string) : DatabaseAction

  createOnCloud(localSphereId: string, localLocationId: string, data: LocalData) : Promise<CloudData>

  updateOnCloud(localSphereId: string, data: LocalData) : Promise<void>

  removeFromCloud(localSphereId: string, localId: string) : Promise<void>
}


interface TransferTool<LocalData,LocalDataSettable,CloudData,CloudDataSettable> {

  mapLocalToCloud(localData: LocalData) : CloudDataSettable

  mapCloudToLocal(cloudData: CloudData, ...args) : Partial<LocalDataSettable>

  getCreateLocalAction(data: Partial<LocalDataSettable>, ...args) : {id: string, action: DatabaseAction }

  createLocal(data: Partial<LocalDataSettable>) : string

  getUpdateLocalAction(localItemId: string, data: Partial<LocalDataSettable>) : DatabaseAction

  getRemoveFromLocalAction(localItemId: string) : DatabaseAction

  getUpdateLocalCloudIdAction(localItemId: string, cloudId: string) : DatabaseAction

  createOnCloud(userId: string, data: LocalData) : Promise<CloudData>

  updateOnCloud(data: LocalData) : Promise<void>

  removeFromCloud(localId: string) : Promise<void>
}

