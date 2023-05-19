import { mat4, vec3, vec4 } from "gl-matrix";
import { Cube, ColorName } from "./cube";

import Shader from "./shader";

enum Face {
    RIGHT,
    LEFT,
    UP,
    DOWN,
    BACK,
    FRONT
};

class RubiksCube {
    cubes: Cube[];

    cameraPos: Float32Array;
    cameraFront: Float32Array;
    cameraUp: Float32Array;
    pitch: number;
    yaw: number;

    frontFace: Face;
    upFace: Face;

    animation: (() => void) | null;

    constructor(size: number, gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes = [];
        this.cameraPos = new Float32Array([4, 3, 7]);
        this.cameraFront = new Float32Array([0, 0, -1]);
        this.cameraUp = new Float32Array([0, 1, 0]);
        this.pitch = 0;
        this.yaw = 0;

        this.frontFace = Face.FRONT;
        this.upFace = Face.UP;

        this.animation = null;

        let scale = [1.0, 1.0, 1.0];

        /**
         * back:   0-8
         * front: 18-26
         * up:    6-8, 15-17, 24-26
         * down:  0-2, 9-11, 18-20
         * right: 2,5,8, 11,14,17, 20,23,26
         * left:  0,3,6, 9,12,15,  18,21,24
         */

        let face_color_map = {
            back:  [0 ,1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ],
            front: [18,19,20,21,22,23,24,25,26],
            up:    [6 ,7 ,8 ,15,16,17,24,25,26],
            down:  [0 ,1 ,2 ,9 ,10,11,18,19,20],
            right: [2 ,5 ,8 ,11,14,17,20,23,26],
            left:  [0 ,3 ,6 ,9 ,12,15,18,21,24],
        }

        let CubeColors = {
            front: ColorName.GREEN,
            up:    ColorName.YELLOW,
            down:  ColorName.WHITE,
            right: ColorName.ORANGE,
            left:  ColorName.RED,
            back:  ColorName.BLUE,
        };

        for (let i = 0; i < Math.pow(size, 3); i++) {
            // let x = 0.1 * i;
            // let y = 0.1 * i;
            let x = 1.1 * (i % 3) - 1.1;
            let y = 1.1 * (Math.floor(i / 3) % 3) - 1.1;
            let z = 1.1 * (Math.floor(i / 9) % 3) - 1.1;
            // let z = 0;
            let color = {
                front: ColorName.BLACK,
                up:    ColorName.BLACK,
                down:  ColorName.BLACK,
                right: ColorName.BLACK,
                left:  ColorName.BLACK,
                back:  ColorName.BLACK,
            };

            if (face_color_map.back.includes(i))
                color.back = CubeColors.back;
            if (face_color_map.front.includes(i))
                color.front = CubeColors.front;
            if (face_color_map.up.includes(i))
                color.up = CubeColors.up;
            if (face_color_map.down.includes(i))
                color.down = CubeColors.down;
            if (face_color_map.right.includes(i))
                color.right = CubeColors.right;
            if (face_color_map.left.includes(i))
                color.left = CubeColors.left;
            
            this.cubes.push(new Cube(gl, shader, [x, y, z] ,scale, color));
        }
    }

