import {FloatBuffer} from "./FloatBuffer";
import {color4} from "../Color";

export class Color4Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, colors: color4[]) {
    super(gl, colors.flat(1), 4);
  }

  public getWidth() {
    return 4;
  }
}
