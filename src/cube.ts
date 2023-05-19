import { mat4 } from "gl-matrix";
import Shader from "./shader";

const Color = [
    [183/255,18/255,52/255,1],
    [1,1,1,1],
    [1,213/255,0,1],
    [1,88/255,0,1],
    [0,70/255,173/255,1],
    [0,155/255,72/255,1],
    [0,0,0,1],
]

enum ColorName {
    RED,
    WHITE,
    YELLOW,
    ORANGE,
    BLUE,
    GREEN,
    BLACK,
}

type CubeColors = {
    back: ColorName,
    front: ColorName,
    left: ColorName,
    right: ColorName,
    down: ColorName,
    up: ColorName,
}

class Cube {
    static vertices: Float32Array;
    static colors: Float32Array;
    static vboVertices: WebGLBuffer | null;

    gl: WebGL2RenderingContext;
    vao: WebGLVertexArrayObject | null;
    vboColor: WebGLBuffer | null;
    shader: Shader;

    pos: Float32Array;
    scale: Float32Array;

    rotationMatrix: mat4;
    x_axis: Float32Array;
    y_axis: Float32Array;
    z_axis: Float32Array;

    constructor(gl: WebGL2RenderingContext, shader: Shader, pos: Array<number>, scale: Array<number>, color: CubeColors) {
        this.gl = gl;
        this.shader = shader;

        this.vao = gl.createVertexArray();
        this.vboColor = gl.createBuffer();

        this.pos = new Float32Array(pos);
        this.scale = new Float32Array(scale);
        
        this.rotationMatrix = mat4.create();
        
        this.x_axis = new Float32Array([1,0,0]);
        this.y_axis = new Float32Array([0,1,0]);
        this.z_axis = new Float32Array([0,0,1]);

        // back, front, left, right, down, up
        let color_buffer = new Float32Array([
            Cube.getFaceColor(color.back),
            Cube.getFaceColor(color.front),
            Cube.getFaceColor(color.left),
            Cube.getFaceColor(color.right),
            Cube.getFaceColor(color.down),
            Cube.getFaceColor(color.up),
        ].flat(2));
        
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vboVertices);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0 * 4);
        gl.enableVertexAttribArray(0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboColor);
        gl.bufferData(gl.ARRAY_BUFFER, color_buffer, gl.STATIC_DRAW);

        gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 4 * 4, 0 * 4);
        gl.enableVertexAttribArray(1);

        // textures...
        shader.use();
        // shader.setNumber("texture1");
    }

    draw(view: mat4) {
        this.shader.use();
        
        // let view       = mat4.create();
        let projection = mat4.create();
        mat4.perspective(
            projection,
            45.0,
            1000.0 / 1000.0,
            0.1,
            100.0
        );

        // mat4.translate(view, view, this.pos);
        // projection = glm::perspective(glm::radians(45.0f), (float)SCR_WIDTH / (float)SCR_HEIGHT, 0.1f, 100.0f);
        // view       = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
        // pass transformation matrices to the shader
        this.shader.setMat4("view", view);
        this.shader.setMat4("projection", projection);
        this.shader.setMat4("rotation", this.rotationMatrix);
    
        // render boxes
        this.gl.bindVertexArray(this.vao);
        for (let i = 0; i < 1; i++) {
            let model = mat4.create();
            // model = glm::translate(model, cubePositions[i]);
            // float angle = 20.0f * i;/
            // model = glm::rotate(model, glm::radians(angle), glm::vec3(1.0f, 0.3f, 0.5f));

            mat4.scale(model, model, this.scale);
            mat4.translate(model, model, this.pos);

            // mat4.rotate(
            //     model,
            //     model,
            //     (Math.sin(new Date().getTime() / 1000) + 1) * Math.PI / 2,
            //     [0.3, 0.7, 0.1]
            // );

            this.shader.setMat4("model", model);
            
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);
        }
    }

    rotate(mat: mat4) {
        mat4.multiply(this.rotationMatrix, this.rotationMatrix, mat);
    }

    static init(gl: WebGL2RenderingContext) {
        Cube.vboVertices = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vboVertices);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
    }

    static getFaceColor(color: ColorName) {
        return [
            Color[color],
            Color[color],
            Color[color],
            Color[color],
            Color[color],
            Color[color],
        ];
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

Cube.colors = new Float32Array([
    // back
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,

    // front
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5, -0.5,  0.5,

    // left
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5,  0.5,
    -0.5,  0.5,  0.5,

    // right
     0.5,  0.5,  0.5,
     0.5,  0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,

    // down
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
    -0.5, -0.5,  0.5,
    -0.5, -0.5, -0.5,

    // up
    -0.5,  0.5, -0.5,
     0.5,  0.5, -0.5,
     0.5,  0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,
    -0.5,  0.5, -0.5,
]);


export { Cube, Color, ColorName, CubeColors };