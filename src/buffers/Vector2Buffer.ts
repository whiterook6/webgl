import {vector3} from "../types";
import {FloatBuffer} from "./FloatBuffer";

export class Vector2Buffer extends FloatBuffer {
  constructor(
    gl: WebGL2RenderingContext,
    vectors: [number, number][],
    mode: number = gl.STATIC_DRAW
  ) {
    super(gl, vectors.flat(1), 2, mode);
  }

  public getWidth() {
    return 2;
  }

  public updateVectors(newVectors: [number, number][], offset: number = 0) {
    this.update(newVectors.flat(1));
  }
}
