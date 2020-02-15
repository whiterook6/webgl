import { Vector3 } from "../Vector3";
import { mat4 } from "gl-matrix";
import { Camera } from "./Camera";

export class LookAtCamera extends Camera {
  private position: Vector3;
  private forward: Vector3;
  private up: Vector3;

  constructor(){
    super();
    this.position = new Vector3(0, 0, 0);
    this.forward = new Vector3(0, 0, 0);
    this.up = new Vector3(0, 0, 0);
  }

  public setPosition(position: Vector3){
    this.position = position;
  }

  public setForward(forward: Vector3){
    this.forward = forward.normalize();
  }

  public setTarget(target: Vector3){
    this.forward = target.minus(this.position).normalize();
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
    mat4.lookAt(lookAt, position.toArray(), forward.toArray(), up.toArray());
    return lookAt;
  }

  public toString(){
    return `Pos: ${JSON.stringify(this.position)}  Fwd: ${JSON.stringify(this.forward)} Up: ${JSON.stringify(this.up)}`;
  }
};
