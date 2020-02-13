import { Color4Buffer, FloatBuffer, IndexBuffer, Vector3Buffer } from "./Buffer";
import { Color } from "./Color";
import { Shader } from "./Shader";
import { Vector3 } from "./Vector3";
import { LookAtCamera, Camera, PerspectiveLens, Lens } from "./Camera";
import { mat4 } from "gl-matrix";

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
  const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;

  // If we don't have a GL context, give up now
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  const background = initBackground(gl);
  const grids = initGrids(gl);
  const camera = new LookAtCamera();
  camera.setPosition(new Vector3(10, 11, 12));
  camera.setTarget(new Vector3(0, 0, 0));
  camera.setUp(new Vector3(0, 1, 0))
  const lens = new PerspectiveLens();
  lens.aspect = width / height;

  // Draw the scene repeatedly
  function render() {
    drawScene(gl, background, grids, camera, lens);

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

  const indexBuffer = new IndexBuffer(gl, [
    0, 1, 2, 3
  ]);

  const backgroundShader = new Shader(gl)
    .addVertexSource(`
  precision lowp float;

  uniform vec4 color1;
  uniform vec4 color2;
  uniform vec4 color3;
  uniform vec4 color4;

  attribute vec4 aVertexPosition;
  
  varying vec2 uv;

  void main(void) {
    gl_Position = aVertexPosition;
    uv = aVertexPosition.xy * 0.5 + vec2(0.5, 0.5);
  }
    `)
    .addFragmentSource(`
  precision lowp float;

  uniform vec4 color1;
  uniform vec4 color2;
  uniform vec4 color3;
  uniform vec4 color4;

  varying vec2 uv;

  void main(void) {
    gl_FragColor = 
      color1 * (1.0 - uv.x) * (1.0 - uv.y)
      + color2 * uv.x * (1.0 - uv.y)
      + color3 * (1.0 - uv.x) * uv.y
      + color4 * uv.x * uv.y;
  }
    `)
    .link();
  
  return {
    vertexPositionAttribute: backgroundShader.getAttributeLocation("aVertexPosition"),
    color1Uniform: backgroundShader.getUniformLocation("color1"),
    color2Uniform: backgroundShader.getUniformLocation("color2"),
    color3Uniform: backgroundShader.getUniformLocation("color3"),
    color4Uniform: backgroundShader.getUniformLocation("color4"),
    program: backgroundShader.getProgram(),
    positionBuffer,
    indexBuffer
  };
}

function initGrids(gl: WebGL2RenderingContext){
  const gridPositions: Vector3[] = [];
  const indexPositions: number[] = [];

  let i: number;
  for (i = -5; i <= 5; i++){
    gridPositions.push(new Vector3(i, -5, 0));
    gridPositions.push(new Vector3(i, 5, 0));
  }

  for (i = -4; i < 5; i++){
    gridPositions.push(new Vector3(-5, i, 0));
    gridPositions.push(new Vector3(5, i, 0));
  }

  for (i = 0; i < 24; i++){
    indexPositions.push(i);
  }
  indexPositions.push(0);
  indexPositions.push(23);
  for (i = 24; i < 40; i++) {
    indexPositions.push(i);
  }

  console.log(gridPositions);
  console.log(indexPositions);

  const gridShader = new Shader(gl)
    .addVertexSource(`
precision lowp float;

uniform vec4 color;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
attribute vec4 vertexPosition;

void main(void) {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vertexPosition;
}
    `)
    .addFragmentSource(`
precision lowp float;

uniform vec4 color;

void main(void) {
  gl_FragColor = color;
}
    `)
    .link();

  return {
    program: gridShader.getProgram(),
    positionAttribute: gridShader.getAttributeLocation("vertexPosition"),
    colorUniform: gridShader.getUniformLocation("color"),
    modelMatrixUniform: gridShader.getUniformLocation("modelMatrix"),
    viewMatrixUniform: gridShader.getUniformLocation("viewMatrix"),
    projectionMatrixUniform: gridShader.getUniformLocation("projectionMatrix"),
    positionBuffer: new Vector3Buffer(gl, gridPositions),
    indexBuffer: new IndexBuffer(gl, indexPositions),
  }
}

//
// Draw the scene.
//
function drawScene(gl: WebGL2RenderingContext, background: any, grids: any, camera: Camera, lens: Lens) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  {
    const {
      vertexPositionAttribute,
      color1Uniform,
      color2Uniform,
      color3Uniform,
      color4Uniform,
      program,
      positionBuffer,
      indexBuffer,
    } = background;

    (positionBuffer as FloatBuffer).bindToAttribute(vertexPositionAttribute);
    (indexBuffer as IndexBuffer).bindToAttribute();

    // Tell WebGL to use our program when drawing

    gl.useProgram(program);
    gl.uniform4fv(color1Uniform, Color.fromHex("#0182B2"));
    gl.uniform4fv(color2Uniform, Color.fromHex("#EC4980"));
    gl.uniform4fv(color3Uniform, Color.fromHex("#FFDA8A"));
    gl.uniform4fv(color4Uniform, Color.fromHex("#50377E"));
    gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_SHORT, 0);
  }

  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
  {
    const {
      program,
      positionAttribute,
      colorUniform,
      positionBuffer,
      indexBuffer,
      modelMatrixUniform,
      viewMatrixUniform,
      projectionMatrixUniform,
    } = grids;

    const modelMatrix = mat4.create();
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = lens.getProjection();

    gl.useProgram(program);
    gl.uniform4fv(colorUniform, Color.fromHex("#efebeb"));
    (positionBuffer as FloatBuffer).bindToAttribute(positionAttribute);
    (indexBuffer as IndexBuffer).bindToAttribute();
    gl.uniformMatrix4fv(
      modelMatrixUniform,
      false,
      modelMatrix);
    gl.uniformMatrix4fv(
      viewMatrixUniform,
      false,
      viewMatrix);
    gl.uniformMatrix4fv(
      projectionMatrixUniform,
      false,
      projectionMatrix);
    gl.drawElements(gl.LINES, (indexBuffer as IndexBuffer).getLength(), gl.UNSIGNED_SHORT, 0);
  }
}
