import {mat4} from "gl-matrix";
import { Shader } from "./Shader";
import { FloatBuffer, IndexBuffer, Color4Buffer } from "./Buffer";
import { Camera, LookAtCamera } from "./Camera";
import { Vector3 } from "./Vector3";

var cubeRotation = 0.0;

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

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;

    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;
    varying highp vec3 vLighting;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

      // Apply lighting effect

      highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
      highp vec3 directionalLightColor = vec3(1, 1, 1);
      highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
      vColor = aVertexColor;
    }
  `;

  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;
    varying highp vec3 vLighting;

    void main(void) {
      gl_FragColor = vec4(vColor.rgb * vLighting, vColor.a);
    }
  `;

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram!, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram!, 'aVertexColor'),
      vertexNormal: gl.getAttribLocation(shaderProgram!, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram!, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram!, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  var then = 0;

  // Draw the scene repeatedly
  function render(now: number) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//
function initBuffers(gl: WebGL2RenderingContext) {

  // Create a buffer for the cube's vertex positions.
  const positions = [
    // Front face
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0, 1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, -1.0, -1.0,

    // Top face
    -1.0, 1.0, -1.0,
    -1.0, 1.0, 1.0,
    1.0, 1.0, 1.0,
    1.0, 1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
    1.0, -1.0, -1.0,
    1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,

    // Right face
    1.0, -1.0, -1.0,
    1.0, 1.0, -1.0,
    1.0, 1.0, 1.0,
    1.0, -1.0, 1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, 1.0, -1.0,
  ];
  const positionBuffer = new FloatBuffer(gl, positions, 3);

  const vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];
  const normalBuffer = new FloatBuffer(gl, vertexNormals, 3);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face, so four colors per face (square with four vertices, each with same color)

  const faceColors: Array<[number, number, number, number]> = [
    [1.0, 1.0, 1.0, 1.0],    // Front face: white
    [1.0, 1.0, 1.0, 1.0],    // Front face: white
    [1.0, 1.0, 1.0, 1.0],    // Front face: white
    [1.0, 1.0, 1.0, 1.0],    // Front face: white
    [1.0, 0.0, 0.0, 1.0],    // Back face: red
    [1.0, 0.0, 0.0, 1.0],    // Back face: red
    [1.0, 0.0, 0.0, 1.0],    // Back face: red
    [1.0, 0.0, 0.0, 1.0],    // Back face: red
    [0.0, 1.0, 0.0, 1.0],    // Top face: green
    [0.0, 1.0, 0.0, 1.0],    // Top face: green
    [0.0, 1.0, 0.0, 1.0],    // Top face: green
    [0.0, 1.0, 0.0, 1.0],    // Top face: green
    [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
    [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
    [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
    [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
    [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
    [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
    [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
    [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
    [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    [1.0, 0.0, 1.0, 1.0],    // Left face: purple
    [1.0, 0.0, 1.0, 1.0],    // Left face: purple
  ];
  const colorBuffer = new Color4Buffer(gl, faceColors);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.
  const indices = [
    0, 1, 2, 0, 2, 3,    // front
    4, 5, 6, 4, 6, 7,    // back
    8, 9, 10, 8, 10, 11,   // top
    12, 13, 14, 12, 14, 15,   // bottom
    16, 17, 18, 16, 18, 19,   // right
    20, 21, 22, 20, 22, 23,   // left
  ];

  const indexBuffer = new IndexBuffer(gl, indices);

  return {
    position: positionBuffer,
    normals: normalBuffer,
    color: colorBuffer,
    indices: indexBuffer,
  };
}

//
// Draw the scene.
//
function drawScene(gl: WebGL2RenderingContext, programInfo: any, buffers: any, deltaTime: number) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = (gl.canvas as HTMLCanvasElement).clientWidth / (gl.canvas as HTMLCanvasElement).clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
    fieldOfView,
    aspect,
    zNear,
    zFar);

  const modelMatrix = mat4.fromTranslation(mat4.create(), [0, 0, 0]);

  const camera = new LookAtCamera();
  camera.setPosition(new Vector3(0, 0, -10));
  camera.setTarget(new Vector3(0, 0, 0));
  camera.setUp(new Vector3(0, 1, 0));
  const viewMatrix = camera.getViewMatrix();
  const modelViewMatrix = mat4.create();
  mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

  
  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  (buffers.position as FloatBuffer).bindToAttribute(programInfo.attribLocations.vertexPosition);
  (buffers.normals as FloatBuffer).bindToAttribute(programInfo.attribLocations.vertexNormal);

  (buffers.color as Color4Buffer).bindToAttribute(programInfo.attribLocations.vertexColor);

  (buffers.indices as IndexBuffer).bindToAttribute();

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix);
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Update the rotation for the next draw

  cubeRotation += deltaTime;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string) {
  return new Shader(gl).addVertexSource(vsSource).addFragmentSource(fsSource).link().getProgram();
}

