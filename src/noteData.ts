// 0 isn't really valid, it represents either invalid or unset quantitization
export const quantitization = [0, 4, 8, 12, 16, 24, 32, 48, 64, 192] as const;

export type Quantitization = typeof quantitization[number];

const dup = <T>(src: T[], n: number) => {
  const res: Array<T> = [];
  for (let i = 0; i < n; i++) {
    res.push(...src);
  }
  return res;
};

const _4ths: Quantitization[] = [4, 4, 4, 4];
const _8ths: Quantitization[] = [4, 8];
const _12ths: Quantitization[] = [4, 12, 8];
const _16ths: Quantitization[] = [4, 16, 8, 16];
const _24ths: Quantitization[] = [4, 24, 12, 8, 12, 24];
const _32ths: Quantitization[] = [4, 32, 16, 32, 8, 32, 16, 32];
const _48ths: Quantitization[] = [4, 48, 24, 16, 12, 48, 8, 48, 12, 16, 24, 48];
const _64ths: Quantitization[] = [
  4, 64, 32, 64, 16, 64, 32, 64, 8, 64, 32, 64, 16, 64, 32, 64,
];

const _192ths: Quantitization[] = [
  4, 192, 192, 192 /* end */, 64, 192, 32, 192 /* end */, 48, 192, 192,
  192 /* end */, 16, 192, 192, 192 /* end */, 12, 192, 32, 192 /* end */, 64,
  192, 192, 192 /* end */, 8, 192, 192, 192 /* end */, 64, 192, 32,
  192 /* end */, 12, 192, 192, 192 /* end */, 16, 192, 192, 192 /* end */, 24,
  192, 32, 192 /* end */, 64, 192, 192, 192 /* end */,
];

export const noteData: Map<Quantitization, Quantitization[]> = new Map([
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
