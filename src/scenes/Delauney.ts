import Delaunator from "delaunator";
import { mat4 } from "gl-matrix";
import { ITimestamp } from "../animation";
import { Color4Buffer, IndexBuffer, Vector3Buffer } from "../buffers";
import { SolidColorRenderer, VertexColorRenderer } from "../renderers";
import { Gradient, color4 } from "../types";

export class Delauney {
  private readonly gl: WebGL2RenderingContext;
  private readonly width: number;
  private readonly height: number;
  private readonly renderer: SolidColorRenderer;
  private readonly vertexPositions: Float32Array; // [x0, y0, x1, y1, x2, y2, ...]
  private readonly vertexVelocities: Float32Array; // [vx0, vy0, vx1, vy1, vx2, vy2, ...]
  private readonly vertexBuffer: Vector3Buffer;
  // private readonly colorBuffer: Color4Buffer;
  private readonly indexBuffer: IndexBuffer;
  private delaunator: Delaunator<number>;

  constructor(gl: WebGL2RenderingContext, width: number, height: number, count: number){
    this.gl = gl;
    this.width = width;
    this.height = height;
    const maxTriangles = 2 * count - 5;

    this.vertexPositions = new Float32Array(count * 2);
    this.vertexVelocities = new Float32Array(count * 2);
    
    // add border vertices
    this.vertexPositions[0] = 0;
    this.vertexPositions[1] = 0;
    this.vertexPositions[2] = width;
    this.vertexPositions[3] = 0;
    this.vertexPositions[4] = width;
    this.vertexPositions[5] = height;
    this.vertexPositions[6] = 0;
    this.vertexPositions[7] = height;
    this.vertexVelocities[0] = 0;
    this.vertexVelocities[1] = 0;
    this.vertexVelocities[2] = 0;
    this.vertexVelocities[3] = 0;
    this.vertexVelocities[4] = 0;
    this.vertexVelocities[5] = 0;
    this.vertexVelocities[6] = 0;
    this.vertexVelocities[7] = 0;

    for (let index = 8; index < this.vertexPositions.length; index += 2) {
      this.vertexPositions[index] = Math.random() * width;
      this.vertexPositions[index + 1] = Math.random() * height;
      
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.05;
      this.vertexVelocities[index] = Math.cos(angle) * speed;
      this.vertexVelocities[index + 1] = Math.sin(angle) * speed;
    }

    this.vertexBuffer = new Vector3Buffer(gl, new Float32Array(count * 3), gl.DYNAMIC_COPY);
    // this.colorBuffer = new Color4Buffer(gl, new Float32Array(maxTriangles * 4), gl.DYNAMIC_COPY);
    this.delaunator = new Delaunator(this.vertexPositions);
    this.indexBuffer = new IndexBuffer(gl, new Uint16Array(maxTriangles * 3));
    this.renderer = new SolidColorRenderer(gl);
  }

  public update = (timestamp: ITimestamp) => {
    // skip the first four vertices (8 coordinates, x and y for each) because they're fixed at the corners
    for (let index = 8; index < this.vertexPositions.length; index += 2) {
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
    // const colors: color4[] = [];
    // for (let i = 0; i < triangleIndices.length; i += 3) {
    //   const centerY = (
    //     this.vertexPositions[triangleIndices[i] * 2 + 1] +
    //     this.vertexPositions[triangleIndices[i + 1] * 2 + 1] +
    //     this.vertexPositions[triangleIndices[i + 2] * 2 + 1]
    //   ) / (3 * this.height);
    //   const color = colorGradient(centerY);

    //   colors.push(color, color, color);
    // }
    // this.colorBuffer.updateColors(colors);

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
      this.indexBuffer,
      colorGradient(1),
      viewProjectionMatrix,
      this.gl.TRIANGLES
    );
  }
}