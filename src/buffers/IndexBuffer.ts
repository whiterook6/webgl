import { Buffer } from ".";

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
