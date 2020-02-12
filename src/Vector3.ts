export class Vector3 {
  public static epsilon = 0.00001;
  private readonly v: [number, number, number];
  constructor(x: [number, number, number] | number = 0, y: number = 0, z: number = 0){
    if (Array.isArray(x)){
      this.v = x;
    } else {
      this.v = [x as number, y!, z!];
    }
  }

  public add(v: Vector3) {
    return new Vector3(this.v[0] + v.v[0], this.v[1] + v.v[1], this.v[2] + v.v[2]);
  }

  /**
   * Get the angle between this and another vector in radians
   */
  public angleTo(v: Vector3) {
    return Math.acos(this.dot(v) / (this.length() * v.length()));
  }
  
  /**
   * Return a new Vector that is bounded by min and max: min.x <= this.x <= max.x, etc.
   */
  public bound(min: Vector3, max: Vector3){
    return new Vector3(
      Math.max(min.v[0], Math.min(max.v[0], this.v[0])),
      Math.max(min.v[1], Math.min(max.v[1], this.v[1])),
      Math.max(min.v[2], Math.min(max.v[2], this.v[2]))
    );
  }

  /**
   * Clone this vector
   */
  public clone() {
    return new Vector3(this.v[0], this.v[1], this.v[2]);
  }
  
  /**
   * Get the cross product (using the right hand rule) of this and another vector.
   */
  public cross(v: Vector3) {
    return new Vector3(
      this.v[1] * v.v[2] - this.v[2] * v.v[1],
      this.v[2] * v.v[0] - this.v[0] * v.v[2],
      this.v[0] * v.v[1] - this.v[1] * v.v[0]
    );
  }
  
  /**
   * Get the dot product of this and another vector.
   */
  public dot(v: Vector3) {
    return this.v[0] * v.v[0] + this.v[1] * v.v[1] + this.v[2] * v.v[2];
  }
  
  /**
   * Test for equality between this and another vector. Uses Vector3.epsilon as a bounding box.
   */
  public equals(v: Vector3) {
    return Math.abs(this.v[0] - v.v[0]) < Vector3.epsilon
      && Math.abs(this.v[1] - v.v[1]) < Vector3.epsilon
      && Math.abs(this.v[2] - v.v[2]) < Vector3.epsilon;
  }

  /**
   * Returns the horizontal angle (eg around the up axis) for this vector.
   */
  public getPhi(){
    return Math.asin(this.v[1] / this.length());
  }

  /**
   * Returns the vertical angle (eg around the x axis) for this vector.
   */
  public getTheta(){
    return Math.atan2(this.v[2], this.v[0]);
  }

  /**
   * Returns the Euclidean distance from tip to tail of this
   */
  public length() {
    return Math.sqrt(this.dot(this));
  }

  /**
   * Alias for subtract
   */
  public minus(v: Vector3): Vector3 {
    return this.subtract(v);
  }

  /**
   * Returns the negative of this vector: [-x, -y, -z]
   */
  public negative(): Vector3 {
    return new Vector3(-this.v[0], -this.v[1], -this.v[2]);
  }

  /**
   * Alias for Unit
   */
  public normalize(): Vector3 {
    return this.unit();
  }

  /**
   * Alias for add
   */
  public plus(v: Vector3): Vector3 {
    return this.add(v);
  }

  /**
   * Returns this vector's values scaled by scale: [x * scale, y * scale, z * scale]
   */
  public scale(scale: number){
    return new Vector3(this.v[0] * scale, this.v[1] * scale, this.v[2] * scale);
  }

  /**
   * Returns a new vector by subtracting another from this.
   */
  public subtract(v: Vector3) {
    return new Vector3(this.v[0] - v.v[0], this.v[1] - v.v[1], this.v[2] - v.v[2]);
  }

  /**
   * Returns [x, y, z]
   */
  public toArray(){
    return [...this.v];
  }

  /**
   * Prints when using string interpolation: `Vector: ${vector}`
   */
  public toString(){
    const [a, b, c] = this.v;
    return `[${a.toFixed(3)}, ${b.toFixed(2)}, ${c.toFixed(2)}]`;
  }

  /**
   * Returns another vector with length 1 "pointing" in the same direction as this one.
   */
  public unit(){
    const length = this.length();
    if (Math.abs(length) < Vector3.epsilon){
      return new Vector3(1, 0, 0);
    } else {
      return this.scale(1.0 / length);
    }
  }

  /**
   * Returns an up vector from this and a right vector.
   */
  public up(right: Vector3){
    return this.cross(right).cross(this).scale(this.length());
  }

  /**
   * Returns the x component of this vector 
   */
  public x(){
    return this.v[0]
  }

  /**
   * Returns the y component of this vector 
   */
  public y(){
    return this.v[1];
  }

  /**
   * Returns the z component of this vector 
   */
  public z(){
    return this.v[2];
  }

  /**
   * Returns mixing of the two vectors by the given amount. 
   * @param mix How much of the Right vector is in the mix.
   *  0.0 => 100% left;
   *  1.0 => 100% right;
   *  0.5 => 50% left, 50% right
   */
  public static lerp(left: Vector3, right: Vector3, mix: number){
    const vL = left.toArray();
    const vR = right.toArray();

    return new Vector3(
      mix * vL[0] + (1.0 - mix) * vR[0],
      mix * vL[1] + (1.0 - mix) * vR[1],
      mix * vL[2] + (1.0 - mix) * vR[2],
    );
  }

  /**
   * Returns a unit vector pointing along the x axis.
   */
  public static x(){
    return new Vector3(1, 0, 0);
  }

  /**
   * Returns a unit vector pointing along the y axis.
   */
  public static y(){
    return new Vector3(0, 1, 0);
  }

  /**
   * Returns a unit vector pointing along the z axis.
   */
  public static z(){
    return new Vector3(0, 0, 1);
  }
}
