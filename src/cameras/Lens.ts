import {mat4} from "gl-matrix";

export abstract class Lens {
  public abstract getProjection(mat4?: mat4): mat4;
}
