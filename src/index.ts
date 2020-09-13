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
import {Color, Vector3, vector3, epsilon} from "./types";

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
  sceneCamera.setDistance(20);
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
  const bezier = new Vector3Bezier([0, 0, 9], [0, 10, 1], [0, -5, 1], [0, 7, 10]);
  const renderableBezier = new RenderableBezier(gl, bezier);
  const grid = new ThreeDGrid(gl);

  let carT: number = 0.0;
  let carPreviousT: number = 0.0;
  const g: vector3 = [0, 0, -9.8];
  const carVertices = new Vector3Buffer(gl, [[0, 0, 0]]);
  const carColors = new Color4Buffer(gl, [Color.fromHex("#FFFFFF")]);
  const carIndices = new IndexBuffer(gl, [0]);
  const carRenderer = new VertexColorRenderer(gl);
  const carMatrix = mat4.create();

  function render(timestamp: ITimestamp) {
    {
      const deltaT = timestamp.deltaT / 1000;
      const distance = bezier.getDistance(carT);
      const previousDistance = bezier.getDistance(carPreviousT);

      const pathAtT = Vector3.normalize(bezier.getVelocity(carT));
      const forceAlongPath = Vector3.project(g, pathAtT);
      const acceleration = Vector3.scale(forceAlongPath, deltaT * deltaT * 0.5);
      const accelerationMagnitude = Vector3.mag(acceleration);
      let newDistance;
      if (pathAtT[2] < 0) {
        // if track is descending
        newDistance = 2 * distance - previousDistance + accelerationMagnitude;
      } else {
        newDistance = 2 * distance - previousDistance - accelerationMagnitude;
      }

      carPreviousT = carT;
      carT = bezier.getT(newDistance);

      if (carT >= 1.0) {
        carT = 0;
        carPreviousT = 0;
      }
    }

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
    const carPosition = bezier.getPosition(carT);
    mat4.fromTranslation(carMatrix, carPosition);
    mat4.multiply(carMatrix, viewMatrix, carMatrix);
    mat4.multiply(carMatrix, projectionMatrix, carMatrix);
    carRenderer.render(carVertices, carColors, carIndices, carMatrix, gl.POINTS);
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
