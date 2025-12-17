import {Lens} from "./Lens";
import {mat4} from "gl-matrix";

export class PerspectiveLens extends Lens {
  public fieldOfView: number = (45 * Math.PI) / 180;
  public aspect: number = 1;
  public zNear: number = 0.1;
  public zFar: number = 100.0;

  public getProjection() {
    const matrix = mat4.create();
    mat4.perspective(matrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);

    return matrix;
  }
}
