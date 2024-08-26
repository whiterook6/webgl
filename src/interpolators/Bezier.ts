export class Bezier {
  protected readonly nodes: [number, number, number, number];

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

  public static continue = (previous: Bezier, c: number, d: number): Bezier => {
    const [, , previousC, previousD] = previous.nodes;
    return new Bezier(previousD, previousD - previousC, c, d);
  };

  public split = (t: number = 0.5) => {
    const [A, B, C, D] = this.nodes;
    const m = 1 - t;
    const E = m * A + t * B;
    const F = m * B + t * C;
    const G = m * C + t * D;
    const H = m * E + t * F;
    const J = m * F + t * G;
    const K = m * H + t * J;

    return [new Bezier([A, F, H, K]), new Bezier([K, J, G, D])];
  };

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
    const m = 1 - t;
    const m2 = m * m;
    return 3 * m2 * (p1 - p0) + 6 * t * m * (p2 - p1) + 3 * t2 * (p3 - p2);
  };

  public getSecondDerivative = (t: number) => {
    const [p0, p1, p2, p3] = this.nodes;
    const mt = 1 - t;
    return 6 * mt * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1);
  };

  public getLength = (): number => {
    let length = 0;
    let previous = this.nodes[0];
    for (let i = 1; i <= 25; i++) {
      const next = this.get(i / 25);
      length += next - previous;
      previous = next;
    }

    return length;
  };

  /**
   * Prints when using string interpolation: `[0.12, 0.34, 0.56, 0.78]`
   */
  public toString = (t: number) => {
    const [a, b, c, d] = this.nodes;
    return `[${a.toFixed(3)}, ${b.toFixed(2)}, ${c.toFixed(2)}, ${d.toFixed(2)}]`;
  };
}
