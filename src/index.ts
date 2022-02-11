import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {Color4Buffer, IndexBuffer, Vector3Buffer} from "./buffers";
import {PerspectiveLens} from "./cameras";
import {OrbitCamera} from "./cameras/OrbitCamera";
import {IMouseDrag, Mouse} from "./interaction/Mouse";
import {Color4Bezier, loop, pipe, sin, transform, Vector3Bezier} from "./interpolators";
import {FullscreenQuad} from "./objects/FullscreenQuad";
import {Gizmo} from "./objects/Gizmo";
import {RenderableBezier} from "./objects/RenderableBezier";
import {ThreeDGrid} from "./objects/ThreeDGrid";
import {Triangle} from "./objects/Triangle";
import {BezierPhysicsVerlet} from "./physics/BezierPhysicsVerlet";
import {VertexColorRenderer} from "./renderers/VertexColorRenderer";
import {Color, Vector3, vector3} from "./types";

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

  const background = new FullscreenQuad(gl);
  const tlBezier = new Color4Bezier(
    Color.fromHex("#0182B2"),
    Color.fromHex("#0182B2"),
    Color.fromHex("#EC4980"),
    Color.fromHex("#EC4980")
  );
  const trBezier = new Color4Bezier(
    Color.fromHex("#EC4980"),
    Color.fromHex("#EC4980"),
    Color.fromHex("#FFDA8A"),
    Color.fromHex("#FFDA8A")
  );
  const blBezier = new Color4Bezier(
    Color.fromHex("#FFDA8A"),
    Color.fromHex("#FFDA8A"),
    Color.fromHex("#50377E"),
    Color.fromHex("#50377E")
  );
  const brBezier = new Color4Bezier(
    Color.fromHex("#50377E"),
    Color.fromHex("#50377E"),
    Color.fromHex("#0182B2"),
    Color.fromHex("#0182B2")
  );
  const tlPipe = pipe([loop(0, 5000), transform(0.0002), sin], tlBezier.get);
  const trPipe = pipe([loop(0, 5000), transform(0.0002), sin], trBezier.get);
  const blPipe = pipe([loop(0, 5000), transform(0.0002), sin], blBezier.get);
  const brPipe = pipe([loop(0, 5000), transform(0.0002), sin], brBezier.get);

  const triangle = new Triangle(gl);

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
    gl.disable(gl.DEPTH_TEST); // Enable depth testing
    background.setTlColor(tlPipe(timestamp.age));
    background.setTrColor(trPipe(timestamp.age));
    background.setBlColor(blPipe(timestamp.age));
    background.setBrColor(brPipe(timestamp.age));
    background.render();

    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    const identity = mat4.create();
    mat4.identity(identity);
    triangle.render(identity, identity, identity);
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
