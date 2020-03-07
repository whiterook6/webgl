import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {PerspectiveLens} from "./cameras";
import {OrbitCamera} from "./cameras/OrbitCamera";
import {Color} from "./Color";
import {Framebuffer} from "./Framebuffer";
import {loop, pipe, sin, transform} from "./interpolators";
import {FullscreenQuad} from "./objects/FullscreenQuad";
import {Sphere} from "./objects/Sphere";
import {TexturedCube} from "./objects/TexturedCube";
import {ThreeDGrid} from "./objects/ThreeDGrid";
import {Vector3} from "./Vector3";
import {Color4Bezier} from "./interpolators";

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
  const tlPipe = pipe([loop(0, 10000), transform(0.0001), sin], tlBezier.get);
  const trPipe = pipe([loop(0, 10000), transform(0.0001), sin], trBezier.get);
  const blPipe = pipe([loop(0, 10000), transform(0.0001), sin], blBezier.get);
  const brPipe = pipe([loop(0, 10000), transform(0.0001), sin], brBezier.get);

  const grids = new ThreeDGrid(gl);
  const sphere = new Sphere(gl, 64);
  const texturedCube = new TexturedCube(gl);
  const framebuffer = new Framebuffer(gl, 256, 256);

  const camera = new OrbitCamera();
  camera.setDistance(10);
  camera.setTheta(-Math.PI / 12);
  camera.setTarget(new Vector3(0, 0, 0));
  camera.setUp(new Vector3(0, 1, 0));

  const lens = new PerspectiveLens();

  function render(timestamp: ITimestamp) {
    const modelMatrix = mat4.create();

    const angle = (timestamp.age / 100) * (Math.PI / 180);
    camera.setPhi(angle);
    const viewMatrix = camera.getViewMatrix();

    framebuffer.render((bufferWidth: number, bufferHeight: number) => {
      gl.viewport(0, 0, bufferWidth, bufferHeight);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      gl.clearDepth(1.0); // Clear everything
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); // Enable depth testing
      gl.depthFunc(gl.LEQUAL); // Near things obscure far things
      lens.aspect = bufferWidth / bufferHeight;
      const _projectionMatrix = lens.getProjection();
      grids.render(modelMatrix, viewMatrix, _projectionMatrix);
      sphere.render(modelMatrix, viewMatrix, _projectionMatrix);
    });

    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth}px`);
      canvas.setAttribute("height", `${newHeight}px`);
      width = newWidth;
      height = newHeight;
    }

    // normal time
    lens.aspect = width / height;
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
    texturedCube.render(modelMatrix, viewMatrix, projectionMatrix);
  }

  const looper = new AnimationLoop(render);
  document.addEventListener("keypress", (event) => {
    if (event.keyCode === 32) {
      looper.toggle();
    }
  });
}
