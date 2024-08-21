import { mat4 } from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {
  TwoDCamera,
  OrthoLens
} from "./cameras";
import { Color, Gradient } from "./types";
import { Delauney } from "./scenes/Delauney";
import { GLContext } from "./gl/GLContext";



// Start here
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    throw new Error("Cannot find canvas");
  }
  const glContext = new GLContext(canvas);
  const gl = glContext.gl;
  let mustResize = false;

  const camera = new TwoDCamera([glContext.width/2, glContext.height / 2, 0]);
  const lens = new OrthoLens(glContext.width, glContext.height, 0, 1000);
  const colorGradient: Gradient = Color.createGradient([
    Color.fromHex("#FFE7C6"),
    Color.fromHex("#F47AAB")
  ])

  const numParticles = 100;
  const delauney = new Delauney(gl, glContext.width, glContext.height, numParticles);
  const viewProjectionMatrix = mat4.create();
  mat4.multiply(viewProjectionMatrix, lens.getProjection(), camera.getViewMatrix());

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      glContext.resize(window.innerWidth, window.innerHeight);
      lens.update(glContext.width, glContext.height, 0, 1000);
      mustResize = false;
    }

    delauney.update(timestamp);

    gl.viewport(0, 0, glContext.width * devicePixelRatio, glContext.height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST); // Disable depth testing
    delauney.render(viewProjectionMatrix, colorGradient);

  }

  const looper = new AnimationLoop(render);
  looper.attachSpacebarToggle();
  looper.resume();
}

main();
