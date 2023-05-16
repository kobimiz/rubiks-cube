import { mat4 } from "gl-matrix";
import Shader from "./shader";

class Cube {
    static vertices: Float32Array;

    gl: WebGL2RenderingContext;
    vao: WebGLVertexArrayObject | null;
    vbo: WebGLBuffer | null;
    shader: Shader;

    pos: Float32Array;
    scale: Float32Array;
    color: Float32Array;

    constructor(gl: WebGL2RenderingContext, shader: Shader, pos: Array<number>, scale: Array<number>, color: Array<number>) {
        this.gl = gl;
        this.shader = shader;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();

        this.pos = new Float32Array(pos);
        this.scale = new Float32Array(scale);
        this.color = new Float32Array(color);
        
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0 * 4);
        gl.enableVertexAttribArray(0);
        
        // textures...
        shader.use();
        // shader.setNumber("texture1");
    }

    draw() {
        this.shader.use();
        
        let view       = mat4.create();
        let projection = mat4.create();
        // projection = glm::perspective(glm::radians(45.0f), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
        // view       = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
        // pass transformation matrices to the shader
        this.shader.setMat4("view", view);
        this.shader.setMat4("projection", projection);
    
        // render boxes
        this.gl.bindVertexArray(this.vao);
        for (let i = 0; i < 1; i++) {
            this.shader.setVec4("color", this.color);
            let model = mat4.create();
            // model = glm::translate(model, cubePositions[i]);
            // float angle = 20.0f * i;/
            // model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));

            mat4.scale(model, model, this.scale);
            mat4.translate(model, model, this.pos);

            mat4.rotate(
                model,
                model,
                (Math.sin(new Date().getTime() / 1000) + 1) * Math.PI / 2,
                [0.3, 0.7, 0.1]
            );

            this.shader.setMat4("model", model);
            
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
        }
    }
}

Cube.vertices = new Float32Array([
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,

    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,

    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,

     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,

    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,

    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
]);


export default Cube;