import {FloatBuffer} from "./FloatBuffer";
import {vector3} from "../Vector3";

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
