export class Bezier {
  private readonly nodes: [number, number, number, number];

  constructor(
    a: [number, number, number, number] | number = 0,
    b: number = 0,
    c: number = 0,
    d: number = 0
  ) {
    if (Array.isArray(a)) {
      this.nodes = a;
    } else {
      this.nodes = [a as number, b!, c!, d!];
    }
  }

  public get = (t: number) => {
    const [p0, p1, p2, p3] = this.nodes;

    const t2 = t * t;
    const t3 = t * t * t;

    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt * mt * mt;

    return 1 * mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + 1 * t3 * p3;
  };

  public getDerivative = (t: number) => {
    const [p0, p1, p2, p3] = this.nodes;
    const t2 = t * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    return 3 * mt2 * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t2 * (p3 - p2);
  };

  public getSecondDerivative = (t: number) => {
    const [p0, p1, p2, p3] = this.nodes;
    const mt = 1 - t;
    return 6 * mt * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1);
  };

  /**
   * Prints when using string interpolation: `Curve: ${bezier}`
   */
  public toString = (t: number) => {
    const [a, b, c, d] = this.nodes;
    return `[${a.toFixed(3)}, ${b.toFixed(2)}, ${c.toFixed(2)}, ${d.toFixed(2)}]`;
  };
}
