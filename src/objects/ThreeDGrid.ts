import {Vector3Buffer, IndexBuffer} from "../buffers";
import {Shader} from "../Shader";
import {Vector3} from "../Vector3";
import {mat4} from "gl-matrix";
import {Color4, Color} from "../Color";

export class ThreeDGrid {
  private readonly gl: WebGL2RenderingContext;
  private readonly positionBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;
  private readonly program: WebGLProgram;

  private readonly vertexPositionAttribute: number;
  private readonly colorUniform: WebGLUniformLocation;
  private readonly modelMatrixUniform: WebGLUniformLocation;
  private readonly viewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;

    const gridPositions: Vector3[] = [];
    const indexPositions: number[] = [];

    let i: number;
    for (i = -5; i <= 5; i++) {
      gridPositions.push(new Vector3(i, -5, -5));
      gridPositions.push(new Vector3(i, 5, -5));
      gridPositions.push(new Vector3(-5, -i, -5));
      gridPositions.push(new Vector3(5, -i, -5));

      gridPositions.push(new Vector3(-5, i, 5));
      gridPositions.push(new Vector3(-5, i, -5));
      gridPositions.push(new Vector3(-5, 5, i));
      gridPositions.push(new Vector3(-5, -5, i));

      gridPositions.push(new Vector3(5, -5, i));
      gridPositions.push(new Vector3(-5, -5, i));
      gridPositions.push(new Vector3(i, -5, 5));
      gridPositions.push(new Vector3(i, -5, -5));
    }

    for (i = 0; i < gridPositions.length; i++) {
      indexPositions.push(i);
    }

    const shader = new Shader(gl)
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

    this.program = shader.getProgram();
    this.vertexPositionAttribute = shader.getAttributeLocation("vertexPosition");
    this.colorUniform = shader.getUniformLocation("color") as WebGLUniformLocation;
    this.modelMatrixUniform = shader.getUniformLocation("modelMatrix") as WebGLUniformLocation;
    this.viewMatrixUniform = shader.getUniformLocation("viewMatrix") as WebGLUniformLocation;
    this.projectionMatrixUniform = shader.getUniformLocation(
      "projectionMatrix"
    ) as WebGLUniformLocation;

    this.positionBuffer = new Vector3Buffer(gl, gridPositions);
    this.indexBuffer = new IndexBuffer(gl, indexPositions);

    this.setColor(Color.fromHex("#FFFFFF"));
  }

  public setColor(color: Color4) {
    this.gl.useProgram(this.program);
    this.gl.uniform4fv(this.colorUniform, color);
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.gl.useProgram(this.program);
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.indexBuffer.bindToAttribute();

    this.gl.uniformMatrix4fv(this.modelMatrixUniform, false, modelMatrix);
    this.gl.uniformMatrix4fv(this.viewMatrixUniform, false, viewMatrix);
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.drawElements(this.gl.LINES, this.indexBuffer.getLength(), this.gl.UNSIGNED_SHORT, 0);
  }
}
