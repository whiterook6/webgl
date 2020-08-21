import {Shader} from "../Shader";
import {mat4} from "gl-matrix";
import {Vector3Buffer, Color4Buffer, IndexBuffer} from "../buffers";

export class Lines {
  private readonly gl: WebGL2RenderingContext;
  private readonly shader: Shader;

  private readonly vertexPositionAttribute: number;
  private readonly vertexColorAttribute: number;
  private readonly matrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;

uniform mat4 matrix;
attribute vec4 vertexColor;
attribute vec4 vertexPosition;
varying vec4 vColor;

void main(void) {
  vColor = vertexColor;
  gl_Position = matrix * vertexPosition;
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
    this.matrixUniform = this.shader.getUniformLocation("matrix") as WebGLUniformLocation;
  }

  public render(
    matrix: mat4,
    positionBuffer: Vector3Buffer,
    colorBuffer: Color4Buffer,
    indexBuffer: IndexBuffer
  ) {
    this.gl.useProgram(this.shader.getProgram());
    positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    colorBuffer.bindToAttribute(this.vertexColorAttribute);
    indexBuffer.bindToAttribute();

    this.gl.uniformMatrix4fv(this.matrixUniform, false, matrix);
    this.gl.drawElements(this.gl.LINES, indexBuffer.getLength(), this.gl.UNSIGNED_SHORT, 0);
  }

  public destroy() {
    this.shader.destroy();
  }
}
