import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {PerspectiveLens} from "./cameras";
import {OrbitCamera} from "./cameras/OrbitCamera";
import {OrthoLens} from "./cameras/OrthoLens";
import {TwoDCamera} from "./cameras/TwoDCamera";
import {Hairs} from "./objects/Hairs";

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
//
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Cannot find canvas");
  }
  const gl = createGLContext(canvas);

  const hairs = new Hairs(gl, 100, 50);

  const camera = new TwoDCamera([0, 0, 0]);
  const lens = new OrthoLens(-1, 1, -10, 10);
  const viewProjectionMatrix = mat4.create();

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth * devicePixelRatio}px`);
      canvas.setAttribute("height", `${newHeight * devicePixelRatio}px`);
      width = newWidth;
      height = newHeight;
    }
    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); // Enable depth testing

    mat4.multiply(viewProjectionMatrix, lens.getProjection(), camera.getViewMatrix());
    hairs.render(viewProjectionMatrix, timestamp.age / 8000);

    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
  }

  const looper = new AnimationLoop(render);
  document.addEventListener("keypress", (event) => {
    if (event.repeat) {
      return;
    }
    if (event.keyCode === 32) {
      looper.toggle();
    }
  });
  looper.resume();
}

main();
