import {mat4, vec3, vec4} from "gl-matrix";
import {ITimestamp} from "../animation";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Vector3Bezier} from "../interpolators";
import {SolidColorRenderer} from "../renderers/SolidColorRenderer";
import {Color, color4, Vector3, vector3} from "../types";

const colorOptions: color4[] = [
  Color.fromHex("#3498db"),
  Color.fromHex("#9b59b6"),
  Color.fromHex("#2ecc71"),
  Color.fromHex("#1abc9c"),
  Color.fromHex("#f1c40f"),
  Color.fromHex("#e67e22"),
  Color.fromHex("#e74c3c"),
];

export class ParticleSystem {
  private readonly gl: WebGL2RenderingContext;
  private readonly particleCount: number;
  private readonly bezier: Vector3Bezier;
  private readonly positions: vec3[];
  private readonly velocities: vec3[];
  private readonly colors: color4[];
  private readonly mesh: Vector3Buffer;
  private readonly indices: IndexBuffer;
  private readonly renderer: SolidColorRenderer;

  constructor(gl: WebGL2RenderingContext, count: number, bezier: Vector3Bezier) {
    this.gl = gl;
    this.renderer = new SolidColorRenderer(gl);
    this.particleCount = count;
    this.bezier = bezier;

    this.positions = new Array<vec3>(count);
    this.velocities = new Array<vec3>(count);
    this.colors = new Array<color4>(count);
    for (let index = 0; index < count; index++) {
      this.positions[index] = vec3.fromValues(...bezier.getPosition(index / count));
      vec3.add(this.positions[index], this.positions[index], [
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ]);
      this.velocities[index] = vec3.fromValues(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      );
      this.colors[index] = colorOptions[Math.floor(Math.random() * colorOptions.length)];
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

  public update = (timestamp: ITimestamp) => {
    const deltaTInSeconds = timestamp.deltaT / 1000;
    const displacement = vec3.create();
    for (let index = 0; index < this.particleCount; index++) {
      vec3.scale(displacement, this.velocities[index], deltaTInSeconds);
      vec3.add(this.positions[index], this.positions[index], displacement);

      const position = Vector3.fromVec3(this.positions[index]);
      const [closestPoint, distanceToCurve] = this.bezier.getClosestPoint(position);
      const force = Vector3.scale(
        Vector3.subtract(closestPoint, position),
        Math.min(2, 1 / distanceToCurve) * deltaTInSeconds
      );

      vec3.add(
        this.velocities[index],
        this.velocities[index],
        vec3.fromValues(force[0], force[1], force[2])
      );
    }
  };

  public render = (viewMatrix: mat4, projectionMatrix: mat4) => {
    const matrix = mat4.create();
    for (let index = 0; index < this.particleCount; index++) {
      mat4.fromTranslation(matrix, this.positions[index]);
      mat4.scale(matrix, matrix, [0.2, 0.2, 0.2]);
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
