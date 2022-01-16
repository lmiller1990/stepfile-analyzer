import { quantization } from "./noteData";

export class ChartQuantizationError extends Error {
  constructor(outOfRange: number, data: any) {
    const message = `Charts with quantization ${outOfRange} are not yet supported. Expected quantization to be in ${quantization.join(
      ", "
    )}.`;
    super(message);
    this.name = "ChartQuantizationError";
  }
}

export class PatternQuantizationError extends Error {
  constructor() {
    const message = `Quantization mismatch - pattern is not uniform.`;
    super(message);
    this.name = "PatternQuantizationError";
  }
}
