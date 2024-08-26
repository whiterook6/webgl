import {Shader} from "../gl/Shader";
import {Vector3Buffer, IndexBuffer} from "../buffers";
import {mat4} from "gl-matrix";
import {color4} from "../types";

export class SolidColorRenderer {
  private static shader: Shader;
  private static vertexPositionAttribute: number;
  private static colorUniform: WebGLUniformLocation;
  private static matrixUniform: WebGLUniformLocation;

  private readonly gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    if (!SolidColorRenderer.shader) {
      SolidColorRenderer.loadShader(gl);
    }
  }

  static loadShader(gl: WebGL2RenderingContext) {
    SolidColorRenderer.shader = new Shader(gl)
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

    SolidColorRenderer.vertexPositionAttribute = SolidColorRenderer.shader.getAttributeLocation(
      "vertexPosition"
    );
    SolidColorRenderer.matrixUniform = SolidColorRenderer.shader.getUniformLocation(
      "matrix"
    ) as WebGLUniformLocation;
    SolidColorRenderer.colorUniform = SolidColorRenderer.shader.getUniformLocation(
      "color"
    ) as WebGLUniformLocation;
  }

  render(vertices: Vector3Buffer, indices: IndexBuffer, color: color4, matrix: mat4, mode: number) {
    vertices.bindToAttribute(SolidColorRenderer.vertexPositionAttribute);
    indices.bindToAttribute();

    this.gl.useProgram(SolidColorRenderer.shader.getProgram());
    this.gl.uniformMatrix4fv(SolidColorRenderer.matrixUniform, false, matrix);
    this.gl.uniform4fv(SolidColorRenderer.colorUniform, color);

    const vertexCount = indices.getLength();
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(mode, vertexCount, type, offset);
    
    indices.unbindFromAttribute();
    vertices.unbindFromAttribute(SolidColorRenderer.vertexPositionAttribute);
  }

  destroy(){
    if (SolidColorRenderer.shader) {
      SolidColorRenderer.shader.destroy();
    }
  }
}
