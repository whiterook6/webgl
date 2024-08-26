import { AnimationLoop, ITimestamp } from "./animation";
import {
  OrthoLens,
  TwoDCamera
} from "./cameras";
import { GLContext } from "./gl/GLContext";
import { Vector3Bezier } from "./interpolators";
import { Polyline } from "./objects/Polyline";
import { Color } from "./types";

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

  const lens = new OrthoLens(glContext.width / 100, glContext.height / 100, 0.001, 100);
  const camera = new TwoDCamera([0, 0, 1]);
  
  const polyline = new Polyline(glContext.gl);
  const bezier = new Vector3Bezier([-2, 0, 0], [4, 4, 0], [-4, 4, 5], [2, 0, -5]);
  const leftColor = Color.fromHex("#ec4067");
  const rightColor = Color.fromHex("#311847");
  for (let i = 0; i < 100; i++) {
    const t = i / 100;
    const p = bezier.getPosition(t);
    polyline.addPoint(p, Color.interpolate(leftColor, rightColor, t), Math.sin(t * Math.PI) * 0.2 + 0.1);
  }

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      glContext.resize(window.innerWidth, window.innerHeight);
      lens.update(glContext.width / 100, glContext.height / 100, 0.001, 100);
    }
   

    polyline.updateBuffers([0, 0, 1]);


    gl.viewport(0, 0, glContext.width * devicePixelRatio, glContext.height * devicePixelRatio);
    gl.clearColor(0.87,0.87,0.87,1.0); // Clear to black, fully opaque
    gl.clearDepth(100); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // Disable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    polyline.render(camera.getViewMatrix(), lens.getProjection());
  }

  const looper = new AnimationLoop(render);
  looper.attachSpacebarToggle();
  looper.resume();
}

main();
