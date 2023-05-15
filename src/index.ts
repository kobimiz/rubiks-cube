import { mat4 } from "gl-matrix";
import Shader from "./shader";

import * as cubeVertex from './shaders/cube-vert';
import * as cubeFragment from './shaders/cube-frag';

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

let shader = new Shader(gl, cubeVertex.default, cubeFragment.default);
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