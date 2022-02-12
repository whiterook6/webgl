import {mat4} from "gl-matrix";
import {Buffer} from ".";

export class MatrixBuffer extends Buffer {
  private readonly f32Array: Float32Array;
  private readonly matrices: mat4[];

  constructor(gl: WebGL2RenderingContext, count: number, mode: number = gl.DYNAMIC_DRAW) {
    super(gl);
    this.f32Array = new Float32Array(count * 16);
    this.matrices = new Array<mat4>(count);
    for (let i = 0; i < count; i++) {
      this.matrices[i] = new Float32Array(this.f32Array.buffer, i * 16 * 4, 16) as mat4;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, count * 16 * 4, mode);
  }

  public getMatrices(): mat4[] {
    return this.matrices.slice();
  }

  public update() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.f32Array);
  }
}
