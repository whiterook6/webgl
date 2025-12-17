import {Buffer} from ".";

export class IndexBuffer extends Buffer {
  constructor(gl: WebGL2RenderingContext, data: number[] | Uint16Array) {
    super(gl);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    if (Array.isArray(data)) {
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    } else {
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
  }

  public bindToAttribute() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }

  public unbindFromAttribute() {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
  }

  public getBytes() {
    return this.gl.getBufferParameter(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.BUFFER_SIZE) as number;
  }

  public getLength() {
    return this.getBytes() / 2;
  }

  public update(data: number[] | Uint16Array, offset: number = 0) {
    const gl = this.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, offset, new Uint16Array(data));
  }
}
