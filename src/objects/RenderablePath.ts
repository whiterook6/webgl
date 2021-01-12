import {mat4} from "gl-matrix";
import {Color4Buffer, IndexBuffer, Vector3Buffer} from "../buffers";
import {Vector3Path} from "../interpolators/Vector3Path";
import {VertexColorRenderer} from "../renderers/VertexColorRenderer";
import {Color, color4, vector3, Vector3} from "../types";

export class RenderablePath {
  private readonly gl: WebGL2RenderingContext;
  private readonly path: Vector3Path;
  private readonly renderer: VertexColorRenderer;

  private readonly vertices: Vector3Buffer;
  private readonly colors: Color4Buffer;
  private readonly indices: IndexBuffer;

  constructor(gl: WebGL2RenderingContext, path: Vector3Path) {
    this.gl = gl;
    this.path = path;
    this.renderer = new VertexColorRenderer(gl);

    const length = path.getLength();
    let segmentLength = 0.33;
    const segments = Math.ceil(length / segmentLength);
    segmentLength = length / segments;

    const positions: vector3[] = [];
    const colors: color4[] = [];
    const indices: number[] = [];
    const red = Color.fromHex("#FF0000");
    const green = Color.fromHex("#00FF00");
    const blue = Color.fromHex("#0000FF");

    for (let i = 0; i <= segments; i++) {
      const t = path.getT(i * segmentLength);
      const index = i * 6;
      const matrix = this.path.getMatrix(t);
      const origin = Vector3.multiply([0, 0, 0], matrix);

      // tangent
      const forward = Vector3.multiply([0, 0, 1], matrix);
      positions.push(origin, forward);
      colors.push(red, red);
      indices.push(index, index + 1);

      // tangent
      const right = Vector3.multiply([0.2, 0, 0], matrix);
      positions.push(origin, right);
      colors.push(green, green);
      indices.push(index + 2, index + 3);

      // up
      const up = Vector3.multiply([0, 0.2, 0], matrix);
      positions.push(origin, up);
      colors.push(blue, blue);
      indices.push(index + 4, index + 5);
    }

    this.vertices = new Vector3Buffer(gl, positions);
    this.colors = new Color4Buffer(gl, colors);
    this.indices = new IndexBuffer(gl, indices);
  }

  public render(viewMatrix: mat4, projectionMatrix: mat4) {
    const mat = mat4.create();
    mat4.multiply(mat, projectionMatrix, viewMatrix);
    this.renderer.render(this.vertices, this.colors, this.indices, mat, this.gl.LINES);
  }
}
