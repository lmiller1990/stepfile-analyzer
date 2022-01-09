import { Quantization, quantization } from "./noteData";

type QuantizationLabel = `${Quantization}${"th" | "nd"}`;
export interface UIQuantization {
  id: `q-${Quantization}`;
  quantization: Quantization;
  name: QuantizationLabel;
}

export function quantizationLabel(q: Quantization): QuantizationLabel {
  return q === 32 || 192 ? `${q}nd` : `${q}th`;
}

export const quantizations: UIQuantization[] = quantization.map((x) => ({
  id: `q-${x}`,
  quantization: x,
  name: quantizationLabel(x),
}));

const val = 400;

export const measureHeight = {
  value: val,
  px: `${val}px`,
};
