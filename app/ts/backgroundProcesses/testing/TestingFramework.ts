import { CloudAddresses }                  from "../indirections/CloudAddresses";
import { CLOUD_ADDRESS, CLOUD_V2_ADDRESS, SSE_ADDRESS } from "../../ExternalConfig";
import { CameraLibrarySettings }           from "../indirections/CameraLibraryInterface";
import { CrownstoneSSE }                   from "../../logic/DevSSE";
import { BridgeMock }                      from "./BridgeMock";
import { BridgeConfig }                    from "../../native/libInterface/BridgeConfig";


export const TestingFramework = {

  SSE: null,

  async initialize(json) {
    if (!json) { return; }

    try {
      CloudAddresses.cloud_v1                 = json.cloud_v1          || CloudAddresses.cloud_v1;
      CloudAddresses.cloud_v2                 = json.cloud_v2          || CloudAddresses.cloud_v2;
      CloudAddresses.sse                      = json.sse               || CloudAddresses.sse;
      CameraLibrarySettings.mockImageLibrary  = json.mockImageLibrary  || false;
      CameraLibrarySettings.mockCameraLibrary = json.mockCameraLibrary || false;
      BridgeConfig.mockBluenet                = json.mockBluenet       || false;
      BridgeConfig.mockBridgeUrl              = json.mockBridgeUrl     || null;
    }
    catch (err : any) {
      console.log("TestingFramework: Something went wrong", err);
    }

    if (BridgeConfig.mockBluenet && BridgeConfig.mockBridgeUrl) {
      await TestingFramework.setupSSE();
    }
  },

  async setupSSE() {
    if (BridgeConfig.mockBluenet) {
      console.log("Set mock bluenet to url:", BridgeConfig.mockBridgeUrl)
      if (!TestingFramework.SSE) {
        console.log("init SSE testFramework connection:", BridgeConfig.mockBridgeUrl)
        TestingFramework.SSE = new CrownstoneSSE({sseUrl: BridgeConfig.mockBridgeUrl+'sse'});
      }
      TestingFramework.SSE.accessToken = "TEST_DEV";
      await TestingFramework.SSE.start((event) => { BridgeMock.handleSSE(event); });
      console.log("TestFramework SSE Started")
    }
  },

  stopSSE() {
    if (TestingFramework.SSE) {
      TestingFramework.SSE.stop();
      delete TestingFramework.SSE;
    }
  },



  // async persist() {
  //   let data = JSON.stringify({
  //     cloud_v1:            CloudAddresses.cloud_v1,
  //     cloud_v2:            CloudAddresses.cloud_v2,
  //     mockImageLibrary:    CameraLibrarySettings.mockImageLibrary,
  //     mockCameraLibrary:   CameraLibrarySettings.mockCameraLibrary,
  //     mockBluenet:         BridgeConfig.mockBluenet,
  //     mockBridgeUrl:       BridgeConfig.mockBridgeUrl,
  //   });
  //   await FileUtil.writeToFile(TestingOverrideConfigFile, data);
  //
  //   if (BridgeConfig.mockBluenet && BridgeConfig.mockBridgeUrl) {
  //     TestingFramework.setupSSE();
  //   }
  //
  //   BluenetPromiseWrapper.isDevelopmentEnvironment().then((result) => {
  //     base_core.sessionMemory.developmentEnvironment = result;
  //   });
  // },


  async clear() {
    TestingFramework.stopSSE();

    CloudAddresses.cloud_v1                 = CLOUD_ADDRESS;
    CloudAddresses.cloud_v2                 = CLOUD_V2_ADDRESS;
    CameraLibrarySettings.mockImageLibrary  = false;
    CameraLibrarySettings.mockCameraLibrary = false;
    BridgeConfig.mockBluenet                = false;
    BridgeConfig.mockBridgeUrl              = '';
  }
}
