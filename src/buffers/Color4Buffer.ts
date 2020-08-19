import {FloatBuffer} from "./FloatBuffer";
import {Color4} from "../Color";

export class Color4Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, colors: Color4[]) {
    super(gl, colors.flat(1), 4);
  }

  public getWidth() {
    return 4;
  }

  public updateColors (colors: Color4[], offset: number = 0) {
    return this.update(colors.flat(1));
  }
}
