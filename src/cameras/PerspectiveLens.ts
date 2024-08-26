import {Lens} from "./Lens";
import {mat4} from "gl-matrix";

export class PerspectiveLens extends Lens {
  public aspect: number;
  public fieldOfView: number;
  public zNear: number;
  public zFar: number;

  constructor(aspect: number = 1, fieldOfView: number = (45 * Math.PI) / 180, zNear: number = 0.1, zFar: number = 100.0) {
    super();
    this.aspect = aspect;
    this.fieldOfView = fieldOfView;
    this.zNear = zNear;
    this.zFar = zFar;
  }

  public getProjection(destination?: mat4): mat4 {
    if (destination) {
      return mat4.perspective(destination, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    } else {
      const matrix = mat4.create();
      return mat4.perspective(matrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);
    }
  }
}
