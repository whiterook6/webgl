import {Buffer} from ".";

export class FloatBuffer extends Buffer {
  private readonly width: number;

  /**
   * @param mode Either gl.STATIC_DRAW or gl.DYNAMIC_DRAW, depending on if you intend to update or not. Default is Static.
   */
  constructor(
    gl: WebGL2RenderingContext,
    data: number[] | Float32Array,
    width: number,
    mode: number = gl.STATIC_DRAW
  ) {
    super(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), mode);

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

  public unbindFromAttribute(attributeLocation: number) {
    this.gl.disableVertexAttribArray(attributeLocation);
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

  public update(data: number[] | Float32Array, offset: number = 0) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, new Float32Array(data));
  }
}
