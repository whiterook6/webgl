import {mat4} from "gl-matrix";
import {vector3} from "../Vector3";

export abstract class Camera {
  public abstract getViewMatrix(): mat4;

  public static unproject(
    projected: vector3,
    viewport: [number, number, number, number],
    projViewMatrix: mat4
  ): vector3 {
    const [viewX, viewY, viewWidth, viewHeight] = viewport;
    let [x, y, z] = projected;

    // offsets from viewport, and flipping Y
    x = x - viewX;
    y = viewHeight - y - 1;
    y = y - viewY;

    // normalize to clip space: from 0 -> 1024 and 0 -> 768, for example, to -1 -> 1 for X and Y
    x = (2 * x) / viewWidth - 1;
    y = (2 * y) / viewHeight - 1;
    z = 2 * z - 1;

    // get inverted projection view matrix
    const invertedMatrix = mat4.create();
    mat4.invert(invertedMatrix, projViewMatrix);

    // To be honest, this is witchcraft. Go team?
    const [
      a00,
      a01,
      a02,
      a03,
      a10,
      a11,
      a12,
      a13,
      a20,
      a21,
      a22,
      a23,
      a30,
      a31,
      a32,
      a33,
    ] = invertedMatrix;

    // get W factor
    const lw = 1 / (x * a03 + y * a13 + z * a23 + a33);

    // unproject
    return [
      (x * a00 + y * a10 + z * a20 + a30) * lw,
      (x * a01 + y * a11 + z * a21 + a31) * lw,
      (x * a02 + y * a12 + z * a22 + a32) * lw,
    ];
  }
}
