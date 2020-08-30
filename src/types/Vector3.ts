import {epsilon} from ".";

export type vector3 = [number, number, number];

export class Vector3 {
  public static add = (v1: vector3, v2: vector3): vector3 => {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
  };

  /**
   * Get the angle between two vectors in radians
   */
  public static angleBetween = (v1: vector3, v2: vector3): number => {
    return Math.acos(Vector3.dot(v1, v2) / (Vector3.len(v1) * Vector3.len(v2)));
  };

  /**
   * Return a new Vector that is bounded by min and max: min.x <= this.x <= max.x, etc.
   */
  public static bound = (min: vector3, max: vector3, v: vector3): vector3 => {
    return [
      Math.max(min[0], Math.min(max[0], v[0])),
      Math.max(min[1], Math.min(max[1], v[1])),
      Math.max(min[2], Math.min(max[2], v[2])),
    ];
  };

  /**
   * Clone this vector
   */
  public static clone = (v: vector3): vector3 => {
    return [v[0], v[1], v[2]];
  };

  /**
   * Get the cross product (using the right hand rule) of two vectors.
   */
  public static cross = (v1: vector3, v2: vector3): vector3 => {
    return [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0],
    ];
  };

  /**
   * Get the dot product of this and another vector.
   */
  public static dot = (v1: vector3, v2: vector3): number => {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  };

  /**
   * Test for equality between this and another vector. Uses Vector3.epsilon as a bounding box.
   */
  public static equals = (v1: vector3, v2: vector3): boolean => {
    return (
      Math.abs(v1[0] - v2[0]) < epsilon &&
      Math.abs(v1[1] - v2[1]) < epsilon &&
      Math.abs(v1[2] - v2[2]) < epsilon
    );
  };

  /**
   * Returns the horizontal angle (eg around the up axis) for a vector.
   */
  public static getPhi = (v: vector3): number => {
    return Math.asin(v[1] / Vector3.len(v));
  };

  /**
   * Returns the vertical angle (eg around the x axis) for a vector.
   */
  public static getTheta = (v: vector3): number => {
    return Math.atan2(v[2], v[0]);
  };

  /**
   * Returns the Euclidean distance from the origin to this point.
   */
  public static len = (v: vector3): number => {
    return Math.sqrt(Vector3.dot(v, v));
  };

  /**
   * Returns the negative of this vector: [-x, -y, -z]
   */
  public static negative = (v: vector3): vector3 => {
    return [-v[0], -v[1], -v[2]];
  };

  /**
   * Alias for Unit
   */
  public static normalize = (v: vector3): vector3 => {
    return Vector3.unit(v);
  };

  /**
   * Returns this vector's values scaled by scale: [x * scale, y * scale, z * scale]
   */
  public static scale = (v: vector3, scale: number): vector3 => {
    return [v[0] * scale, v[1] * scale, v[2] * scale];
  };

  /**
   * Returns a new vector by subtracting v2 from v1.
   */
  public static subtract = (v1: vector3, v2: vector3): vector3 => {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
  };

  /**
   * Prints when using string interpolation: `Vector: ${vector}`
   */
  public static toString = (v: vector3): string => {
    const [a, b, c] = v;
    return `[${a.toFixed(3)}, ${b.toFixed(2)}, ${c.toFixed(2)}]`;
  };

  /**
   * Returns another vector with length 1 "pointing" in the same direction as this one.
   */
  public static unit = (v: vector3): vector3 => {
    const length = Vector3.len(v);
    if (Math.abs(length) < epsilon) {
      return [1, 0, 0];
    } else {
      return Vector3.scale(v, 1.0 / length);
    }
  };

  /**
   * Returns an up vector from a forward vector and a right vector.
   */
  public static up = (forward: vector3, right: vector3): vector3 => {
    return Vector3.scale(
      Vector3.cross(Vector3.cross(forward, right), forward),
      Vector3.len(forward)
    );
  };

  /**
   * Returns mixing of the two vectors by the given amount.
   * @param mix How much of the right vector is in the mix.
   *  0.0 => 100% left;
   *  1.0 => 100% right;
   *  0.5 => 50% left, 50% right
   */
  public static lerp = (left: vector3, right: vector3, mix: number): vector3 => {
    return [
      (1.0 - mix) * left[0] + mix * right[0],
      (1.0 - mix) * left[1] + mix * right[1],
      (1.0 - mix) * left[2] + mix * right[2],
    ];
  };

  /**
   * Returns a unit vector pointing along the x axis.
   */
  public static x = (): vector3 => {
    return [1, 0, 0];
  };

  /**
   * Returns a unit vector pointing along the y axis.
   */
  public static y = (): vector3 => {
    return [0, 1, 0];
  };

  /**
   * Returns a unit vector pointing along the z axis.
   */
  public static z = (): vector3 => {
    return [0, 0, 1];
  };

  public static fromPolar = (theta: number, phi: number, length: number = 1): vector3 => {
    if (length < epsilon) {
      return [0, 0, 0];
    }

    const sinPhi = Math.sin(phi);
    return [
      length * sinPhi * Math.cos(theta),
      length * sinPhi * Math.sin(theta),
      length * Math.cos(phi),
    ];
  };
}
