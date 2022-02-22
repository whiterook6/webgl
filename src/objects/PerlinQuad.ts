import {FloatBuffer, IndexBuffer} from "../buffers";
import {Shader} from "../Shader";
import perlin from "../shaders/perlin";

export class PerlinQuad {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: FloatBuffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly shader: Shader;
  private readonly vertexPositionAttribute: number;
  private readonly timeUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    // prettier-ignore
    this.positionBuffer = new FloatBuffer(gl, [
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      1.0, 1.0
    ], 2);

    this.indexBuffer = new IndexBuffer(gl, [0, 1, 2, 3]);

    this.shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;
attribute vec4 vertexPosition;
uniform float time;

varying vec2 uv;

void main(void) {
  gl_Position = vertexPosition;
  uv = vertexPosition.xy * 0.5 + vec2(0.5, 0.5);
}`
      )
      .addFragmentSource(
        `precision lowp float;
uniform float time;
varying vec2 uv;

${perlin}

void main(void) {
  vec3 color;
  float x = uv.x;
  float y = uv.y;
  color = vec3(perlin(vec3(x * 2., y*2., time)));
  gl_FragColor = vec4(color, 1.);
}`
      )
      .link();

    this.vertexPositionAttribute = this.shader.getAttributeLocation("vertexPosition");
    this.timeUniform = this.shader.getUniformLocation("time") as WebGLUniformLocation;
  }

  public render(time: number) {
    this.gl.useProgram(this.shader.getProgram());
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();
    this.gl.uniform1f(this.timeUniform, time);
    this.gl.drawElements(this.gl.TRIANGLE_STRIP, 4, this.gl.UNSIGNED_SHORT, 0);
  }

  public destroy() {
    this.positionBuffer.destroy();
    this.indexBuffer.destroy();
    this.shader.destroy();
  }
}
