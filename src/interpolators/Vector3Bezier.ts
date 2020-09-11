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
  private frames!: quat[];

  constructor(a: vector3, b: vector3, c: vector3, d: vector3) {
    this.xCurve = new Bezier([a[0], b[0], c[0], d[0]]);
    this.yCurve = new Bezier([a[1], b[1], c[1], d[1]]);
    this.zCurve = new Bezier([a[2], b[2], c[2], d[2]]);

    this.generateLookups();
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

  public getLength(): number {
    if (this.centilengths.length > 0) {
      return this.centilengths[this.centilengths.length - 1];
    } else {
      return 0;
    }
  }

  public getDistance(t: number): number {
    if (t <= 0){
      return 0;
    } else if (t>= 1){
      return this.getLength();
    } else {
      const left = Math.min(this.centilengths.length - 2, Math.floor(this.centilengths.length * t));
      const right = left + 1;
      const mix = t * this.centilengths.length - left;

      return this.centilengths[left] * (1 - mix) + this.centilengths[right] * (mix);
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
    const forward = Vector3.normalize(this.getVelocity(t));
    const acc = this.getAcceleration(t);
    let up;
    let right;
    if (Vector3.len(acc) > epsilon) {
      const b = Vector3.add(forward, acc);
      const r = Vector3.normalize(Vector3.cross(b, forward));
      up = Vector3.normalize(Vector3.cross(r, forward));
      right = Vector3.cross(forward, up);
    } else {
      const zUp = Vector3.z();
      right = Vector3.normalize(Vector3.cross(forward, zUp));
      up = Vector3.normalize(Vector3.cross(right, forward));
    }

    console.log(`Angle between forward and right: ${Vector3.angleBetween(forward, right)}`);
    console.log(`Angle between forward and up: ${Vector3.angleBetween(forward, up)}`);
    console.log(`Angle between up and right: ${Vector3.angleBetween(up, right)}`);
    console.log(`forward: ${forward}`);
    console.log(`right: ${right}`);
    console.log(`up: ${up}`);

    return {
      forward,
      right,
      up,
    };
  }

  public getMatrix(t: number): mat4 {
    let quaternion: quat;
    if (t <= 0) {
      quaternion = this.frames[0];
    } else if (t >= 1) {
      quaternion = this.frames[this.frames.length - 1];
    } else {
      const left = Math.min(this.frames.length - 2, Math.floor(this.frames.length * t));
      const right = left + 1;
      const mix = t * this.frames.length - left;
      quaternion = quat.create();
      quat.slerp(quaternion, this.frames[left], this.frames[right], mix);
    }

    const matrix = mat4.create();
    const position = this.getPosition(t);
    mat4.fromRotationTranslation(matrix, quaternion, position);
    return matrix;
  }

  private generateLookups() {
    let length: number = 0;
    let previousPosition: vector3 = this.getPosition(0);
    this.centilengths = new Array<number>(101);
    this.centilengths[0] = 0;

    this.frames = new Array<quat>(101);
    const frame = this.getFrenetFrame(0);
    let previousForward: vector3 = frame.forward;
    let previousRight: vector3 = frame.right;
    this.frames[0] = quat.create();
    quat.setAxes(this.frames[0], frame.forward, frame.right, frame.up);

    for (let i = 1; i <= 100; i++) {
      const t = i / 100;
      const position = this.getPosition(t);
      length += Vector3.len(Vector3.subtract(previousPosition, position));
      this.centilengths[i] = length;

      // // https://pomax.github.io/bezierinfo/#pointvectors3d
      const forward = Vector3.normalize(this.getVelocity(t));
      const v1 = Vector3.minus(position, previousPosition);
      const c1 = Vector3.dot(v1, v1);
      const riL = Vector3.minus(
        previousRight,
        Vector3.scale(v1, 2 * c1 * Vector3.dot(v1, previousRight))
      );
      const tiL = Vector3.minus(
        previousForward,
        Vector3.scale(v1, 2 * c1 * Vector3.dot(v1, previousForward))
      );

      const v2 = Vector3.minus(forward, tiL);
      const c2 = Vector3.dot(v2, v2);
      const right = Vector3.minus(riL, Vector3.scale(v2, 2 * c2 * Vector3.dot(v2, riL)));
      const up = Vector3.cross(right, forward);

      // const frame: frenetFrame = this.getFrenetFrame(t);

      this.frames[i] = quat.create();
      quat.setAxes(this.frames[i], forward, right, up);
      previousPosition = position;
      previousForward = forward;
      previousRight = right;
    }
  }

  public toString() {
    return `${this.xCurve}\n${this.yCurve},${this.zCurve}`;
  }
}
