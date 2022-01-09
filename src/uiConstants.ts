import { quantization } from "./noteData";

export const quantizations = quantization.map((x) => ({
  id: `q-${x}`,
  quantization: x,
  name: x === 32 || 192 ? `${x}nd` : `${x}th`,
}));

const val = 400;

export const measureHeight = {
  value: val,
  px: `${val}px`,
};
