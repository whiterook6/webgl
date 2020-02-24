export abstract class Buffer {
  protected readonly gl: WebGL2RenderingContext;
  protected readonly buffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    const buffer = gl.createBuffer();
    if (buffer === null) {
      throw new Error("Error creating buffer");
    }

    this.buffer = buffer;
  }

  public getBuffer(): WebGLBuffer {
    return this.buffer;
  }

  public destroy() {
    this.gl.deleteBuffer(this.buffer);
  }
}
