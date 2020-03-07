import {Texture} from "./Texture";

export class Framebuffer {
  private readonly gl: WebGL2RenderingContext;
  private readonly framebuffer: WebGLFramebuffer;
  private readonly depthBuffer: WebGLRenderbuffer;
  private readonly texture: Texture;

  constructor(gl: WebGL2RenderingContext, width: number, height: number) {
    this.gl = gl;

    // create a framebuffer, to which we will attach a texture for color and a render buffer for depth
    const framebuffer = gl.createFramebuffer();
    if (framebuffer === null) {
      throw new Error("Error creating framebuffer");
    }
    this.framebuffer = framebuffer;

    // create a texture for rendering to
    this.texture = new Texture(gl, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // attach the texture for rendering: color attachment
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture.getGLTexture(),
      0
    );

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    if (depthBuffer === null) {
      this.gl.deleteFramebuffer(this.framebuffer);
      this.texture.destroy();
      throw new Error("Error creating depthbuffer");
    }

    this.depthBuffer = depthBuffer;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
  }

  public getFramebuffer() {
    return this.framebuffer;
  }

  public render(fn: (width: number, height: number) => void) {
    const textureWidth = this.texture.getWidth();
    const textureHeight = this.texture.getHeight();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, textureWidth, textureHeight);

    try {
      fn(textureWidth, textureHeight);
    } finally {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
  }

  public destroy() {
    this.gl.deleteFramebuffer(this.framebuffer);
    this.texture.destroy();
    this.gl.deleteRenderbuffer(this.depthBuffer);
  }
}
