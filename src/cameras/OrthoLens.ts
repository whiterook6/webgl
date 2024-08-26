import {mat4} from "gl-matrix";
import {Lens} from ".";

export class OrthoLens extends Lens {
  private readonly matrix: mat4;

  constructor(width: number, height: number, near: number, far: number) {
    super();
    this.matrix = mat4.create();
    mat4.ortho(this.matrix, -width / 2, width / 2, -height / 2, height / 2, near, far);
  }

  public getProjection(destination?: mat4): mat4 {
    if (destination) {
      return mat4.copy(destination, this.matrix);
    } else {
      return mat4.clone(this.matrix);
    }
  }

  public update(width: number, height: number, near: number, far: number): void {
    mat4.ortho(this.matrix, -width / 2, width / 2, -height / 2, height / 2, near, far);
  }
}
