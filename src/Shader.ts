export class Shader {
  private readonly gl: WebGL2RenderingContext;
  private readonly attributeLocations: {[key: string]: number}
  private readonly uniformLocations: {[key: string]: WebGLUniformLocation | null}
  private vertexShader?: WebGLShader;
  private fragmentShader?: WebGLShader;
  public program?: WebGLProgram;

  constructor(gl: WebGL2RenderingContext){
    this.gl = gl;
    this.attributeLocations = {};
    this.uniformLocations = {};
    this.attributeLocations = {};
  }

  /**
   * Adds and compiles WebGL 2 vertex shader code. If any part of this process throws an error, it will clean
   * up after itself.
   * 
   * @throws Error if the code cannot be compiled, if the shader cannot be allocated, or if the shader code isn't WebGL2
   */
  public addVertexSource(source: string){
    if (!source.startsWith("#version 300 es")){
      throw new Error("Vertex source code must be version 300 compliant. Start with #version 300 es");
    }

    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (vertexShader === null){
      throw new Error("Error creating empty Vertex Shader");
    }

    this.vertexShader = vertexShader;
    this.gl.attachShader(this.vertexShader, source);
    this.gl.compileShader(this.vertexShader);

    const compileStatus = this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS);
    if (!compileStatus){
      this.gl.deleteShader(this.vertexShader);
      this.vertexShader = undefined;
      throw new Error("Cannot compile vertex source");
    }

    return this;
  }

  /**
   * Adds and compiles WebGL 2 fragment shader code. If any part of this process throws an error, it will clean
   * up after itself.
   * 
   * @throws Error if the code cannot be compiled, if the shader cannot be allocated, or if the shader code isn't WebGL2
   */
  public addFragmentSource(source: string){
    if (!source.startsWith("#version 300 es")){
      throw new Error("Fragment source code must be version 300 compliant. Start with #version 300 es");
    }

    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (fragmentShader === null){
      throw new Error("Error creating empty Vertex Shader");
    }

    this.fragmentShader = fragmentShader;
    this.gl.attachShader(this.fragmentShader, source);
    this.gl.compileShader(this.fragmentShader);

    const compileStatus = this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS);
    if (!compileStatus){
      this.gl.deleteShader(this.fragmentShader);
      this.fragmentShader = undefined;
      throw new Error("Cannot compile fragment source");
    }

    return this;
  }

  /**
   * Takes this shader's vertx and fragment shader code and links them into a program.
   * Call after adding fragment and vertex code. If an error is thrown in the process,
   * the program is cleaned up.
   * 
   * @throws Error if the program cannot be allocated, the shaders cannot be attached,
   * the shaders cannot be linked, or the shader has already been linked.
   */
  public link(){
    if (this.program){
      throw new Error("This shader has already been linked.");
    } else if (!this.vertexShader){
      throw new Error("Vertex Shader not yet compiled. Add a vertex shader first.");
    } else if (!this.fragmentShader){
      throw new Error("Fragment Shader not yet compiled. Add a fragment shader first.");
    }

    const program = this.gl.createProgram();
    if (program === null){
      throw new Error("Error creating blank Shader Program");
    }

    this.gl.attachShader(program, this.vertexShader);
    this.gl.attachShader(program, this.fragmentShader);
    this.gl.linkProgram(program);

    const linkStatus: GLboolean = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (!linkStatus){
      try {
        this.gl.deleteProgram(program);
      } catch (error){
        console.error(error);
      }

      throw new Error("Cannot compile shader program");
    }

    this.gl.deleteShader(this.vertexShader);
    this.vertexShader = undefined;
    this.gl.deleteShader(this.fragmentShader);
    this.fragmentShader = undefined;

    return this;
  }

  /**
   * Gets this shader's WebGL Program.
   * 
   * @throws Error if this shader's program has already been compiled and linked.
   */
  public getProgram(): WebGLProgram {
    if (!this.program){
      throw new Error("Program already linked.");
    }

    return this.program as WebGLProgram;
  }

  /**
   * Gets the webgl location of an attribute in this shader program. This function caches
   * the location as that value will not change.
   * 
   * @throws Error if the program hasn't yet been linked.
   */
  public getAttributeLocation(attribute: string){
    if (!this.program){
      throw new Error("Cannot get attribute location. Link this shader first");
    }

    if (!this.attributeLocations.hasOwnProperty(attribute)){
      this.attributeLocations[attribute] = this.gl.getAttribLocation(this.program, attribute);
    }

    return this.attributeLocations[attribute];
  }

  /**
   * Gets the webgl location of an uniform in this shader program. This function caches
   * the location as that value will not change.
   * 
   * @throws Error if the program hasn't yet been linked.
   */
  public getUniformLocation(uniform: string){
    if (!this.program){
      throw new Error("Cannot get attribute location. Link this shader first");
    }
    if (!this.uniformLocations.hasOwnProperty(uniform)){
      const uniformLocation = this.gl.getUniformLocation(this.program, uniform);
    }
    return this.uniformLocations[uniform];
  }

  /**
   * Cleans up this shader's program and sources. Any errors thrown during the
   * clean up are caught and logged.
   */
  public destroy(){
    if (this.vertexShader){
      try {
        this.gl.deleteShader(this.vertexShader);
      } catch (error){
        console.error(error);
      }
      this.vertexShader = undefined;
    }

    if (this.fragmentShader){
      try {
        this.gl.deleteShader(this.fragmentShader);
      } catch (error){
        console.error(error);
      }
      this.fragmentShader = undefined;
    }

    if (this.program){
      try {
        this.gl.deleteProgram(this.program);
      } catch (error){
        console.error(error);
      }
      this.program = undefined;
    }
  }
}
