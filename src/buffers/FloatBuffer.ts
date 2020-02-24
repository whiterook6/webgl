import {Buffer} from ".";

export class FloatBuffer extends Buffer {
  private readonly width: number;

  constructor(gl: WebGL2RenderingContext, data: number[], width: number) {
    super(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    this.width = width;
  }

  public bindToAttribute(attributeLocation: number) {
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(attributeLocation, this.width, type, normalize, stride, offset);
    this.gl.enableVertexAttribArray(attributeLocation);
  }

  public getWidth() {
    return this.width;
  }

  public getBytes() {
    return this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE) as number;
  }

  public getLength() {
    return this.getBytes() / (this.width * 4);
  }
}
