import {vector3, Vector3} from "../types";
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

  public getPosition(): vector3 {
    return Vector3.clone(this.position);
  }

  public setForward(forward: vector3) {
    this.forward = Vector3.normalize(forward);
  }

  public getForward(): vector3 {
    return Vector3.clone(this.forward);
  }

  public setTarget(target: vector3) {
    this.forward = Vector3.normalize(Vector3.subtract(target, this.position));
  }

  public getTarget(): vector3 {
    return Vector3.add(this.position, this.forward);
  }

  public setUp(up: vector3) {
    this.up = Vector3.normalize(up);
  }

  public getUp(): vector3 {
    return Vector3.clone(this.up);
  }

  public getViewMatrix() {
    const {position, forward} = this;
    const right = Vector3.normalize(Vector3.cross(forward, this.up));
    const up = Vector3.normalize(Vector3.cross(forward, right));

    const lookAt = mat4.create();
    mat4.lookAt(lookAt, position, forward, up);
    return lookAt;
  }

  public getFacingMatrix(target: vector3): mat4 {
    const matrix = mat4.create();
    mat4.targetTo(matrix, target, this.getPosition(), this.getUp());
    return matrix;
  }

  public toString() {
    return `Pos: ${this.position}  Fwd: ${this.forward} Up: ${this.up}`;
  }
}
