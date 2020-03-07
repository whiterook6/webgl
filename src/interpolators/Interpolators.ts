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
 * sin-waves between 0 and 1
 */
export const sin: Interpolator<number> = (t: number) => 1 - (Math.cos(t * (2 * Math.PI)) / 2 + 0.5);
