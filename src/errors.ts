import { quantitization } from "./noteData";

export class QuantitizationError extends Error {
  constructor(outOfRange: number, data: any) {
    const message = `Encountered quantitization: ${outOfRange}. Expected quantitization to be in ${quantitization.join(
      ","
    )}. Dataset is ${JSON.stringify(data)}.`;
    super(message); // (1)
    this.name = "QuantitizationError";
  }
}
