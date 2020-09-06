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
import {VertexColorRenderer} from "./renderers/VertexColorRenderer";
import {Color, Vector3} from "./types";

// Start here
//
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }
  canvas.addEventListener("contextmenu", (event) => {
    event.stopPropagation();
    event.preventDefault();
  });

  // disable right-click menu
  canvas.oncontextmenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

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

  const sceneCamera = new OrbitCamera();
  sceneCamera.setDistance(10);
  sceneCamera.setTheta(-Math.PI / 12);
  sceneCamera.setTarget([0, 0, 5]);
  sceneCamera.setUp([0, 0, 1]);
  const gizmoCamera = new OrbitCamera();
  gizmoCamera.setDistance(3);
  gizmoCamera.setTheta(-Math.PI / 12);
  gizmoCamera.setTarget([0, 0, 0]);
  gizmoCamera.setUp([0, 0, 1]);

  const lens = new PerspectiveLens();
  const gizmo = new Gizmo(gl);
  const bezier = new Vector3Bezier(
    [6.0, 0.0, 0.0],
    [6.0, 11.0, 0.0],
    [3.0, 0.0, 3.0],
    [0.0, 0.0, 10.0]
  );
  const renderableBezier = new RenderableBezier(gl, bezier);
  const bezierGizmo = new VertexColorRenderer(gl);
  const bezierGizmoVertexBuffer = new Vector3Buffer(gl, [
    [0, 0, 0],
    [1, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
    [0, 0, 1],
  ]);
  const bezierGizmoColorBuffer = new Color4Buffer(gl, [
    Color.fromHex("#FF0000"),
    Color.fromHex("#FF0000"),
    Color.fromHex("#00FF00"),
    Color.fromHex("#00FF00"),
    Color.fromHex("#0000FF"),
    Color.fromHex("#0000FF"),
  ]);
  const bezierGizmoIndexBuffer = new IndexBuffer(gl, [0, 1, 2, 3, 4, 5]);
  const bezierGizmoMatrix = mat4.create();
  const bezierPipe = pipe([loop(0, 10000), transform(0.0001)], (t) => t);
  const grid = new ThreeDGrid(gl);
  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth}px`);
      canvas.setAttribute("height", `${newHeight}px`);
      width = newWidth;
      height = newHeight;
    }

    // normal time
    lens.aspect = width / height;
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

    const viewMatrix = sceneCamera.getViewMatrix();
    const projectionMatrix = lens.getProjection();
    grid.render(viewMatrix, projectionMatrix);
    renderableBezier.render(viewMatrix, projectionMatrix);
    const t = bezierPipe(timestamp.age);
    sceneCamera.setTarget(bezier.getPosition(t));
    const frame = bezier.getMatrix(t);
    mat4.multiply(bezierGizmoMatrix, viewMatrix, frame);
    mat4.multiply(bezierGizmoMatrix, projectionMatrix, bezierGizmoMatrix);
    bezierGizmo.render(
      bezierGizmoVertexBuffer,
      bezierGizmoColorBuffer,
      bezierGizmoIndexBuffer,
      bezierGizmoMatrix,
      gl.LINES
    );

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(width - 200, 0, 200, 200);
    lens.aspect = 1;
    gizmoCamera.setPhi(sceneCamera.getPhi());
    gizmoCamera.setTheta(sceneCamera.getTheta());
    gizmo.render(gizmoCamera.getViewMatrix(), lens.getProjection());
    lens.aspect = width / height;
    gl.viewport(0, 0, width, height);
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
    sceneCamera.movePhi(deltaX * -0.01);
    sceneCamera.moveTheta(deltaY * 0.01);
  };
  const zoomCamera = (delta: number) => {
    if (looper.getIsPaused()) {
      return;
    }

    sceneCamera.setDistance(sceneCamera.getDistance() + delta);
  };
  mouse.addDragCallback(moveCamera);
  mouse.addWheelCallback(zoomCamera);
  mouse.register();
}

main();
