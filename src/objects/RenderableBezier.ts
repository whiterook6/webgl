import {Vector3Bezier} from "../interpolators";
import {mat4, vec3} from "gl-matrix";
import {VertexColorRenderer} from "../renderers/VertexColorRenderer";
import {Vector3Buffer, Color4Buffer, IndexBuffer} from "../buffers";
import {vector3, color4, Vector3, Color} from "../types";

export class RenderableBezier {
  private readonly gl: WebGL2RenderingContext;
  private readonly bezier: Vector3Bezier;
  private readonly renderer: VertexColorRenderer;

  private readonly vertices: Vector3Buffer;
  private readonly colors: Color4Buffer;
  private readonly indices: IndexBuffer;

  constructor(gl: WebGL2RenderingContext, bezier: Vector3Bezier) {
    this.gl = gl;
    this.bezier = bezier;
    this.renderer = new VertexColorRenderer(gl);

    const length = bezier.getLength();
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
      const t = bezier.getT(i * segmentLength);
      const index = i * 6;
      const matrix = this.bezier.getMatrix(t);
      console.log(matrix);
      const origin = Vector3.multiply([0, 0, 0], matrix);

      // tangent
      const forward = Vector3.multiply([1, 0, 0], matrix);
      positions.push(origin, forward);
      colors.push(red, red);
      indices.push(index, index + 1);

      // tangent
      const right = Vector3.multiply([0, 1, 0], matrix);
      positions.push(origin, right);
      colors.push(green, green);
      indices.push(index + 2, index + 3);

      // up
      const up = Vector3.multiply([0, 0, 1], matrix);
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
