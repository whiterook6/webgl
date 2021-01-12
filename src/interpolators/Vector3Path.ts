import {Vector3, vector3} from "../types";
import {mat4} from "gl-matrix";
import {Vector3Bezier, frenetFrame} from "./Vector3Bezier";

export class Vector3Path {
  private readonly beziers: Vector3Bezier[];

  constructor(beziers: Vector3Bezier[]) {
    this.beziers = beziers;
  }

  public getMaxT = () => this.beziers.length;

  public getPosition = (t: number): vector3 => {
    const bezier = this.getBezierFromT(t);
    return bezier.getPosition(t % 1);
  };

  public getVelocity = (t: number): vector3 => {
    const bezier = this.getBezierFromT(t);
    return bezier.getVelocity(t % 1);
  };

  public getTangent(t: number): vector3 {
    return Vector3.normalize(this.getVelocity(t));
  }

  public getAcceleration = (t: number): vector3 => {
    const bezier = this.getBezierFromT(t);
    return bezier.getAcceleration(t % 1);
  };

  public getLength = (): number => {
    return this.beziers.reduce((length, bezier) => length + bezier.getLength(), 0);
  };

  public getDistance = (t: number): number => {
    if (t > this.beziers.length) {
      return this.getLength();
    }

    let distance = 0;
    for (let i = 0; i < t; i++) {
      distance += this.beziers[i].getLength();
    }

    return distance + this.getBezierFromT(t).getDistance(t % 1);
  };

  public getT = (distance: number): number => {
    let remainingDistance = distance;
    let bezier;
    let t = 0;
    for (bezier of this.beziers) {
      const length = bezier.getLength();
      if (remainingDistance > length) {
        remainingDistance -= length;
        t++;
        continue;
      }

      return t + bezier.getT(remainingDistance);
    }

    return this.beziers.length;
  };

  public getFrenetFrame = (t: number): frenetFrame => {
    const bezier = this.getBezierFromT(t);
    return bezier.getFrenetFrame(t % 1);
  };

  public getMatrix = (t: number): mat4 => {
    const bezier = this.getBezierFromT(t);
    return bezier.getMatrix(t % 1);
  };

  private readonly getBezierFromT = (t: number): Vector3Bezier => {
    if (t > this.beziers.length) {
      return this.beziers[this.beziers.length - 1];
    }

    return this.beziers[Math.floor(t)];
  };
}
