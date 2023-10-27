import { mat4 } from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {
  TwoDCamera,
  OrthoLens
} from "./cameras";
import { FullscreenQuad } from "./objects/FullscreenQuad";
import { Color, Gradient } from "./types";
import { Fluid } from "./scenes/Fluid";
import { Delauney } from "./scenes/Delauney";

let mustResize = false;
let width = window.innerWidth;
let height = window.innerHeight;
let newWidth: number;
let newHeight: number;

function createGLContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  canvas.setAttribute("width", `${width * devicePixelRatio}px`);
  canvas.setAttribute("height", `${height * devicePixelRatio}px`);

  const gl = canvas.getContext("webgl2", {antialias: false}) as WebGL2RenderingContext;
  if (!gl) {
    throw new Error("Cannot create WebGL context");
  }

  window.addEventListener("resize", () => {
    if (mustResize) {
      return;
    }

    newWidth = window.innerWidth;
    newHeight = window.innerHeight;

    const oldWidth = parseInt(canvas.getAttribute("width") || `${newWidth}`, 10);
    const oldHeight = parseInt(canvas.getAttribute("height") || `${newHeight}`, 10);

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      mustResize = true;
    }
  });

  return gl;
}

// Start here
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Cannot find canvas");
  }
  const gl = createGLContext(canvas);
  const camera = new TwoDCamera([width/2, height / 2, 0]);
  const lens = new OrthoLens(width, height, 0, 1000);
  const colorGradient: Gradient = Color.createGradient([
    Color.fromHex("#FFE7C6"),
    Color.fromHex("#F47AAB")
  ])

  const delauney = new Delauney(gl, width, height, 1000);
  const viewProjectionMatrix = mat4.create();
  mat4.multiply(viewProjectionMatrix, lens.getProjection(), camera.getViewMatrix());

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth * devicePixelRatio}px`);
      canvas.setAttribute("height", `${newHeight * devicePixelRatio}px`);
      width = newWidth;
      height = newHeight;
      lens.update(newWidth, newHeight, 0, 1000);
    }

    delauney.update(timestamp);

    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); // Disable depth testing
    delauney.render(viewProjectionMatrix, colorGradient);

  }

  const looper = new AnimationLoop(render);
  document.addEventListener("keypress", (event) => {
    if (event.repeat) {
      return;
    }
    if (event.key == " ") {
      looper.toggle();
      return;
    }
    if (event.key === "]"){
      if (looper.getIsPaused()) {
        looper.step();
      }
      return;
    }
  });
  looper.resume();
}

main();
