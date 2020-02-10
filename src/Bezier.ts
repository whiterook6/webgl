import {Vector3} from "./Vector3";

export class Bezier {
  private readonly nodes: [number, number, number, number];

  constructor(a: [number, number, number, number] | number = 0, b: number = 0, c: number = 0, d: number = 0) {
    if (Array.isArray(a)) {
      this.nodes = a;
    } else {
      this.nodes = [a as number, b!, c!, d!];
    }
  }

  public get(t: number){
    const [p0, p1, p2, p3] = this.nodes;
    
    const t2 = t * t;
    const t3 = t * t * t;

    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt * mt * mt;
    
    return (1 * mt3 * p0)
      + (3 * mt2 * t * p1)
      + (3 * mt * t2 * p2)
      + (1 * t3 * p3);
  }

  public getDerivative(t: number){
    const [p0, p1, p2, p3] = this.nodes;
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return (3 * mt2 * (p1 - p0))
      + (6 * mt * t *(p2 - p1))
      + (3 * t2 * (p3 - p2));
  }

  public getSecondDerivative(t: number) {
    const [p0, p1, p2, p3] = this.nodes;
    const mt = 1 - t;
    return (6 * mt * (p2 - (2 * p1) + p0))
      + (6 * t * (p3 - (2 * p2) + p1));
  }

  /**
   * Prints when using string interpolation: `Curve: ${bezier}`
   */
  public toString() {
    const [a, b, c, d] = this.nodes;
    return `[${a.toFixed(3)}, ${b.toFixed(2)}, ${c.toFixed(2)}, ${d.toFixed(2)}]`;
  }
};

export class Vector3Bezier {
  private readonly xCurve: Bezier;
  private readonly yCurve: Bezier;
  private readonly zCurve: Bezier;

  constructor(a: Vector3, b: Vector3, c: Vector3, d: Vector3){
    this.xCurve = new Bezier([a.x(), b.x(), c.x(), d.x()]);
    this.yCurve = new Bezier([a.y(), b.y(), c.y(), d.y()]);
    this.zCurve = new Bezier([a.z(), b.z(), c.z(), d.z()]);
  }

  public getPosition(t: number){
    return new Vector3([
      this.xCurve.get(t),
      this.yCurve.get(t),
      this.zCurve.get(t),
    ]);
  }

  public getVelocity(t: number){
    return new Vector3([
      this.xCurve.getDerivative(t),
      this.yCurve.getDerivative(t),
      this.zCurve.getDerivative(t),
    ]);
  }

  public getAcceleration(t: number){
    return new Vector3([
      this.xCurve.getSecondDerivative(t),
      this.yCurve.getSecondDerivative(t),
      this.zCurve.getSecondDerivative(t),
    ]);
  }

  /**
   * Prints when using string interpolation: `Curve: ${bezier}`
   */
  public toString(){
    return `${this.xCurve}\n${this.yCurve},${this.zCurve}`;
  }
  
  public static createFromMotion(initialPosition: Vector3, initialVelocity: Vector3, finalPosition: Vector3, finalVelocity: Vector3){
    return new Vector3Bezier(initialPosition, initialPosition.plus(initialVelocity.scale(1/3)), finalPosition.minus(finalVelocity.scale(1/3)), finalPosition);
  }
}