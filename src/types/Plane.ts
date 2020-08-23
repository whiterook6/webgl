import {epsilon, ray, Ray, vector3, Vector3} from "./";

export type plane = {
  origin: vector3;
  normal: vector3;
};

export class Plane {
  public static up = (origin: vector3 = [0, 0, 0]) => {
    return {
      origin,
      normal: [0, 0, 1],
    };
  };

  public static down = (origin: vector3 = [0, 0, 0]): plane => {
    return {
      origin,
      normal: [0, 0, -1],
    };
  };

  public static left = (origin: vector3 = [0, 0, 0]): plane => {
    return {
      origin,
      normal: [0, -1, 0],
    };
  };

  public static right = (origin: vector3 = [0, 0, 0]): plane => {
    return {
      origin,
      normal: [0, 1, 0],
    };
  };

  public static in = (origin: vector3 = [0, 0, 0]): plane => {
    return {
      origin,
      normal: [1, 0, 0],
    };
  };

  public static out = (origin: vector3 = [0, 0, 0]): plane => {
    return {
      origin,
      normal: [-1, 0, 0],
    };
  };

  public static getIntersection = (p: plane, r: ray): vector3 | null => {
    const lineDirection = Ray.direction(r); // already normalized
    const normalDotDirection = Vector3.dot(p.normal, lineDirection);
    if (Math.abs(normalDotDirection) < epsilon) {
      return null;
    }

    const distance =
      (Vector3.dot(p.normal, p.origin) - Vector3.dot(p.normal, r.start)) / normalDotDirection;
    const traverse = Ray.traverse(r, distance);
    return traverse;
  };
}
