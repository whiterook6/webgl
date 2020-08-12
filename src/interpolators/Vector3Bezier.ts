import {Bezier} from "./";
import {Vector3} from "../Vector3";

export class Vector3Bezier {
  private readonly xCurve: Bezier;
  private readonly yCurve: Bezier;
  private readonly zCurve: Bezier;

  constructor(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
    this.xCurve = new Bezier([a.x(), b.x(), c.x(), d.x()]);
    this.yCurve = new Bezier([a.y(), b.y(), c.y(), d.y()]);
    this.zCurve = new Bezier([a.z(), b.z(), c.z(), d.z()]);
  }

  public getPosition(t: number) {
    return new Vector3([this.xCurve.get(t), this.yCurve.get(t), this.zCurve.get(t)]);
  }

  public getVelocity(t: number) {
    return new Vector3([
      this.xCurve.getDerivative(t),
      this.yCurve.getDerivative(t),
      this.zCurve.getDerivative(t),
    ]);
  }

  public getAcceleration(t: number) {
    return new Vector3([
      this.xCurve.getSecondDerivative(t),
      this.yCurve.getSecondDerivative(t),
      this.zCurve.getSecondDerivative(t),
    ]);
  }

  /**
   * Prints when using string interpolation: `Curve: ${bezier}`
   */
  public toString() {
    return `${this.xCurve}\n${this.yCurve},${this.zCurve}`;
  }

  public static createFromMotion(
    initialPosition: Vector3,
    initialVelocity: Vector3,
    finalPosition: Vector3,
    finalVelocity: Vector3
  ) {
    return new Vector3Bezier(
      initialPosition,
      initialPosition.plus(initialVelocity.scale(1 / 3)),
      finalPosition.minus(finalVelocity.scale(1 / 3)),
      finalPosition
    );
  }
}
