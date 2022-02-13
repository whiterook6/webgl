import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {LookAtCamera, PerspectiveLens} from "./cameras";
import {OrbitCamera} from "./cameras/OrbitCamera";
import {IMouseDrag, Mouse} from "./interaction/Mouse";
import {Color4Bezier, loop, pipe, sin, transform} from "./interpolators";
import {Cube} from "./objects/Cube";
import {FullscreenQuad} from "./objects/FullscreenQuad";
import {Gizmo} from "./objects/Gizmo";
import {ThreeDGrid} from "./objects/ThreeDGrid";
import {Color} from "./types";

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

  const cube = new Cube(gl);
  const cubeMatrix = mat4.create();

  const camera = new OrbitCamera();
  camera.setDistance(10);
  camera.setTarget([0, 0, 0]);
  camera.setPhi(Math.PI / 4);
  camera.setTheta(Math.PI / 4);

  const lens = new PerspectiveLens();
  lens.aspect = width / height;

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth * devicePixelRatio}px`);
      canvas.setAttribute("height", `${newHeight * devicePixelRatio}px`);
      width = newWidth;
      height = newHeight;
      lens.aspect = width / height;
    }
    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // render
    mat4.fromZRotation(cubeMatrix, timestamp.age / 1000);
    const projectionMatrix = lens.getProjection();
    const viewMatrix = camera.getViewMatrix();

    cube.render(cubeMatrix, viewMatrix, projectionMatrix);
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
