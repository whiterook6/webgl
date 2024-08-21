import {Shader} from "../gl/Shader";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {mat4} from "gl-matrix";
import {color4, vector3} from "../types";

export class InstancedSolidColorRenderer {
  private count: number;

  private readonly shader: Shader;
  
  private readonly vertices: Vector3Buffer;
  private readonly vertexPositionAttribute: number;
  
  private readonly matrixAttribute: number;
  private matrixBuffer: WebGLBuffer;
  private matrixData: Float32Array;

  private readonly colorUniform: WebGLUniformLocation;
  private readonly viewProjectionMatrixUniform: WebGLUniformLocation;
  private readonly indices: IndexBuffer;
  private readonly mode: number;

  private readonly gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, count: number, vertices: Vector3Buffer, indices: IndexBuffer, mode: number) {
    this.gl = gl;
    this.count = count;
    this.vertices = vertices;
    this.indices = indices;
    this.mode = mode;

    this.shader = new Shader(gl)
      .addVertexSource(`#version 300 es
in vec3 position;
in mat4 matrix;
uniform mat4 viewProjectionMatrix;
  
void main() {
  // Multiply the position by the matrix.
  gl_Position = viewProjectionMatrix * matrix * vec4(position, 1);
}
`)
      .addFragmentSource(`#version 300 es
precision highp float;
uniform vec4 uColor;  
out vec4 outColor;
  
void main() {
  outColor = uColor;
}
`)
      .link();

    this.vertexPositionAttribute = this.shader.getAttributeLocation("position");
    this.matrixAttribute = this.shader.getAttributeLocation("matrix");
    this.colorUniform = this.shader.getUniformLocation("uColor") as WebGLUniformLocation;
    this.viewProjectionMatrixUniform = this.shader.getUniformLocation("viewProjectionMatrix") as WebGLUniformLocation;

    this.matrixData = new Float32Array(count * 16);
    this.matrixBuffer = this.gl.createBuffer() as WebGLBuffer;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.matrixBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.matrixData.byteLength, this.gl.DYNAMIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
  }

  public render(positions: vector3[], color: color4, viewProjectionMatrix: mat4){
    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniform4fv(this.colorUniform, color);
    this.gl.uniformMatrix4fv(this.viewProjectionMatrixUniform, false, viewProjectionMatrix);

    this.indices.bindToAttribute();

    // upload the new matrix data
    for (let i = 0; i < this.count; ++i) {
      const offset = i * 16;
      mat4.fromTranslation(this.matrixData.subarray(offset, offset + 16) as mat4, positions[i]);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.matrixBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.matrixData);

    const bytesPerMatrix = 4 * 16;
    for (let i = 0; i < 4; ++i) {
      const loc = this.matrixAttribute + i;
      this.gl.enableVertexAttribArray(loc);
      // note the stride and offset
      const offset = i * 16;  // 4 floats per row, 4 bytes per float
      this.gl.vertexAttribPointer(
        loc,              // location
        4,                // size (num values to pull from buffer per iteration)
        this.gl.FLOAT,    // type of data in buffer
        false,            // normalize
        bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
        offset,           // offset in buffer
      );
      // this line says this attribute only changes for each 1 instance
      this.gl.vertexAttribDivisor(loc, 1);
    }

    this.vertices.bindToAttribute(this.vertexPositionAttribute);
    this.gl.drawArraysInstanced(
      this.mode,                 // GL Fan, strip, etc.
      0,                         // offset
      this.vertices.getLength(), // num vertices per instance
      this.count,                // num instances
    );
    this.indices.unbindFromAttribute();
    this.vertices.unbindFromAttribute(this.vertexPositionAttribute);
    for (let i = 0; i < 4; ++i) {
      this.gl.vertexAttribDivisor(this.matrixAttribute + i, 0);
    }
  }

  public destroy(){
    this.shader.destroy();
    this.gl.deleteBuffer(this.matrixBuffer);
  }
}
