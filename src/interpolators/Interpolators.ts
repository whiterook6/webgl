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
 * Oscilates between min and max over a period with an offset
 * @param min the minimum output value
 * @param max the maximum output value
 * @param period how long between peaks
 * @param offset shift the output forward or backward
 * returns a function that oscillates over those values given an input in seconds
 */
export const buildOscilator = (min: number, max: number, period: number, shift: number = 0) => {
  const halfAmplitude = (max - min) / 2;
  const verticalShift = (max + min) / 2;
  const twoPIOverPeriod = (2 * Math.PI) / period;

  return (age: number) => {
    const result = Math.sin((age - shift) * twoPIOverPeriod) * halfAmplitude + verticalShift;
    return result;
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
