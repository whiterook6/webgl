import Delaunator from "delaunator";
import { mat4 } from "gl-matrix";
import { ITimestamp } from "../animation";
import { Color4Buffer, IndexBuffer, Vector3Buffer } from "../buffers";
import { VertexColorRenderer } from "../renderers";
import { Gradient, color4 } from "../types";

export class Delauney {
  private readonly gl: WebGL2RenderingContext;
  private readonly width: number;
  private readonly height: number;
  private readonly renderer: VertexColorRenderer;
  private readonly vertexPositions: Float32Array; // [x0, y0, x1, y1, x2, y2, ...]
  private readonly vertexVelocities: Float32Array; // [vx0, vy0, vx1, vy1, vx2, vy2, ...]
  private readonly vertexBuffer: Vector3Buffer;
  private readonly colorBuffer: Color4Buffer;
  private readonly indexBuffer: IndexBuffer;
  private delaunator: Delaunator<number>;

  constructor(gl: WebGL2RenderingContext, width: number, height: number, count: number){
    this.gl = gl;
    this.width = width;
    this.height = height;

    this.vertexPositions = new Float32Array(count * 2);
    this.vertexVelocities = new Float32Array(count * 2);
    for (let index = 0; index < this.vertexPositions.length; index += 2) {
      this.vertexPositions[index] = Math.random() * width;
      this.vertexPositions[index + 1] = Math.random() * height;
      this.vertexVelocities[index] = (Math.random() - 0.5) * 2;
      this.vertexVelocities[index + 1] = (Math.random() - 0.5) * 2;
    }

    this.vertexBuffer = new Vector3Buffer(gl, new Float32Array(count * 3), gl.STATIC_DRAW);
    this.colorBuffer = new Color4Buffer(gl, new Float32Array(count * 4), gl.STATIC_DRAW);
    this.delaunator = new Delaunator(this.vertexPositions);
    this.indexBuffer = new IndexBuffer(gl, new Uint16Array(this.delaunator.triangles.map(index => index)));
    this.renderer = new VertexColorRenderer(gl);
  }

  public update = (timestamp: ITimestamp) => {
    for (let index = 0; index < this.vertexPositions.length; index += 2) {
      const newX = this.vertexPositions[index] + this.vertexVelocities[index] * timestamp.deltaT;
      const newY = this.vertexPositions[index + 1] + this.vertexVelocities[index + 1] * timestamp.deltaT;

      if (newX > this.width){
        this.vertexPositions[index] = newX - this.width;
      } else if (newX < 0){
        this.vertexPositions[index] = this.width + newX;
      } else {
        this.vertexPositions[index] = newX;
      }

      if (newY > this.height){
        this.vertexPositions[index + 1] = newY - this.height;
      } else if (newY < 0){
        this.vertexPositions[index + 1] = this.height + newY;
      } else {
        this.vertexPositions[index + 1] = newY;
      }
    }

    this.delaunator.update();
  }

  public render = (viewProjectionMatrix: mat4, colorGradient: Gradient) => {
    const triangleIndices: Uint32Array = this.delaunator.triangles;
    const colors: color4[] = [];
    for (let i = 0; i < triangleIndices.length; i += 3) {
      const centerY = (
        this.vertexPositions[triangleIndices[i] * 2 + 1] +
        this.vertexPositions[triangleIndices[i + 1] * 2 + 1] +
        this.vertexPositions[triangleIndices[i + 2] * 2 + 1]
      ) / (3 * this.height);
      const color = colorGradient(centerY);

      colors.push(color, color, color);
    }
    this.colorBuffer.updateColors(colors);

    const vertex3s: [number, number, number][] = [];
    for (let i = 0; i < this.vertexPositions.length; i += 2) {
      vertex3s.push([
        this.vertexPositions[i],
        this.vertexPositions[i + 1],
        0
      ]);
    }

    this.vertexBuffer.updateVectors(vertex3s);
    this.indexBuffer.update(new Uint16Array(triangleIndices.map(index => index)));

    this.renderer.render(
      this.vertexBuffer,
      this.colorBuffer,
      this.indexBuffer,
      viewProjectionMatrix,
      this.gl.TRIANGLES
    )
  }
}