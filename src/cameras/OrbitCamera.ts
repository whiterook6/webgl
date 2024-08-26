import {mat4} from "gl-matrix";
import {Vector3, vector3} from "../types";
import {Camera} from "./Camera";

export class OrbitCamera extends Camera {
  private theta: number; // angle between x-y plane and line
  private phi: number; // angle around x-z plane
  private distance: number;
  private target: vector3;
  private up: vector3;

  constructor() {
    super();
    this.theta = 0;
    this.phi = 0;
    this.distance = 1;
    this.target = [0, 0, 0];
    this.up = [0, 1, 0];
  }

  public getPosition(): vector3 {
    const {theta, phi, distance, target} = this;

    return [
      target[0] + distance * Math.cos(theta) * Math.cos(phi),
      target[1] + distance * Math.cos(theta) * Math.sin(phi),
      target[2] + distance * Math.sin(theta),
    ];
  }

  public getForward(): vector3 {
    const {theta, phi} = this;

    return [Math.cos(theta) * Math.cos(phi), Math.cos(theta) * Math.sin(phi), Math.sin(theta)];
  }

  public getUp(): vector3 {
    return Vector3.clone(this.up);
  }

  public getViewMatrix(): mat4 {
    const {target, up} = this;
    const position = this.getPosition();

    const viewMatrix = mat4.create();
    return mat4.lookAt(viewMatrix, position, target, up);
  }

  public getFacingMatrix(target: vector3) {
    const {up} = this;
    const position = this.getPosition();

    const matrix = mat4.create();
    mat4.targetTo(matrix, target, position, up);
    return matrix;
  }

  /**
   * @param theta Angle between x-z plane and line
   */
  public setTheta(theta: number) {
    const ninetyDeg = Math.PI / 2;
    this.theta = Math.max(Math.min(ninetyDeg, theta), -ninetyDeg);
    // calculate the up vector
    const forward = this.getForward();
    const right = Vector3.normalize(
      Vector3.cross(
        forward,
        this.up
      )
    );
    this.up = Vector3.normalize(
      Vector3.cross(
        right,
        forward
      )
    );
  }

  /**
   * @param deltaTheta Angle between x-z plane and line
   */
  public moveTheta(deltaTheta: number) {
    this.setTheta(deltaTheta + this.theta);
  }

  public getTheta() {
    return this.theta;
  }

  /**
   * @param phi Angle along x-z plane
   */
  public setPhi(phi: number) {
    this.phi = phi % (2 * Math.PI);
  }

  /**
   * @param deltaPhi Angle along x-z plane
   */
  public movePhi = (deltaPhi: number) => {
    this.setPhi(deltaPhi + this.phi);
  };

  public getPhi() {
    return this.phi;
  }

  public setDistance(distance: number) {
    this.distance = Math.max(0, distance);
  }

  public getDistance() {
    return this.distance;
  }

  public setTarget(target: vector3) {
    this.target = Vector3.clone(target);
  }

  public setUp(up: vector3) {
    this.up = Vector3.normalize(up);
  }
}
