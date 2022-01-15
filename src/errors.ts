import { quantization } from "./noteData";

export class QuantizationError extends Error {
  constructor(outOfRange: number, data: any) {
    const message = `Charts with quantization ${outOfRange} are not yet supported. Expected quantization to be in ${quantization.join(
      ", "
    )}.`;
    super(message); // (1)
    this.name = "QuantizationError";
  }
}
