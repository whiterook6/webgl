import {vector3, ray, epsilon} from "./";
import {Vector3} from "./Vector3";
import {Ray} from "./Ray";

export type plane = {
  origin: vector3;
  normal: vector3;
};

export class Plane {
  public static getIntersection = (p: plane, r: ray): vector3 | null => {
    const lineDirection = Ray.direction(r); // already normalized
    const normalDotDirection = Vector3.dot(p.normal, lineDirection);
    if (normalDotDirection < epsilon) {
      return null;
    }

    const distance =
      (Vector3.dot(p.normal, p.origin) - Vector3.dot(p.normal, r.start)) / normalDotDirection;
    return Ray.traverse(r, distance);
  };
}
