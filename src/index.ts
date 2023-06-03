import Shader from "./shader";

import * as cubeVertex from './shaders/cube-vert';
import * as cubeFragment from './shaders/cube-frag';
import * as borderFrag from './shaders/border-frag';
import { RubiksCube, Face } from "./rubiksCube";
import { Cube } from "./cube";
import { glMatrix, mat4, vec3, quat} from "gl-matrix";
import { Shuffler } from "./shuffler";

let canvas = document.getElementsByTagName('canvas')[0];
let gl = canvas.getContext('webgl2', { stencil: true }); // stencil option is important

if (gl == null)
    throw "Can't get webgl2 context.";

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.STENCIL_TEST);
gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);

let shader = new Shader(gl, cubeVertex.default, cubeFragment.default);
let shader_outline = new Shader(gl, cubeVertex.default, borderFrag.default);

shader.use();

Cube.init(gl);
let rubiks_cube = new RubiksCube(3, gl, shader, shader_outline)

let fps = 30;
let time_delta = 1000 / fps;

function draw(gl: WebGL2RenderingContext) {
    gl.clearColor(0.2, 0.3, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    let view = mat4.create();
    mat4.lookAt(view, rubiks_cube.cameraPos, [0,0,0], rubiks_cube.cameraUp);
    let q = quat.create();
    quat.fromEuler(q, rubiks_cube.pitch, rubiks_cube.yaw, rubiks_cube.roll);
    let m = mat4.create();
    mat4.fromQuat(m, q);
    mat4.mul(view, view, m);

    rubiks_cube.draw();
}

let drawInterval = setInterval(draw, time_delta, gl);

document.addEventListener('keydown', e => {
    let side_to_rotate = e.key.toLowerCase();
    if (side_to_rotate == 'r')
        rubiks_cube.turnRight(e.shiftKey);
    else if (side_to_rotate == 'u')
        rubiks_cube.turnUp(e.shiftKey);
    else if (side_to_rotate == 'l')
        rubiks_cube.turnLeft(e.shiftKey);
    else if (side_to_rotate == 'd')
        rubiks_cube.turnDown(e.shiftKey);
    else if (side_to_rotate == 'f')
        rubiks_cube.turnFront(e.shiftKey);
    else if (side_to_rotate == 'b')
        rubiks_cube.turnBack(e.shiftKey);
    else if (e.key == 'ArrowRight')
        rubiks_cube.turnY(false);
    else if (e.key == 'ArrowLeft')
        rubiks_cube.turnY(true);
    else if (e.key == 'ArrowUp')
        rubiks_cube.turnX(true);
    else if (e.key == 'ArrowDown')
        rubiks_cube.turnX(false);

});
console.log(rubiks_cube)

let shuffler = new Shuffler(rubiks_cube);

document.getElementById('shuffle')?.addEventListener('click', e => {
    time_delta /= 3;

    clearInterval(drawInterval);
    drawInterval = setInterval(() => {
        draw(gl as WebGL2RenderingContext);

        if (rubiks_cube.animation == null && rubiks_cube.actionQueue.length == 0) {
            clearInterval(drawInterval);

            time_delta *= 3;
            drawInterval = setInterval(draw, time_delta, gl) as unknown as NodeJS.Timer;
        }
    }, time_delta) as unknown as NodeJS.Timer;
    console.log(shuffler.shuffle(10));
    
});

// document.addEventListener('keydown', e => {
//     const cameraSpeed = 0.2;

//     let frontScaled = vec3.scale([0, 0, 0], rubiks_cube.cameraFront, cameraSpeed);
//     let cross = vec3.cross([0, 0, 0], rubiks_cube.cameraFront, rubiks_cube.cameraUp);
//     vec3.normalize(cross, cross);
//     vec3.scale(cross, cross, cameraSpeed);

//     if (e.key == 'w')
//         vec3.add(rubiks_cube.cameraPos, rubiks_cube.cameraPos, frontScaled)
//     else if (e.key == 's')
//         vec3.sub(rubiks_cube.cameraPos, rubiks_cube.cameraPos, frontScaled)
//     else if (e.key == 'a')
//         vec3.sub(rubiks_cube.cameraPos, rubiks_cube.cameraPos, cross)
//     // else if (e.key == 'd')
//     //     vec3.add(rubiks_cube.cameraPos, rubiks_cube.cameraPos, cross)
// });

// let clicked = false;
// let lastX = 1000 / 2;
// let lastY = 1000 / 2;
// let firstMouse = false;
// let inter: number = -1;
// let shouldClear = false;

// canvas.addEventListener('mousedown', e => {
//     clicked = true;
//     lastX = e.clientX;
//     lastY = e.clientY;

//     if (inter === -1) {
//         inter = setInterval(() => {
//             // let direction = new Float32Array([
//             //     Math.cos(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
//             //     Math.sin(glMatrix.toRadian(rubiks_cube.pitch)),
//             //     Math.sin(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
//             // ]);
//             let direction = new Float32Array([
//                 Math.cos(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
//                 Math.sin(glMatrix.toRadian(rubiks_cube.pitch)),
//                 Math.sin(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
//             ]);
//             // camera distance from 0,0,0: sqrt(74)
//             let dist = Math.sqrt(74);
//             vec3.normalize(direction, direction);
//             vec3.add(rubiks_cube.cameraPos, [0,0,0], direction);
//             let len = vec3.length(rubiks_cube.cameraPos);
//             vec3.scale(rubiks_cube.cameraPos, rubiks_cube.cameraPos, dist / len);

//             if (shouldClear) {
//                 let angle = vec3.angle(rubiks_cube.cameraPos, direction);
//                 if (angle < 0.02) {
//                     clearInterval(inter);
//                     inter = -1;
//                     shouldClear = false;
//                 }
//             }
//         }, time_delta) as unknown as number;
//     }
// });

// window.addEventListener('mouseup', e => {
//     if (inter !== -1) {
//         let direction = new Float32Array([
//             Math.cos(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
//             Math.sin(glMatrix.toRadian(rubiks_cube.pitch)),
//             Math.sin(glMatrix.toRadian(rubiks_cube.yaw)) * Math.cos(glMatrix.toRadian(rubiks_cube.pitch)),
//         ]);

//         let angle = vec3.angle(rubiks_cube.cameraPos, direction);
//         if (angle > 0.05) {
//             shouldClear = true;
//         } else {
//             clearInterval(inter);
//             inter = -1;
//         }
//     }
//     clicked = false;
// });

// let rotationsStage = {
//     x: 0,
//     y: 1,
// }

// window.addEventListener('mousemove', e => {
//     if (clicked) {
//         if (firstMouse) {
//             lastX = e.clientX;
//             lastY = e.clientY;
//             firstMouse = false;
//         }

//         let xoffset = e.clientX - lastX;
//         let yoffset = e.clientY - lastY;
//         lastX = e.clientX;
//         lastY = e.clientY;

//         let sensitivity = 0.15;
//         xoffset *= sensitivity;
//         yoffset *= sensitivity;

//         rubiks_cube.yaw += xoffset;
//         rubiks_cube.pitch += yoffset;

//         if (rubiks_cube.pitch > 89)
//             rubiks_cube.pitch = 89;
//         else if (rubiks_cube.pitch < -89)
//             rubiks_cube.pitch = -89;


//         let angle_x = 180 / Math.PI * vec3.angle(rubiks_cube.cameraPos, [1, 0, 0]);
//         let angle_y = 180 / Math.PI * vec3.angle(rubiks_cube.cameraPos, [0, 1, 0]);
//         let angle_z = 180 / Math.PI * vec3.angle(rubiks_cube.cameraPos, [0, 0, -1]);
        
//         if (rubiks_cube.cameraPos[2] > 0)
//             angle_x = 360 - angle_x;

//         let y_changed = false
//         console.log(angle_y, rotationsStage.y)
//         if (angle_y < 45) {
//             if (rotationsStage.y == 1) y_changed = rubiks_cube.do_x(true);
//             else if (rotationsStage.y == 2) y_changed = rubiks_cube.do_x(false);
//             rotationsStage.y = 0;
//         } else if (angle_y < 135) {
//             if (rotationsStage.y == 2) y_changed = rubiks_cube.do_x(false);
//             else if (rotationsStage.y == 0) y_changed = rubiks_cube.do_x(true);
//             rotationsStage.y = 1;
//         } else {
//             if (rotationsStage.y == 0) y_changed = rubiks_cube.do_x(true);
//             else if (rotationsStage.y == 1) y_changed = rubiks_cube.do_x(false);
//             rotationsStage.y = 2;
//         } 

//         if (y_changed) return;

//         if (angle_x < 45 || angle_x > 315) {
//             if (rotationsStage.x == 1) rubiks_cube.do_y(true);
//             else if (rotationsStage.x == 3) rubiks_cube.do_y(false);
//             rotationsStage.x = 0;
//         } else if (angle_x < 135) {
//             if (rotationsStage.x == 2) rubiks_cube.do_y(true);
//             else if (rotationsStage.x == 0) rubiks_cube.do_y(false);
//             rotationsStage.x = 1;
//         } else if (angle_x < 225) {
//             if (rotationsStage.x == 3) rubiks_cube.do_y(true);
//             else if (rotationsStage.x == 1) rubiks_cube.do_y(false);
//             rotationsStage.x = 2;
//         } else {
//             if (rotationsStage.x == 0) rubiks_cube.do_y(true);
//             else if (rotationsStage.x == 2) rubiks_cube.do_y(false);
//             rotationsStage.x = 3;
//         }
//     }
// });