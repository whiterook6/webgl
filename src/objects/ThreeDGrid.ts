import {mat4} from "gl-matrix";
import {Color4Buffer, IndexBuffer, Vector3Buffer} from "../buffers";
import {color4} from "../Color";
import {vector3} from "../Vector3";
import {Lines} from "./Lines";

export class ThreeDGrid extends Lines {
  private readonly positionBuffer: Vector3Buffer;
  private readonly colorBuffer: Color4Buffer;
  private readonly indexBuffer: IndexBuffer;

  constructor(gl: WebGL2RenderingContext) {
    super(gl);

    const gridPositions: vector3[] = [];
    const colors: color4[] = [];
    const indexPositions: number[] = [];

    let i: number;
    for (i = -5; i <= 5; i++) {
      gridPositions.push([i, -5, -5]);
      gridPositions.push([i, 5, -5]);
      gridPositions.push([-5, -i, -5]);
      gridPositions.push([5, -i, -5]);
      colors.push([0, 0, 1, 1]);
      colors.push([0, 0, 1, 1]);
      colors.push([0, 0, 1, 1]);
      colors.push([0, 0, 1, 1]);

      gridPositions.push([-5, i, 5]);
      gridPositions.push([-5, i, -5]);
      gridPositions.push([-5, 5, i]);
      gridPositions.push([-5, -5, i]);
      colors.push([1, 0, 0, 1]);
      colors.push([1, 0, 0, 1]);
      colors.push([1, 0, 0, 1]);
      colors.push([1, 0, 0, 1]);

      gridPositions.push([5, -5, i]);
      gridPositions.push([-5, -5, i]);
      gridPositions.push([i, -5, 5]);
      gridPositions.push([i, -5, -5]);
      colors.push([0, 1, 0, 1]);
      colors.push([0, 1, 0, 1]);
      colors.push([0, 1, 0, 1]);
      colors.push([0, 1, 0, 1]);
    }

    for (i = 0; i < gridPositions.length; i++) {
      indexPositions.push(i);
    }

    this.positionBuffer = new Vector3Buffer(gl, gridPositions);
    this.indexBuffer = new IndexBuffer(gl, indexPositions);
    this.colorBuffer = new Color4Buffer(gl, colors);
  }

  public renderGrid = (modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) => {
    const matrix = mat4.create();
    mat4.multiply(matrix, projectionMatrix, viewMatrix);
    mat4.multiply(matrix, modelMatrix, matrix);
    this.render(matrix, this.positionBuffer, this.colorBuffer, this.indexBuffer);
  };

  public destroy = () => {
    super.destroy();
    this.positionBuffer.destroy();
    this.colorBuffer.destroy();
    this.indexBuffer.destroy();
  };
}
