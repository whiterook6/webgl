import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Vector2Buffer} from "../buffers/Vector2Buffer";
import {Shader} from "../Shader";
import perlin from "../shaders/perlin";
import hsvrgb from "../shaders/hsvrgb";

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

  constructor(
    gl: WebGL2RenderingContext,
    columns: number,
    rows: number,
    width: number,
    height: number
  ) {
    this.gl = gl;
    this.hairCount = columns * rows;

    const hairPositions: [number, number][] = [];
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        hairPositions.push([
          (i * width) / columns + Math.random() * 3,
          (j * height) / rows + Math.random() * 3,
        ]);
      }
    }
    this.hairPositions = new Vector2Buffer(gl, hairPositions);
    this.indexBuffer = new IndexBuffer(gl, [0, 1, 2, 3]);
    this.vertexBuffer = new Vector3Buffer(
      gl,
      [
        [0, 0, 0],
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 0],
      ],
      gl.STATIC_DRAW
    );

    this.shader = new Shader(gl)
      .addVertexSource(
        `
${perlin}
${hsvrgb}
attribute vec2 hairColRow;
attribute vec4 vertexPosition;
varying vec3 color;
uniform float time;
uniform mat4 viewProjection;

void main(void) {
  float rotation = perlin(vec3(hairColRow.x / ${(-width / 2).toFixed(1)}, hairColRow.y / ${(
          -height / 2
        ).toFixed(1)}, time + 2.0)); // from 0 to 1
  float xRotation = cos(rotation * 2.0 * 3.14159265359);
  float yRotation = sin(rotation * 2.0 * 3.14159265359);
  float length = abs(perlin(vec3(hairColRow.x / ${(width / 2).toFixed(1)}, hairColRow.y / ${(
          height / 2
        ).toFixed(1)}, time + 100.0))) * 100.0; // from 0 to 100
  vec4 position = vec4(
    (vertexPosition.x * yRotation * length - vertexPosition.y * xRotation * 5.0) + hairColRow.x,
    (vertexPosition.y * yRotation * 5.0 + vertexPosition.x * xRotation * length) + hairColRow.y,
    vertexPosition.z,
    1.0
  );
  gl_Position = viewProjection * position;
  
  float hue = perlin(vec3(hairColRow.x / ${(width / 2).toFixed(1)}, hairColRow.y / ${(
          height / 2
        ).toFixed(1)}, time + 400.0)) / 3.0 + 0.667; // from 0.667 to 1
  float saturation = mix(0.75, 1.0, vertexPosition.x);
  float value = mix(0.0, 1.0, vertexPosition.x);
  color = hsv2rgb(vec3(hue, saturation, value));
}
            `
      )
      .addFragmentSource(
        `
precision mediump float;
varying vec3 color;

void main(void) {
  gl_FragColor = vec4(color, 1.0);
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
