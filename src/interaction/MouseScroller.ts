type ScrollCallback = (delta: number) => void;

export class MouseScroller {
  private scrollFactor: number;

  constructor(callback: ScrollCallback, scrollFactor: number = 1) {
    this.scrollFactor = scrollFactor;
    window.addEventListener("wheel", (e) => {      
      callback(e.deltaY * this.scrollFactor);
    });
  }
}