import {Shader} from "../Shader";
import {Vector3Buffer, IndexBuffer} from "../buffers";
import {mat4} from "gl-matrix";
import {color4} from "../types";

export class SolicColorRenderer {
  private static shader: Shader;
  private static vertexPositionAttribute: number;
  private static colorUniform: WebGLUniformLocation;
  private static matrixUniform: WebGLUniformLocation;

  private readonly gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    if (!SolicColorRenderer.shader) {
      SolicColorRenderer.loadShader(gl);
    }
  }

  static loadShader(gl: WebGL2RenderingContext) {
    SolicColorRenderer.shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;

attribute vec4 vertexPosition;
uniform mat4 matrix;
uniform vec4 color;

void main(void) {
  gl_Position = matrix * vertexPosition;
}`
      )
      .addFragmentSource(
        `
precision lowp float;
uniform vec4 color;

void main(void) {
  gl_FragColor = color;
}`
      )
      .link();

    SolicColorRenderer.vertexPositionAttribute = SolicColorRenderer.shader.getAttributeLocation(
      "vertexPosition"
    );
    SolicColorRenderer.matrixUniform = SolicColorRenderer.shader.getUniformLocation(
      "matrix"
    ) as WebGLUniformLocation;
    SolicColorRenderer.colorUniform = SolicColorRenderer.shader.getUniformLocation(
      "color"
    ) as WebGLUniformLocation;
  }

  render(vertices: Vector3Buffer, indices: IndexBuffer, color: color4, matrix: mat4, mode: number) {
    vertices.bindToAttribute(SolicColorRenderer.vertexPositionAttribute);
    indices.bindToAttribute();

    this.gl.useProgram(SolicColorRenderer.shader.getProgram());
    this.gl.uniformMatrix4fv(SolicColorRenderer.matrixUniform, false, matrix);
    this.gl.uniform4fv(SolicColorRenderer.colorUniform, color);

    const vertexCount = indices.getLength();
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(mode, vertexCount, type, offset);
  }
}
