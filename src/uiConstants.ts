import { Quantization, quantization } from "./noteData";

export interface UIQuantization {
  id: `q-${Quantization}`;
  quantization: Quantization;
  name: `${Quantization}${"th" | "nd"}`;
}

export const quantizations: UIQuantization[] = quantization.map((x) => ({
  id: `q-${x}`,
  quantization: x,
  name: x === 32 || 192 ? `${x}nd` : `${x}th`,
}));

const val = 400;

export const measureHeight = {
  value: val,
  px: `${val}px`,
};
