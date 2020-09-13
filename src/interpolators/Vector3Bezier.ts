import {Vector3, vector3, epsilon} from "../types";
import {Bezier} from "./";
import {mat4, quat, vec3} from "gl-matrix";

export type frenetFrame = {
  forward: vector3;
  up: vector3;
  right: vector3;
};

export class Vector3Bezier {
  private readonly xCurve: Bezier;
  private readonly yCurve: Bezier;
  private readonly zCurve: Bezier;

  /**
   * Used to get T from distance. centilengths[T] = distance at T.
   * @see getT(distance: number)
   */
  private centilengths!: number[];

  /**
   * quaternions rotation by T. Uses rotation minimizing frames
   * @see getFrame(t: number)
   */
  private frames!: mat4[];

  constructor(a: vector3, b: vector3, c: vector3, d: vector3) {
    this.xCurve = new Bezier([a[0], b[0], c[0], d[0]]);
    this.yCurve = new Bezier([a[1], b[1], c[1], d[1]]);
    this.zCurve = new Bezier([a[2], b[2], c[2], d[2]]);

    this.generateLookups();
  }

  public getNodes(): [vector3, vector3, vector3, vector3] {
    const xNodes = this.xCurve.getNodes();
    const yNodes = this.yCurve.getNodes();
    const zNodes = this.zCurve.getNodes();
    return [
      [xNodes[0], yNodes[0], zNodes[0]],
      [xNodes[1], yNodes[1], zNodes[1]],
      [xNodes[2], yNodes[2], zNodes[2]],
      [xNodes[3], yNodes[3], zNodes[3]],
    ];
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

  public getTangent(t: number): vector3 {
    return Vector3.normalize(this.getVelocity(t));
  }

  public getAcceleration(t: number): vector3 {
    return [
      this.xCurve.getSecondDerivative(t),
      this.yCurve.getSecondDerivative(t),
      this.zCurve.getSecondDerivative(t),
    ];
  }

  public getLength(): number {
    if (this.centilengths.length > 0) {
      return this.centilengths[this.centilengths.length - 1];
    } else {
      return 0;
    }
  }

  public getDistance(t: number): number {
    if (t <= 0) {
      return 0;
    } else if (t >= 1) {
      return this.getLength();
    } else {
      const left = Math.min(this.centilengths.length - 2, Math.floor(this.centilengths.length * t));
      const right = left + 1;
      const mix = t * this.centilengths.length - left;

      return this.centilengths[left] * (1 - mix) + this.centilengths[right] * mix;
    }
  }

  public getT(distance: number): number {
    if (distance < epsilon) {
      return 0;
    } else if (distance > this.getLength()) {
      return 1;
    }

    let low = 0;
    let high = this.centilengths.length - 1;
    let iterations = 0;
    let middle = 0;
    const maxIterations = 7;

    while (low < high - 1 && iterations < maxIterations) {
      middle = Math.floor((low + high) / 2);
      const centilength = this.centilengths[middle];

      if (Math.abs(centilength - distance) < epsilon) {
        return middle / this.centilengths.length;
      } else if (distance > centilength) {
        low = middle;
        iterations++;
      } else {
        high = middle;
        iterations++;
      }
    }

    const m =
      (distance - this.centilengths[low]) / (this.centilengths[high] - this.centilengths[low]);
    const t = (low + m) / this.centilengths.length;
    return t;
  }

  public getFrenetFrame(t: number): frenetFrame {
    const forward = this.getTangent(t);
    const acc = this.getAcceleration(t);
    let up;
    let right;
    if (Vector3.mag(acc) > epsilon) {
      const b = Vector3.add(forward, acc);
      const r = Vector3.normalize(Vector3.cross(b, forward));
      up = Vector3.normalize(Vector3.cross(r, forward));
      right = Vector3.cross(forward, up);
    } else {
      const zUp = Vector3.z();
      right = Vector3.normalize(Vector3.cross(forward, zUp));
      up = Vector3.normalize(Vector3.cross(right, forward));
    }

    return {
      forward,
      right,
      up,
    };
  }

  public getMatrix(t: number): mat4 {
    if (t <= 0) {
      return this.frames[0];
    } else if (t >= 1) {
      return this.frames[this.frames.length - 1];
    } else {
      return this.frames[Math.floor(this.frames.length * t)];
    }
  }

  private generateLookups() {
    let length: number = 0;
    let previousPosition: vector3 = this.getPosition(0);
    this.centilengths = new Array<number>(101);
    this.centilengths[0] = 0;

    this.frames = new Array<mat4>(101);
    const frame = this.getFrenetFrame(0);
    let previousUp: vector3 = frame.up;
    this.frames[0] = mat4.create();
    mat4.targetTo(
      this.frames[0],
      previousPosition,
      Vector3.add(previousPosition, frame.forward),
      previousUp
    );

    for (let i = 1; i <= 100; i++) {
      const t = i / 100;
      const position = this.getPosition(t);
      length += Vector3.mag(Vector3.subtract(previousPosition, position));
      this.centilengths[i] = length;

      const forward = this.getTangent(t);
      const right = Vector3.cross(forward, previousUp);
      const up = Vector3.cross(right, forward);

      this.frames[i] = mat4.create();
      mat4.targetTo(this.frames[i], position, Vector3.add(position, forward), up);
      previousUp = up;
      previousPosition = position;
    }
  }

  public toString() {
    return `${this.xCurve}\n${this.yCurve},${this.zCurve}`;
  }
}