    draw() {
        if (this.animation !== null) {
            this.animation();
        }
        // let cameraTarget = [0,0,0];
        // let cameraDir = new Float32Array(cameraTarget);
        // vec3.sub(cameraDir, this.cameraPos, cameraDir);
        // vec3.normalize(cameraDir, cameraDir);

        // let up = new Float32Array([0,1,0]);
        // let cameraRight = vec3.create();
        // vec3.cross(up, up, cameraDir);
        // vec3.normalize(cameraRight, up);

        // let cameraUp = vec3.create();
        // vec3.cross(cameraUp, cameraDir, cameraRight);

        let radius = 10.0;
        let time = new Date().getTime() / 1000;
        let camX = Math.sin(time) * radius;
        let camZ = Math.cos(time) * radius;

        // let camX = Math.sin(1.2) * radius;
        // let camZ = Math.cos(1.2) * radius;
        let view = mat4.create();
        let res = vec3.add([0,0,0], this.cameraPos, this.cameraFront);
        
        // mat4.lookAt(view, [camX,0,camZ], [0,0,0], [0,1,0]);
        mat4.lookAt(view, this.cameraPos, [0,0,0], this.cameraUp);

        // let rotated_view = mat4.create();
        // mat4.lookAt(rotated_view, [camX,0,camZ], [0,0,0], [0,1,0]);
        // mat4.rotate(rotated_view, rotated_view, (Math.sin(time) + 1) * Math.PI / 2, [1,0,0]);
        let rotation = mat4.create();
        mat4.rotate(rotation, rotation, 0.1, [1,0,0])

        // mat4.translate(rotated_view, rotated_view, [0,-1,0]);

        this.cubes.forEach((cube, i) => {
            cube.draw(view)
        });
    }

    gen_animation(indices: Array<number>, frame_count: number, rotation: mat4, end_mapping: Array<number>) {
        let frame = 1;

        let animation = () => {
            indices.forEach(i => {
                this.cubes[i].rotate(rotation);
            });

            frame += 1;
            if (frame > frame_count) {
                // wrap up animation by updating indices
                this.animation = null;

                let temp_vals : {[key: number]: Cube} = {};
                end_mapping.forEach((newI, i) => {
                    temp_vals[newI] = this.cubes[newI];
                    if (temp_vals[indices[i]] !== undefined) {
                        // value was replaced, stored in temp_vals[indices[i]]
                        this.cubes[newI] = temp_vals[indices[i]];
                    } else {
                        this.cubes[newI] = this.cubes[indices[i]];
                    }
                });
            }
        }

        return animation.bind(this);
    }

    // TODO refactor mapping to two isomorphic permutation
    // (since it is the same on all faces, expect ccw perms)
    turnRight(inverse: boolean = false) {
        if (this.animation !== null) return;

        let right         = [2 ,5 ,8,11,14,17,20,23,26];
        let right_mapping = [20,11,2,23,14,5 ,26,17,8 ];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [1,0,0])
         else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [1,0,0])
        
        this.animation = this.gen_animation(right, 10, rotation, right_mapping);
    }

    turnUp(inverse: boolean = false) {
        if (this.animation !== null) return;

        let up         = [6,7 ,8 ,15,16,17,24,25,26];
        let up_mapping = [8,17,26,7 ,16,25,6 ,15,24];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [0,1,0])
         else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [0,1,0])
        
        this.animation = this.gen_animation(up, 10, rotation, up_mapping);
    }

    turnLeft(inverse: boolean = false) {
        if (this.animation !== null) return;

        let left         = [0,3,6,9,12,15,18,21,24];
        let left_mapping = [6,15,24,3,12,21,0,9,18];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [1,0,0])
         else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [1,0,0])
        
        this.animation = this.gen_animation(left, 10, rotation, left_mapping);
    }

    turnDown(inverse: boolean = false) {
        if (this.animation !== null) return;

        let down         = [0,1,2,9,10,11,18,19,20];
        let down_mapping = [18,9,0,19,10,1,20,11,2];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [0,1,0])
         else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [0,1,0])
        
        this.animation = this.gen_animation(down, 10, rotation, down_mapping);
    }

    turnFront(inverse: boolean = false) {
        if (this.animation !== null) return;

        let front         = [18,19,20,21,22,23,24,25,26];
        let front_mapping = [24,21,18,25,22,19,26,23,20];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [0,0,1])
         else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [0,0,1])
        
        this.animation = this.gen_animation(front, 10, rotation, front_mapping);
    }

    turnBack(inverse: boolean = false) {
        if (this.animation !== null) return;

        let back         = [0,1,2,3,4,5,6,7,8];
        let back_mapping = [2,5,8,1,4,7,0,3,6];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [0,0,1])
         else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [0,0,1])
        
        this.animation = this.gen_animation(back, 10, rotation, back_mapping);
    }
}


export default RubiksCube;