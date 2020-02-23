import { mat4 } from "gl-matrix";
import { AnimationLoop, ITimestamp } from "./animation";
import { PerspectiveLens } from "./cameras";
import { OrbitCamera } from "./cameras/OrbitCamera";
import { FullscreenQuad } from "./objects/FullscreenQuad";
import { Sphere } from "./objects/Sphere";
import { ThreeDGrid } from "./objects/ThreeDGrid";
import { Vector3 } from "./Vector3";
import { TexturedCube } from "./objects/TexturedCube";
import { Framebuffer } from "./Framebuffer";

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
  if (!canvas){
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.setAttribute("width", `${width}px`);
  canvas.setAttribute("height", `${height}px`);
  const gl = canvas.getContext('webgl2', { antialias: false }) as WebGL2RenderingContext;

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  const background = new FullscreenQuad(gl);
  const grids = new ThreeDGrid(gl);
  const sphere = new Sphere(gl, 64);
  const texturedCube = new TexturedCube(gl);
  const framebuffer = new Framebuffer(gl, 256, 256);
  
  const camera = new OrbitCamera();
  camera.setDistance(10);
  camera.setTheta(-Math.PI / 12);
  camera.setTarget(new Vector3(0, 0, 0));
  camera.setUp(new Vector3(0, 1, 0))
  
  const lens = new PerspectiveLens();

  function render(timestamp: ITimestamp) {
    const modelMatrix = mat4.create();
    
    const angle = (timestamp.age / 100) * (Math.PI / 180);
    camera.setPhi(angle);
    const viewMatrix = camera.getViewMatrix();

    framebuffer.render((bufferWidth: number, bufferHeight: number) => {
      gl.viewport(0, 0, bufferWidth, bufferHeight);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
      gl.clearDepth(1.0);                 // Clear everything
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);           // Enable depth testing
      gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      lens.aspect = bufferWidth / bufferHeight;
      const projectionMatrix = lens.getProjection();
      grids.render(modelMatrix, viewMatrix, projectionMatrix);
      sphere.render(modelMatrix, viewMatrix, projectionMatrix);
    });

    // normal time
    lens.aspect = width / height;
    const projectionMatrix = lens.getProjection();
    gl.viewport(0, 0, width, height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);           // Enable depth testing
    background.render();
  
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    grids.render(modelMatrix, viewMatrix, projectionMatrix);
    texturedCube.render(modelMatrix, viewMatrix, projectionMatrix);
  }

  new AnimationLoop(render);
}

