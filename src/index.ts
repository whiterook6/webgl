import {mat4, vec4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {PerspectiveLens} from "./cameras";
import {OrbitCamera} from "./cameras/OrbitCamera";
import {Color} from "./Color";
import {Framebuffer} from "./Framebuffer";
import {Color4Bezier, loop, pipe, sin, transform, Vector3Bezier} from "./interpolators";
import {FullscreenQuad} from "./objects/FullscreenQuad";
import {Sphere} from "./objects/Sphere";
import {TexturedCube} from "./objects/TexturedCube";
import {ThreeDGrid} from "./objects/ThreeDGrid";
import {Vector3} from "./Vector3";
import {Mouse, IMouseDrag, IMouseClick} from "./interaction/Mouse";
import { Line } from "./objects/Lines";

const unproject = (clickVector: Vector3, viewport: [number, number, number, number], viewMatrix: mat4, projectionMatric: mat4) => {
  const [viewX, viewY, viewWidth, viewHeight] = viewport;
  let [x, y, z] = clickVector.toArray();

  // offsets from viewport, and flipping Y
  x = x - viewX;
  y = viewHeight - y - 1;
  y = y - viewY;

  // normalize to clip space: from 0 -> 1024 and 0 -> 768, for example, to -1 -> 1 for X and Y
  x = (2 * x) / viewWidth - 1
  y = (2 * y) / viewHeight - 1
  z = 2 * z - 1

  const projViewMatrix = mat4.create();
  const invertedMatrix = mat4.create();
  mat4.multiply(projViewMatrix, projectionMatric, viewMatrix);
  mat4.invert(invertedMatrix, projViewMatrix);

  const [
    a00, a01, a02, a03,
    a10, a11, a12, a13,
    a20, a21, a22, a23,
    a30, a31, a32, a33
  ] = invertedMatrix;

  const lw = 1 / (x * a03 + y * a13 + z * a23 + a33);

  return new Vector3(
    (x * a00 + y * a10 + z * a20 + a30) * lw,
    (x * a01 + y * a11 + z * a21 + a31) * lw,
    (x * a02 + y * a12 + z * a22 + a32) * lw,
  );
};

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.setAttribute("width", `${width}px`);
  canvas.setAttribute("height", `${height}px`);
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

  const grids = new ThreeDGrid(gl);
  // const sphere = new Sphere(gl, 64);
  // const texturedCube = new TexturedCube(gl);
  // const framebuffer = new Framebuffer(gl, 256, 256);

  // const camera = new OrbitCamera();
  // camera.setDistance(10);
  // camera.setTheta(-Math.PI / 12);
  // camera.setTarget(new Vector3(0, 0, 0));
  // camera.setUp(new Vector3(0, 1, 0));
  const sceneCamera = new OrbitCamera();
  sceneCamera.setDistance(10);
  sceneCamera.setTheta(-Math.PI / 12);
  sceneCamera.setTarget(new Vector3(0, 0, 0));
  sceneCamera.setUp(new Vector3(0, 1, 0));

  const lens = new PerspectiveLens();
  const line = new Line(gl, new Vector3Bezier(
    new Vector3([0, 0, 0]),
    new Vector3([0, 1, 0]),
    new Vector3([1, 1, 0]),
    new Vector3([1, 0, 0]),
  ));

  function render(timestamp: ITimestamp) {
    const modelMatrix = mat4.create();

    // framebuffer.render((bufferWidth: number, bufferHeight: number) => {
    //   const angle = (timestamp.age / 100) * (Math.PI / 180);
    //   camera.setPhi(angle);
    //   const _viewMatrix = camera.getViewMatrix();

    //   gl.viewport(0, 0, bufferWidth, bufferHeight);
    //   gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    //   gl.clearDepth(1.0); // Clear everything
    //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //   gl.enable(gl.DEPTH_TEST); // Enable depth testing
    //   gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    //   lens.aspect = bufferWidth / bufferHeight;
    //   const _projectionMatrix = lens.getProjection();
    //   grids.render(modelMatrix, _viewMatrix, _projectionMatrix);
    //   sphere.render(modelMatrix, _viewMatrix, _projectionMatrix);
    // });

    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth}px`);
      canvas.setAttribute("height", `${newHeight}px`);
      width = newWidth;
      height = newHeight;
    }

    // normal time
    lens.aspect = width / height;
    const viewMatrix = sceneCamera.getViewMatrix();
    const projectionMatrix = lens.getProjection();
    gl.viewport(0, 0, width, height);
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

    grids.render(modelMatrix, viewMatrix, projectionMatrix);
    line.render(modelMatrix, viewMatrix, projectionMatrix);
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

  const mouse = new Mouse();
  const moveCamera = (event: IMouseDrag) => {
    if (looper.getIsPaused()) {
      return;
    }

    const {deltaX, deltaY} = event;
    sceneCamera.movePhi(deltaX * 0.01);
    sceneCamera.moveTheta(deltaY * 0.01);
  };
  mouse.addDragCallback(moveCamera);
  document.addEventListener("mousedown", (event) => {
    const {clientX, clientY} = event;
    const viewport: [number, number, number, number] = [0, 0, width, height];
    const clickVectorClose = new Vector3(clientX, clientY, 0);
    const clickVectorFar = new Vector3(clientX, clientY, 1);

    const unprojectedClose = unproject(clickVectorClose, viewport, sceneCamera.getViewMatrix(), lens.getProjection());
    const unprojectedFar = unproject(clickVectorFar, viewport, sceneCamera.getViewMatrix(), lens.getProjection());

    line.update(new Vector3Bezier(
      new Vector3([unprojectedClose.x(), unprojectedClose.y(), unprojectedClose.z()]),
      new Vector3([unprojectedClose.x(), unprojectedClose.y(), unprojectedClose.z()]),
      new Vector3([unprojectedFar.x(), unprojectedFar.y(), unprojectedFar.z()]),
      new Vector3([unprojectedFar.x(), unprojectedFar.y(), unprojectedFar.z()]),
    ));
  });
  mouse.register();
}
