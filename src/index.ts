import { mat4 } from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {
  PerspectiveLens,
  OrbitCamera,
} from "./cameras";
import { GLContext } from "./gl/GLContext";
import { Cube } from "./objects/Cube";

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
  camera.setTarget([0, 0, 0]);
  camera.setUp([0, 0, 1]);
  
  const lens = new PerspectiveLens();
  lens.aspect = glContext.width / glContext.height;
  const cube = new Cube(glContext.gl);
  const modelMatrix = mat4.create();

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      glContext.resize(window.innerWidth, window.innerHeight);
      lens.aspect = glContext.width / glContext.height;
    }

    camera.setPhi(timestamp.age / 1000);

    gl.viewport(0, 0, glContext.width * devicePixelRatio, glContext.height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // Disable depth testing

    cube.render(modelMatrix, camera.getViewMatrix(), lens.getProjection());
  }

  const looper = new AnimationLoop(render);
  looper.attachSpacebarToggle();
  looper.resume();
}

main();
