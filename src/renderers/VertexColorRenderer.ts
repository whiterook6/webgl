import {Shader} from "../Shader";
import {Vector3Buffer, IndexBuffer, Color4Buffer} from "../buffers";
import {mat4} from "gl-matrix";
import {color4} from "../types";

export class VertexColorRenderer {
  private static shader: Shader;
  private static vertexPositionAttribute: number;
  private static vertexColorAttribute: number;
  private static matrixUniform: WebGLUniformLocation;

  private readonly gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    if (!VertexColorRenderer.shader) {
      VertexColorRenderer.loadShader(gl);
    }
  }

  static loadShader(gl: WebGL2RenderingContext) {
    VertexColorRenderer.shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;

attribute vec4 vertexColor;
attribute vec4 vertexPosition;
uniform mat4 matrix;
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

    VertexColorRenderer.vertexPositionAttribute = VertexColorRenderer.shader.getAttributeLocation(
      "vertexPosition"
    );
    VertexColorRenderer.vertexColorAttribute = VertexColorRenderer.shader.getAttributeLocation(
      "vertexColor"
    );
    VertexColorRenderer.matrixUniform = VertexColorRenderer.shader.getUniformLocation(
      "matrix"
    ) as WebGLUniformLocation;
  }

  render(
    vertices: Vector3Buffer,
    vertexColors: Color4Buffer,
    indices: IndexBuffer,
    matrix: mat4,
    mode: number
  ) {
    vertices.bindToAttribute(VertexColorRenderer.vertexPositionAttribute);
    vertexColors.bindToAttribute(VertexColorRenderer.vertexColorAttribute);
    indices.bindToAttribute();

    this.gl.useProgram(VertexColorRenderer.shader.getProgram());
    this.gl.uniformMatrix4fv(VertexColorRenderer.matrixUniform, false, matrix);

    const vertexCount = indices.getLength();
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(mode, vertexCount, type, offset);
  }
}
