import {Vector3Bezier} from "../interpolators";
import {Vector3Path} from "../interpolators/Vector3Path";
import {vector3, Vector3} from "../types";

const G: vector3 = [0, 0, -9.8];

export class BezierPhysicsVerlet {
  private readonly path: Vector3Path;
  private t: number;
  private distance: number;
  private previousT: number;
  private previousDistance: number;
  private previousDTSeconds: number;

  constructor(path: Vector3Path) {
    this.path = path;
    this.distance = 0;
    this.previousDistance = 0;
    this.previousDTSeconds = 0.016;
    this.previousT = 0;
    this.t = 0;
  }

  public update = (dtSeconds: number) => {
    const {path, distance, previousDistance, previousDTSeconds, t} = this;

    const pathAtT = Vector3.normalize(path.getVelocity(t));
    const forceAlongPath = Vector3.project(pathAtT, G);
    const forceMagnitude = Vector3.mag(forceAlongPath);
    const acceleration = forceMagnitude * dtSeconds * ((dtSeconds + previousDTSeconds) / 2);

    let newDistance;
    if (pathAtT[2] < 0) {
      // if track is descending
      newDistance =
        distance + (distance - previousDistance) * (dtSeconds / previousDTSeconds) + acceleration;
    } else {
      // if track is ascending
      newDistance =
        distance + (distance - previousDistance) * (dtSeconds / previousDTSeconds) - acceleration;
    }

    const newT = path.getT(newDistance);

    if (newT >= path.getMaxT()) {
      this.distance = 0;
      this.previousDistance = 0;
      this.t = 0;
    } else {
      this.distance = newDistance;
      this.previousDistance = distance;
      this.t = newT;
    }

    this.previousT = t;
    this.previousDTSeconds = dtSeconds;
  };

  public getPosition = (): vector3 => {
    const {path, t} = this;

    return path.getPosition(t);
  };

  public getVelocity = (): vector3 => {
    const {path, t, previousDTSeconds, previousT} = this;

    return Vector3.scale(
      Vector3.subtract(path.getPosition(t), path.getPosition(previousT)),
      previousDTSeconds
    );
  };

  public getAcceleration = (): vector3 => {
    return [0, 0, 0];
  };
}
