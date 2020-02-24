import {Shader} from "../Shader";
import {Vector3Buffer, Color4Buffer, IndexBuffer} from "../buffers";
import {Vector3} from "../Vector3";
import {Color} from "../Color";
import {mat4} from "gl-matrix";

export class Cube {
  private readonly gl: WebGL2RenderingContext;

  private readonly positionBuffer: Vector3Buffer;
  private readonly colorBuffer: Color4Buffer;
  private readonly normalBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;

  private readonly program: WebGLShader;

  private readonly vertexPositionAttribute: number;
  private readonly vertexNormalAttribute: number;
  private readonly vertexColorAttribute: number;

  private readonly normalMatrixUniform: WebGLUniformLocation;
  private readonly modelViewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    const shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;

attribute vec4 vertexPosition;
attribute vec3 vertexNormal;
attribute vec4 vertexColor;
uniform mat4 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionmatrix;
varying lowp vec4 vColor;
varying highp vec3 vLighting;

void main(void) {
  gl_Position = projectionmatrix * modelViewMatrix * vertexPosition;

  // Apply lighting effect

  highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp vec4 transformedNormal = normalMatrix * vec4(vertexNormal, 1.0);

  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  vLighting = ambientLight + (directionalLightColor * directional);
  vColor = vertexColor;
}`
      )
      .addFragmentSource(
        `
precision lowp float;

varying highp vec3 vLighting;
varying lowp vec4 vColor;

void main(void) {
  gl_FragColor = vec4(vColor.rgb * vLighting, 1.0);
}`
      )
      .link();

    this.program = shader.getProgram();

    this.positionBuffer = new Vector3Buffer(gl, [
      // Front face
      new Vector3([-1.0, -1.0, 1.0]),
      new Vector3([1.0, -1.0, 1.0]),
      new Vector3([1.0, 1.0, 1.0]),
      new Vector3([-1.0, 1.0, 1.0]),

      // Back face
      new Vector3([-1.0, -1.0, -1.0]),
      new Vector3([-1.0, 1.0, -1.0]),
      new Vector3([1.0, 1.0, -1.0]),
      new Vector3([1.0, -1.0, -1.0]),

      // Top face
      new Vector3([-1.0, 1.0, -1.0]),
      new Vector3([-1.0, 1.0, 1.0]),
      new Vector3([1.0, 1.0, 1.0]),
      new Vector3([1.0, 1.0, -1.0]),

      // Bottom face
      new Vector3([-1.0, -1.0, -1.0]),
      new Vector3([1.0, -1.0, -1.0]),
      new Vector3([1.0, -1.0, 1.0]),
      new Vector3([-1.0, -1.0, 1.0]),

      // Right face
      new Vector3([1.0, -1.0, -1.0]),
      new Vector3([1.0, 1.0, -1.0]),
      new Vector3([1.0, 1.0, 1.0]),
      new Vector3([1.0, -1.0, 1.0]),

      // Left face
      new Vector3([-1.0, -1.0, -1.0]),
      new Vector3([-1.0, -1.0, 1.0]),
      new Vector3([-1.0, 1.0, 1.0]),
      new Vector3([-1.0, 1.0, -1.0]),
    ]);

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

    this.normalBuffer = new Vector3Buffer(gl, [
      // Front
      new Vector3([0.0, 0.0, 1.0]),
      new Vector3([0.0, 0.0, 1.0]),
      new Vector3([0.0, 0.0, 1.0]),
      new Vector3([0.0, 0.0, 1.0]),

      // Back
      new Vector3([0.0, 0.0, -1.0]),
      new Vector3([0.0, 0.0, -1.0]),
      new Vector3([0.0, 0.0, -1.0]),
      new Vector3([0.0, 0.0, -1.0]),

      // Top
      new Vector3([0.0, 1.0, 0.0]),
      new Vector3([0.0, 1.0, 0.0]),
      new Vector3([0.0, 1.0, 0.0]),
      new Vector3([0.0, 1.0, 0.0]),

      // Bottom
      new Vector3([0.0, -1.0, 0.0]),
      new Vector3([0.0, -1.0, 0.0]),
      new Vector3([0.0, -1.0, 0.0]),
      new Vector3([0.0, -1.0, 0.0]),

      // Right
      new Vector3([1.0, 0.0, 0.0]),
      new Vector3([1.0, 0.0, 0.0]),
      new Vector3([1.0, 0.0, 0.0]),
      new Vector3([1.0, 0.0, 0.0]),

      // Left
      new Vector3([-1.0, 0.0, 0.0]),
      new Vector3([-1.0, 0.0, 0.0]),
      new Vector3([-1.0, 0.0, 0.0]),
      new Vector3([-1.0, 0.0, 0.0]),
    ]);

    this.indexBuffer = new IndexBuffer(gl, [
      0,
      1,
      2,
      0,
      2,
      3, // front
      4,
      5,
      6,
      4,
      6,
      7, // back
      8,
      9,
      10,
      8,
      10,
      11, // top
      12,
      13,
      14,
      12,
      14,
      15, // bottom
      16,
      17,
      18,
      16,
      18,
      19, // right
      20,
      21,
      22,
      20,
      22,
      23, // left
    ]);

    this.gl.useProgram(this.program);
    this.vertexPositionAttribute = shader.getAttributeLocation("vertexPosition");
    this.vertexNormalAttribute = shader.getAttributeLocation("vertexNormal");
    this.vertexColorAttribute = shader.getAttributeLocation("vertexColor");
    this.normalMatrixUniform = shader.getUniformLocation("normalMatrix") as WebGLUniformLocation;
    this.modelViewMatrixUniform = shader.getUniformLocation(
      "modelViewMatrix"
    ) as WebGLUniformLocation;
    this.projectionMatrixUniform = shader.getUniformLocation(
      "projectionmatrix"
    ) as WebGLUniformLocation;
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.normalBuffer.bindToAttribute(this.vertexNormalAttribute);
    this.colorBuffer.bindToAttribute(this.vertexColorAttribute);
    this.indexBuffer.bindToAttribute();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(this.normalMatrixUniform, false, normalMatrix);

    const vertexCount = 36;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
