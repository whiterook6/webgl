export class GLContext {
  public canvas: HTMLCanvasElement;
  public width: number;
  public height: number;
  public gl: WebGL2RenderingContext;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    this.canvas.setAttribute("width", `${this.width * window.devicePixelRatio}px`);
    this.canvas.setAttribute("height", `${this.height * window.devicePixelRatio}px`);
    this.gl = canvas.getContext("webgl2", { antialias: false }) as WebGL2RenderingContext;
    if (!this.gl) {
      throw new Error("Cannot create WebGL context");
    };

    this.gl.viewport(0, 0, this.width * window.devicePixelRatio, this.height * window.devicePixelRatio);
  }

  public resize(newWidth: number, newHeight: number): void {
    if (newWidth === this.width && newHeight === this.height) {
      return;
    }
    
    this.width = newWidth;
    this.height = newHeight;
    this.canvas.setAttribute("width", `${this.width * window.devicePixelRatio}px`);
    this.canvas.setAttribute("height", `${this.height * window.devicePixelRatio}px`);
    this.gl.viewport(0, 0, this.width * window.devicePixelRatio, this.height * window.devicePixelRatio);
  }
}