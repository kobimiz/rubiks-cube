import { Color, ColorName, Cube } from "./cube";
import { Face, FacePermutor } from "./facePermutor";
import * as cubeSolver from 'cube-solver';
import { Edges, Corners } from "./facePermutor";
import { CubeRotation, RubiksCubeLogic } from "./rubiksCubeLogic";
import { F2LCases } from "./f2lCases";

export const ColorNames : {[x in ColorName]: string} = {
    [ColorName.ORANGE]: 'Orange',
    [ColorName.YELLOW]: 'Yellow',
    [ColorName.WHITE]: 'White',
    [ColorName.BLACK]: 'Black',
    [ColorName.GREEN]: 'Green',
    [ColorName.BLUE]: 'Blue',
    [ColorName.RED]: 'Red',
}

class CFOPGuide {
    rubiksCubeLogic: RubiksCubeLogic
    possibleMoves: { face: Face, inverse: boolean }[]
    target: (rubiksCubeLogic: RubiksCubeLogic) => boolean;

    f2lPairs: { redGreen: boolean, greenOrange: boolean, orangeBlue: boolean, blueRed: boolean }

    constructor(rubiksCubeLogic: RubiksCubeLogic) {
        this.rubiksCubeLogic = rubiksCubeLogic;

        this.possibleMoves = [];
        let faces : Face[] = [ Face.BACK, Face.FRONT, Face.UP, Face.LEFT, Face.RIGHT ];
        for (let i = 0; i < faces.length; i++) {
            this.possibleMoves.push({ face: faces[i], inverse: true });
            this.possibleMoves.push({ face: faces[i], inverse: false });
        }

        this.target = (rc: RubiksCubeLogic) => {
            // let face = Face.DOWN;
            // let faceCubes = FacePermutor.getFaceIndices(face)
            //                 ?.map(i => rubiksCubeLogic.cubes[i])
            
            // let faceColors = faceCubes?.map(cube => cube.color[cube.permutor.obj[face] as Face.BACK]) as ColorName[];

            // return faceColors.every(color => color == faceColors[0]);

            // let face = Face.DOWN;
            // 555553040244544252434024402511111111323002001330332325

            // front left pair:
            // front     back      up        down      left      right
            // GG.GG.... .B..B.... ......... .W.WWWWW. ...RR.RR. ...OO....

            // white cross
            // .G.G..... .B..B.... ......... .W.WWW.W. ...RR.... ...OO....

            // first pair, corner on top
            // wGwG..... wBw.B.... ......... .W.WWW.W. w..RR.w.. w..OO.w..

            let str = rc.toString()
            // let res = str.match(/55.55.....4..4..............1.11111....00.00....33..../)
            // first pair, corner on top
            let res = str.match(this.targetStringToRegex('GG.GG.... .B..B.... ......... .W.WWWWW. ...RR.RR. ...OO....'))
            return res != null;


            // return edges.every((colors, i) => { 
            //         return colors.includes(edge_colors[i][0]) && colors.includes(edge_colors[i][1])
            //     }) && 
            //     corners.every((colors, i) => { 
            //         return colors.includes(corner_colors[i][0]) && colors.includes(edge_colors[i][1]) && colors.includes(edge_colors[i][2])
            //     }) 
        }

        // TODO mark off 'solved by accident' pairs (using regex and string rep)
        this.f2lPairs = {
            redGreen: false,
            greenOrange: false,
            orangeBlue: false,
            blueRed: false,
        }
    }

    targetStringToRegex(str: string) {
        // GG.GG.... .B..B.... ......... .W.WWWWW. ...RR.RR. ...OO....
            // enum Face {
            //     RIGHT, 0
            //     LEFT,  1
            //     UP,    2
            //     DOWN,  3
            //     BACK,  4
            //     FRONT, 5
            // };
        // enum ColorName {
            //     RED,    0
            //     WHITE,  1
            //     YELLOW, 2
            //     ORANGE, 3
            //     BLUE,   4
            //     GREEN,  5
            //     BLACK,  6
            // }
        let res = str
                    .replace(/\s/g, '')
                    .replace(/W/g, ColorName.WHITE.toString())
                    .replace(/Y/g, ColorName.YELLOW.toString())
                    .replace(/O/g, ColorName.ORANGE.toString())
                    .replace(/B/g, ColorName.BLUE.toString())
                    .replace(/G/g, ColorName.GREEN.toString())
                    .replace(/R/g, ColorName.RED.toString())
                    .replace(/w/g, `[^${ColorName.WHITE.toString()}]`)
                    .replace(/y/g, `[^${ColorName.YELLOW.toString()}]`)
                    .replace(/o/g, `[^${ColorName.ORANGE.toString()}]`)
                    .replace(/b/g, `[^${ColorName.BLUE.toString()}]`)
                    .replace(/g/g, `[^${ColorName.GREEN.toString()}]`)
                    .replace(/r/g, `[^${ColorName.RED.toString()}]`);

        return new RegExp(res);
    }


