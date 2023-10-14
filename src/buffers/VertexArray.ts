import { Buffer } from "./Buffer";

export class VertexArray extends Buffer{
  private readonly width: number;
  private readonly length: number;

  constructor(gl: WebGL2RenderingContext, data: number[] | Float32Array, width: number, mode: number = gl.STATIC_DRAW) {
    super(gl);
    const vertexArray = this.gl.createVertexArray();
    this.gl.bindVertexArray(vertexArray);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), mode);
    this.width = width;
    this.length = data.length / width;
  }

  public bindToAttribute(attributeLocation: number) {
    this.gl.enableVertexAttribArray(attributeLocation);
    this.gl.vertexAttribPointer(
      attributeLocation, // location
      this.width,        // size (num values to pull from buffer per iteration)
      this.gl.FLOAT,     // type of data in buffer
      false,             // normalize
      0,                 // stride (0 = compute from size and type above)
      0,                 // offset in buffer
    );
  }

  public unbind(attributeLocation: number) {
    this.gl.disableVertexAttribArray(attributeLocation);
  }

  public getLength = () => {
    return this.length
  }
}