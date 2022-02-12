import {FloatBuffer, IndexBuffer} from "../buffers";
import {Color4Bezier} from "../interpolators";
import {Shader} from "../Shader";
import {color4, Color} from "../types";

export class FullscreenQuad {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: FloatBuffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly shader: Shader;
  private readonly vertexPositionAttribute: number;
  private readonly tlColorUniform: WebGLUniformLocation;
  private readonly trColorUniform: WebGLUniformLocation;
  private readonly blColorUniform: WebGLUniformLocation;
  private readonly brColorUniform: WebGLUniformLocation;

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
  
uniform vec4 tlColor;
uniform vec4 trColor;
uniform vec4 blColor;
uniform vec4 brColor;

attribute vec4 vertexPosition;

varying vec2 uv;

void main(void) {
  gl_Position = vertexPosition;
  uv = vertexPosition.xy * 0.5 + vec2(0.5, 0.5);
}`
      )
      .addFragmentSource(
        `
precision lowp float;

uniform vec4 tlColor;
uniform vec4 trColor;
uniform vec4 blColor;
uniform vec4 brColor;

varying vec2 uv;

void main(void) {
  gl_FragColor = 
    tlColor * (1.0 - uv.x) * uv.y
    + trColor * uv.x * uv.y
    + blColor * (1.0 - uv.x) * (1.0 - uv.y)
    + brColor * uv.x * (1.0 - uv.y);
}`
      )
      .link();

    this.vertexPositionAttribute = this.shader.getAttributeLocation("vertexPosition");
    this.tlColorUniform = this.shader.getUniformLocation("tlColor") as WebGLUniformLocation;
    this.trColorUniform = this.shader.getUniformLocation("trColor") as WebGLUniformLocation;
    this.blColorUniform = this.shader.getUniformLocation("blColor") as WebGLUniformLocation;
    this.brColorUniform = this.shader.getUniformLocation("brColor") as WebGLUniformLocation;
  }

  public render(tlColor: color4, trColor: color4, blColor: color4, brColor: color4) {
    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniform4fv(this.tlColorUniform, tlColor);
    this.gl.uniform4fv(this.trColorUniform, trColor);
    this.gl.uniform4fv(this.blColorUniform, blColor);
    this.gl.uniform4fv(this.brColorUniform, brColor);
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();
    this.gl.drawElements(this.gl.TRIANGLE_STRIP, 4, this.gl.UNSIGNED_SHORT, 0);
  }

  public destroy() {
    this.positionBuffer.destroy();
    this.indexBuffer.destroy();
    this.shader.destroy();
  }
}
