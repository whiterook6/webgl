import {mat4} from "gl-matrix";
import {IndexBuffer, Vector3Buffer} from "../buffers";
import {Shader} from "../Shader";
import {Color, vector3, Vector3} from "../types";

export const parseOBJ = (text: string, gl: WebGL2RenderingContext): any => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const vLines: vector3[] = [];
  const nLines: vector3[] = [];

  const vertices: vector3[] = [];
  const normals: vector3[] = [];
  const indices: number[] = [];

  let index = 0;
  for (const line of lines) {
    const [type, ...args] = line.split(/\s+/);

    switch (type.toLowerCase()) {
      case "v": // vertex=
        if (args.length === 3) {
          vLines.push([parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2])]);
        }
        break;

      case "vn": // vertex normal
        if (args.length === 3) {
          nLines.push([parseFloat(args[0]), parseFloat(args[1]), parseFloat(args[2])]);
        }
        break;

      case "f": // face
        const argsSplit = args.map((arg) => arg.split("/"));
        const vertexIndices = argsSplit.map((argSplit) => parseInt(argSplit[0], 10) - 1);
        const normalIndices = argsSplit.map((argSplit) => {
          if (argSplit.length > 2 && typeof argSplit[2] === "string" && argSplit[2].length > 0) {
            return parseInt(argSplit[2], 10) - 1;
          } else {
            return undefined;
          }
        });

        const faceVertices = vertexIndices.map((vertexIndex) => vLines[vertexIndex]);
        vertices.push(...faceVertices);

        const hasNormalIndices = normalIndices.every((normalIndex) => normalIndex !== undefined);
        if (hasNormalIndices) {
          normals.push(...normalIndices.map((normalIndex) => nLines[normalIndex!]));
        } else {
          // compute normal from faces

          const normal = Vector3.cross(
            Vector3.subtract(faceVertices[1], faceVertices[0]),
            Vector3.subtract(faceVertices[2], faceVertices[0])
          );
          const normalized = Vector3.normalize(normal);
          normals.push(normalized, normalized, normalized);
        }

        indices.push(index, index + 1, index + 2);
        index += 3;
        break;
    }
  }

  const obj = {
    vertices,
    normals,
    indices,
  };
  return obj;
};

export class ObjModel {
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

  constructor(
    gl: WebGL2RenderingContext,
    vertices: vector3[],
    normals: vector3[],
    indices: number[]
  ) {
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

    this.positionBuffer = new Vector3Buffer(gl, vertices);
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
    const scaledModelMatrix = mat4.create();
    mat4.scale(scaledModelMatrix, modelMatrix, [0.01, 0.01, 0.01]);
    mat4.multiply(modelViewMatrix, viewMatrix, scaledModelMatrix);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    this.gl.useProgram(this.shader.getProgram());
    this.gl.uniformMatrix4fv(this.projectionMatrixUniform, false, projectionMatrix);
    this.gl.uniformMatrix4fv(this.modelViewMatrixUniform, false, modelViewMatrix);
    this.gl.uniformMatrix4fv(this.normalMatrixUniform, false, normalMatrix);
    this.gl.uniform4fv(this.colorUniform, Color.fromHex("#ffffff"));

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
