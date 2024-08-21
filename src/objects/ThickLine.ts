import {mat4, vec3} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Shader} from "../gl/Shader";
import {color4, vector3} from "../types";

export class ThickLine {
  private static modelViewMatrix: mat4;
  private static gl: WebGL2RenderingContext;
  private static vertexBuffer: Vector3Buffer;
  private static vertexPositionAttribute: number;
  private static indexBuffer: IndexBuffer;
  private static program: Shader;
  private static modelViewMatrixUniform: WebGLUniformLocation;
  private static projectionMatrixUniform: WebGLUniformLocation;
  private static startColorUniform: WebGLUniformLocation;
  private static endColorUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext) {
    if (!ThickLine.gl) {
      ThickLine.gl = gl;
      ThickLine.program = new Shader(gl)
        .addVertexSource(
          `precision lowp float;
uniform vec4 startColor;
uniform vec4 endColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec4 vertexPosition;

varying float u;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * vertexPosition;
    u = vertexPosition.x;
}`
        )
        .addFragmentSource(
          `precision lowp float;
uniform vec4 startColor;
uniform vec4 endColor;
varying float u;

void main(void) {
  gl_FragColor = startColor * (1.0 - u) + endColor * u;
}`
        )
        .link();
      ThickLine.vertexPositionAttribute = ThickLine.program.getAttributeLocation("vertexPosition");
      ThickLine.startColorUniform = ThickLine.program.getUniformLocation(
        "startColor"
      ) as WebGLUniformLocation;
      ThickLine.endColorUniform = ThickLine.program.getUniformLocation(
        "endColor"
      ) as WebGLUniformLocation;

      ThickLine.indexBuffer = new IndexBuffer(gl, [0, 1, 2, 3]);
      ThickLine.vertexBuffer = new Vector3Buffer(
        gl,
        [
          [0, 0, 0],
          [1, 0, 0],
          [1, 1, 0],
          [0, 1, 0],
        ],
        gl.STATIC_DRAW
      );
      ThickLine.modelViewMatrixUniform = ThickLine.program.getUniformLocation(
        "uModelViewMatrix"
      ) as WebGLUniformLocation;
      ThickLine.projectionMatrixUniform = ThickLine.program.getUniformLocation(
        "uProjectionMatrix"
      ) as WebGLUniformLocation;
      ThickLine.modelViewMatrix = mat4.create();
    }
  }

  public render(
    viewMatrix: mat4,
    projectionMatrix: mat4,
    position: vector3,
    rotation: number,
    length: number,
    thickness: number,
    startColor: color4,
    endColor: color4
  ) {
    mat4.fromZRotation(ThickLine.modelViewMatrix, rotation);
    mat4.scale(ThickLine.modelViewMatrix, ThickLine.modelViewMatrix, [length, thickness, 1]);
    mat4.translate(ThickLine.modelViewMatrix, ThickLine.modelViewMatrix, position);
    mat4.multiply(ThickLine.modelViewMatrix, viewMatrix, ThickLine.modelViewMatrix);

    ThickLine.gl.useProgram(ThickLine.program.getProgram());
    ThickLine.gl.uniform4fv(ThickLine.startColorUniform, startColor);
    ThickLine.gl.uniform4fv(ThickLine.endColorUniform, endColor);
    ThickLine.gl.uniformMatrix4fv(ThickLine.projectionMatrixUniform, false, projectionMatrix);
    ThickLine.gl.uniformMatrix4fv(
      ThickLine.modelViewMatrixUniform,
      false,
      ThickLine.modelViewMatrix
    );

    ThickLine.vertexBuffer.bindToAttribute(ThickLine.vertexPositionAttribute);
    ThickLine.indexBuffer.bindToAttribute();
    ThickLine.gl.drawElements(ThickLine.gl.TRIANGLE_FAN, 4, ThickLine.gl.UNSIGNED_SHORT, 0);
  }
}
