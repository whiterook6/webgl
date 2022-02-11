import {mat4} from "gl-matrix";
import {Lens} from ".";

export class OrthoLens extends Lens {
  private readonly matrix: mat4;

  constructor(width: number, height: number, near: number, far: number) {
    super();
    this.matrix = mat4.create();
    mat4.ortho(this.matrix, -width / 2, width / 2, -height / 2, height / 2, near, far);
  }

  public getProjection(): mat4 {
    return this.matrix;
  }
}
