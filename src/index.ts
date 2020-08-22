import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {PerspectiveLens, Camera} from "./cameras";
import {OrbitCamera} from "./cameras/OrbitCamera";
import {Color} from "./Color";
import {Color4Bezier, loop, pipe, sin, transform, Vector3Bezier} from "./interpolators";
import {IMouseDrag, Mouse} from "./interaction/Mouse";
import {FullscreenQuad} from "./objects/FullscreenQuad";
import {ThreeDGrid} from "./objects/ThreeDGrid";
import {Gizmo} from "./objects/Gizmo";
import {vector3} from "./Vector3";
import {Line} from "./objects/Lines";

main();

//
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
  sceneCamera.setTarget([0, 0, 0]);
  sceneCamera.setUp([0, 0, 1]);

  const lens = new PerspectiveLens();
  const line = new Line(gl, new Vector3Bezier([0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]));
  const gizmo = new Gizmo(gl);

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

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(width - 200, 0, 200, 200);
    lens.aspect = 1;
    sceneCamera.setDistance(3);
    gizmo.render(modelMatrix, sceneCamera.getViewMatrix(), lens.getProjection());
    sceneCamera.setDistance(10);
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
    sceneCamera.movePhi(deltaX * 0.01);
    sceneCamera.moveTheta(deltaY * 0.01);
  };
  mouse.addDragCallback(moveCamera);
  document.addEventListener("mousedown", (event) => {
    const {clientX, clientY} = event;
    const viewport: [number, number, number, number] = [0, 0, width, height];
    const clickVectorClose: vector3 = [clientX, clientY, 0];
    const clickVectorFar: vector3 = [clientX, clientY, 1];
    const projViewMatrix = mat4.create();
    mat4.multiply(projViewMatrix, lens.getProjection(), sceneCamera.getViewMatrix());
    const unprojectedClose = Camera.unproject(clickVectorClose, viewport, projViewMatrix);
    const unprojectedFar = Camera.unproject(clickVectorFar, viewport, projViewMatrix);

    line.update(
      new Vector3Bezier(unprojectedClose, unprojectedClose, unprojectedFar, unprojectedFar)
    );
  });
  mouse.register();
}
