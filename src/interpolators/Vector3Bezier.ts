import {Vector3, vector3} from "../types";
import {Bezier} from "./";

export class Vector3Bezier {
  private readonly xCurve: Bezier;
  private readonly yCurve: Bezier;
  private readonly zCurve: Bezier;

  constructor(a: vector3, b: vector3, c: vector3, d: vector3) {
    this.xCurve = new Bezier([a[0], b[0], c[0], d[0]]);
    this.yCurve = new Bezier([a[1], b[1], c[1], d[1]]);
    this.zCurve = new Bezier([a[2], b[2], c[2], d[2]]);
  }

  public getPosition(t: number): vector3 {
    return [this.xCurve.get(t), this.yCurve.get(t), this.zCurve.get(t)];
  }

  public getVelocity(t: number): vector3 {
    return [
      this.xCurve.getDerivative(t),
      this.yCurve.getDerivative(t),
      this.zCurve.getDerivative(t),
    ];
  }

  public getAcceleration(t: number): vector3 {
    return [
      this.xCurve.getSecondDerivative(t),
      this.yCurve.getSecondDerivative(t),
      this.zCurve.getSecondDerivative(t),
    ];
  }

  /**
   * Prints when using string interpolation: `Curve: ${bezier}`
   */
  public toString() {
    return `${this.xCurve}\n${this.yCurve},${this.zCurve}`;
  }

  public static createFromMotion(
    initialPosition: vector3,
    initialVelocity: vector3,
    finalPosition: vector3,
    finalVelocity: vector3
  ) {
    return new Vector3Bezier(
      initialPosition,
      Vector3.add(initialPosition, Vector3.scale(initialVelocity, 1 / 3)),
      Vector3.subtract(finalPosition, Vector3.scale(finalVelocity, 1 / 3)),
      finalPosition
    );
  }
}
