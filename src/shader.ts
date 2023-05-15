import { mat4 } from "gl-matrix";

class Shader {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    constructor(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
        this.gl = gl;

        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader)
        throw 'Error compiling creating shaders';
        
        let vertex_source = 
        gl.shaderSource(vertexShader, vertex);
        gl.shaderSource(fragmentShader, fragment);
        
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);
        
        let err = gl.getShaderInfoLog(vertexShader);
        if (err) throw err;
        
        err = gl.getShaderInfoLog(fragmentShader);
        if (err) throw err;
        
        let program = gl.createProgram();
        if (!program)
        throw 'Error creating shader program';
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        
        gl.linkProgram(program);
        
        err = gl.getProgramInfoLog(program);
        if (err) throw err;
        
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);

        this.program = program;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setBool(name: string, value: boolean) {
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), +value);
    }

    setNumber(name: string, value: number) { 
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), value); 
    }

    // setInt(name: string, value: number) { 
    //     this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), value); 
    // }

    // setFloat(name: string, value: number) { 
    //     this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value); 
    // }

    // ------------------------------------------------------------------------
    // NOTE array length can be only (?1),2,3,4
    // TODO check
    setVec4(name: string, value: Array<number>) { 
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, name), value);
    }
    
    // NOTE length can be only (?1),2,3,4
    // TODO check
    
    setMat4(name: string, mat: mat4) {
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, name), false, mat);
    }
}

export default Shader;