import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Shader} from "../gl/Shader";

export class Triangle {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly shader: Shader;
  private readonly vertexPositionAttribute: number;
  private readonly modelViewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    this.shader = new Shader(gl)
      .addVertexSource(
        `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}`
      )
      .addFragmentSource(
        `
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`
      )
      .link();

    this.positionBuffer = new Vector3Buffer(gl, [
      [0, 0, 0],
      [300, 0, 0],
      [300, 100, 0],
    ]);
    this.indexBuffer = new IndexBuffer(gl, [0, 1, 2]);
    this.modelViewMatrixUniform = this.shader.getUniformLocation(
      "uModelViewMatrix"
    ) as WebGLUniformLocation;
    this.projectionMatrixUniform = this.shader.getUniformLocation(
      "uProjectionMatrix"
    ) as WebGLUniformLocation;
    this.vertexPositionAttribute = this.shader.getAttributeLocation("aVertexPosition");
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);

    const vertexCount = 3;
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }
}
