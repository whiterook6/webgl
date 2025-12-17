import {mat4} from "gl-matrix";
import {vector3, ray} from "../types";

export abstract class Camera {
  public abstract getFacingMatrix(target: vector3): mat4;
  public abstract getForward(): vector3;
  public abstract getPosition(): vector3;
  public abstract getUp(): vector3;
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

  public static unprojectRay(
    screenPosition: [number, number],
    viewport: [number, number, number, number],
    projViewMatrix: mat4
  ): ray {
    const [viewX, viewY, viewWidth, viewHeight] = viewport;
    let [x, y] = screenPosition;

    // offsets from viewport, and flipping Y
    x = x - viewX;
    y = viewHeight - y - 1;
    y = y - viewY;

    // normalize to clip space: from 0 -> 1024 and 0 -> 768, for example, to -1 -> 1 for X and Y
    x = (2 * x) / viewWidth - 1;
    y = (2 * y) / viewHeight - 1;

    const zNear = -1;
    const zFar = 1;

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
    const lwNear = 1 / (x * a03 + y * a13 + zNear * a23 + a33);
    const lwFar = 1 / (x * a03 + y * a13 + zFar * a23 + a33);

    // unproject
    const start: vector3 = [
      (x * a00 + y * a10 + zNear * a20 + a30) * lwNear,
      (x * a01 + y * a11 + zNear * a21 + a31) * lwNear,
      (x * a02 + y * a12 + zNear * a22 + a32) * lwNear,
    ];
    const end: vector3 = [
      (x * a00 + y * a10 + zFar * a20 + a30) * lwFar,
      (x * a01 + y * a11 + zFar * a21 + a31) * lwFar,
      (x * a02 + y * a12 + zFar * a22 + a32) * lwFar,
    ];

    return {
      start,
      end,
    } as ray;
  }
}
