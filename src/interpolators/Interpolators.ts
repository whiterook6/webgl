import {Bezier} from "./Bezier";

type Interpolator<T> = (t: number) => T;

export const pipe = <T>(
  segments: Interpolator<number>[],
  output: Interpolator<T>
): Interpolator<T> => {
  return (t: number): T => {
    let current = t;
    for (const segment of segments) {
      current = segment(current);
    }

    return output(current);
  };
};

/**
 * Locks the output to between min and max
 */
export const clamp = (min: number, max: number): Interpolator<number> => {
  return (t: number) => Math.max(Math.min(t, max), min);
};

/**
 * Loops from min to max, then repeats
 */
export const loop = (min: number, max: number): Interpolator<number> => {
  const mod = max - min;
  return (t: number) => (t % mod) + min;
};

/**
 * Scales and shifts the output.
 */
export const transform = (scale: number, shift: number = 0): Interpolator<number> => {
  return (t: number) => t * scale + shift;
};

/**
 * Saw-tooth waves between 0, 1, and 0
 */
export const saw = (t: number) => {
  const mod2 = t % 2;
  return Math.min(mod2, 2 - mod2);
};

/**
 * Sine waves between 0 and 1
 */
export const sin = (t: number) => 1 - (Math.cos(t * (2 * Math.PI)) / 2 + 0.5);

const easeInBezier = new Bezier(0, 0.42, 1, 1);
const easeOutBezier = new Bezier(0, 0, 0.58, 1);
const easeInOutBezier = new Bezier(0, 0.42, 0.58, 1);
export const easeIn = easeInBezier.get;
export const easeOut = easeOutBezier.get;
export const easeInOut = easeInOutBezier.get;
