import { Vector3 } from "./Vector3";
import { Color4 } from "./Color";

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

  public getBuffer(): WebGLBuffer {
    return this.buffer;
  }
}

export class FloatBuffer extends Buffer {
  private readonly width: number;

  constructor(gl: WebGL2RenderingContext, data: number[], width: number){
    super(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    this.width = width;
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

  public getBytes(){
    return this.gl.getBufferParameter(this.gl.ARRAY_BUFFER, this.gl.BUFFER_SIZE) as number;
  }

  public getLength(){
    return this.getBytes() / (this.width * 4);
  }
};

export class Vector3Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, vectors: Vector3[]){
    super(gl, vectors.map(v => v.toArray()).flat(1), 3);
  }

  public getWidth(){
    return 3;
  }
}

export class Color4Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, colors: Array<Color4>){
    super(gl, colors.flat(1), 4);
  }

  public getWidth(){
    return 4;
  }
}

export class IndexBuffer extends Buffer {

  constructor(gl: WebGL2RenderingContext, data: number[]){
    super(gl);

    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
  }

  public bindToAttribute(){
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
  }

  public getBytes(){
    return this.gl.getBufferParameter(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.BUFFER_SIZE) as number;
  }

  public getLength(){
    return this.getBytes() / 2;
  }
};