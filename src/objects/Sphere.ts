import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Shader} from "../Shader";
import {Color, vector3} from "../types";

export class Sphere {
  private readonly gl: WebGL2RenderingContext;

  private readonly positionBuffer: Vector3Buffer;
  private readonly normalBuffer: Vector3Buffer;
  private readonly indexBuffer: IndexBuffer;

  private readonly shader: Shader;

  private readonly vertexPositionAttribute: number;
  private readonly vertexNormalAttribute: number;

  private readonly normalMatrixUniform: WebGLUniformLocation;
  private readonly modelViewMatrixUniform: WebGLUniformLocation;
  private readonly projectionMatrixUniform: WebGLUniformLocation;

  private readonly colorUniform: WebGLUniformLocation;

  constructor(gl: WebGL2RenderingContext, segments: number) {
    this.gl = gl;

    this.shader = new Shader(gl)
      .addVertexSource(
        `
precision lowp float;

attribute vec4 vertexPosition;
attribute vec3 vertexNormal;
uniform mat4 normalMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionmatrix;
uniform vec4 color;
varying highp vec3 vLighting;

void main(void) {
  gl_Position = projectionmatrix * modelViewMatrix * vertexPosition;

  // Apply lighting effect

  highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp vec4 transformedNormal = normalMatrix * vec4(vertexNormal, 1.0);

  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  vLighting = ambientLight + (directionalLightColor * directional);
}`
      )
      .addFragmentSource(
        `
precision lowp float;

varying highp vec3 vLighting;
uniform vec4 color;

void main(void) {
  gl_FragColor = vec4(color.rgb * vLighting, 1.0);
}`
      )
      .link();

    const positions: vector3[] = [];
    const normals: vector3[] = [];
    const indices: number[] = [];

    let i: number;
    let j: number;
    const sectorCount = segments;
    const stackCount = segments / 2;
    const sectorStep = (2 * Math.PI) / sectorCount;
    const stackStep = Math.PI / stackCount;
    const radius = 2;

    for (i = 0; i <= stackCount; ++i) {
      const stackAngle = Math.PI / 2 - i * stackStep; // starting from pi/2 to -pi/2
      const xy = radius * Math.cos(stackAngle); // r * cos(u)
      const z = radius * Math.sin(stackAngle); // r * sin(u)

      // add (sectorCount+1) vertices per stack
      // the first and last vertices have same position and normal, but different tex coords
      for (j = 0; j <= sectorCount; ++j) {
        const sectorAngle = j * sectorStep; // starting from 0 to 2pi

        // vertex position (x, y, z)
        const x = xy * Math.cos(sectorAngle); // r * cos(u) * cos(v)
        const y = xy * Math.sin(sectorAngle); // r * cos(u) * sin(v)
        positions.push([x, y, z]);

        // normalized vertex normal (nx, ny, nz)
        normals.push([x / 2, y / 2, z / 2]);
      }
    }

    for (i = 0; i < stackCount; ++i) {
      let k1 = i * (sectorCount + 1); // beginning of current stack
      let k2 = k1 + sectorCount + 1; // beginning of next stack

      for (j = 0; j < sectorCount; ++j, ++k1, ++k2) {
        // 2 triangles per sector excluding first and last stacks
        // k1 => k2 => k1+1
        if (i !== 0) {
          indices.push(k1);
          indices.push(k2);
          indices.push(k1 + 1);
        }

        // k1+1 => k2 => k2+1
        if (i !== stackCount - 1) {
          indices.push(k1 + 1);
          indices.push(k2);
          indices.push(k2 + 1);
        }
      }
    }

    this.positionBuffer = new Vector3Buffer(gl, positions);
    this.normalBuffer = new Vector3Buffer(gl, normals);
    this.indexBuffer = new IndexBuffer(gl, indices);

    this.gl.useProgram(this.shader.getProgram());
    this.vertexPositionAttribute = this.shader.getAttributeLocation("vertexPosition");
    this.vertexNormalAttribute = this.shader.getAttributeLocation("vertexNormal");
    this.normalMatrixUniform = this.shader.getUniformLocation(
      "normalMatrix"
    ) as WebGLUniformLocation;
    this.modelViewMatrixUniform = this.shader.getUniformLocation(
      "modelViewMatrix"
    ) as WebGLUniformLocation;
    this.projectionMatrixUniform = this.shader.getUniformLocation(
      "projectionmatrix"
    ) as WebGLUniformLocation;
    this.colorUniform = this.shader.getUniformLocation("color") as WebGLUniformLocation;
  }

  public render(modelMatrix: mat4, viewMatrix: mat4, projectionMatrix: mat4) {
    this.positionBuffer.bindToAttribute(this.vertexPositionAttribute);
    this.normalBuffer.bindToAttribute(this.vertexNormalAttribute);
    this.indexBuffer.bindToAttribute();

    const modelViewMatrix = mat4.create();
    mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(this.normalMatrixUniform, false, normalMatrix);
    this.gl.uniform4fv(this.colorUniform, Color.fromHex("#e74c3c"));

    const vertexCount = this.indexBuffer.getLength();
    const type = this.gl.UNSIGNED_SHORT;
    const offset = 0;
    this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
  }

  destroy() {
    this.positionBuffer.destroy();
    this.normalBuffer.destroy();
    this.indexBuffer.destroy();
    this.shader.destroy();
  }
}
