import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Vector2Buffer} from "../buffers/Vector2Buffer";
import {Shader} from "../Shader";
import {perlin} from "../shaders/perlin";

export class Hairs {
  private readonly gl: WebGL2RenderingContext;
  private readonly hairCount: number;
  private readonly hairPositions: Vector2Buffer;
  private readonly shader: Shader;
  private readonly hairColRowAttribute: number;
  private readonly timeUniform: WebGLUniformLocation;
  private readonly viewProjectionMatrixUniform: WebGLUniformLocation;
  private readonly vertexBuffer: Vector3Buffer;
  private readonly vertexPositionAttribute: number;
  private readonly indexBuffer: IndexBuffer;

  constructor(gl: WebGL2RenderingContext, columns: number, rows: number) {
    this.gl = gl;
    this.hairCount = columns * rows;

    const hairPositions: [number, number][] = [];
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        hairPositions.push([i / columns, j / rows]);
      }
    }
    this.hairPositions = new Vector2Buffer(gl, hairPositions);
    this.indexBuffer = new IndexBuffer(gl, [0, 1, 2, 3]);
    this.vertexBuffer = new Vector3Buffer(
      gl,
      [
        [0, 0, 0],
        [1, 0, 0.5],
        [1, 0.01, 0.5],
        [0, 0.01, 0],
      ],
      gl.STATIC_DRAW
    );

    this.shader = new Shader(gl)
      .addVertexSource(
        `
${perlin}
attribute vec2 hairColRow;
attribute vec4 vertexPosition;
varying vec2 uv;
varying vec4 color;
uniform float time;
uniform mat4 viewProjection;

void main(void) {
  float rotation = perlin(vec3(hairColRow.x, hairColRow.y, time + 2.0)); // from 0 to 1
  float xRotation = cos(rotation * 2.0 * 3.14159265359);
  float yRotation = sin(rotation * 2.0 * 3.14159265359);
  float length = perlin(vec3(hairColRow.x, hairColRow.y, time + 2.0)); // from 0 to 1
  vec4 position = vec4(
    (vertexPosition.x * yRotation * length - vertexPosition.y * xRotation) + hairColRow.x - 0.5,
    (vertexPosition.y * yRotation + vertexPosition.x * xRotation * length) + hairColRow.y - 0.5,
    vertexPosition.z,
    1.0
  );

  gl_Position = viewProjection * position;
  uv = hairColRow;
  color = vec4(length, length, 0.0, 1.0);
}
            `
      )
      .addFragmentSource(
        `
precision mediump float;
varying vec2 uv;
varying vec4 color;

void main(void) {
  gl_FragColor = color;
}
            `
      )
      .link();

    this.hairColRowAttribute = this.shader.getAttributeLocation("hairColRow");
    this.vertexPositionAttribute = this.shader.getAttributeLocation("vertexPosition");
    this.timeUniform = this.shader.getUniformLocation("time") as WebGLUniformLocation;
    this.viewProjectionMatrixUniform = this.shader.getUniformLocation(
      "viewProjection"
    ) as WebGLUniformLocation;
  }

  public render(viewProjectionMatrix: mat4, time: number) {
    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniform1f(this.timeUniform, time);
    this.gl.uniformMatrix4fv(this.viewProjectionMatrixUniform, false, viewProjectionMatrix);
    this.hairPositions.bindToAttribute(this.hairColRowAttribute);
    this.vertexBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();
    this.gl.vertexAttribDivisor(this.hairColRowAttribute, 1);
    this.gl.drawArraysInstanced(this.gl.TRIANGLE_FAN, 0, 4, this.hairCount);
  }
}
