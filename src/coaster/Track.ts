import {Vector3Bezier} from "../interpolators";

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
        [length + radius, radius - radiusHandle, 0],
        [length + radius, radius, 0]
      ),
      new Vector3Bezier( // turn right again around 2-unit radius
        [length + radius, radius, 0],
        [length + radius, radius + radiusHandle, 0],
        [length + radiusHandle, 2 * radius, 0],
        [length, 2 * radius, 0]
      ),
      new Vector3Bezier( // straight
        [length, 2 * radius, 0],
        [(2 * length) / 3, 2 * radius, 0],
        [length / 3, 2 * radius, 0],
        [0, 2 * radius, 0]
      ),
      new Vector3Bezier( // turn right around 2-unit radius
        [0, 2 * radius, 0],
        [-radiusHandle, 2 * radius, 0],
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
    return this.sections
      .map((section: Vector3Bezier) => {
        const points = [];
        for (let i = 0; i < 25; i++) {
          points.push(section.getPosition(i / 25));
        }

        return points;
      })
      .flat(1);
  }
}
