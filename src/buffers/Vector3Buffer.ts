import {vector3} from "../types";
import {FloatBuffer} from "./FloatBuffer";

export class Vector3Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, vectors: vector3[]) {
    super(gl, vectors.flat(1), 3);
  }

  public getWidth() {
    return 3;
  }

  public updateVectors(newVectors: vector3[], offset: number = 0) {
    this.update(newVectors.flat(1));
  }
}