    findEdges(color: ColorName) {
        // let edges = this.rubiksCube.rubiksCubeLogic.getEdges();

    }

    findCross(color: ColorName) {
        // return cubeSolver.solve(this.rubiksCube.getScrambleString(), 'cross');
    }

    // TODO make sure yellow is on top
    solveNextF2LPair(depth = 22) {
        let solution : string[] = [];

        let unsolvedPairs = Object.keys(this.f2lPairs).filter(key => !this.f2lPairs[key as 'redGreen']);
        if (unsolvedPairs.length == 0)
            return { solution: [], insertion: [] };

        // let nextPair = unsolvedPairs[0];
        let nextPair = 'redGreen';
        let pair_map = {
            redGreen: [ColorName.GREEN, ColorName.RED],
            greenOrange: [ColorName.GREEN, ColorName.ORANGE],
            orangeBlue: [ColorName.ORANGE, ColorName.BLUE],
            blueRed: [ColorName.BLUE, ColorName.RED],
        }
        let colors = pair_map[nextPair as 'redGreen'];

        let corner = this.rubiksCubeLogic.getCornerPosition(ColorName.WHITE, colors[0], colors[1]);
        let edge = this.rubiksCubeLogic.getEdgePosition(colors[0], colors[1]);

        let corner_index = corner[0] as number;
        let edge_index = edge[0] as number;
        
        // let corner_faces = this.getPieceFaces(corner[0] as number);
        // let edge_faces = this.getPieceFaces(edge[0] as number);

        const edges_indices = {
            UR: 17,
            UF: 25,
            UL: 15,
            UB: 7,
            DR: 11,
            DF: 19,
            DL: 9,
            DB: 1,
            FR: 23,
            FL: 21,
            BL: 3,
            BR: 5,
        };
          
        const corners_indices = {
            URF: 26,
            UFL: 24,
            ULB: 6,
            UBR: 8,
            DFR: 20,
            DLF: 18,
            DBL: 0,
            DBR: 2,
        };

        // corner-down, edge-down
        //      same slot: get both out
        //      not same slot: get edge out first
        // corner-down, edge-up
        //      align and insert
        // corner-up, edge-down
        //      3 corner cases
        // corner-up, edge-up
        //      3 corner cases

        // outline pieces
        let original_corner = this.rubiksCubeLogic.getCornerPosition(ColorName.WHITE, colors[0], colors[1]);
        let original_edge = this.rubiksCubeLogic.getEdgePosition(colors[0], colors[1]);
        (original_corner[1] as Cube).outline(true);
        (original_edge[1] as Cube).outline(true);

        // get to upper layer
        let corner_down_layer = [corners_indices.DFR, corners_indices.DBR, corners_indices.DBL, corners_indices.DLF];
        let edge_middle_layer = [edges_indices.FR, edges_indices.BR, edges_indices.BL, edges_indices.FL];

        let copy = this.rubiksCubeLogic.copy();
        let f2lCases = new F2LCases(copy);

        // adjust edge to be in front/up right
        // if (edge_index == edges_indices.FL || edge_index == edges_indices.UF) {
        //     copy.turnY(true);
        //     solution.push("y'");
        // } else if (edge_index == edges_indices.BL || edge_index == edges_indices.UL) {
        //     copy.turnY(true);
        //     copy.turnY(true);
        //     solution.push("y2");
        // } else if (edge_index == edges_indices.UB || edge_index == edges_indices.BR) {
        //     copy.turnY(false);
        //     solution.push("y");
        // }

        corner = copy.getCornerPosition(ColorName.WHITE, colors[0], colors[1]);
        edge = copy.getEdgePosition(colors[0], colors[1]);

        corner_index = corner[0] as number;
        edge_index = edge[0] as number;

        if (corner_down_layer.includes(corner_index) && edge_middle_layer.includes(edge_index)) {
            if (edge_index - corner_index == 3) {
                // same slot
                solution = solution.concat(f2lCases.cornerDown_edgeDown.same_slot(corner_index, edge_index));
            } else
                solution = solution.concat(f2lCases.cornerDown_edgeDown.not_same_slot(corner_index, edge_index));
        } else if (!corner_down_layer.includes(corner_index) && edge_middle_layer.includes(edge_index)) {
            solution = solution.concat(f2lCases.cornerUp_edgeDown.all(corner_index, edge_index));
        } else if (corner_down_layer.includes(corner_index) && !edge_middle_layer.includes(edge_index)) {
            solution = solution.concat(f2lCases.cornerDown_edgeUp.all(corner_index, edge_index));
        } else {
            solution = solution.concat(f2lCases.cornerUp_edgeUp.all(corner_index, edge_index));
        }
        
        for (let i = 1; i < solution.length; i++) {
            let turn = solution[i];
            if (turn[0] == 'y')
                copy.turnY(turn.length > 1);
            else if (turn[0] == 'R')
                copy.turn(Face.RIGHT, turn.length > 1);
            else if (turn[0] == 'L')
                copy.turn(Face.LEFT, turn.length > 1);
            else if (turn[0] == 'U')
                copy.turn(Face.UP, turn.length > 1);
            else if (turn[0] == 'D')
                copy.turn(Face.DOWN, turn.length > 1);
            else if (turn[0] == 'F')
                copy.turn(Face.FRONT, turn.length > 1);
            else if (turn[0] == 'B')
                copy.turn(Face.BACK, turn.length > 1);
        }

        let insertF2L = this.solve(copy, 1, new Set());
        let temp = null;
        if (insertF2L != false) {
            temp = insertF2L.map(turn => {
                if (turn.face == Face.RIGHT)
                    return `R${turn.inverse ? "'" : ''}`;
                else if (turn.face == Face.LEFT)
                    return `L${turn.inverse ? "'" : ''}`;
                else if (turn.face == Face.UP)
                    return `U${turn.inverse ? "'" : ''}`;
                else if (turn.face == Face.DOWN)
                    return `D${turn.inverse ? "'" : ''}`;
                else if (turn.face == Face.FRONT)
                    return `F${turn.inverse ? "'" : ''}`;
                else if (turn.face == Face.BACK)
                    return `B${turn.inverse ? "'" : ''}`;
                return 'Unknown'                    
            });
        }

        // // get corner piece out of the way
        // // if ()
        // if (corner_index == corners_indices.DFR)
        //     solution = solution.concat("R U R'".split(' '));
        // else if (corner_index == corners_indices.DBR)
        //     solution = solution.concat("R' U' R".split(' '));
        // else if (corner_index == corners_indices.DBL)
        //     solution = solution.concat("L U L'".split(' '));
        // else if (corner_index == corners_indices.DLF)
        //     solution = solution.concat("L' U' L".split(' '));




        this.f2lPairs[nextPair as 'redGreen'] = true;
        
        // return FacePermutor.getFaceIndices(Face.LEFT)
        //         ?.map(i => {
        //             let face = this.rubiksCubeLogic.cubes[i].permutor.obj[Face.LEFT]
        //             let color = this.rubiksCubeLogic.cubes[i].color[face as 0];
        //             return ColorNames[color];
        //         });
        return {
            solution,
            insertion: temp
        };
    }

