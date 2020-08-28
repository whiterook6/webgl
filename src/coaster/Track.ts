import {Vector3Bezier} from "../interpolators";
import {vector3, Vector3} from "../types";
import {mat4, vec3} from "gl-matrix";

// https://spencermortensen.com/articles/bezier-circle/
const circleApproximation = 0.551915024494;
export class Track {
  sections: Vector3Bezier[];

  constructor(length: number, radius: number) {
    const radiusHandle = radius * circleApproximation;
    this.sections = [
      new Vector3Bezier([0, 0, 0], [length / 3, 0, 0], [(2 * length) / 3, 0, 0], [length, 0, 0]), // straight ahead
      new Vector3Bezier( // turn right around 2-unit radius
        [length, 0, 0],
        [length + radiusHandle, 0, 0],
        [length + radius, radius - radiusHandle, -1],
        [length + radius, radius, -1]
      ),
      new Vector3Bezier( // turn right again around 2-unit radius
        [length + radius, radius, -1],
        [length + radius, radius + radiusHandle, -1],
        [length + radiusHandle, 2 * radius, -1],
        [length, 2 * radius, -1]
      ),
      new Vector3Bezier( // straight
        [length, 2 * radius, -1],
        [(2 * length) / 3, 2 * radius, -1],
        [length / 3, 2 * radius, -1],
        [0, 2 * radius, -1]
      ),
      new Vector3Bezier( // turn right around 2-unit radius
        [0, 2 * radius, -1],
        [-radiusHandle, 2 * radius, -1],
        [-radius, radius + radiusHandle, 0],
        [-radius, radius, 0]
      ),
      new Vector3Bezier( // turn right again around 2-unit radius
        [-radius, radius, 0],
        [-radius, radius - radiusHandle, 0],
        [-radiusHandle, 0, 0],
        [0, 0, 0]
      ),
    ];
  }

  public getLength() {
    return this.sections.reduce((previous: number, current: Vector3Bezier) => {
      return previous + current.getLength();
    }, 0);
  }

  public getPoints() {
    const distance = 0.5;
    return this.sections
      .map((section: Vector3Bezier) => {
        const length = section.getLength();
        const pointCount = length / distance;

        const points = [];
        for (let i = 0; i < pointCount; i++) {
          const d = length * (i / pointCount);
          points.push(section.getPosition(section.getT(d)));
        }

        return points;
      })
      .flat(1);
  }

  public getTriangles() {
    const distance = 0.5;
    return this.sections
      .map((section: Vector3Bezier) => {
        const length = section.getLength();
        const pointCount = length / distance;

        const triangles: vector3[] = [];

        for (let i = 0; i < pointCount; i++) {
          const d = length * (i / pointCount);
          const t = section.getT(d);
          const position = section.getPosition(t);
          const velocity = section.getVelocity(t);
          const mat = mat4.create();
          mat4.targetTo(mat, position, Vector3.add(position, velocity), [0, 0, 1]);

          const vertices: vec3[] = [
            vec3.fromValues(-0.1, 0, 0),
            vec3.fromValues(0.1, 0, 0),
            vec3.fromValues(0, -0.173205, 0),
          ];
          vec3.transformMat4(vertices[0], vertices[0], mat);
          vec3.transformMat4(vertices[1], vertices[1], mat);
          vec3.transformMat4(vertices[2], vertices[2], mat);
          triangles.push(...vertices.map((v) => [v[0], v[1], v[2]] as vector3));
        }

        return triangles;
      })
      .flat(1);
  }
}
