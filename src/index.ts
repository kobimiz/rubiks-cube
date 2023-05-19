import Shader from "./shader";

import * as cubeVertex from './shaders/cube-vert';
import * as cubeFragment from './shaders/cube-frag';
import RubiksCube from "./rubiksCube";
import { ColorName, Cube } from "./cube";
import { glMatrix, mat4, vec3 } from "gl-matrix";

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

let fps = 30;
let time_delta = 1000 / fps;

let axis_colors = {
    front: ColorName.BLACK,
    back: ColorName.BLACK,
    up: ColorName.BLACK,
    down: ColorName.BLACK,
    right: ColorName.BLACK,
    left: ColorName.BLACK,
}

let axis = {
    x: new Cube(gl, shader, [0.5,0,0], [10, 0.1, 0.1], axis_colors),
    y: new Cube(gl, shader, [0,0.5,0], [0.1, 10, 0.1], axis_colors),
    z: new Cube(gl, shader, [0,0,0.5], [0.1, 0.1, 10], axis_colors),
}
let id = mat4.create();
mat4.lookAt(id, [20,20,20], [0,0,0], [0,1,0]);

function draw(gl: WebGL2RenderingContext) {
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rubiks_cube.draw();

    
    // axis.x.draw(id);
    // axis.y.draw(id);
    // axis.z.draw(id);
}

setInterval(draw, time_delta, gl);
console.log(rubiks_cube)

let i = 0;
document.addEventListener('keydown', e => {
    if (e.key == 'ArrowDown') {
        rubiks_cube.turnRight();
    } else if (e.key == 'ArrowUp') {
        rubiks_cube.turnUp();
    } else if (e.key == 'ArrowLeft') {
        rubiks_cube.turnLeft();
    } else if (e.key == 'ArrowRight') {
        rubiks_cube.turnDown();
    } else if (e.key == 'e') {
        rubiks_cube.turnFront();
    } else if (e.key == 'r') {
        rubiks_cube.turnBack();
    }
});

document.addEventListener('keydown', e => {
    const cameraSpeed = 0.2;

    let frontScaled = vec3.scale([0,0,0], rubiks_cube.cameraFront, cameraSpeed);
    let cross = vec3.cross([0,0,0], rubiks_cube.cameraFront, rubiks_cube.cameraUp);
    vec3.normalize(cross, cross);
    vec3.scale(cross, cross, cameraSpeed);

    if (e.key == 'w')
        vec3.add(rubiks_cube.cameraPos, rubiks_cube.cameraPos, frontScaled)
    else if (e.key == 's')
        vec3.sub(rubiks_cube.cameraPos, rubiks_cube.cameraPos, frontScaled)
    else if (e.key == 'a')
        vec3.sub(rubiks_cube.cameraPos, rubiks_cube.cameraPos, cross)
    else if (e.key == 'd')
        vec3.add(rubiks_cube.cameraPos, rubiks_cube.cameraPos, cross)
});

let clicked = false;
let lastX = 1000 / 2;
let lastY = 1000 / 2;
let firstMouse = false;
let inter: number = -1;
let shouldClear = false;

canvas.addEventListener('mousedown', e => {
    clicked = true;
    lastX = e.clientX;
    lastY = e.clientY;

    if (inter === -1) {
        inter = setInterval(() => {
            let direction = new Float32Array([
                Math.cos(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
                Math.sin(glMatrix.toRadian(rubiks_cube.pitch)),
                Math.sin(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
            ]);
            // camera distance from 0,0,0: sqrt(74)
            let dist = Math.sqrt(74);
            vec3.normalize(direction, direction);
            vec3.add(rubiks_cube.cameraPos, rubiks_cube.cameraPos, direction);
            let len = vec3.length(rubiks_cube.cameraPos);
            vec3.scale(rubiks_cube.cameraPos, rubiks_cube.cameraPos, dist / len);

            if (shouldClear) {
                let angle = vec3.angle(rubiks_cube.cameraPos, direction);
                if (angle < 0.02) {
                    clearInterval(inter);
                    inter = -1;
                    shouldClear = false;
                }
            }
        }, time_delta) as unknown as number;
    }
});

window.addEventListener('mouseup', e => {
    if (inter !== -1) {
        let direction = new Float32Array([
            Math.cos(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
            Math.sin(glMatrix.toRadian(rubiks_cube.pitch)),
            Math.sin(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
        ]);

        let angle = vec3.angle(rubiks_cube.cameraPos, direction);
        if (angle > 0.05) {
            shouldClear = true;
        } else {
            clearInterval(inter);
            inter = -1;
        }
    }
    clicked = false;
});

window.addEventListener('mousemove', e => {
    if (clicked) {
        if (firstMouse) {
            lastX = e.clientX;
            lastY = e.clientY;
            firstMouse = false;
        }

        let xoffset = e.clientX - lastX;
        let yoffset = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        let sensitivity = 0.15;
        xoffset *= sensitivity;
        yoffset *= sensitivity;

        rubiks_cube.yaw += xoffset;
        rubiks_cube.pitch += yoffset;

        if (rubiks_cube.pitch > 89)
            rubiks_cube.pitch = 89;
        else if (rubiks_cube.pitch < -89)
            rubiks_cube.pitch = -89;
    }
});
