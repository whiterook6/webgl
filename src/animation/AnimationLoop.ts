import { ITimestamp } from ".";

type RenderCallback = (timestamp: ITimestamp) => void;

export class AnimationLoop {
  private renderCallback: RenderCallback;
  private pausedAt: number | undefined;
  private startTime: number;
  private previousTime: number;

  constructor(callback: RenderCallback) {
    this.renderCallback = callback;

    const now = performance.now();
    this.pausedAt = now;
    this.startTime = now;
    this.previousTime = now - 16.7; // initial frame length: 1/60th of a second
  }

  public resume = (renderCallback?: RenderCallback) => {
    if (this.pausedAt === undefined) {
      return;
    }

    if (renderCallback) {
      this.renderCallback = renderCallback;
    }

    const now = performance.now();
    const pauseDelay = now - this.pausedAt;
    this.startTime += pauseDelay;
    this.previousTime += pauseDelay;
    this.pausedAt = undefined;
    requestAnimationFrame(this.render);
  };

  public render = () => {
    if (this.pausedAt !== undefined) {
      return;
    }

    const now = performance.now();
    const age = now - this.startTime;
    const deltaT = now - this.previousTime;
    this.previousTime = now;

    const timestamp = {
      now,
      age,
      deltaT,
    };

    this.renderCallback(timestamp);
    requestAnimationFrame(this.render);
  };

  public pause = () => {
    this.pausedAt = performance.now();
  };

  public toggle = () => {
    if (this.pausedAt !== undefined) {
      this.resume();
    } else {
      this.pause();
    }
  };

  public getIsPaused = () => this.pausedAt !== undefined;
}
