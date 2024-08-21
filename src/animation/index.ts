export interface ITimestamp {
  /** Age in milliseconds */
  age: number;

  /** Time in milliseconds */
  now: number;

  /** time since previous frame in milliseconds */
  deltaT: number;
}

export * from "./AnimationLoop";
