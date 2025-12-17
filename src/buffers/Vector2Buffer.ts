import {FloatBuffer} from "./FloatBuffer";

export class Vector2Buffer extends FloatBuffer {
  constructor(
    gl: WebGL2RenderingContext,
    vectors: [number, number][] | Float32Array,
    mode: number = gl.STATIC_DRAW
  ) {
    super(gl, Array.isArray(vectors) ? vectors.flat(1) : vectors, 2, mode);
  }

  public getWidth() {
    return 2;
  }

  public updateVectors(newVectors: [number, number][] | Float32Array, offset: number = 0) {
    if (Array.isArray(newVectors)) {
      this.update(newVectors.flat(1));
    } else {
      this.update(newVectors, offset);
    }
  }
}
