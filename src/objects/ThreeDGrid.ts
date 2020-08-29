import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {SolicColorRenderer} from "../renderers/SolidColorRenderer";
import {Color, vector3, color4} from "../types";

export class ThreeDGrid {
  private readonly gl: WebGL2RenderingContext;
  private readonly color: color4;
  private readonly renderer: SolicColorRenderer;
  private readonly positionBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.renderer = new SolicColorRenderer(gl);
    this.color = Color.fromHex("#FFFFFF");

    const gridPositions: vector3[] = [];
    const indexPositions: number[] = [];

    let i: number;
    for (i = -5; i <= 5; i++) {
      gridPositions.push([i, -5, -5]);
      gridPositions.push([i, 5, -5]);
      gridPositions.push([-5, -i, -5]);
      gridPositions.push([5, -i, -5]);

      gridPositions.push([-5, i, 5]);
      gridPositions.push([-5, i, -5]);
      gridPositions.push([-5, 5, i]);
      gridPositions.push([-5, -5, i]);

      gridPositions.push([5, -5, i]);
      gridPositions.push([-5, -5, i]);
      gridPositions.push([i, -5, 5]);
      gridPositions.push([i, -5, -5]);
    }

    for (i = 0; i < gridPositions.length; i++) {
      indexPositions.push(i);
    }

    this.positionBuffer = new Vector3Buffer(gl, gridPositions);
    this.indexBuffer = new IndexBuffer(gl, indexPositions);
  }

  public render(viewMatrix: mat4, projectionMatrix: mat4) {
    const projectionViewMatric = mat4.create();
    mat4.multiply(projectionViewMatric, projectionMatrix, viewMatrix);
    this.renderer.render(
      this.positionBuffer,
      this.indexBuffer,
      this.color,
      projectionViewMatric,
      this.gl.LINES
    );
  }

  public destroy() {
    this.indexBuffer.destroy();
    this.positionBuffer.destroy();
  }
}
