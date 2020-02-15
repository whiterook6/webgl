import { FloatBuffer } from "./FloatBuffer";
import { Vector3 } from "../Vector3";

export class Vector3Buffer extends FloatBuffer {
  constructor(gl: WebGL2RenderingContext, vectors: Vector3[]){
    super(gl, vectors.map(v => v.toArray()).flat(1), 3);
  }

  public getWidth(){
    return 3;
  }
};
