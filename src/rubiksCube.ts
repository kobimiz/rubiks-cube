import { mat4, quat, vec3 } from "gl-matrix";
import { Cube, ColorName } from "./cube";

import Shader from "./shader";
import { Permutor } from "./permutor";

enum Face {
    RIGHT,
    LEFT,
    UP,
    DOWN,
    BACK,
    FRONT
};

let face_map = {
    'f': Face.FRONT,
    'b': Face.BACK,
    'r': Face.RIGHT,
    'l': Face.LEFT,
    'u': Face.UP,
    'd': Face.DOWN,
};

type RotationMap = {
    'f': string,
    'b': string,
    'r': string,
    'l': string,
    'u': string,
    'd': string,
}

class RubiksCube {
    cubes: Cube[];

    cameraPos: Float32Array;
    cameraFront: Float32Array;
    cameraUp: Float32Array;

    pitch: number;
    yaw: number;
    roll: number;

    xAxis: vec3;
    yAxis: vec3;
    zAxis: vec3;

    permutor: Permutor;

    timeout: number;

    animation: (() => void) | null;

    actionQueue: (() => void)[];

    constructor(size: number, gl: WebGL2RenderingContext, shader: Shader, shader_outline: Shader) {
        this.cubes = [];
        this.cameraPos = new Float32Array([7, 4, 5]);
        this.cameraFront = new Float32Array([0, 0, -1]);
        this.cameraUp = new Float32Array([0, 1, 0]);

        this.pitch = 0;
        this.yaw = 90;
        this.roll = 0;
        
        this.xAxis = [1,0,0];
        this.yAxis = [0,1,0];
        this.zAxis = [0,0,1];

        this.timeout = -1;

        this.permutor = new Permutor({
            'f': 'f',
            'b': 'b',
            'r': 'r',
            'l': 'l',
            'u': 'u',
            'd': 'd',
        });

        this.animation = null;
        this.actionQueue = [];

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
            let x = 1.1 * (i % 3) - 1.1;
            let y = 1.1 * (Math.floor(i / 3) % 3) - 1.1;
            let z = 1.1 * (Math.floor(i / 9) % 3) - 1.1;
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
            
            this.cubes.push(new Cube(gl, shader, shader_outline, [x, y, z] ,scale, color, i));
        }
    }

    draw() {
        if (this.animation == null) {
            if (this.actionQueue.length > 0)
                this.animation = this.actionQueue.shift() as () => void;
        }

        if (this.animation !== null) {
            this.animation();
        }
        
        let view = mat4.create();
        mat4.lookAt(view, this.cameraPos, [0,0,0], this.cameraUp);

        let q = quat.create();
        quat.fromEuler(q, this.pitch, this.yaw, this.roll);
        let m = mat4.create();
        mat4.fromQuat(m, q);
        mat4.mul(view, view, m);

        this.cubes.forEach((cube, i) => {
            cube.draw(view)
        });
    }

    gen_animation(indices: Array<number>, frame_count: number, rotation: mat4, 
                end_mapping: Array<number>, callback : ((rc: RubiksCube) => void) | null = null, inverse = false) {

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

                if (inverse) {
                    let temp = indices;
                    indices = end_mapping;
                    end_mapping = temp;
                }

                end_mapping.forEach((newI, i) => {
                    temp_vals[newI] = this.cubes[newI];
                    if (temp_vals[indices[i]] !== undefined) {
                        // value was replaced, stored in temp_vals[indices[i]]
                        this.cubes[newI] = temp_vals[indices[i]];
                    } else {
                        this.cubes[newI] = this.cubes[indices[i]];
                    }
                });

                if (callback)
                    callback(this);
            }
        }

        return animation.bind(this);
    }

    // TODO refactor mapping to two isomorphic permutation
    // (since it is the same on all faces, expect ccw perms)
    turnRight(inverse: boolean = false) {
        let right         = [2 ,5 ,8,11,14,17,20,23,26];
        let right_mapping = [20,11,2,23,14,5 ,26,17,8 ];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.xAxis)
        else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.xAxis)

        this.actionQueue.push(this.gen_animation(right, 10, rotation, right_mapping, null, inverse))
    }

    turnUp(inverse: boolean = false) {
        let up         = [6,7 ,8 ,15,16,17,24,25,26];
        let up_mapping = [8,17,26,7 ,16,25,6 ,15,24];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.yAxis)
        else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.yAxis)
        
        this.actionQueue.push(this.gen_animation(up, 10, rotation, up_mapping, null, inverse));
    }

    turnLeft(inverse: boolean = false) {
        let left         = [0,3,6,9,12,15,18,21,24];
        let left_mapping = [6,15,24,3,12,21,0,9,18];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.xAxis)
        else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.xAxis)
        
        this.actionQueue.push(this.gen_animation(left, 10, rotation, left_mapping, null, inverse));
    }

    turnDown(inverse: boolean = false) {
        let down         = [0,1,2,9,10,11,18,19,20];
        let down_mapping = [18,9,0,19,10,1,20,11,2];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.yAxis)
        else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.yAxis)
        
        this.actionQueue.push(this.gen_animation(down, 10, rotation, down_mapping, null, inverse));
    }

    turnFront(inverse: boolean = false) {
        let front         = [18,19,20,21,22,23,24,25,26];
        let front_mapping = [24,21,18,25,22,19,26,23,20];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.zAxis)
        else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.zAxis)
        
        this.actionQueue.push(this.gen_animation(front, 10, rotation, front_mapping, null, inverse));
    }

    turnBack(inverse: boolean = false) {
        let back         = [0,1,2,3,4,5,6,7,8];
        let back_mapping = [2,5,8,1,4,7,0,3,6];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.zAxis)
        else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.zAxis)
        
        this.actionQueue.push(this.gen_animation(back, 10, rotation, back_mapping, null, inverse));
    }

    turnX(inverse: boolean = false) {
        let rotation = mat4.create();
        this.do_x(inverse);
        if (inverse)
            mat4.rotate(rotation, rotation, Math.PI / (10 * 2), [1,0,0]);
        else
            mat4.rotate(rotation, rotation, -Math.PI / (10 * 2), [1,0,0]);

        let all = [...Array(27).keys()];
        let all_mapping = [18,19,20,9,10,11,0,1,2,21,22,23,12,13,14,3,4,5,24,25,26,15,16,17,6,7,8];

        this.actionQueue.push(this.gen_animation(all, 10, rotation, all_mapping, rubiks_cube => {}, inverse));
    }

    turnY(inverse: boolean = false) {
        let rotation = mat4.create();
        this.do_y(inverse);
        if (inverse)
            mat4.rotate(rotation, rotation, Math.PI / (10 * 2), [0,1,0]);
        else
            mat4.rotate(rotation, rotation, -Math.PI / (10 * 2), [0,1,0]);

        let all = [...Array(27).keys()];
        let all_mapping = [2,11,20,5,14,23,8,17,26,1,10,19,4,13,22,7,16,25,0,9,18,3,12,21,6,15,24];
        this.actionQueue.push(this.gen_animation(all, 10, rotation, all_mapping, rubiks_cube => {}, inverse));
    }

    do_y(inverse: boolean) {
        if (inverse)
            this.permutor.ccw_perm(['f', 'l', 'b', 'r']);
        else
            this.permutor.cw_perm(['f', 'l', 'b', 'r']);
    
        let f_face_string = face_map[this.permutor.obj['f'] as 'f'];
    
        if (this.timeout != -1) {
            clearTimeout(this.timeout);
            this.cubes.forEach(cube => cube.outline(false));
        }
        // this.highlightFace(f_face_string, true);
    
        // this.timeout = setTimeout(() => {
        //     this.highlightFace(f_face_string, false);
        //     this.timeout = -1;
        // }, 1000) as unknown as number;
    }
    
    do_x(inverse: boolean) {
        if (inverse)
            this.permutor.ccw_perm(['f', 'u', 'b', 'd']);
        else
            this.permutor.cw_perm(['f', 'u', 'b', 'd']);
    
        let f_face_string = face_map[this.permutor.obj['f'] as 'f'];
    
        if (this.timeout != -1) {
            clearTimeout(this.timeout);
            this.cubes.forEach(cube => cube.outline(false));
        }
        // this.highlightFace(f_face_string, true);
    
        // this.timeout = setTimeout(() => {
        //     this.highlightFace(f_face_string, false);
        //     this.timeout = -1;
        // }, 1000) as unknown as number;
    
        return true;
    }

    highlightFace(face: Face, on: boolean) {
        let back  = [0,1,2,3,4,5,6,7,8];
        let front = [18,19,20,21,22,23,24,25,26];
        let down  = [0,1,2,9,10,11,18,19,20];
        let left  = [0,3,6,9,12,15,18,21,24];
        let up    = [6,7 ,8 ,15,16,17,24,25,26];
        let right = [2 ,5 ,8,11,14,17,20,23,26];

        switch (face) {
            case Face.FRONT:
                front.forEach(i => this.cubes[i].outline(on))
                break;
            case Face.BACK:
                back.forEach(i => this.cubes[i].outline(on))
                break;
            case Face.UP:
                up.forEach(i => this.cubes[i].outline(on))
                break;
            case Face.DOWN:
                down.forEach(i => this.cubes[i].outline(on))
                break;
            case Face.RIGHT:
                right.forEach(i => this.cubes[i].outline(on))
                break;
            case Face.LEFT:
                left.forEach(i => this.cubes[i].outline(on))
                break;
        }
    }

    select_by_order(on: boolean) {
        this.cubes.forEach((cube,i) => {
            setTimeout(() => {
                cube.select(on);
            }, 100 * i);
        })
    }
}

export { RubiksCube, Face };