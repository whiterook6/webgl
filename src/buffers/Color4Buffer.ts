import {FloatBuffer} from "./FloatBuffer";
import {color4} from "../types";

export class Color4Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, colors: color4[], mode: number = gl.STATIC_DRAW) {
    super(gl, colors.flat(1), 4, mode);
  }

  public getWidth() {
    return 4;
  }

  public updateColors(colors: color4[], offset: number = 0) {
    return this.update(colors.flat(1));
  }
}
