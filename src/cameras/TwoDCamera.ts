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
  private readonly matrix: mat4;

  constructor(position: vector3 = [0, 0, 0]) {
    super();
    this.position = position;
    this.matrix = mat4.create();
    mat4.fromTranslation(this.matrix, [-position[0], -position[1], -position[2]]);
  }

  public setPosition(position: vector3): void {
    this.position = position;
    mat4.fromTranslation(this.matrix, [-position[0], -position[1], -position[2]]);
  }

  public getViewMatrix(): mat4 {
    return this.matrix;
  }
  
  public getFacingMatrix(target: vector3): mat4 {
    const matrix = mat4.create();
    mat4.fromTranslation(matrix, [-target[0], -target[1], -target[2]]);
    return matrix;
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
