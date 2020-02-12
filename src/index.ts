import {mat4} from "gl-matrix";
import { Shader } from "./Shader";
import { FloatBuffer, IndexBuffer, Color4Buffer } from "./Buffer";
import { LookAtCamera, PerspectiveLens } from "./Camera";
import { Vector3 } from "./Vector3";
import { Color } from "./Color";

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas') as HTMLCanvasElement;
  if (!canvas){
    return;
  }
  canvas.setAttribute("width", `${window.innerWidth}px`);
  canvas.setAttribute("height", `${window.innerHeight}px`);
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  const background = initBackground(gl);

  // Draw the scene repeatedly
  function render() {
    drawScene(gl, background);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function initBackground(gl: WebGL2RenderingContext){
  const positionBuffer = new FloatBuffer(gl, [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
  ], 2);
  const colorBuffer = new Color4Buffer(gl, [
    Color.fromHex("#0182B2"),
    Color.fromHex("#EC4980"),
    Color.fromHex("#FFDA8A"),
    Color.fromHex("#F3F3F3")
  ]);

  const indexBuffer = new IndexBuffer(gl, [
    0, 1, 2, 3
  ]);

  const backgroundShader = new Shader(gl)
    .addVertexSource(`
  attribute vec4 aVertexPosition;
  attribute vec4 aVertexColor;

  varying lowp vec4 vColor;

  void main(void) {
    gl_Position = aVertexPosition;
    vColor = aVertexColor;
  }
    `)
    .addFragmentSource(`
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vec4(vColor.rgb, 1);
  }
    `)
    .link();
  
  return {
    vertexPositionAttribute: backgroundShader.getAttributeLocation("aVertexPosition"),
    vertexColorAttribute: backgroundShader.getAttributeLocation("aVertexColor"),
    program: backgroundShader.getProgram(),
    positionBuffer,
    colorBuffer,
    indexBuffer
  };
}

//
// Draw the scene.
//
function drawScene(gl: WebGL2RenderingContext, background: any) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  const {
    vertexPositionAttribute,
    vertexColorAttribute,
    program,
    positionBuffer,
    colorBuffer,
    indexBuffer,
  } = background;

  (positionBuffer as FloatBuffer).bindToAttribute(vertexPositionAttribute);
  (colorBuffer as FloatBuffer).bindToAttribute(vertexColorAttribute);
  (indexBuffer as IndexBuffer).bindToAttribute();

  // Tell WebGL to use our program when drawing

  gl.useProgram(program);


  {
    const vertexCount = 4;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLE_STRIP, vertexCount, type, offset);
  }
}


