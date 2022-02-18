import {BootApp}                  from "./tests/boot";
import {TestRegisterNewUser}      from "./tests/register";
import {EnableTestOverrides}      from "./tests/enableTestOverrides";
import {Platform}                 from "./util/testUtil";
import {LoginUser}                from "./tests/login";
import {PermissionInitialization} from "./tests/permissionInitialization";

export const CONFIG = {
  IP_ADDRESS: process.env.IP_ADDRESS,
  ONLY_ESSENTIALS: true,
};

if (CONFIG.IP_ADDRESS === undefined) { throw "IP_ADDRESS ENVIRONMENTAL VARIABLE IS REQUIRED."}

// check if the Platform variable has been provided.
console.log("Running tests on platform:", Platform());
console.log("Looking for cloud at IP:", CONFIG.IP_ADDRESS);

describe('Boot the app',                           BootApp);
describe('Set Custom Cloud Endpoints for Testing', EnableTestOverrides);
describe('Register a new user',                    TestRegisterNewUser);
describe('Login with user',                        LoginUser);
describe('Setup initial permissions',              PermissionInitialization);