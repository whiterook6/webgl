import {Camera} from "./Camera";
import {mat4} from "gl-matrix";
import {Vector3} from "../Vector3";

export class OrbitCamera extends Camera {
  private theta: number; // angle between x-y plane and line
  private phi: number; // angle around x-z plane
  private distance: number;
  private target: Vector3;
  private up: Vector3;

  constructor() {
    super();
    this.theta = 0;
    this.phi = 0;
    this.distance = 1;
    this.target = new Vector3(0, 0, 0);
    this.up = new Vector3([0, 1, 0]);
  }

  public getPosition(): Vector3 {
    const {theta, phi, distance, target} = this;

    return new Vector3([
      target.x() + distance * Math.cos(theta) * Math.cos(phi),
      target.y() + distance * Math.sin(theta),
      target.z() + distance * Math.cos(theta) * Math.sin(phi),
    ]);
  }

  public getViewMatrix(): mat4 {
    const {target, up} = this;

    const position = this.getPosition();

    const viewMatrix = mat4.create();
    return mat4.lookAt(viewMatrix, position.toArray(), target.toArray(), up.toArray());
  }

  /**
   * @param theta Angle between x-z plane and line
   */
  public setTheta(theta: number) {
    const ninetyDeg = Math.PI / 2;
    this.theta = Math.max(Math.min(ninetyDeg, theta), -ninetyDeg);
  }

  /**
   * @param phi Angle along x-z plane
   */
  public setPhi(phi: number) {
    this.phi = phi % (2 * Math.PI);
  }

  public setDistance(distance: number) {
    this.distance = Math.max(0, distance);
  }

  public setTarget(target: Vector3) {
    this.target = target;
  }

  public setUp(up: Vector3) {
    this.up = up;
  }
}
