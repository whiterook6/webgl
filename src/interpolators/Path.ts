import {mat4} from "gl-matrix";
import {Vector3, vector3} from "../types";
import {frenetFrame, Vector3Bezier} from "./Vector3Bezier";

export class Path {
  public segments: Vector3Bezier[];

  constructor(segment: Vector3Bezier) {
    this.segments = [segment];
  }

  public addSegment = (translate: vector3, exitTangent: vector3) => {
    const lastSegmentNodes = this.segments[this.segments.length - 1].getNodes();
    const newSegment = new Vector3Bezier(
      lastSegmentNodes[3],
      Vector3.subtract(Vector3.scale(lastSegmentNodes[3], 2), lastSegmentNodes[2]),
      Vector3.subtract(translate, exitTangent),
      translate
    );
    this.segments.push(newSegment);
  };

  public getPosition = (t: number): vector3 => {
    const segment = this.getSegmentByT(t);
    const boundT = this.getSegmentTByT(t);
    return segment.getPosition(boundT);
  };

  public getVelocity = (t: number): vector3 => {
    const segment = this.getSegmentByT(t);
    const boundT = this.getSegmentTByT(t);
    return segment.getVelocity(boundT);
  };

  public getTangent = (t: number): vector3 => {
    const segment = this.getSegmentByT(t);
    const boundT = this.getSegmentTByT(t);
    return segment.getTangent(boundT);
  };

  public getAcceleration = (t: number): vector3 => {
    const segment = this.getSegmentByT(t);
    const boundT = this.getSegmentTByT(t);
    return segment.getAcceleration(boundT);
  };

  public getLength = (): number => {
    return this.segments.reduce((totalLength, current) => {
      return totalLength + current.getLength();
    }, 0);
  };

  public getDistance = (t: number): number => {
    if (t < 0) {
      return 0;
    } else if (t >= this.segments.length) {
      return this.getLength();
    }

    let remainingT = t;
    let index = 0;
    let distance = 0;
    while (remainingT > 1) {
      distance += this.segments[index++].getLength();
      remainingT -= 1;
    }

    return distance + this.segments[index].getDistance(remainingT);
  };

  public getT = (distance: number): number => {
    let remainingDistance = distance;
    for (let index = 0; index < this.segments.length; index++) {
      const segment = this.segments[index];
      const length = segment.getLength();
      if (length > remainingDistance) {
        return index + segment.getT(remainingDistance);
      } else {
        remainingDistance -= length;
      }
    }
    return 1;
  };

  public getFrenetFrame = (t: number): frenetFrame => {
    const segment = this.getSegmentByT(t);
    const boundT = this.getSegmentTByT(t);
    return segment.getFrenetFrame(boundT);
  };

  public getMatrix = (t: number): mat4 => {
    const segment = this.getSegmentByT(t);
    const boundT = this.getSegmentTByT(t);
    return segment.getMatrix(boundT);
  };

  private readonly getSegmentByT = (t: number): Vector3Bezier => {
    if (this.segments.length === 0) {
      throw new Error("No segments in path");
    }

    if (t < 0) {
      return this.segments[0];
    } else if (t >= this.segments.length) {
      return this.segments[this.segments.length - 1];
    } else {
      return this.segments[Math.floor(t)];
    }
  };

  private readonly getSegmentTByT = (t: number): number => {
    if (t < t) {
      return 0;
    } else if (t >= this.segments.length) {
      return 1;
    } else {
      return t % 1;
    }
  };
}
