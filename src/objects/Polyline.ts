import { mat4 } from "gl-matrix";
import { color4, Vector3, vector3 } from "../types";
import { Color4Buffer, IndexBuffer, Vector3Buffer } from "../buffers";
import { VertexColorRenderer } from "../renderers";

export class Polyline {
  private vertices: vector3[] = [];
  private colors: color4[] = [];
  private thicknesses: number[] = [];

  private vertexBuffer: Vector3Buffer;
  private colorBuffer: Color4Buffer;
  private indexBuffer: IndexBuffer;
  private gl: WebGL2RenderingContext;
  private renderer: VertexColorRenderer;

  constructor(gl: WebGL2RenderingContext){
    this.gl = gl;
    this.renderer = new VertexColorRenderer(gl);
    this.vertexBuffer = new Vector3Buffer(gl, []);
    this.colorBuffer = new Color4Buffer(gl, []);
    this.indexBuffer = new IndexBuffer(gl, []);
  }

  /** Clear the line. The buffers will be updated during the next render */
  public clearPoints(){
    this.vertices = [];
    this.colors = [];
    this.thicknesses = [];
  }

  /** Add a point with the given thickness, connected to the previous point (or starting a fresh line) */
  public addPoint(point: vector3, color: color4, thickness: number){
    this.vertices.push(point);
    this.colors.push(color);
    this.thicknesses.push(thickness);
  }

  public editPoint(index: number, point: vector3, color: color4, thickness: number){
    this.vertices[index] = point;
    this.colors[index] = color;
    this.thicknesses[index] = thickness;
  }

  public updateBuffers(){
    // add a left and right vertex for each point
    // using the normal of the line to determine the direction
    const triangleStripVertices: vector3[] = Array(this.vertices.length * 2).fill([0, 0, 0]);
    const colors: color4[] = Array(this.vertices.length * 2).fill([0, 0, 0, 0]);
    const indices: number[] = Array(this.vertices.length * 2).fill(0).map((_, i) => i);
    for (let i = 0; i < this.vertices.length; i++){
      const vertex = this.vertices[i];
      const thickness = this.thicknesses[i];
      const color = this.colors[i];

      let normal: vector3;
      if (i === 0){
        // get normal from next point
        const next = this.vertices[i + 1];
        normal = Vector3.scale(Vector3.normalize(Vector3.cross(Vector3.subtract(next, vertex), [0, 0, 1])), thickness);
      } else if (i === this.vertices.length - 1){
        const prev = this.vertices[i - 1];
        normal = Vector3.scale(Vector3.normalize(Vector3.cross(Vector3.subtract(vertex, prev), [0, 0, 1])), thickness);
      } else {
        const next = this.vertices[i + 1];
        const prev = this.vertices[i - 1];
        normal = Vector3.scale(Vector3.normalize(Vector3.cross(Vector3.subtract(next, prev), [0, 0, 1])), thickness);
      }

      triangleStripVertices[i*2] = Vector3.add(vertex, normal);
      triangleStripVertices[i*2 + 1] = Vector3.subtract(vertex, normal);
      colors[i*2] = color;
      colors[i*2 + 1] = color;
    }

    if (this.vertexBuffer.getLength() !== triangleStripVertices.length){
      this.vertexBuffer.destroy();
      this.vertexBuffer = new Vector3Buffer(this.gl, triangleStripVertices);
      this.colorBuffer.destroy();
      this.colorBuffer = new Color4Buffer(this.gl, colors);
      this.indexBuffer.destroy();
      this.indexBuffer = new IndexBuffer(this.gl, indices);
    } else {
      this.vertexBuffer.update(triangleStripVertices.flat());
      this.colorBuffer.update(colors.flat());
      this.indexBuffer.update(indices);
    }
  }

  /** Update data in buffers and render the line. */
  public render(viewMatrix: mat4, projectionMatrix: mat4){
    if (this.vertices.length < 2){
      return;
    } 

    const matrix = mat4.create();
    mat4.multiply(matrix, projectionMatrix, viewMatrix);

    this.renderer.render(
      this.vertexBuffer,
      this.colorBuffer,
      this.indexBuffer,
      matrix,
      this.gl.TRIANGLE_STRIP
    )
  }
}