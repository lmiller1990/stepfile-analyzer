import { quantization } from "./noteData";

export class QuantizationError extends Error {
  constructor(outOfRange: number, data: any) {
    const message = `Encountered quantization: ${outOfRange}. Expected quantization to be in ${quantization.join(
      ","
    )}. Dataset is ${JSON.stringify(data)}.`;
    super(message); // (1)
    this.name = "QuantizationError";
  }
}
