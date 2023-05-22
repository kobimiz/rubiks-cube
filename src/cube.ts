import { mat4, vec3 } from "gl-matrix";
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
    shader2: Shader;

    pos: Float32Array;
    scale: Float32Array;

    rotationMatrix: mat4;

    selected: boolean;
    outlined: boolean;

    constructor(gl: WebGL2RenderingContext, shader: Shader, shader2: Shader, pos: Array<number>, scale: Array<number>, color: CubeColors) {
        this.gl = gl;
        this.shader = shader;
        this.shader2 = shader2;

        this.vao = gl.createVertexArray();
        this.vboColor = gl.createBuffer();

        this.pos = new Float32Array(pos);
        this.scale = new Float32Array(scale);
        
        this.rotationMatrix = mat4.create();

        this.selected = false;
        this.outlined = false;

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
    }

    draw(view: mat4) {   
        this.gl.bindVertexArray(this.vao);

        let projection = mat4.create();
        mat4.perspective(
            projection,
            45.0,
            1000.0 / 1000.0,
            0.1,
            100.0
        );
        
        let model = mat4.create();
        mat4.scale(model, model, this.scale);
        mat4.translate(model, model, this.pos);
        
        // pass transformation matrices to the shader
        this.shader.use();
        this.shader.setMat4("view", view);
        this.shader.setMat4("projection", projection);
        this.shader.setMat4("rotation", this.rotationMatrix);
        this.shader.setBool("selected", this.selected);
        this.shader.setMat4("model", model);

        this.gl.stencilFunc(this.gl.ALWAYS, 1, 0xff);
        this.gl.stencilMask(0xff);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);

        if (this.outlined) {
            let model = mat4.create();
            mat4.scale(model, model, vec3.scale([0,0,0], this.scale, 1.05));
            mat4.translate(model, model, this.pos);
    
            this.shader2.use();
            this.shader2.setMat4("view", view);
            this.shader2.setMat4("projection", projection);
            this.shader2.setMat4("rotation", this.rotationMatrix);
            this.shader2.setBool("selected", this.selected);
            this.shader2.setMat4("model", model);

            this.gl.stencilFunc(this.gl.NOTEQUAL, 1, 0xFF);
            this.gl.stencilMask(0x00);
            this.gl.disable(this.gl.DEPTH_TEST);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 36);

            this.gl.stencilMask(0xFF);
            this.gl.stencilFunc(this.gl.ALWAYS, 0, 0xFF);
            this.gl.enable(this.gl.DEPTH_TEST);
        }
        
    }

    rotate(mat: mat4) {
        mat4.multiply(this.rotationMatrix, mat, this.rotationMatrix);
    }

    select(on: boolean) {
        this.selected = on;
    }

    outline(on: boolean) {
        this.outlined = on;
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

export { Cube, Color, ColorName, CubeColors };