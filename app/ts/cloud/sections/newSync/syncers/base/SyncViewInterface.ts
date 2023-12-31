export class SyncViewInterface<CloudDataFormat> {

  actions:          DatabaseAction[];
  transferPromises: Promise<any>[];
  globalCloudIdMap: syncIdMap;

  constructor(options: SyncInterfaceViewOptions) {
    this.actions          = options.actions;
    this.transferPromises = options.transferPromises;

    // this is a map of cloudIds and the corresponding localIds that have been created or exist for them.
    this.globalCloudIdMap = options.globalCloudIdMap;
  }

  handleData(cloudData: CloudDataFormat) {
    throw new Error("MUST_BE_IMPLEMENTED_BY_CHILD_CLASS");
  }

  process(response: SyncResponseItemCore<CloudDataFormat>) {
    if (!response) { return; }

    switch (response.status) {
      case "VIEW":
        // View is requested and plainly added.
        this.handleData(response.data);
      default:
      // do nothing.
    }
  }
}