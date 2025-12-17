import {FloatBuffer} from "./FloatBuffer";
import {color4} from "../types";

export class Color4Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, colors: color4[] | Float32Array, mode?: number) {
    super(gl, Array.isArray(colors) ? colors.flat(1) : colors, 4, mode);
  }

  public getWidth() {
    return 4;
  }

  public updateColors(newColors: color4[], offset: number = 0) {
    if (Array.isArray(newColors)) {
      this.update(newColors.flat(1), offset);
    } else {
      this.update(newColors, offset);
    }
  }
}
