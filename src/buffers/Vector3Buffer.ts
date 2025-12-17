import {vector3} from "../types";
import {FloatBuffer} from "./FloatBuffer";

export class Vector3Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, vectors: vector3[] | Float32Array, mode: number = gl.STATIC_DRAW) {
    super(gl, Array.isArray(vectors) ? vectors.flat(1) : vectors, 3, mode);
  }

  public getWidth() {
    return 3;
  }

  public updateVectors(newVectors: vector3[] | Float32Array, offset: number = 0) {
    if (Array.isArray(newVectors)) {
      this.update(newVectors.flat(1), offset);
    } else {
      this.update(newVectors, offset);
    }
  }
}
