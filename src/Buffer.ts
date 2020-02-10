import { Vector3 } from "./Vector3";

abstract class Buffer {
  protected readonly gl: WebGL2RenderingContext;
  protected readonly buffer: WebGLBuffer;

  constructor(gl: WebGL2RenderingContext){
    this.gl = gl;
    const buffer = gl.createBuffer();
    if (buffer === null){
      throw new Error("Error creating buffer");
    }

    this.buffer = buffer;
  }
}

export class FloatBuffer extends Buffer {
  private readonly width: number;
  private readonly length: number;

  constructor(gl: WebGL2RenderingContext, data: number[], width: number){
    super(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    this.width = width;
    this.length = Math.ceil(data.length / width);
  }

  public bindToAttribute(attributeLocation: number){
    const type = this.gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.vertexAttribPointer(
        attributeLocation,
        this.width,
        type,
        normalize,
        stride,
        offset);
    this.gl.enableVertexAttribArray(attributeLocation);
  }

  public getWidth(){
    return this.width;
  }

  public getLength(){
    return this.length;
  }
};

export class Vector3Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, vectors: Vector3[]){
    super(gl, vectors.map(v => v.toArray).flat(1), 3);
  }

  public getWidth(){
    return 3;
  }
}

export class IndexBuffer extends Buffer {
  private readonly length: number;

  constructor(gl: WebGL2RenderingContext, data: number[]){
    super(gl);

    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
    this.length = data.length;
  }

  public bindToAttribute(attributeLocation: number){
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }
};