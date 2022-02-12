import {mat4} from "gl-matrix";
import {AnimationLoop, ITimestamp} from "./animation";
import {Color4Buffer, Vector3Buffer} from "./buffers";
import {OrthoLens} from "./cameras/OrthoLens";
import {TwoDCamera} from "./cameras/TwoDCamera";
import {buildOscilator} from "./interpolators";
import {ThickLine} from "./objects/ThickLine";
import {Shader} from "./Shader";
import {Color, color4, vector3} from "./types";

// Start here
//
function main() {
  const canvas = document.querySelector("#glcanvas") as HTMLCanvasElement;
  if (!canvas) {
    return;
  }

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.setAttribute("width", `${width * devicePixelRatio}px`);
  canvas.setAttribute("height", `${height * devicePixelRatio}px`);
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

  const program = new Shader(gl)
    .addVertexSource(
      `#version 300 es
in vec4 a_position;
in vec4 color;
in mat4 matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = matrix * a_position;

  // Pass the vertex color to the fragment shader.
  v_color = color;
}`
    )
    .addFragmentSource(
      `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec4 v_color;

out vec4 outColor;

void main() {
  outColor = v_color;
}`
    )
    .link();

  const positionAttribute = program.getAttributeLocation("a_position");
  const colorAttribute = program.getAttributeLocation("color");
  const matrixAttribute = program.getAttributeLocation("matrix");

  const positionBuffer = new Vector3Buffer(
    gl,
    [
      [-0.1, 0.4, 0],
      [-0.1, -0.4, 0],
      [0.1, -0.4, 0],
      [0.1, -0.4, 0],
      [-0.1, 0.4, 0],
      [0.1, 0.4, 0],
      [0.4, -0.1, 0],
      [-0.4, -0.1, 0],
      [-0.4, 0.1, 0],
      [-0.4, 0.1, 0],
      [0.4, -0.1, 0],
      [0.4, 0.1, 0],
    ],
    gl.STATIC_DRAW
  );
  const numVertices = positionBuffer.getLength();
  positionBuffer.bindToAttribute(positionAttribute);

  // setup matrixes, one per instance
  const numInstances = 500;
  // make a typed array with one view per matrix
  const matrixData = new Float32Array(numInstances * 16);
  const matrices: Float32Array[] = [];
  for (let i = 0; i < numInstances; ++i) {
    const byteOffsetToMatrix = i * 16 * 4;
    const numFloatsForView = 16;
    matrices.push(new Float32Array(matrixData.buffer, byteOffsetToMatrix, numFloatsForView));
  }

  const matrixBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
  // just allocate the buffer
  gl.bufferData(gl.ARRAY_BUFFER, matrixData.byteLength, gl.DYNAMIC_DRAW);

  // set all 4 attributes for matrix
  const bytesPerMatrix = 4 * 16;
  for (let i = 0; i < 4; ++i) {
    const loc = matrixAttribute + i;
    gl.enableVertexAttribArray(loc);
    // note the stride and offset
    const offset = i * 16; // 4 floats per row, 4 bytes per float
    gl.vertexAttribPointer(
      loc, // location
      4, // size (num values to pull from buffer per iteration)
      gl.FLOAT, // type of data in buffer
      false, // normalize
      bytesPerMatrix, // stride, num bytes to advance to get to next set of values
      offset // offset in buffer
    );
    // this line says this attribute only changes for each 1 instance
    gl.vertexAttribDivisor(loc, 1);
  }

  const colors: color4[] = [];
  for (let i = 0; i < numInstances; ++i) {
    colors.push(Color.random());
  }
  const colorBuffer = new Color4Buffer(gl, colors);
  colorBuffer.bindToAttribute(colorAttribute);

  // this line says this attribute only changes for each 1 instance
  gl.vertexAttribDivisor(colorAttribute, 1);

  function render(timestamp: ITimestamp) {
    if (mustResize) {
      mustResize = false;
      canvas.setAttribute("width", `${newWidth * devicePixelRatio}px`);
      canvas.setAttribute("height", `${newHeight * devicePixelRatio}px`);
      width = newWidth;
      height = newHeight;
    }

    gl.viewport(0, 0, width * devicePixelRatio, height * devicePixelRatio);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    gl.useProgram(program.getProgram());

    // update all the matrices
    matrices.forEach((mat, ndx) => {
      mat4.fromTranslation(mat as mat4, [-0.5 + ndx * 0.25, 0, 0]);
      mat4.rotateZ(mat as mat4, mat as mat4, (timestamp.age / 1000) * (0.01 + 0.01 * ndx));
    });

    // upload the new matrix data
    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrixData);

    gl.drawArraysInstanced(
      gl.TRIANGLES,
      0, // offset
      numVertices, // num vertices per instance
      numInstances // num instances
    );
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
}

main();
