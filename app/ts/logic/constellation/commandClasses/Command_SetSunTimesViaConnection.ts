import { CommandBase } from "./base/CommandBase";
import { BluenetPromiseWrapper } from "../../../native/libInterface/BluenetPromise";


export class Command_SetSunTimesViaConnection extends CommandBase implements CommandBaseInterface {

  sunriseSecondsSinceMidnight : number;
  sunsetSecondsSinceMidnight  : number;
  constructor(sunriseSecondsSinceMidnight : number, sunsetSecondsSinceMidnight : number) {
    super("setSunTimesViaConnection");
    this.sunriseSecondsSinceMidnight = sunriseSecondsSinceMidnight;
    this.sunsetSecondsSinceMidnight  = sunsetSecondsSinceMidnight;
  }


  async execute(connectedHandle: string, options: ExecutionOptions) : Promise<void> {
    return BluenetPromiseWrapper.setSunTimesViaConnection(connectedHandle, this.sunriseSecondsSinceMidnight, this.sunsetSecondsSinceMidnight);
  }
  
}

