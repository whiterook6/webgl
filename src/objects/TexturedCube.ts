import { Shader } from "../Shader";
import { Vector3Buffer, Color4Buffer, IndexBuffer, FloatBuffer } from "../buffers";
import { Vector3 } from "../Vector3";
import { Color } from "../Color";
import { mat4 } from "gl-matrix";

export class TexturedCube {
  private readonly gl: WebGL2RenderingContext;

  private readonly positionBuffer: Vector3Buffer;
  private readonly textureBuffer: FloatBuffer;
  private readonly indexBuffer: IndexBuffer;

  private readonly program: WebGLShader;

  private readonly vertexPositionAttribute: number;
  private readonly vertexTextureAttribute: number;

  private readonly modelViewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;
  private readonly textureLocation: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext){
    this.gl = gl;

    const shader = new Shader(gl)
      .addVertexSource(`
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionmatrix;

varying vec2 v_texcoord;

void main() {
  // Multiply the position by the matrix.
  gl_Position = projectionmatrix * modelViewMatrix * vertexPosition;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
}`)
      .addFragmentSource(`
precision mediump float;

// Passed in from the vertex shader.
varying vec2 v_texcoord;

// The texture.
uniform sampler2D u_texture;

void main() {
   gl_FragColor = texture2D(u_texture, v_texcoord);
}`)
      .link();
    
    this.program = shader.getProgram();
    
    this.positionBuffer = new Vector3Buffer(gl, [
      // Front face
      new Vector3([-1.0, -1.0,  1.0]),
      new Vector3([1.0, -1.0,  1.0]),
      new Vector3([1.0,  1.0,  1.0]),
      new Vector3([-1.0,  1.0,  1.0]),

      // Back face
      new Vector3([-1.0, -1.0, -1.0]),
      new Vector3([-1.0,  1.0, -1.0]),
      new Vector3([1.0,  1.0, -1.0]),
      new Vector3([1.0, -1.0, -1.0]),

      // Top face
      new Vector3([-1.0,  1.0, -1.0]),
      new Vector3([-1.0,  1.0,  1.0]),
      new Vector3([1.0,  1.0,  1.0]),
      new Vector3([1.0,  1.0, -1.0]),

      // Bottom face
      new Vector3([-1.0, -1.0, -1.0]),
      new Vector3([1.0, -1.0, -1.0]),
      new Vector3([1.0, -1.0,  1.0]),
      new Vector3([-1.0, -1.0,  1.0]),

      // Right face
      new Vector3([1.0, -1.0, -1.0]),
      new Vector3([1.0,  1.0, -1.0]),
      new Vector3([1.0,  1.0,  1.0]),
      new Vector3([1.0, -1.0,  1.0]),

      // Left face
      new Vector3([-1.0, -1.0, -1.0]),
      new Vector3([-1.0, -1.0,  1.0]),
      new Vector3([-1.0,  1.0,  1.0]),
      new Vector3([-1.0,  1.0, -1.0]),
    ]);

    this.textureBuffer = new FloatBuffer(gl, [
      // Front
      0, 0,
      0, 1,
      1, 0,
      1, 1,
    
      // Back
      0, 0,
      0, 1,
      1, 0,
      1, 1,
      
      // Top
      0, 0,
      0, 1,
      1, 0,
      1, 1,
      
      // Bottom
      0, 0,
      0, 1,
      1, 0,
      1, 1,
    
      // Right
      0, 0,
      0, 1,
      1, 0,
      1, 1,
    
      // Left
      0, 0,
      0, 1,
      1, 0,
      1, 1,
    ], 2);

    this.indexBuffer = new IndexBuffer(gl, [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ]);

    this.gl.useProgram(this.program);
    this.vertexPositionAttribute = shader.getAttributeLocation("a_position");
    this.vertexTextureAttribute = shader.getAttributeLocation("a_texcoord");
    this.modelViewMatrixUniform = shader.getUniformLocation("modelViewMatrix") as WebGLUniformLocation;
    this.projectionMatrixUniform = shader.getUniformLocation("projectionmatrix") as WebGLUniformLocation;
    this.textureLocation = shader.getUniformLocation("u_texture") as WebGLUniformLocation;
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4){
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.textureBuffer.bindToAttribute(this.vertexTextureAttribute);
    this.indexBuffer.bindToAttribute();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);
    this.gl.uniform1i(this.textureLocation, 0);

    const vertexCount = 36;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}