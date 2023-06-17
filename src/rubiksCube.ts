import { mat4, quat, vec3 } from "gl-matrix";
import { Cube, ColorName } from "./cube";

import Shader from "./shader";
import { Face, FacePermutor } from "./facePermutor";
import { RubiksCubeLogic } from "./rubiksCubeLogic";
import { ColorNames } from "./cfopGuide";

type Turn = {
    move: string,
    inverse: boolean,
    count: number,
    isUserMove: boolean
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

    rubiksCubeLogic: RubiksCubeLogic;

    animation: (() => void) | null;
    actionQueue: (() => void)[];

    isSolved: boolean;
    turns: Turn[];

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
        this.turns = [];

        let scale = [1.0, 1.0, 1.0];

        let CubeColors = {
            front: ColorName.GREEN,
            up:    ColorName.YELLOW,
            down:  ColorName.WHITE,
            right: ColorName.ORANGE,
            left:  ColorName.RED,
            back:  ColorName.BLUE,
        };

        let backIndices  = FacePermutor.getFaceIndices(Face.BACK) as number[];
        let frontIndices = FacePermutor.getFaceIndices(Face.FRONT) as number[];
        let upIndices    = FacePermutor.getFaceIndices(Face.UP) as number[];
        let downIndices  = FacePermutor.getFaceIndices(Face.DOWN) as number[];
        let rightIndices = FacePermutor.getFaceIndices(Face.RIGHT) as number[];
        let leftIndices  = FacePermutor.getFaceIndices(Face.LEFT) as number[];

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

    private updateScrambleString(move: string, inverse: boolean, isUserMove = true) {
        if (this.turns.length > 0) {
            let lastTurn = this.turns.at(-1) as Turn;
            if (lastTurn.move == move) {
                if (lastTurn.inverse != inverse)
                    this.turns.pop();
                else if (lastTurn.count == 1)
                    lastTurn.count = 2;
                else {
                    lastTurn.count = 1;
                    lastTurn.inverse = !lastTurn.inverse
;                }
            } else
                this.turns.push({ move, inverse, count: 1, isUserMove });
        } else
            this.turns.push({ move, inverse, count: 1, isUserMove });

        (document.getElementById('moves') as HTMLElement).innerHTML = this.getScrambleString(true);
        (document.getElementById('moveCount') as HTMLElement).textContent = this.turns.filter(turn => ['x', 'y'].includes(turn.move) === false).length.toString()
    }

    getScrambleString(includeStyling = false) {
        return this.turns
                .map(turn => {
                    if (!includeStyling || turn.isUserMove)
                        return `${turn.move}${turn.count > 1 ? turn.count:''}${turn.count == 1 && turn.inverse ? "'":""}`
                    return `<span class='generatedMove'>${turn.move}${turn.count > 1 ? turn.count:''}${turn.count == 1 && turn.inverse ? "'":""}</span>`
                }).join(' ');        
    }

    turnRight(inverse: boolean = false, isUserMove = true) {
        let right = FacePermutor.getFaceIndices(Face.RIGHT) as number[];
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
        this.updateScrambleString('R', inverse, isUserMove);
    }

    turnUp(inverse: boolean = false, isUserMove = true) {
        let up = FacePermutor.getFaceIndices(Face.UP) as number[];
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

        this.updateScrambleString('U', inverse, isUserMove);
    }

    turnLeft(inverse: boolean = false, isUserMove = true) {
        let left = FacePermutor.getFaceIndices(Face.LEFT) as number[];
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

        this.updateScrambleString('L', inverse, isUserMove);
    }

    turnDown(inverse: boolean = false, isUserMove = true) {
        let down = FacePermutor.getFaceIndices(Face.DOWN) as number[];
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
        this.updateScrambleString('D', inverse, isUserMove);
    }

    turnFront(inverse: boolean = false, isUserMove = true) {
        let front = FacePermutor.getFaceIndices(Face.FRONT) as number[];
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
        this.updateScrambleString('F', inverse, isUserMove);
    }

    turnBack(inverse: boolean = false, isUserMove = true) {
        let back = FacePermutor.getFaceIndices(Face.BACK) as number[];
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
        this.updateScrambleString('B', inverse, isUserMove);
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
        this.updateScrambleString('x', inverse);
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
        this.updateScrambleString('y', inverse);
    }

    highlightFace(face: Face, on: boolean) {
        FacePermutor.getFaceIndices(face)?.forEach(i => this.cubes[i].outline(on))
    }

    select_by_order(on: boolean) {
        this.cubes.forEach((cube,i) => {
            setTimeout(() => {
                cube.select(on);
            }, 100 * i);
        })
    }

    getFaceColors(face: Face) {
        let faceCubes = FacePermutor.getFaceIndices(face)
                        ?.map(i => this.cubes[i])
        
        let faceColors = faceCubes?.map(cube => cube.color[cube.permutor.obj[face] as Face.BACK]) as ColorName[];

        return faceColors;
    }

    toString() {
        let front = this.getFaceColors(Face.FRONT).join('');
        let back  = this.getFaceColors(Face.BACK).join('');
        let up    = this.getFaceColors(Face.UP).join('');
        let down  = this.getFaceColors(Face.DOWN).join('');
        let left  = this.getFaceColors(Face.LEFT).join('');
        let right = this.getFaceColors(Face.RIGHT).join('');

        return `${front}${back}${up}${down}${left}${right}`;
    }
}

export { RubiksCube };