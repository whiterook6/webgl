import {Vector3Bezier} from "../interpolators";
import {vector3, Vector3} from "../types";

const G: vector3 = [0, -9.8, 0];

export class BezierPhysicsVerlet {
  private readonly bezier: Vector3Bezier;
  private t: number;
  private distance: number;
  private previousT: number;
  private previousDistance: number;
  private previousDTSeconds: number;

  constructor(bezier: Vector3Bezier) {
    this.bezier = bezier;
    this.distance = 0;
    this.previousDistance = 0;
    this.previousDTSeconds = 0.016;
    this.previousT = 0;
    this.t = 0;
  }

  public update = (dtSeconds: number) => {
    const {bezier, distance, previousDistance, previousDTSeconds, t} = this;

    const pathAtT = Vector3.normalize(bezier.getVelocity(t));
    const forceAlongPath = Vector3.project(G, pathAtT);
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

    const newT = bezier.getT(newDistance);

    if (newT >= 1.0) {
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
    const {bezier, t} = this;

    return bezier.getPosition(t);
  };

  public getVelocity = (): vector3 => {
    const {bezier, t, previousDTSeconds, previousT} = this;

    return Vector3.scale(
      Vector3.subtract(bezier.getPosition(t), bezier.getPosition(previousT)),
      previousDTSeconds
    );
  };

  public getAcceleration = (): vector3 => {
    return [0, 0, 0];
  };
}
