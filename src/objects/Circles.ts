import { mat4 } from "gl-matrix";
import { IndexBuffer, Vector3Buffer } from "../buffers";
import { SolidColorRenderer } from "../renderers/SolidColorRenderer";
import { Vector3, color4, vector3 } from "../types";

export class Circles {
  private readonly gl: WebGL2RenderingContext;
  private readonly renderer: SolidColorRenderer;
  private readonly vertexBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly color;

  constructor(
    gl: WebGL2RenderingContext,
    radius: number,
    sides: number,
    color: color4
  ){
    this.gl = gl;
    this.color = color;
    this.renderer = new SolidColorRenderer(gl);  
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
  }

  public render = (matrix: mat4) => {
    this.renderer.render(this.vertexBuffer, this.indexBuffer, this.color, matrix, this.gl.TRIANGLE_FAN);
  }

  public destroy = () => {
    this.renderer.destroy();
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();
  }
};