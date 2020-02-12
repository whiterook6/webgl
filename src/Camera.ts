import { Vector3 } from "./Vector3";
import { mat4 } from "gl-matrix";

export abstract class Camera {
  public abstract getViewMatrix(): mat4;
}

export class LookAtCamera extends Camera {
  private position: Vector3;
  private forward: Vector3;
  private up: Vector3;

  constructor(){
    super();
    this.position = new Vector3(0, -10, 0);
    this.forward = new Vector3(0, 1, 0);
    this.up = new Vector3(0, 0, 1);
  }

  public setPosition(position: Vector3){
    this.position = position;
  }

  public setForward(forward: Vector3){
    this.forward = forward.normalize();
  }

  public setTarget(target: Vector3){
    this.forward = target.minus(this.position).unit();
  }

  public setUp(up: Vector3){
    this.up = up.normalize();
  }

  public getViewMatrix(){
    const position = this.position;
    const forward = this.forward.normalize();
    const right = forward.cross(this.up).normalize();
    const up = right.cross(forward).normalize();

    const lookAt = mat4.create();
    mat4.lookAt(lookAt, position.toArray(), [0, 0, -6], up.toArray());
    return lookAt;
  }
}

export abstract class Lens {
  public abstract getProjection(): mat4;
}

export class PerspectiveLens extends Lens {
  public fieldOfView: number = 45 * Math.PI / 180;
  public aspect: number = 1;
  public zNear: number = 0.00001;
  public zFar: number = 1000.0;

  public getProjection(){
    const matrix = mat4.create();
    mat4.perspective(matrix, this.fieldOfView, this.aspect, this.zNear, this.zFar);

    return matrix;
  }
}
