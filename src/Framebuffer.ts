import { Texture } from "./Texture";

export class Framebuffer {
  private readonly gl: WebGL2RenderingContext;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly texture: Texture;

  constructor(gl: WebGL2RenderingContext, width: number, height: number){
    this.gl = gl;
    this.texture = new Texture(gl, width, height);

    const framebuffer = gl.createFramebuffer();
    if (framebuffer === null){
      throw new Error("Error creating framebuffer");
    }

    this.framebuffer = framebuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.texture.getGLTexture(), level);

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
  }

  public getFramebuffer() {
    return this.framebuffer;
  }

  public render(fn: (width: number, height: number) => void){
    const textureWidth = 256;
    const textureHeight = 256;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, textureWidth, textureHeight);

    try {
      fn(textureWidth, textureHeight);
    } finally {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
  }
}