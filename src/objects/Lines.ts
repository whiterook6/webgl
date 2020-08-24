import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Vector3Bezier} from "../interpolators";
import {Shader} from "../Shader";
import {Color, color4, vector3} from "../types";

export class Line {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly shader: Shader;

  private readonly vertexPositionAttribute: number;
  private readonly colorUniform: WebGLUniformLocation;
  private readonly modelMatrixUniform: WebGLUniformLocation;
  private readonly viewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext, bezier: Vector3Bezier) {
    this.gl = gl;

    const vertices: vector3[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= 100; i++) {
      const position = bezier.getPosition(i / 100);
      vertices.push(position);
      indices.push(i);
    }

    this.shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;

uniform vec4 color;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
attribute vec4 vertexPosition;

void main(void) {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vertexPosition;
}`
      )
      .addFragmentSource(
        `
precision lowp float;

uniform vec4 color;

void main(void) {
  gl_FragColor = color;
}`
      )
      .link();

    this.vertexPositionAttribute = this.shader.getAttributeLocation("vertexPosition");
    this.colorUniform = this.shader.getUniformLocation("color") as WebGLUniformLocation;
    this.modelMatrixUniform = this.shader.getUniformLocation("modelMatrix") as WebGLUniformLocation;
    this.viewMatrixUniform = this.shader.getUniformLocation("viewMatrix") as WebGLUniformLocation;
    this.projectionMatrixUniform = this.shader.getUniformLocation(
      "projectionMatrix"
    ) as WebGLUniformLocation;

    this.positionBuffer = new Vector3Buffer(gl, vertices);
    this.indexBuffer = new IndexBuffer(gl, indices);
    this.setColor(Color.fromHex("#FFFFFF"));
  }

  public setColor(color: color4) {
    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniform4fv(this.colorUniform, color);
  }

  public update = (newBezier: Vector3Bezier) => {
    const vertices: vector3[] = [];

    for (let i = 0; i < 100; i++) {
      const position = newBezier.getPosition(i / 100);
      vertices.push(position);
    }
    vertices.push(newBezier.getPosition(1));

    this.positionBuffer.updateVectors(vertices);
  };

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.gl.useProgram(this.shader.getProgram());
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();

    this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, modelMatrix);
    this.gl.uniformMatrix4fv(this.viewMatrixUniform, false, viewMatrix);
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.drawElements(
      this.gl.LINE_STRIP,
      this.indexBuffer.getLength(),
      this.gl.UNSIGNED_SHORT,
      0
    );
  }

  public destroy() {
    this.indexBuffer.destroy();
    this.positionBuffer.destroy();
    this.shader.destroy();
  }
}
