import { eventBus } from "../../../../app/ts/util/EventBus";
import { createStore } from "redux";
import { batchActions, enableBatching } from "../../../../app/ts/database/reducers/BatchReducer";
import CrownstoneReducer                from '../../../../app/ts/database/reducer'

import { mockNativeBus } from "../nativeBus.mock";
let nativeBus = mockNativeBus()


export function mockCore() {
  const store = createStore(enableBatching(CrownstoneReducer))
  // @ts-ignore
  store.batchDispatch = (actions) => { return batchActions(store, actions); };

  let bleState = {
    bleAvailable: true,
    bleBroadcastAvailable: true,
  };
  let mockedCore =  {
    eventBus: eventBus,
    nativeBus: nativeBus,
    state: bleState,
    store: store,
    reset: () => {
      eventBus.clearAllEvents();
      nativeBus.clearAllEvents();
      store.dispatch({ type: "TESTS_CLEAR_STORE" });
      bleState.bleAvailable = true;
      bleState.bleBroadcastAvailable = true;
    }
  }

  jest.mock("../../../../app/ts/Core", () => {
    return { core: mockedCore };
  })

  return mockedCore;
}
