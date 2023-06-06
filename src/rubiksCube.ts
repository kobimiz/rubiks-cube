import { mat4, quat, vec3 } from "gl-matrix";
import { Cube, ColorName } from "./cube";

import Shader from "./shader";
import { Permutor } from "./permutor";
import { Face } from "./facePermutor";
import { RubiksCubeLogic } from "./rubiksCubeLogic";

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

    rubiksCubeLogic: RubiksCubeLogic;

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

        this.rubiksCubeLogic = new RubiksCubeLogic(this.cubes);

        this.animation = null;
        this.actionQueue = [];

        let scale = [1.0, 1.0, 1.0];

        let CubeColors = {
            front: ColorName.GREEN,
            up:    ColorName.YELLOW,
            down:  ColorName.WHITE,
            right: ColorName.ORANGE,
            left:  ColorName.RED,
            back:  ColorName.BLUE,
        };

        let backIndices  = this.rubiksCubeLogic.getFaceIndices(Face.BACK) as number[];
        let frontIndices = this.rubiksCubeLogic.getFaceIndices(Face.FRONT) as number[];
        let upIndices    = this.rubiksCubeLogic.getFaceIndices(Face.UP) as number[];
        let downIndices  = this.rubiksCubeLogic.getFaceIndices(Face.DOWN) as number[];
        let rightIndices = this.rubiksCubeLogic.getFaceIndices(Face.RIGHT) as number[];
        let leftIndices  = this.rubiksCubeLogic.getFaceIndices(Face.LEFT) as number[];

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

            if (backIndices.includes(i))
                color.back = CubeColors.back;
            if (frontIndices.includes(i))
                color.front = CubeColors.front;
            if (upIndices.includes(i))
                color.up = CubeColors.up;
            if (downIndices.includes(i))
                color.down = CubeColors.down;
            if (rightIndices.includes(i))
                color.right = CubeColors.right;
            if (leftIndices.includes(i))
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

    gen_animation(indices: Array<number>, frame_count: number, rotation: mat4, callback : ((rc: RubiksCube) => void) | null = null) {
        let frame = 1;
        let animation = () => {
            indices.forEach(i => {
                this.cubes[i].rotate(rotation);
            });

            frame += 1;
            if (frame > frame_count) {
                this.animation = null;
                if (callback)
                    callback(this);
            }
        }

        return animation.bind(this);
    }

    turnRight(inverse: boolean = false) {
        let right = this.rubiksCubeLogic.getFaceIndices(Face.RIGHT) as number[];
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.xAxis)
        else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.xAxis)

        this.actionQueue.push(this.gen_animation(right, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turn(Face.RIGHT, inverse); 
        }))
    }

    turnUp(inverse: boolean = false) {
        let up = this.rubiksCubeLogic.getFaceIndices(Face.UP) as number[];
        let frame_count = 10;


        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.yAxis)
        else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.yAxis)
        
        this.actionQueue.push(this.gen_animation(up, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turn(Face.UP, inverse); 
        }));
    }

    turnLeft(inverse: boolean = false) {
        let left = this.rubiksCubeLogic.getFaceIndices(Face.LEFT) as number[];
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.xAxis)
        else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.xAxis)
        
        this.actionQueue.push(this.gen_animation(left, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turn(Face.LEFT, inverse); 
        }));
    }

    turnDown(inverse: boolean = false) {
        let down = this.rubiksCubeLogic.getFaceIndices(Face.DOWN) as number[];
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.yAxis)
        else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.yAxis)
        
        this.actionQueue.push(this.gen_animation(down, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turn(Face.DOWN, inverse); 
        }));
    }

    turnFront(inverse: boolean = false) {
        let front = this.rubiksCubeLogic.getFaceIndices(Face.FRONT) as number[];
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.zAxis)
        else 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.zAxis)
        
        this.actionQueue.push(this.gen_animation(front, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turn(Face.FRONT, inverse); 
        }));
    }

    turnBack(inverse: boolean = false) {
        let back = this.rubiksCubeLogic.getFaceIndices(Face.BACK) as number[];
        let frame_count = 10;

        let rotation = mat4.create();
        if (inverse) 
            mat4.rotate(rotation, rotation, -Math.PI / (frame_count * 2), this.zAxis)
        else 
            mat4.rotate(rotation, rotation, Math.PI / (frame_count * 2), this.zAxis)
        
        this.actionQueue.push(this.gen_animation(back, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turn(Face.BACK, inverse); 
        }));
    }

    turnX(inverse: boolean = false) {
        let rotation = mat4.create();
        if (inverse)
            mat4.rotate(rotation, rotation, Math.PI / (10 * 2), [1,0,0]);
        else
            mat4.rotate(rotation, rotation, -Math.PI / (10 * 2), [1,0,0]);

        let all = [...Array(27).keys()];
        let all_mapping = [18,19,20,9,10,11,0,1,2,21,22,23,12,13,14,3,4,5,24,25,26,15,16,17,6,7,8];

        let obj: object;
        if (inverse)
            obj = Object.fromEntries(all_mapping.map((newI, i) => [newI, i]));
        else
            obj = Object.fromEntries(all_mapping.map((newI, i) => [i, newI]));

        this.actionQueue.push(this.gen_animation(all, 10, rotation, rubiks_cube => {
            let perm = new Permutor(rubiks_cube.cubes);
            perm.permute_obj(obj);
        }));
    }

    turnY(inverse: boolean = false) {
        let rotation = mat4.create();
        if (inverse)
            mat4.rotate(rotation, rotation, Math.PI / (10 * 2), [0,1,0]);
        else
            mat4.rotate(rotation, rotation, -Math.PI / (10 * 2), [0,1,0]);

        let all = [...Array(27).keys()];
        let all_mapping = [2,11,20,5,14,23,8,17,26,1,10,19,4,13,22,7,16,25,0,9,18,3,12,21,6,15,24];
        let obj: object;
        if (inverse)
            obj = Object.fromEntries(all_mapping.map((newI, i) => [newI, i]));
        else
            obj = Object.fromEntries(all_mapping.map((newI, i) => [i, newI]));

        this.actionQueue.push(this.gen_animation(all, 10, rotation, rubiks_cube => {
            let perm = new Permutor(rubiks_cube.cubes);
            perm.permute_obj(obj);
        }));
    }

    highlightFace(face: Face, on: boolean) {
        this.rubiksCubeLogic.getFaceIndices(face)?.forEach(i => this.cubes[i].outline(on))
    }

    select_by_order(on: boolean) {
        this.cubes.forEach((cube,i) => {
            setTimeout(() => {
                cube.select(on);
            }, 100 * i);
        })
    }
}

export { RubiksCube };