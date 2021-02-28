import {mat4, vec3} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {SolidColorRenderer} from "../renderers/SolidColorRenderer";
import {Color, color4, vector3} from "../types";

const colorOptions: color4[] = [
  Color.fromHex("#B6542D"),
  Color.fromHex("#5C9463"),
  Color.fromHex("#FBFAA0"),
  Color.fromHex("#4222AB"),
];

export class ParticleSystem {
  private readonly gl: WebGL2RenderingContext;
  private readonly particleCount: number;
  private readonly positions: vec3[];
  private readonly colors: color4[];
  private readonly mesh: Vector3Buffer;
  private readonly indices: IndexBuffer;
  private readonly renderer: SolidColorRenderer;

  constructor(gl: WebGL2RenderingContext, count: number) {
    this.gl = gl;
    this.renderer = new SolidColorRenderer(gl);
    this.particleCount = count;

    this.positions = new Array<vec3>(count);
    this.colors = new Array<color4>(count);
    for (let index = 0; index < count; index++) {
      this.positions[index] = vec3.fromValues(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      );
      this.colors[index] = colorOptions[Math.floor(Math.random() * 4)];
    }

    const meshSize = 32;
    const vertices = new Array<vector3>(meshSize);
    const indices = new Array<number>(meshSize);
    for (let index = 0; index < meshSize; index++) {
      const angle = 2 * Math.PI * (index / meshSize);
      vertices[index] = [Math.cos(angle), Math.sin(angle), 0];
      indices[index] = index;
    }
    this.mesh = new Vector3Buffer(gl, vertices, gl.STATIC_READ);
    this.indices = new IndexBuffer(gl, indices);
  }

  public render = (viewMatrix: mat4, projectionMatrix: mat4) => {
    const matrix = mat4.create();
    for (let index = 0; index < this.particleCount; index++) {
      mat4.fromTranslation(matrix, this.positions[index]);
      mat4.multiply(matrix, viewMatrix, matrix);
      mat4.multiply(matrix, projectionMatrix, matrix);
      this.renderer.render(
        this.mesh,
        this.indices,
        this.colors[index],
        matrix,
        this.gl.TRIANGLE_FAN
      );
    }
  };
}
