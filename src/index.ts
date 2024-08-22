import { mat4 } from "gl-matrix";
import { AnimationLoop, ITimestamp } from "./animation";
import {
  OrbitCamera,
  PerspectiveLens
} from "./cameras";
import { GLContext } from "./gl/GLContext";
import { MouseScroller } from "./interaction/MouseScroller";
import { buildOscillator } from "./interpolators";
import { Cube } from "./objects/Cube";
import { ThreeDGrid } from "./objects/ThreeDGrid";
import { Color } from "./types";
import { Polyline } from "./objects/Polyline";

// Start here
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Cannot find canvas");
  }
  const glContext = new GLContext(canvas);
  const gl = glContext.gl;

  let mustResize = false;
  window.addEventListener("resize", () => {
    mustResize = true;
  });

  const camera = new OrbitCamera();
  camera.setDistance(5);
  camera.setTheta(0.5);
  camera.setTarget([0, 0, 0]);
  camera.setUp([0, 0, 1]);

  const oscillator = buildOscillator(-0.5, 0.5, 10);

  const lens = new PerspectiveLens(window.innerWidth / window.innerHeight);

  const threeDGrid = new ThreeDGrid(glContext.gl, Color.fromHex("#444444"));
  const cube = new Cube(glContext.gl);
  const cubeModelMatrix = mat4.create();
  new MouseScroller((delta) => {
    camera.setDistance(camera.getDistance() + delta);
  }, 0.1);

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      glContext.resize(window.innerWidth, window.innerHeight);
      lens.aspect = window.innerWidth / window.innerHeight;
    }

    camera.setPhi(timestamp.age / 1000);
    camera.setTheta(oscillator(timestamp.age / 1000));

    gl.viewport(0, 0, glContext.width * devicePixelRatio, glContext.height * devicePixelRatio);
    gl.clearColor(0.87,0.87,0.87,1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // Disable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    threeDGrid.render(camera.getViewMatrix(), lens.getProjection());
    cube.render(cubeModelMatrix, camera.getViewMatrix(), lens.getProjection());
  }

  const looper = new AnimationLoop(render);
  looper.attachSpacebarToggle();
  // looper.step();
  looper.resume();
}

main();
