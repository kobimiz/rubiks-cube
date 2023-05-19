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

    frontFace: Face;
    upFace: Face;

    animation: (() => void) | null;

    constructor(size: number, gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes = [];
        this.cameraPos = new Float32Array([0, 0, 3]);

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
        // let camX = Math.sin(time) * radius;
        // let camZ = Math.cos(time) * radius;

        let camX = Math.sin(1.2) * radius;
        let camZ = Math.cos(1.2) * radius;

        let view = mat4.create();
        mat4.lookAt(view, [camX,0,camZ], [0,0,0], [0,1,0]);

        // let rotated_view = mat4.create();
        // mat4.lookAt(rotated_view, [camX,0,camZ], [0,0,0], [0,1,0]);
        // mat4.rotate(rotated_view, rotated_view, (Math.sin(time) + 1) * Math.PI / 2, [1,0,0]);

        // mat4.translate(rotated_view, rotated_view, [0,-1,0]);

        this.cubes.forEach((cube, i) => {
            cube.draw(view)
        });
    }

    gen_animation(indices: Array<number>, frame_count: number, rotation: number, axis: string, end_mapping: Array<number>) {
        let frame = 1;

        let animation = () => {
            indices.forEach(i => {
                // this.cubes[i].rotate(rotation);
                let axis_vec: Float32Array;

                if (axis == 'x') {
                    axis_vec = this.cubes[i].x_axis;
                } else if (axis == 'y') {
                    axis_vec = this.cubes[i].y_axis;
                } else {
                    axis_vec = this.cubes[i].z_axis;
                }
                console.log(axis_vec.toString());
                mat4.rotate(
                    this.cubes[i].rotationMatrix,
                    this.cubes[i].rotationMatrix,
                    rotation,
                    axis_vec
                );
            });

            frame += 1;
            // mat4.q
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

                // indices.forEach(i => {
                //     // if (axis == 'x') {
                //     //     this.cubes[i].y_axis = new Float32Array([0,0,-1]);
                //     //     this.cubes[i].z_axis = new Float32Array([0,1,0]);
                //     // } else if (axis == 'y') {
                //     //     this.cubes[i].x_axis = new Float32Array([0,0,1]);
                //     //     this.cubes[i].z_axis = new Float32Array([-1,0,0]);
                //     // } else {
                //     //     // this.cubes[i].x_axis = new Float32Array([]);
                //     // }
                //     let axis_vec: Float32Array;

                //     if (axis == 'x') {
                //         axis_vec = this.cubes[i].x_axis;
                //     } else if (axis == 'y') {
                //         axis_vec = this.cubes[i].y_axis;
                //     } else {
                //         axis_vec = this.cubes[i].z_axis;
                //     }
                //     let mat: mat4 = (<any>mat4.fromValues)(
                //         ...this.cubes[i].x_axis, 1.0,
                //         ...this.cubes[i].y_axis, 1.0,
                //         ...this.cubes[i].z_axis, 1.0,
                //         0.0, 0.0, 0.0, 1.0
                //     );

                //     mat4.rotate(mat, mat, rotation * frame_count, axis_vec);

                //     this.cubes[i].x_axis = new Float32Array(mat.slice(0, 2+1));
                //     this.cubes[i].y_axis = new Float32Array(mat.slice(4, 6+1));
                //     this.cubes[i].z_axis = new Float32Array(mat.slice(8, 10+1));
                // });
            }
        }

        return animation.bind(this);
    }

    turnRight(inverse: boolean = false) {
        if (this.animation !== null) return;

        let right = [2,5,8,11,14,17,20,23,26];
        let right_mapping = [20,11,2,23,14,5,26,17,8];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            // mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [1,0,0])
            this.animation = this.gen_animation(right, 10, -Math.PI / (frame_count * 2), 'x', right_mapping);
        else 
            // mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [1,0,0])
            this.animation = this.gen_animation(right, 10, Math.PI / (frame_count * 2), 'x', right_mapping);
        
        // this.animation = this.gen_animation(right, 10, rotation, right_mapping);
        
    }

    turnUp(inverse: boolean = false) {
        if (this.animation !== null) return;

        let up = [6,7,8,15,16,17,24,25,26];
        let up_mapping = [8,17,26,7,16,25,6,15,24];
        
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            // mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), [0,1,0])
            this.animation = this.gen_animation(up, 10, Math.PI / (frame_count * 2), 'y', up_mapping);
         else 
         // mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), [0,1,0])
            this.animation = this.gen_animation(up, 10, -Math.PI / (frame_count * 2), 'y', up_mapping);
        
        // this.animation = this.gen_animation(up, 10, rotation, up_mapping);
    }
}


export default RubiksCube;