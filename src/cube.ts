import { mat4 } from "gl-matrix";
import Shader from "./shader";

class Cube {
    static vertices: Float32Array;

    gl: WebGL2RenderingContext;
    vao: WebGLVertexArrayObject | null;
    vbo: WebGLBuffer | null;
    shader: Shader;

    constructor(gl: WebGL2RenderingContext, shader: Shader) {
        this.gl = gl;
        this.shader = shader;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
        
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * 4, 0 * 4);
        gl.enableVertexAttribArray(0);
        
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * 4, 3 * 4);
        gl.enableVertexAttribArray(1);
        
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
            console.log('drawing');
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
            this.shader.setMat4("model", model);
            
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
        }
    }
}

Cube.vertices = new Float32Array([
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


export default Cube;