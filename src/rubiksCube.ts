import { mat4, quat, vec3 } from "gl-matrix";
import { Cube, ColorName } from "./cube";

import Shader from "./shader";
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

    isSolved: boolean;
    scrambleString: string;

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

        this.isSolved = false; // technically it is...
        this.scrambleString = '';

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
                [Face.FRONT]: ColorName.BLACK,
                [Face.UP]:    ColorName.BLACK,
                [Face.DOWN]:  ColorName.BLACK,
                [Face.RIGHT]: ColorName.BLACK,
                [Face.LEFT]:  ColorName.BLACK,
                [Face.BACK]:  ColorName.BLACK,
            };

            if (backIndices.includes(i))
                color[Face.BACK] = CubeColors.back;
            if (frontIndices.includes(i))
                color[Face.FRONT] = CubeColors.front;
            if (upIndices.includes(i))
                color[Face.UP] = CubeColors.up;
            if (downIndices.includes(i))
                color[Face.DOWN] = CubeColors.down;
            if (rightIndices.includes(i))
                color[Face.RIGHT] = CubeColors.right;
            if (leftIndices.includes(i))
                color[Face.LEFT] = CubeColors.left;
            
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
            rubiksCube.isSolved = rubiksCube.rubiksCubeLogic.isSolved();
        }))
        this.scrambleString += ' R' + (inverse ? "'":"");
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
            rubiksCube.isSolved = rubiksCube.rubiksCubeLogic.isSolved();
        }));

        this.scrambleString += ' U' + (inverse ? "'":"");
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
            rubiksCube.isSolved = rubiksCube.rubiksCubeLogic.isSolved();
        }));

        this.scrambleString += ' L' + (inverse ? "'":"");
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
            rubiksCube.isSolved = rubiksCube.rubiksCubeLogic.isSolved();
        }));
        this.scrambleString += ' D' + (inverse ? "'":"");
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
            rubiksCube.isSolved = rubiksCube.rubiksCubeLogic.isSolved();
        }));
        this.scrambleString += ' F' + (inverse ? "'":"");
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
            rubiksCube.isSolved = rubiksCube.rubiksCubeLogic.isSolved();
        }));
        this.scrambleString += ' B' + (inverse ? "'":"");
    }

    turnX(inverse: boolean = false) {
        let rotation = mat4.create();
        if (inverse)
            mat4.rotate(rotation, rotation, Math.PI / (10 * 2), [1,0,0]);
        else
            mat4.rotate(rotation, rotation, -Math.PI / (10 * 2), [1,0,0]);

        let all = [...Array(27).keys()];
        this.actionQueue.push(this.gen_animation(all, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turnX(inverse); 
        }));
        this.scrambleString += ' x' + (inverse ? "'":"");
    }

    turnY(inverse: boolean = false) {
        let rotation = mat4.create();
        if (inverse)
            mat4.rotate(rotation, rotation, Math.PI / (10 * 2), [0,1,0]);
        else
            mat4.rotate(rotation, rotation, -Math.PI / (10 * 2), [0,1,0]);

        let all = [...Array(27).keys()];
        this.actionQueue.push(this.gen_animation(all, 10, rotation, rubiksCube => {
            rubiksCube.rubiksCubeLogic.turnY(inverse); 
        }));
        this.scrambleString += ' y' + (inverse ? "'":"");
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