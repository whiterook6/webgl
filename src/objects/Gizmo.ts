import {mat4} from "gl-matrix";
import {Color4Buffer, IndexBuffer, Vector3Buffer} from "../buffers";
import {VertexColorRenderer} from "../renderers/VertexColorRenderer";
import {color4, vector3} from "../types";

/** Draws a red right, green forward, and blue up line */
export class Gizmo {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: Vector3Buffer;
  private readonly colorBuffer: Color4Buffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly renderer: VertexColorRenderer;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.renderer = new VertexColorRenderer(gl);

    const positions: vector3[] = [
      [0, 0, 0],
      [1, 0, 0], // right

      [0, 0, 0],
      [0, 1, 0], // in/forward

      [0, 0, 0],
      [0, 0, 1], // up
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

  public render(viewMatrix: mat4, projectionMatrix: mat4) {
    const projectionViewMatric = mat4.create();
    mat4.multiply(projectionViewMatric, projectionMatrix, viewMatrix);
    this.renderer.render(
      this.positionBuffer,
      this.colorBuffer,
      this.indexBuffer,
      projectionViewMatric,
      this.gl.LINES
    );
  }

  public destroy() {
    this.indexBuffer.destroy();
    this.positionBuffer.destroy();
    this.colorBuffer.destroy();
  }
}
