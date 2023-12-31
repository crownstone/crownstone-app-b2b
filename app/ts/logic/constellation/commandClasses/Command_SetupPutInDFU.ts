// GENERATED FILE (REMOVE IF FILE IS CHANGED)

import { CommandBase } from "./base/CommandBase";
import { BluenetPromiseWrapper } from "../../../native/libInterface/BluenetPromise";


export class Command_SetupPutInDFU extends CommandBase implements CommandBaseInterface {

  constructor() {
    super("setupPutInDFU");
  }


  async execute(connectedHandle: string, options: ExecutionOptions) : Promise<void> {
    return BluenetPromiseWrapper.setupPutInDFU(connectedHandle);
  }
  
}

