export const createWebGL2Context = (canvas: HTMLCanvasElement): WebGL2RenderingContext => {
  const gl = canvas.getContext("webgl2", {antialias: false}) as WebGL2RenderingContext;
  if (!gl) {
    throw new Error("Cannot create WebGL context");
  }

  return gl;
};


export const resizeCanvasToWindow = (canvas: HTMLCanvasElement) => {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
};

export const resizeCanvasOnWindowResize = (canvas: HTMLCanvasElement) => {
  const resize = () => resizeCanvasToWindow(canvas);
  window.addEventListener("resize", resize);
  // Initial resize
  resize();
  // Return cleanup function
  return () => window.removeEventListener("resize", resize);
};