    isPieceInFace(pieceIndex: number, face: Face) {
        return FacePermutor.faceMap.get(face)?.includes(pieceIndex);
    }

    getPieceFaces(pieceIndex: number) {
        let res = [];
        let faces = FacePermutor.faceMap.keys();
        let iter = faces.next();
        while (!iter.done) {
            if (FacePermutor.faceMap.get(iter.value)?.includes(pieceIndex))
                res.push(iter.value);
            iter = faces.next();
        }

        return res;
    }
    // TODO
    // getPieceFace(index: number) {
    //     let keys = FacePermutor.faceMap.keys();
    //     let iter = keys.next();
    //     while (!iter.done) {
    //         if (FacePermutor.faceMap.get(iter.value)?.includes(index)) {
    //             return iter.value;
    //         }
    //         iter = keys.next();
    //     }

    //     return null;
    // }


    oll() {

    }

    pll() {

    }

    solve(rubiksCubeLogic: RubiksCubeLogic, depth = 25, visited: Set<string>) : false | { face: Face, inverse: boolean }[] {
        // if (visited.has(rubiksCubeLogic.toString()))
        //     return false;

        if (this.target(rubiksCubeLogic))
            return [];

        if (depth == 0)
            return false;
        
        for (let i = 0; i < this.possibleMoves.length; i++) {
            // move- resulting state
            let resultingState = rubiksCubeLogic.copy();
            resultingState.turn(this.possibleMoves[i].face, this.possibleMoves[i].inverse);
            
            let res = this.solve(resultingState, depth - 1, visited);
            // visited.add(resultingState.toString())
            
            if (res)
                return [this.possibleMoves[i]].concat(res);
        }
        
        return false;
    }

    iterativeDeepening(max_depth: number) {
        let copy = this.rubiksCubeLogic.copy();
        // Undo rotations
        copy.rotations.slice().reverse().forEach(rot => {
            if (rot == CubeRotation.X)
                copy.turnX(true)
            else if (rot == CubeRotation.Xp)
                copy.turnX(false)
            else if (rot == CubeRotation.Y)
                copy.turnY(true)
            else if (rot == CubeRotation.Yp)
                copy.turnY(false)
        });

        for (let i = 1; i <= max_depth; i++) {
            // const element = array[i];
            let res = this.solve(copy, i, new Set());
            // console.log(`${i}: ${res}`)
            
            if (res)
                return ['Undo: ', copy.rotations, res];
        }
    }
}

export { CFOPGuide }