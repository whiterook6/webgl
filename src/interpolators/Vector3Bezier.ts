import {Vector3, vector3, epsilon} from "../types";
import {Bezier} from "./";

export type frenetFrame = {
  forward: vector3;
  up: vector3;
  right: vector3;
};

export class Vector3Bezier {
  private readonly xCurve: Bezier;
  private readonly yCurve: Bezier;
  private readonly zCurve: Bezier;
  private centilengths!: number[];

  constructor(a: vector3, b: vector3, c: vector3, d: vector3) {
    this.xCurve = new Bezier([a[0], b[0], c[0], d[0]]);
    this.yCurve = new Bezier([a[1], b[1], c[1], d[1]]);
    this.zCurve = new Bezier([a[2], b[2], c[2], d[2]]);

    this.calculateCentilengths();
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

  public toString() {
    return `${this.xCurve}\n${this.yCurve},${this.zCurve}`;
  }

  public getLength(): number {
    if (this.centilengths.length > 0) {
      return this.centilengths[this.centilengths.length - 1];
    } else {
      return 0;
    }
  }

  public getT(distance: number): number {
    if (distance < epsilon) {
      return 0;
    } else if (distance > this.getLength()) {
      return 1;
    }

    const maxIterations = 10;
    let low = 0;
    let high = this.centilengths.length - 1;
    let iterations = 0;
    let middle = 0;

    while (low < high && iterations < maxIterations) {
      middle = Math.floor((low + high) / 2);
      const centilength = this.centilengths[middle];

      if (Math.abs(centilength - distance) < epsilon) {
        break;
      } else if (distance > centilength) {
        low = middle + 1;
        iterations++;
      } else {
        high = middle;
        iterations++;
      }
    }

    const t = middle / this.centilengths.length;
    return t;
  }

  public getFrenetFrame(t: number): frenetFrame {
    const forward = Vector3.normalize(this.getVelocity(t));
    const b = Vector3.add(forward, this.getAcceleration(t));
    const right = Vector3.normalize(Vector3.cross(b, forward));
    const up = Vector3.normalize(Vector3.cross(right, forward));
    return {
      forward,
      right,
      up,
    };
  }

  private calculateCentilengths() {
    let length: number = 0;
    let previous: vector3 = this.getPosition(0);
    this.centilengths = [0];

    for (let i = 1; i <= 199; i++) {
      const next = this.getPosition(i / 199);
      length += Vector3.len(Vector3.subtract(previous, next));
      this.centilengths.push(length);
      previous = next;
    }
  }
}
