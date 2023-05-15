import { glMatrix, mat4 } from "gl-matrix";


let canvas = document.getElementsByTagName('canvas')[0];
let gl = canvas.getContext('webgl2');

if (gl == null)
    throw "Can't get webgl2 context.";

gl.enable(gl.DEPTH_TEST);

let vertices = new Float32Array([
    -0.5, -0.5, -0.5,  0.0, 0.0,
     0.5, -0.5, -0.5,  1.0, 0.0,
     0.5,  0.5, -0.5,  1.0, 1.0,
     0.5,  0.5, -0.5,  1.0, 1.0,
    -0.5,  0.5, -0.5,  0.0, 1.0,
    -0.5, -0.5, -0.5,  0.0, 0.0,

    -0.5, -0.5,  0.5,  0.0, 0.0,
     0.5, -0.5,  0.5,  1.0, 0.0,
     0.5,  0.5,  0.5,  1.0, 1.0,
     0.5,  0.5,  0.5,  1.0, 1.0,
    -0.5,  0.5,  0.5,  0.0, 1.0,
    -0.5, -0.5,  0.5,  0.0, 0.0,

    -0.5,  0.5,  0.5,  1.0, 0.0,
    -0.5,  0.5, -0.5,  1.0, 1.0,
    -0.5, -0.5, -0.5,  0.0, 1.0,
    -0.5, -0.5, -0.5,  0.0, 1.0,
    -0.5, -0.5,  0.5,  0.0, 0.0,
    -0.5,  0.5,  0.5,  1.0, 0.0,

     0.5,  0.5,  0.5,  1.0, 0.0,
     0.5,  0.5, -0.5,  1.0, 1.0,
     0.5, -0.5, -0.5,  0.0, 1.0,
     0.5, -0.5, -0.5,  0.0, 1.0,
     0.5, -0.5,  0.5,  0.0, 0.0,
     0.5,  0.5,  0.5,  1.0, 0.0,

    -0.5, -0.5, -0.5,  0.0, 1.0,
     0.5, -0.5, -0.5,  1.0, 1.0,
     0.5, -0.5,  0.5,  1.0, 0.0,
     0.5, -0.5,  0.5,  1.0, 0.0,
    -0.5, -0.5,  0.5,  0.0, 0.0,
    -0.5, -0.5, -0.5,  0.0, 1.0,

    -0.5,  0.5, -0.5,  0.0, 1.0,
     0.5,  0.5, -0.5,  1.0, 1.0,
     0.5,  0.5,  0.5,  1.0, 0.0,
     0.5,  0.5,  0.5,  1.0, 0.0,
    -0.5,  0.5,  0.5,  0.0, 0.0,
    -0.5,  0.5, -0.5,  0.0, 1.0
]);

let positions = [
    [ 0.0,  0.0,  0.0],
    // [ 2.0,  5.0, -15.0],
    // [-1.5, -2.2, -2.5],
    // [-3.8, -2.0, -12.3],
    // [ 2.4, -0.4, -3.5],
    // [-1.7,  3.0, -7.5],
    // [ 1.3, -2.0, -2.5],
    // [ 1.5,  2.0, -2.5],
    // [ 1.5,  0.2, -1.5],
    // [-1.3,  1.0, -1.5]
];

let vao = gl.createVertexArray();
let vbo = gl.createBuffer();

gl.bindVertexArray(vao);
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0 * 4);
gl.enableVertexAttribArray(0);

gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
gl.enableVertexAttribArray(1);

// textures...

class Shader {
    gl: WebGL2RenderingContext;
    program: WebGLProgram;

    constructor(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
        this.gl = gl;

        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        
        if (!vertexShader || !fragmentShader)
        throw 'Error compiling creating shaders';
        
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

let vs = `#version 300 es
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexCoord;

// out vec2 TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{
    gl_Position = projection * view * model * vec4(aPos, 1.0f);
    // gl_Position = vec4(aPos, 1.0f);
    // TexCoord = vec2(aTexCoord.x, 1.0 - aTexCoord.y);
}`;

let fs = `#version 300 es
out highp vec4 FragColor;

// in highp vec2 TexCoord;

// uniform sampler2D texture1;
// uniform sampler2D texture2;

void main()
{
    // FragColor = mix(texture(texture1, TexCoord), texture(texture2, TexCoord), 0.2);
    FragColor = vec4(0.7, 0.7, 0.7, 1.0);
}`;

let shader = new Shader(gl, vs, fs);
shader.use();
// shader.setNumber("texture1");

let fps = 20;
let time_delta = 1000 / fps;

function draw(gl: WebGL2RenderingContext) {
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    shader.use();
    
    let view       = mat4.create();
    let projection = mat4.create();
    // projection = glm::perspective(glm::radians(45.0f), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
    // view       = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
    // pass transformation matrices to the shader
    shader.setMat4("view", view);
    shader.setMat4("projection", projection);

    // render boxes
    gl.bindVertexArray(vao);
    for (let i = 0; i < 1; i++) {
        console.log('drawing');
        // calculate the model matrix for each object and pass it to shader before drawing
        let model = mat4.create();
        // model = glm::translate(model, cubePositions[i]);
        // float angle = 20.0f * i;/
        // model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));
        mat4.rotate(
            model,
            model,
            (Math.sin(new Date().getTime() / 1000) + 1) * Math.PI / 2,
            [0.3, 0.7, 0.1]
        );
        shader.setMat4("model", model);
        
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}

// TODO handle draw parameter
setInterval(draw, time_delta, gl);

// gl.deleteVertexArray(vao);
// gl.deleteBuffer(vbo);