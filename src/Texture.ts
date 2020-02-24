export class Texture {
  private readonly gl: WebGL2RenderingContext;
  private readonly texture: WebGLTexture;
  private readonly width: number;
  private readonly height: number;

  constructor(gl: WebGL2RenderingContext, textureWidth: number, textureHeight: number) {
    this.gl = gl;
    this.width = textureWidth;
    this.height = textureHeight;

    const texture = gl.createTexture();
    if (texture === null){
      throw new Error("Error creating texture");
    }

    this.texture = texture;

    // set options for this texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, // other options are for 3d textures
      0, // mipmap reduction level
      gl.RGBA, // internal storage format
      textureWidth,
      textureHeight,
      0, // border of the texture. must be 0.
      gl.RGBA, // format of texel data. Should _probably_ be the same as the internal data above
      gl.UNSIGNED_BYTE, // 8-bits per channel (4 bytes total per texel),
      null
    );

    gl.texParameteri( // set the filtering so we don't need mips
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );
    gl.texParameteri( // no wrapping; clamp to edge
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      gl.CLAMP_TO_EDGE
    );
    gl.texParameteri( // no wrapping; clamp
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      gl.CLAMP_TO_EDGE
    );
  }

  public getWidth(){
    return this.width;
  }

  public getHeight(){
    return this.height;
  }

  public getGLTexture(){
    return this.texture;
  }
}
