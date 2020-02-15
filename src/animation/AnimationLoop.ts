export interface ITimestamp {
  age: number;
  now: number;
  deltaT: number;
}

type RenderCallback = (timestamp: ITimestamp) => void;

export class AnimationLoop {
  private start: number;
  private renderCallback: RenderCallback;
  private previous: number;
  private isPaused: boolean;
  private previousAge: number;

  constructor(callback: RenderCallback){
    this.renderCallback = callback;
    this.start = this.previous = performance.now();
    this.isPaused = false;
    this.previousAge = 0;

    requestAnimationFrame(this.render);
  }
  
  public resume = (renderCallback?: RenderCallback) => {
    if (!this.isPaused){
      return;
    }

    if (renderCallback){
      this.renderCallback = renderCallback;
    }

    this.start = performance.now() - this.previousAge;
    this.isPaused = false;
    requestAnimationFrame(this.render);
  }

  public render = () => {
    if (this.isPaused){
      return;
    }

    const now = performance.now();
    const deltaT = now - this.previous;
    const age = now - this.start;
    
    this.previous = now;
    const timestamp = {
      now,
      age,
      deltaT
    };

    this.renderCallback(timestamp);
    requestAnimationFrame(this.render);
  }

  public pause = () => {
    this.isPaused = true;
    this.previousAge = performance.now() - this.start;
  }

  public toggle = () => {
    if (this.isPaused){
      this.resume();
    } else {
      this.pause();
    }
  }
}