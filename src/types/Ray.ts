import {vector3, epsilon} from "./";
import {Vector3} from "./Vector3";

export type ray = {
  start: vector3;
  end: vector3;
};

export class Ray {
  /**
   * Gets a point at some mixing of start and end. This is more like percetange than distance along.
   * @param mix How much of end is present. 1.0 => entirely the end point. 0.0 => entirely the start point.
   */
  public static lerp = (r: ray, mix: number): vector3 => {
    return Vector3.lerp(r.start, r.end, mix);
  };

  /**
   * Gets the length of the ray, from start to end. Rays can be considered infinitely long,
   * but this method is the distance between two points.
   */
  public static mag = (r: ray): number => {
    return Vector3.mag(Vector3.subtract(r.end, r.start));
  };

  /**
   * Gets a point at some distance along a ray, from start to end.
   */
  public static traverse = (r: ray, distance: number): vector3 => {
    const length = Ray.mag(r);
    if (length < epsilon) {
      return r.start;
    }

    const mix = distance / length;
    return Ray.lerp(r, mix);
  };

  /**
   * Returns A unit vector representing the direction of the ray, if the ray were moved to 0,0,0
   */
  public static direction = (r: ray): vector3 => {
    return Vector3.normalize(Vector3.subtract(r.end, r.start));
  };
}
