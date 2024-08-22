import {mat4} from "gl-matrix";
import {Camera} from ".";
import {vector3} from "../types";

/**
 * +X Axis is to the right
 * +Y Axis is up
 * +Z Axis is out of the screen (positive Z hides negative z)
 */
export class TwoDCamera extends Camera {
  private position: vector3;
  private readonly viewMatrix: mat4;

  constructor(position: vector3 = [0, 0, 0]) {
    super();
    this.position = position;
    this.viewMatrix = mat4.create();
    mat4.fromTranslation(this.viewMatrix, [-position[0], -position[1], -position[2]]);
  }

  public setPosition(position: vector3): void {
    this.position = position;
    mat4.fromTranslation(this.viewMatrix, [-position[0], -position[1], -position[2]]);
  }

  public getViewMatrix(destination?: mat4): mat4 {
    if (destination) {
      return mat4.copy(destination, this.viewMatrix);
    } else {
      return mat4.clone(this.viewMatrix);
    }
  }
  
  public getFacingMatrix(target: vector3, destination?: mat4): mat4 {
    if (destination) {
      return mat4.lookAt(destination, this.position, target, [0, 1, 0]);
    } else {
      const matrix = mat4.create();
      return mat4.fromTranslation(matrix, [-target[0], -target[1], -target[2]]);
    }
  }

  public getPosition(): vector3 {
    return this.position;
  }

  public getLeft(): vector3 {
    return [-1, 0, 0];
  }
  
  public getUp(): vector3 {
    return [0, 1, 0];
  }
  
  public getForward(): vector3 {
    return [0, 0, -1];
  }
}
