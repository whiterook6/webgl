export type MousePosition = [number, number];
const getMousePosition = (event: MouseEvent): MousePosition => [event.clientX, event.clientY];

export interface IMouseClick {
  x: number;
  y: number;
}
type ClickCallback = (event: IMouseClick) => void;

export interface IMouseDrag {
  xEnd: number;
  xStart: number;
  yEnd: number;
  yStart: number;
  deltaX: number;
  deltaY: number;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}
type DragCallback = (event: IMouseDrag) => void;

type WheelCallback = (delta: number) => void;

export class Mouse {
  private mouseDown: boolean;
  private mouseDownTimestamp?: number;
  private mousePosition: MousePosition;
  private mouseDownPosition: MousePosition;

  private readonly clickCallbacks: ClickCallback[] = [];
  private readonly dragCallbacks: DragCallback[] = [];
  private readonly wheelCallbacks: WheelCallback[] = [];

  constructor() {
    this.mouseDown = false;
    this.mousePosition = [0, 0];
    this.mouseDownPosition = [0, 0];
  }

  onMouseDown = (event: MouseEvent) => {
    if (this.mouseDown) {
      return;
    }

    this.mouseDown = true;
    this.mouseDownTimestamp = performance.now();
    this.mousePosition = getMousePosition(event);
    this.mouseDownPosition = getMousePosition(event);
  };

  onMouseUp = () => {
    if (!this.mouseDown || this.mouseDownTimestamp === undefined) {
      return;
    }

    this.mouseDown = false;
  };

  onMouseMove = (event: MouseEvent) => {
    if (!this.mouseDown) {
      return;
    }

    const previousPosition = this.mousePosition;
    this.mousePosition = getMousePosition(event);

    if (
      previousPosition[0] !== this.mousePosition[0] ||
      previousPosition[1] !== this.mousePosition[1]
    ) {
      const now = performance.now();

      for (const callback of this.dragCallbacks) {
        callback({
          xStart: previousPosition[0],
          xEnd: this.mousePosition[0],
          yStart: previousPosition[1],
          yEnd: this.mousePosition[1],
          deltaX: this.mousePosition[0] - previousPosition[0],
          deltaY: this.mousePosition[1] - previousPosition[1],
          ctrl: event.ctrlKey,
          shift: event.shiftKey,
          alt: event.altKey,
        });
      }
    }
  };

  onMouseScroll = (event: WheelEvent) => {
    const delta = event.deltaY;
    for (const callback of this.wheelCallbacks) {
      callback(delta);
    }
  };

  addDragCallback = (callback: DragCallback) => {
    if (this.dragCallbacks.indexOf(callback) === -1) {
      this.dragCallbacks.push(callback);
    }
  };

  removeDragCallback = (callback: DragCallback) => {
    const indexOf = this.dragCallbacks.indexOf(callback);
    if (indexOf >= 0) {
      this.dragCallbacks.splice(indexOf, 1);
    }
  };

  addWheelCallback = (callback: WheelCallback) => {
    if (this.wheelCallbacks.indexOf(callback) === -1) {
      this.wheelCallbacks.push(callback);
    }
  };

  removeWheelCallback = (callback: WheelCallback) => {
    const indexOf = this.wheelCallbacks.indexOf(callback);
    if (indexOf >= 0) {
      this.wheelCallbacks.splice(indexOf, 1);
    }
  };

  register = () => {
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("wheel", this.onMouseScroll);
  };

  unregister = () => {
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("wheel", this.onMouseScroll);
  };
}
