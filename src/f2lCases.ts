import { ColorName } from "./cube";
import { Face } from "./facePermutor";
import { RubiksCubeLogic } from "./rubiksCubeLogic";

type F2LFunction = (cornerIdx: number, edgeIdx: number) => string[];

// Transforms to pairs in up layer
class F2LCases {
    cornerDown_edgeDown: { same_slot: F2LFunction, not_same_slot: F2LFunction }
    cornerDown_edgeUp: { all: F2LFunction  }
    cornerUp_edgeDown: { all: F2LFunction }
    cornerUp_edgeUp: { all: F2LFunction }

    constructor(rcl: RubiksCubeLogic) {
        this.cornerDown_edgeDown = {
            same_slot: (cornerIdx: number, edgeIdx: number) => {
                let copy = rcl.copy();

                let prefix = ''
                if (cornerIdx == 0) {
                    prefix = 'y y'
                    copy.turnY(false);
                    copy.turnY(false);
                }
                else if (cornerIdx == 2) {
                    prefix = "y"
                    copy.turnY(false);
                }
                else if (cornerIdx == 18) {
                    prefix = "y'";
                    copy.turnY(true);
                }
                cornerIdx = 20;
                edgeIdx = 23;

                let cornerColors = copy.cubes[cornerIdx].color
                let cornerMap = copy.cubes[cornerIdx].permutor.obj
                let edgeColors = copy.cubes[edgeIdx].color
                let edgeMap = copy.cubes[edgeIdx].permutor.obj

                if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == edgeColors[edgeMap[Face.FRONT] as Face.FRONT])
                        return `${prefix} R U' R' U' R U R'`.trim().split(' ')
                    else
                        return `${prefix} R U' R' U' R U' R R U R`.trim().split(' ')
                } else if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == edgeColors[edgeMap[Face.RIGHT] as Face.FRONT])
                        return `${prefix} y L' U L U L' U' L`.trim().split(' ')
                    else
                        return `${prefix} y L' U L U L' U L L U' L'`.trim().split(' ')
                } else {
                    if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == edgeColors[edgeMap[Face.FRONT] as Face.FRONT])
                        return `${prefix} R U R'`.trim().split(' ');
                    else
                        return `${prefix} R U' R R U U R`.trim().split(' ')
                }
            },

            not_same_slot: (cornerIdx: number, edgeIdx: number) => {
                let copy = rcl.copy();
                let edge = copy.cubes[edgeIdx];

                let prefix = ''
                if (cornerIdx == 0) {
                    prefix = 'y y'
                    copy.turnY(false);
                    copy.turnY(false);
                }
                else if (cornerIdx == 2) {
                    prefix = "y"
                    copy.turnY(false);
                }
                else if (cornerIdx == 18) {
                    prefix = "y'";
                    copy.turnY(true);
                }
                copy.turn(Face.RIGHT, false);
                copy.turn(Face.UP, false);
                copy.turn(Face.RIGHT, true);
                copy.turn(Face.UP, true);
                cornerIdx = 26;

                edgeIdx = copy.cubes.findIndex(cube => cube == edge);

                let temp = rcl;
                rcl = copy;
                let res = this.cornerUp_edgeDown.all(cornerIdx, edgeIdx);
                rcl = temp;

                return `${prefix} R U R' U'`.trim().split(' ').concat(res)
            }
        };

        // NEED: TESTING
        this.cornerDown_edgeUp = {
            all: (cornerIdx: number, edgeIdx: number) => {
                let copy = rcl.copy();
                let edge = copy.cubes[edgeIdx];

                let prefix = ''
                if (cornerIdx == 0) {
                    prefix = 'y y'
                    copy.turnY(false);
                    copy.turnY(false);
                }
                else if (cornerIdx == 2) {
                    prefix = "y"
                    copy.turnY(false);
                }
                else if (cornerIdx == 18) {
                    prefix = "y'";
                    copy.turnY(true);
                }
                cornerIdx = 20;

                edgeIdx = copy.cubes.findIndex(cube => cube == edge);
                if (edgeIdx == 7) {
                    prefix = `${prefix} U`.trim();
                    copy.turn(Face.UP, false);
                }
                else if (edgeIdx == 15) {
                    prefix = `${prefix} U U`.trim();
                    copy.turn(Face.UP, false);
                    copy.turn(Face.UP, false);
                }
                else if (edgeIdx == 25) {
                    prefix = `${prefix} U'`.trim();
                    copy.turn(Face.UP, true);
                }
                edgeIdx = 17;

                let cornerColors = copy.cubes[cornerIdx].color
                let cornerMap = copy.cubes[cornerIdx].permutor.obj
                let edgeColors = copy.cubes[edgeIdx].color
                let edgeMap = copy.cubes[edgeIdx].permutor.obj

                if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == edgeColors[edgeMap[Face.RIGHT] as Face.FRONT])
                        return `${prefix} U R' F R F'`.trim().split(' ')
                    else
                        return `${prefix} R U' R'`.trim().split(' ')
                } else if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == edgeColors[edgeMap[Face.UP] as Face.FRONT])
                        return `${prefix} U R U R'`.trim().split(' ')
                    else
                        return `${prefix} R U R' U' R U' R'`.trim().split(' ')
                } else {
                    // white is down
                    if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == edgeColors[edgeMap[Face.RIGHT] as Face.FRONT])
                        return `${prefix} R U' R' U' R U' R' U R U' R'`.trim().split(' ');
                    else
                        return `${prefix} U R U' R' U R U' R' U U R U R'`.trim().split(' ')
                }
            }
        };
        
        // NEED: TESTING 2
        this.cornerUp_edgeDown = {
            all: (cornerIdx: number, edgeIdx: number) => {
                let copy = rcl.copy();
                let corner = copy.cubes[cornerIdx];

                let prefix = ''
                if (edgeIdx == 3) {
                    prefix = 'y y'
                    copy.turnY(false);
                    copy.turnY(false);
                }
                else if (edgeIdx == 5) {
                    prefix = "y"
                    copy.turnY(false);
                }
                else if (edgeIdx == 21) {
                    prefix = "y'";
                    copy.turnY(true);
                }
                edgeIdx = 23;

                cornerIdx = copy.cubes.findIndex(cube => cube == corner);
                if (cornerIdx == 6) {
                    prefix = `${prefix} U U`.trim();
                    copy.turn(Face.UP, false);
                    copy.turn(Face.UP, false);
                }
                else if (cornerIdx == 8) {
                    prefix = `${prefix} U`.trim();
                    copy.turn(Face.UP, false);
                }
                else if (cornerIdx == 24) {
                    prefix = `${prefix} U'`.trim();
                    copy.turn(Face.UP, true);
                }
                cornerIdx = 26;

                let cornerColors = copy.cubes[cornerIdx].color
                let cornerMap = copy.cubes[cornerIdx].permutor.obj
                let edgeColors = copy.cubes[edgeIdx].color
                let edgeMap = copy.cubes[edgeIdx].permutor.obj

                if (cornerColors[cornerMap[Face.UP] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == edgeColors[edgeMap[Face.RIGHT] as Face.FRONT])
                        return `${prefix} R U' R'`.trim().split(' ')
                    else
                        return `${prefix} U R U' R' U R U' R'`.trim().split(' ')
                } else if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == edgeColors[edgeMap[Face.FRONT] as Face.FRONT])
                        return `${prefix} U R U R' U U R U' R'`.trim().split(' ')
                    else
                        return `${prefix} U R U' R' U U R U R'`.trim().split(' ')
                } else {
                    // white is front
                    if (cornerColors[cornerMap[Face.RIGHT] as Face.FRONT] == edgeColors[edgeMap[Face.RIGHT] as Face.FRONT])
                        return `${prefix} U' R U' R'`.trim().split(' ');
                    else
                        return `${prefix} U' R U R' U F' U F`.trim().split(' ')
                }
            }
        };

        // NEED: TESTING 3
        this.cornerUp_edgeUp = {
            all: (cornerIdx: number, edgeIdx: number) => {
                // making sure that front right pair is free


                let copy = rcl.copy();
                let edge = copy.cubes[edgeIdx];

                let prefix = '';
                
                if (cornerIdx == 6) {
                    prefix = `${prefix} U U`.trim();
                    copy.turn(Face.UP, false);
                    copy.turn(Face.UP, false);
                }
                else if (cornerIdx == 8) {
                    prefix = `${prefix} U`.trim();
                    copy.turn(Face.UP, false);
                }
                else if (cornerIdx == 24) {
                    prefix = `${prefix} U'`.trim();
                    copy.turn(Face.UP, true);
                }
                cornerIdx = 26;
                edgeIdx = copy.cubes.findIndex(cube => cube == edge);

                // seperate the corner and edge if needed
                // TODO: make sure here and in other places other pairs arent being undone
                if (edgeIdx == 15) {
                    prefix = `${prefix} U' R U R' U`.trim();
                    copy.turn(Face.UP, true);
                    copy.turn(Face.RIGHT, false);
                    copy.turn(Face.UP, false);
                    copy.turn(Face.RIGHT, true);
                    copy.turn(Face.UP, false);
                }
                else if (edgeIdx == 17) {
                    prefix = `${prefix} U' R U' R' U`.trim();
                    copy.turn(Face.UP, true);
                    copy.turn(Face.RIGHT, false);
                    copy.turn(Face.UP, true);
                    copy.turn(Face.RIGHT, true);
                    copy.turn(Face.UP, false);
                }
                else if (edgeIdx == 25) {
                    prefix = `${prefix} R U' R' U' R U R' U U`.trim();
                    copy.turn(Face.RIGHT, false);
                    copy.turn(Face.UP, true);
                    copy.turn(Face.RIGHT, true);
                    copy.turn(Face.UP, true);
                    copy.turn(Face.RIGHT, false);
                    copy.turn(Face.UP, false);
                    copy.turn(Face.RIGHT, true);
                    copy.turn(Face.UP, false);
                    copy.turn(Face.UP, false);
                }
                edgeIdx = 7;

                let cornerColors = copy.cubes[cornerIdx].color
                let cornerMap = copy.cubes[cornerIdx].permutor.obj
                let edgeColors = copy.cubes[edgeIdx].color
                let edgeMap = copy.cubes[edgeIdx].permutor.obj

                if (cornerColors[cornerMap[Face.UP] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == edgeColors[edgeMap[Face.BACK] as Face.FRONT])
                        return `${prefix} U R U U R'`.trim().split(' ')
                    else
                        return `${prefix} U U F' U' F`.trim().split(' ')
                } else if (cornerColors[cornerMap[Face.FRONT] as Face.FRONT] == ColorName.WHITE) {
                    if (cornerColors[cornerMap[Face.UP] as Face.FRONT] == edgeColors[edgeMap[Face.UP] as Face.FRONT])
                        return `${prefix} U' R U R'`.trim().split(' ') // V
                    else
                        return `${prefix} U' R U' R' U F' U F`.trim().split(' ')
                } else {
                    // white is right
                    if (cornerColors[cornerMap[Face.UP] as Face.FRONT] == edgeColors[edgeMap[Face.UP] as Face.FRONT])
                        return `${prefix} U F' U U F`.trim().split(' ');
                    else
                        return `${prefix} R U' R'`.trim().split(' ')
                }
            }
        }
    }
}

export { F2LCases }