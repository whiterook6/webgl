import { mat4, vec2 } from "gl-matrix";
import { ITimestamp } from "../animation";
import { Circles } from "../objects/Circles";
import { Color, vector3 } from "../types";

const bounce = 0.6;

export class Fluid {
  width: number;
  height: number;
  particleCount: number;
  gl: WebGL2RenderingContext;
  circles: Circles;

  positions: vector3[];
  velocities: vector3[];

  constructor(gl: WebGL2RenderingContext, width: number, height: number, particleCount: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.particleCount = particleCount;
    this.circles = new Circles(gl, 4, 8, Color.fromHex("#FF0000"));
    this.positions = [];
    this.velocities = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.positions.push([Math.random() * this.width, Math.random() * this.height, 0]);
      this.velocities.push([Math.random() * 100 - 50, Math.random() * 100 - 50, 0]);
    }
  }

  public update = (timestamp: ITimestamp) => {
    console.log(`${Math.floor(1000 / timestamp.deltaT)}FPS   ${Math.floor(timestamp.deltaT)}ms`);
    // for (let i = 0; i < this.particleCount; i++) {
    //   this.positions[i][0] += this.velocities[i][0] * (timestamp.deltaT / 1000);
    //   this.positions[i][1] += this.velocities[i][1] * (timestamp.deltaT / 1000);

    //   this.velocities[i][1] -= 9.8 * (timestamp.deltaT / 1000);

    //   if (this.positions[i][0] > this.width){
    //     this.positions[i][0] = this.width - (this.positions[i][0] - this.width);
    //     this.velocities[i][0] *= -bounce;
    //   } else if (this.positions[i][0] < 0) {
    //     this.positions[i][0] *= -1;
    //     this.velocities[i][0] *= -bounce;
    //   }

    //   if (this.positions[i][1] < 0) {
    //     this.positions[i][1] *= -1;
    //     this.velocities[i][1] *= -bounce;
    //   }
    // }
  }

  public render = (viewProjectionMatrix: mat4) => {
    const matrix = mat4.clone(viewProjectionMatrix);
    for (let i = 0; i < this.particleCount; i++) {
      const m = mat4.copy(matrix, viewProjectionMatrix);
      mat4.translate(m, m, [this.positions[i][0], this.positions[i][1], 0]);
      this.circles.render(m);
    }
  }
}