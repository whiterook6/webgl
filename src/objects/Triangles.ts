import {Shader} from "../Shader";
import {Vector3Buffer, Color4Buffer, IndexBuffer, FloatBuffer} from "../buffers";
import {Color, color4} from "../types";
import {mat4} from "gl-matrix";

export class Triangles {
  private readonly gl: WebGL2RenderingContext;

  private readonly positionBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;

  private readonly shader: Shader;

  private readonly vertexPositionAttribute: number;

  private readonly modelViewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext, triangles: Vector3Buffer, indices: IndexBuffer) {
    this.gl = gl;

    this.shader = new Shader(gl)
      .addVertexSource(
        `
attribute vec4 a_position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionmatrix;


void main() {
  // Multiply the position by the matrix.
  gl_Position = projectionmatrix * modelViewMatrix * a_position;
}`
      )
      .addFragmentSource(
        `
precision mediump float;

void main() {
   gl_FragColor = vec4(1, 0, 0, 1);
}`
      )
      .link();

    this.gl.useProgram(this.shader.getProgram());
    this.positionBuffer = triangles;
    this.indexBuffer = indices;
    this.vertexPositionAttribute = this.shader.getAttributeLocation("a_position");
    this.modelViewMatrixUniform = this.shader.getUniformLocation(
      "modelViewMatrix"
    ) as WebGLUniformLocation;
    this.projectionMatrixUniform = this.shader.getUniformLocation(
      "projectionmatrix"
    ) as WebGLUniformLocation;
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);

    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, this.indexBuffer.getLength(), type, offset);
  }

  public destroy() {
    this.shader.destroy();
  }
}
