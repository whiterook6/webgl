import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {OrthoLens} from "./cameras/OrthoLens";
import {TwoDCamera} from "./cameras/TwoDCamera";
import {loop, pipe, sin, transform} from "./interpolators";
import {ThickLine} from "./objects/ThickLine";
import {Color, vector3} from "./types";

// Start here
//
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  // disable right-click menu
  canvas.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.setAttribute("width", `${width * devicePixelRatio}px`);
  canvas.setAttribute("height", `${height * devicePixelRatio}px`);
  const gl = canvas.getContext("webgl2", {antialias: false}) as WebGL2RenderingContext;

  // If we don't have a GL context, give up now
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }

  let mustResize: boolean = false;
  let newWidth: number;
  let newHeight: number;
  window.addEventListener("resize", () => {
    newWidth = window.innerWidth;
    newHeight = window.innerHeight;

    const oldWidth = parseInt(canvas.getAttribute("width") || `${newWidth}`, 10);
    const oldHeight = parseInt(canvas.getAttribute("height") || `${newHeight}`, 10);

    if (oldWidth !== newWidth || oldHeight !== newHeight) {
      mustResize = true;
    }
  });

  // const trPipe = pipe([loop(0, 5000), transform(0.0002), sin], trBezier.get);
  const identity = mat4.create();
  mat4.identity(identity);
  const thickLine = new ThickLine(gl);
  const camera = new TwoDCamera([0, 0, -1]);
  const lens = new OrthoLens(width, height, -100, 100);

  const lengthPipe = pipe([loop(0, 5000), transform(0.0002), sin], (t: number) => t * 300 + 100);
  const rotationPipe = pipe(
    [loop(0, 4000), transform(0.00025), sin],
    (t: number) => (t * Math.PI) / 2
  );

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth * devicePixelRatio}px`);
      canvas.setAttribute("height", `${newHeight * devicePixelRatio}px`);
      width = newWidth;
      height = newHeight;
    }

    // normal time
    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.disable(gl.DEPTH_TEST); // Enable depth testing
    // background.setTlColor(tlPipe(timestamp.age));
    // background.setTrColor(trPipe(timestamp.age));
    // background.setBlColor(blPipe(timestamp.age));
    // background.setBrColor(brPipe(timestamp.age));
    // background.render();

    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = lens.getProjection();
    thickLine.render(
      viewMatrix,
      projectionMatrix,
      [0, 0, 0] as vector3,
      rotationPipe(timestamp.age),
      lengthPipe(timestamp.age),
      3,
      Color.fromHex("#FFFFFF"),
      Color.fromHex("#27ae60")
    );
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
