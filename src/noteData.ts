// 0 isn't really valid, it represents either invalid or unset quantization
export const quantization = [0, 4, 8, 12, 16, 24, 32, 48, 64, 192] as const;

export type Quantization = typeof quantization[number];

const dup = <T>(src: T[], n: number) => {
  const res: Array<T> = [];
  for (let i = 0; i < n; i++) {
    res.push(...src);
  }
  return res;
};

const _4ths: Quantization[] = [4, 4, 4, 4];
const _8ths: Quantization[] = [4, 8];
const _12ths: Quantization[] = [4, 12, 8];
const _16ths: Quantization[] = [4, 16, 8, 16];
const _24ths: Quantization[] = [4, 24, 12, 8, 12, 24];
const _32ths: Quantization[] = [4, 32, 16, 32, 8, 32, 16, 32];
const _48ths: Quantization[] = [4, 48, 24, 16, 12, 48, 8, 48, 12, 16, 24, 48];
const _64ths: Quantization[] = [
  4, 64, 32, 64, 16, 64, 32, 64, 8, 64, 32, 64, 16, 64, 32, 64,
];

const _192ths: Quantization[] = [
  4, 192, 192, 192 /* end */, 64, 192, 32, 192 /* end */, 48, 192, 192,
  192 /* end */, 16, 192, 192, 192 /* end */, 12, 192, 32, 192 /* end */, 64,
  192, 192, 192 /* end */, 8, 192, 192, 192 /* end */, 64, 192, 32,
  192 /* end */, 12, 192, 192, 192 /* end */, 16, 192, 192, 192 /* end */, 24,
  192, 32, 192 /* end */, 64, 192, 192, 192 /* end */,
];

export const noteData: Map<Quantization, Quantization[]> = new Map([
  [4, _4ths],
  [8, dup(_8ths, 4)],
  [12, dup(_12ths, 4)],
  [16, dup(_16ths, 4)],
  [24, dup(_24ths, 4)],
  [32, dup(_32ths, 4)],
  [48, dup(_48ths, 4)],
  [64, dup(_64ths, 4)],
  [192, dup(_192ths, 4)],
]);

export function highestCommonDenominator(q1: Quantization, q2: Quantization) {
  for (const q of [...quantization].reverse()) {
    if (q1 % q === 0 && q2 % q === 0) {
      return q;
    }
  }

  throw Error(`${q1} and ${q2} have no common denominator!`);
}
