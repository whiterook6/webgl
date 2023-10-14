import { mat4, vec2 } from "gl-matrix";
import { ITimestamp } from "../animation";
import { Circles } from "../objects/Circles";
import { Color, color4, vector3 } from "../types";
import { InstancedSolidColorRenderer } from "../renderers/InstancedSolidColorRenderer";
import { IndexBuffer, Vector3Buffer } from "../buffers";

const bounce = 0.9;

export class Fluid {
  width: number;
  height: number;
  particleCount: number;
  gl: WebGL2RenderingContext;
  renderer: InstancedSolidColorRenderer;
  vertexBuffer: Vector3Buffer;
  indexBuffer: IndexBuffer;

  positions: vector3[];
  velocities: vector3[];

  constructor(gl: WebGL2RenderingContext, width: number, height: number, particleCount: number) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.particleCount = particleCount;

    const sides = 8;
    const radius = 2;
    const vectors: vector3[] = [[0, 0, 0]];
    const indices: number[] = [0];
    const angle = (Math.PI * 2) / sides;

    for (let i = 0; i <= sides; i++) {
      const x = Math.cos(angle * i) * radius;
      const y = Math.sin(angle * i) * radius;
      vectors.push([x, y, 0]);
      indices.push(i + 1);
    }

    this.vertexBuffer = new Vector3Buffer(gl, vectors);
    this.indexBuffer = new IndexBuffer(gl, indices);
    this.renderer = new InstancedSolidColorRenderer(
      this.gl,
      this.particleCount,
      this.vertexBuffer,
      this.indexBuffer,
      this.gl.TRIANGLE_FAN
    )

    this.positions = [];
    this.velocities = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.positions.push([Math.random() * this.width, Math.random() * this.height, 0]);
      this.velocities.push([Math.random() * 100 - 50, Math.random() * 100 - 50, 0]);
    }
  }

  public update = (timestamp: ITimestamp) => {
    for (let i = 0; i < this.particleCount; i++) {
      this.positions[i][0] += this.velocities[i][0] * (timestamp.deltaT / 1000);
      this.positions[i][1] += this.velocities[i][1] * (timestamp.deltaT / 1000);

      this.velocities[i][1] -= 9.8 * (timestamp.deltaT / 1000);

      if (this.positions[i][0] > this.width){
        this.positions[i][0] = this.width - (this.positions[i][0] - this.width);
        this.velocities[i][0] *= -bounce;
      } else if (this.positions[i][0] < 0) {
        this.positions[i][0] *= -1;
        this.velocities[i][0] *= -bounce;
      }

      if (this.positions[i][1] < 0) {
        this.positions[i][1] *= -1;
        this.velocities[i][1] *= -bounce;
      }
    }
  }

  public render = (color: color4, viewProjectionMatrix: mat4) => {
    this.renderer.render(this.positions, color, viewProjectionMatrix);
  }
}