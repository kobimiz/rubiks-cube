import Shader from "./shader";

import * as cubeVertex from './shaders/cube-vert';
import * as cubeFragment from './shaders/cube-frag';
import RubiksCube from "./rubiksCube";
import { Cube } from "./cube";

let canvas = document.getElementsByTagName('canvas')[0];
let gl = canvas.getContext('webgl2');

if (gl == null)
    throw "Can't get webgl2 context.";

gl.enable(gl.DEPTH_TEST);

// textures...

let shader = new Shader(gl, cubeVertex.default, cubeFragment.default);
shader.use();
// shader.setNumber("texture1");

Cube.init(gl);
let rubiks_cube = new RubiksCube(3, gl, shader)

// let cube = new Cube(gl, shader, [0.3, 0, 0], [0.5, 0.5, 0.5], [0.3, 0.5, 0.7, 1.0]);

let fps = 20;
let time_delta = 1000 / fps;

function draw(gl: WebGL2RenderingContext) {
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // cube.draw();
    rubiks_cube.draw();
}

setInterval(draw, time_delta, gl);