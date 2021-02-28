import {Shader} from "../Shader";
import {Vector3Buffer, Color4Buffer, IndexBuffer, FloatBuffer} from "../buffers";
import {Color} from "../types";
import {mat4} from "gl-matrix";

export class TexturedCube {
  private readonly gl: WebGL2RenderingContext;

  private readonly positionBuffer: Vector3Buffer;
  private readonly textureBuffer: FloatBuffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly colorBuffer: Color4Buffer;

  private readonly shader: Shader;

  private readonly vertexPositionAttribute: number;
  private readonly vertexTextureAttribute: number;
  private readonly vertexColorAttribute: number;

  private readonly modelViewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;
  private readonly textureLocation: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.shader = new Shader(gl)
      .addVertexSource(
        `
attribute vec4 a_position;
attribute vec2 a_texcoord;
attribute vec4 a_color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionmatrix;

varying vec2 v_texcoord;
varying vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = projectionmatrix * modelViewMatrix * a_position;

  // Pass the texcoord to the fragment shader.
  v_texcoord = a_texcoord;
  v_color = a_color;
}`
      )
      .addFragmentSource(
        `
precision mediump float;

// Passed in from the vertex shader.
varying vec2 v_texcoord;
varying vec4 v_color;

// The texture.
uniform sampler2D u_texture;

void main() {
   gl_FragColor = mix(v_color, texture2D(u_texture, v_texcoord), 0.5);
}`
      )
      .link();

    this.positionBuffer = new Vector3Buffer(gl, [
      // Front face
      [-1.0, -1.0, 1.0],
      [1.0, -1.0, 1.0],
      [1.0, 1.0, 1.0],
      [-1.0, 1.0, 1.0],

      // Back face
      [-1.0, -1.0, -1.0],
      [-1.0, 1.0, -1.0],
      [1.0, 1.0, -1.0],
      [1.0, -1.0, -1.0],

      // Top face
      [-1.0, 1.0, -1.0],
      [-1.0, 1.0, 1.0],
      [1.0, 1.0, 1.0],
      [1.0, 1.0, -1.0],

      // Bottom face
      [-1.0, -1.0, -1.0],
      [1.0, -1.0, -1.0],
      [1.0, -1.0, 1.0],
      [-1.0, -1.0, 1.0],

      // Right face
      [1.0, -1.0, -1.0],
      [1.0, 1.0, -1.0],
      [1.0, 1.0, 1.0],
      [1.0, -1.0, 1.0],

      // Left face
      [-1.0, -1.0, -1.0],
      [-1.0, -1.0, 1.0],
      [-1.0, 1.0, 1.0],
      [-1.0, 1.0, -1.0],
    ]);

    // prettier-ignore
    this.textureBuffer = new FloatBuffer(gl, [
      // Front
      0, 0,
      1, 0,
      1, 1,
      0, 1,

      // Back
      1, 0,
      1, 1,
      0, 1,
      0, 0,

      // Top
      0, 0,
      1, 0,
      1, 1,
      0, 1,

      // Bottom
      0, 0,
      1, 0,
      1, 1,
      0, 1,

      // Right
      1, 0,
      1, 1,
      0, 1,
      0, 0,

      // Left
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ], 2);

    this.colorBuffer = new Color4Buffer(gl, [
      // Front
      Color.fromHex("#700460"),
      Color.fromHex("#700460"),
      Color.fromHex("#700460"),
      Color.fromHex("#700460"),

      // Back
      Color.fromHex("#EC0F47"),
      Color.fromHex("#EC0F47"),
      Color.fromHex("#EC0F47"),
      Color.fromHex("#EC0F47"),

      // Top
      Color.fromHex("#FBBF54"),
      Color.fromHex("#FBBF54"),
      Color.fromHex("#FBBF54"),
      Color.fromHex("#FBBF54"),

      // Bottom
      Color.fromHex("#15C286"),
      Color.fromHex("#15C286"),
      Color.fromHex("#15C286"),
      Color.fromHex("#15C286"),

      // Right
      Color.fromHex("#045459"),
      Color.fromHex("#045459"),
      Color.fromHex("#045459"),
      Color.fromHex("#045459"),

      // Left
      Color.fromHex("#038DC9"),
      Color.fromHex("#038DC9"),
      Color.fromHex("#038DC9"),
      Color.fromHex("#038DC9"),
    ]);

    // prettier-ignore
    this.indexBuffer = new IndexBuffer(gl, [
      0, 1, 2, 0, 2, 3,    // front
      4, 5, 6, 4, 6, 7,    // back
      8, 9, 10, 8, 10, 11,   // top
      12, 13, 14, 12, 14, 15,   // bottom
      16, 17, 18, 16, 18, 19,   // right
      20, 21, 22, 20, 22, 23,   // left
    ]);

    this.shader.useProgram();
    this.vertexPositionAttribute = this.shader.getAttributeLocation("a_position");
    this.vertexTextureAttribute = this.shader.getAttributeLocation("a_texcoord");
    this.vertexColorAttribute = this.shader.getAttributeLocation("a_color");
    this.modelViewMatrixUniform = this.shader.getUniformLocation(
      "modelViewMatrix"
    ) as WebGLUniformLocation;
    this.projectionMatrixUniform = this.shader.getUniformLocation(
      "projectionmatrix"
    ) as WebGLUniformLocation;
    this.textureLocation = this.shader.getUniformLocation("u_texture") as WebGLUniformLocation;
  }

  public render(
    modelMatrix: mat4,
    viewMatrix: mat4,
    projectionMatrix: mat4,
    textureNumber: number
  ) {
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.textureBuffer.bindToAttribute(this.vertexTextureAttribute);
    this.colorBuffer.bindToAttribute(this.vertexColorAttribute);
    this.indexBuffer.bindToAttribute();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);
    this.gl.uniform1i(this.textureLocation, textureNumber);

    const vertexCount = 36;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }

  public destroy() {
    this.colorBuffer.destroy();
    this.indexBuffer.destroy();
    this.positionBuffer.destroy();
    this.textureBuffer.destroy();
    this.shader.destroy();
  }
}
