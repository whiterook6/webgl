import {mat4} from "gl-matrix";

export abstract class Camera {
  public abstract getViewMatrix(): mat4;
}
