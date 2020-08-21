import {mat4} from "gl-matrix";
import {Color4Buffer, IndexBuffer, Vector3Buffer} from "../buffers";
import {color4} from "../Color";
import {vector3} from "../Vector3";
import {Lines} from "./Lines";

export class Gizmo extends Lines {
  private readonly positionBuffer: Vector3Buffer;
  private readonly colorBuffer: Color4Buffer;
  private readonly indexBuffer: IndexBuffer;

  constructor(gl: WebGL2RenderingContext) {
    super(gl);

    const positions: vector3[] = [
      [0, 0, 0],
      [1, 0, 0],

      [0, 0, 0],
      [0, 1, 0],

      [0, 0, 0],
      [0, 0, 1],
    ];
    const indices = [0, 1, 2, 3, 4, 5];
    const colors: color4[] = [
      [1, 0, 0, 1],
      [1, 0, 0, 1],

      [0, 1, 0, 1],
      [0, 1, 0, 1],

      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ];

    this.positionBuffer = new Vector3Buffer(gl, positions);
    this.colorBuffer = new Color4Buffer(gl, colors);
    this.indexBuffer = new IndexBuffer(gl, indices);
  }

  public renderGizmo = (modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) => {
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
