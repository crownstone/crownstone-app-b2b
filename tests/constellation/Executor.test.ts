import {
  cleanupSuiteAfterTest,
  mConstellationState,
  prepareSuiteForTest,
} from "../__testUtil/mocks/suite.mock";
import {BleCommandManagerClass} from "../../app/ts/logic/constellation/BleCommandManager";
import {addSphere, addStone} from "../__testUtil/helpers/data.helper";
import {getCommandOptions} from "../__testUtil/helpers/constellation.helper";
import {Command_TurnOn} from "../../app/ts/logic/constellation/commandClasses";
import {Executor} from "../../app/ts/logic/constellation/Executor";

let BleCommandManager = null;
beforeEach(async () => {
  BleCommandManager = new BleCommandManagerClass();
  prepareSuiteForTest();
  mConstellationState.allowBroadcasting = false;
})
beforeAll(async () => {})
afterEach(async () => { await cleanupSuiteAfterTest(); })
afterAll( async () => {})


test("Check the executor aggregation", async () => {
  let sphere = addSphere();
  let { stone: stone1, handle:handle1 } = addStone();
  let { stone: stone2, handle:handle2 } = addStone();
  let { stone: stone3, handle:handle3 } = addStone();
  let { stone: stone4, handle:handle4 } = addStone();
  let { stone: stone5, handle:handle5 } = addStone();

  let promise  = { resolve: jest.fn(), reject: jest.fn() };
  let options  = getCommandOptions(sphere.id, [handle1]);
  let options2 = getCommandOptions(sphere.id, [handle2]);

  BleCommandManager.generateAndLoad(options,  new Command_TurnOn(), false, promise);
  BleCommandManager.generateAndLoad(options2, new Command_TurnOn(), true, promise);

  expect(Executor.aggregateTurnOnCommands(handle1,BleCommandManager.queue.direct[handle1][0],BleCommandManager.queue).length).toBe(2);
  expect(Executor.aggregateTurnOnCommands(handle2,BleCommandManager.queue.direct[handle2][0],BleCommandManager.queue).length).toBe(1);
});
