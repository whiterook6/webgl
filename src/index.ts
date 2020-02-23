import { mat4 } from "gl-matrix";
import { AnimationLoop, ITimestamp } from "./animation";
import { PerspectiveLens } from "./cameras";
import { OrbitCamera } from "./cameras/OrbitCamera";
import { FullscreenQuad } from "./objects/FullscreenQuad";
import { Sphere } from "./objects/Sphere";
import { ThreeDGrid } from "./objects/ThreeDGrid";
import { Vector3 } from "./Vector3";
import { Texture } from "./Texture";
import { Framebuffer } from "./Framebuffer";
import { TexturedCube } from "./objects/TexturedCube";

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

  let mustResize: boolean = false;
  let newWidth: number;
  let newHeight: number;
  window.addEventListener("resize", () => {
    newWidth = window.innerWidth;
    newHeight = window.innerHeight;

    const oldWidth = parseInt(canvas.getAttribute("width") || `${newWidth}`, 10);
    const oldHeight = parseInt(canvas.getAttribute("height") || `${newHeight}`, 10);

    if (oldWidth !== newWidth || oldHeight !== newHeight){
      mustResize = true;
    }
  });

  const background = new FullscreenQuad(gl);
  const grids = new ThreeDGrid(gl);
  const sphere = new Sphere(gl);
  const texturedCube = new TexturedCube(gl);
  
  const camera = new OrbitCamera();
  camera.setDistance(10);
  camera.setTheta(Math.PI / 12);
  camera.setTarget(new Vector3(0, 0, 0));
  camera.setUp(new Vector3(0, 1, 0))
  
  const lens = new PerspectiveLens();
  lens.aspect = width / height;

  const texture = new Texture(gl, 256, 256);
  const framebuffer = new Framebuffer(gl, texture);

  function render(timestamp: ITimestamp) {
    framebuffer.bind(gl.COLOR_ATTACHMENT0);
    {
      const modelMatrix = mat4.create();
      const angle = (timestamp.age / 100) * (Math.PI / 180);
      camera.setPhi(angle);
      const viewMatrix = camera.getViewMatrix();
      const projectionMatrix = lens.getProjection();

      grids.render(modelMatrix, viewMatrix, projectionMatrix);
      sphere.render(modelMatrix, viewMatrix, projectionMatrix);
    }
    framebuffer.unbind();

    if (mustResize){
      mustResize = false;
      canvas.setAttribute("width", `${newWidth}px`);
      canvas.setAttribute("height", `${newHeight}px`);
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      lens.aspect = newWidth / newHeight;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    background.render();
  
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  
    const modelMatrix = mat4.create();
    
    const angle = (timestamp.age / 100) * (Math.PI / 180);
    camera.setPhi(angle);
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = lens.getProjection();
  
    grids.render(modelMatrix, viewMatrix, projectionMatrix);
    sphere.render(modelMatrix, viewMatrix, projectionMatrix);

    mat4.translate(modelMatrix, modelMatrix, [2, 1, 1]);
    sphere.render(modelMatrix, viewMatrix, projectionMatrix);
  }

  const looper = new AnimationLoop(render);
  window.addEventListener("keyup", (event: KeyboardEvent) => {
    if (event.keyCode == 32){ // spacebar
      looper.toggle();
    }
  })
}

