import { FloatBuffer } from "./FloatBuffer";
import { Color4 } from "../Color";

export class Color4Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, colors: Array<Color4>){
    super(gl, colors.flat(1), 4);
  }

  public getWidth(){
    return 4;
  }
}