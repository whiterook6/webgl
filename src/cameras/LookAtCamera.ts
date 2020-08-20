import {vector3, Vector3} from "../Vector3";
import {mat4} from "gl-matrix";
import {Camera} from "./Camera";

export class LookAtCamera extends Camera {
  private position: vector3;
  private forward: vector3;
  private up: vector3;

  constructor() {
    super();
    this.position = [0, 0, 0];
    this.forward = [0, 0, 0];
    this.up = [0, 1, 0];
  }

  public setPosition(position: vector3) {
    this.position = position;
  }

  public setForward(forward: vector3) {
    this.forward = Vector3.normalize(forward);
  }

  public setTarget(target: vector3) {
    this.forward = Vector3.normalize(Vector3.subtract(target, this.position));
  }

  public setUp(up: vector3) {
    this.up = Vector3.normalize(up);
  }

  public getViewMatrix() {
    const {position, forward} = this;
    const right = Vector3.normalize(Vector3.cross(forward, this.up));
    const up = Vector3.normalize(Vector3.cross(forward, right));

    const lookAt = mat4.create();
    mat4.lookAt(lookAt, position, forward, up);
    return lookAt;
  }

  public toString() {
    return `Pos: ${this.position}  Fwd: ${this.forward} Up: ${this.up}`;
  }
}
