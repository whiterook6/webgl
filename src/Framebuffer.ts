import { Texture } from "./Texture";

export class Framebuffer {
  private readonly gl: WebGL2RenderingContext;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly texture: Texture;

  constructor(gl: WebGL2RenderingContext, texture: Texture){
    this.gl = gl;
    const framebuffer = gl.createFramebuffer();
    if (framebuffer === null){
      throw new Error("Error creating framebuffer");
    }

    this.framebuffer = framebuffer;
    this.texture = texture;
  }

  public getFramebuffer() {
    return this.framebuffer;
  }

  public getTexture(){
    return this.texture;
  }

  public bind(attachmentPoint: number){
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.getGLTexture());
    this.gl.viewport(0, 0, this.texture.getWidth(), this.texture.getHeight());
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachmentPoint, this.gl.TEXTURE_2D, this.texture.getGLTexture(), 0);
  }

  public unbind(){
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }
}