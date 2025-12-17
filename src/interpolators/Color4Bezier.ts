import {color4} from "../types";
import {Bezier} from "./";

export class Color4Bezier {
  private readonly rCurve: Bezier;
  private readonly gCurve: Bezier;
  private readonly bCurve: Bezier;
  private readonly aCurve: Bezier;

  constructor(a: color4, b: color4, c: color4, d: color4) {
    this.rCurve = new Bezier([a[0], b[0], c[0], d[0]]);
    this.gCurve = new Bezier([a[1], b[1], c[1], d[1]]);
    this.bCurve = new Bezier([a[2], b[2], c[2], d[2]]);
    this.aCurve = new Bezier([a[3], b[3], c[3], d[3]]);
  }

  public get = (t: number): color4 => {
    return [this.rCurve.get(t), this.gCurve.get(t), this.bCurve.get(t), this.aCurve.get(t)];
  };
}
