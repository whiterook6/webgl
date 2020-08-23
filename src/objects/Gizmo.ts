import {mat4} from "gl-matrix";
import {Color4Buffer, IndexBuffer, Vector3Buffer} from "../buffers";
import {Shader} from "../Shader";
import {color4, vector3} from "../types";

export class Gizmo {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: Vector3Buffer;
  private readonly colorBuffer: Color4Buffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly shader: Shader;

  private readonly vertexPositionAttribute: number;
  private readonly vertexColorAttribute: number;
  private readonly modelMatrixUniform: WebGLUniformLocation;
  private readonly viewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    const positions: vector3[] = [
      [0, 0, 0],
      [1, 0, 0],

      [0, 0, 0],
      [0, 1, 0],

      [0, 0, 0],
      [0, 0, 1],
    ];
    const indices = [0, 1, 2, 3, 4, 5];
    const colors: color4[] = [
      [1, 0, 0, 1],
      [1, 0, 0, 1],

      [0, 1, 0, 1],
      [0, 1, 0, 1],

      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ];

    this.shader = new Shader(gl)
      .addVertexSource(
        `precision lowp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
attribute vec4 vertexColor;
attribute vec4 vertexPosition;
varying vec4 vColor;

void main(void) {
    vColor = vertexColor;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vertexPosition;
}`
      )
      .addFragmentSource(
        `
precision lowp float;

varying vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}`
      )
      .link();

    this.vertexPositionAttribute = this.shader.getAttributeLocation("vertexPosition");
    this.vertexColorAttribute = this.shader.getAttributeLocation("vertexColor");
    this.modelMatrixUniform = this.shader.getUniformLocation("modelMatrix") as WebGLUniformLocation;
    this.viewMatrixUniform = this.shader.getUniformLocation("viewMatrix") as WebGLUniformLocation;
    this.projectionMatrixUniform = this.shader.getUniformLocation(
      "projectionMatrix"
    ) as WebGLUniformLocation;

    this.positionBuffer = new Vector3Buffer(gl, positions);
    this.colorBuffer = new Color4Buffer(gl, colors);
    this.indexBuffer = new IndexBuffer(gl, indices);
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.gl.useProgram(this.shader.getProgram());
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.colorBuffer.bindToAttribute(this.vertexColorAttribute);
    this.indexBuffer.bindToAttribute();

    this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, modelMatrix);
    this.gl.uniformMatrix4fv(this.viewMatrixUniform, false, viewMatrix);
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.drawElements(this.gl.LINES, this.indexBuffer.getLength(), this.gl.UNSIGNED_SHORT, 0);
  }

  public destroy() {
    this.indexBuffer.destroy();
    this.positionBuffer.destroy();
    this.colorBuffer.destroy();
    this.shader.destroy();
  }
}
