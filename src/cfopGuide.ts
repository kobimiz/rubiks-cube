import { Color, ColorName, Cube } from "./cube";
import { Face, FacePermutor } from "./facePermutor";
import * as cubeSolver from 'cube-solver';
import { Edges, Corners } from "./facePermutor";
import { CubeRotation, RubiksCubeLogic } from "./rubiksCubeLogic";
import { F2LCases } from "./f2lCases";
import { RubiksCube } from "./rubiksCube";

export const ColorNames : {[x in ColorName]: string} = {
    [ColorName.ORANGE]: 'Orange',
    [ColorName.YELLOW]: 'Yellow',
    [ColorName.WHITE]: 'White',
    [ColorName.BLACK]: 'Black',
    [ColorName.GREEN]: 'Green',
    [ColorName.BLUE]: 'Blue',
    [ColorName.RED]: 'Red',
}

type Turn = { face: Face, inverse: boolean };

type EdgeOrientation = { full: RegExp, opposite: RegExp, adjacent: RegExp, none: RegExp }
type EdgeOrientationAlgs = { full: string[], opposite: string[], adjacent: string[], none: string[] }
type CornerOrientation = { full: RegExp, bowtie: RegExp, headlights: RegExp, sune: RegExp, car: RegExp }
type CornerOrientationAlgs = { full: string[], bowtie: string[], headlights: string[], chameleon: string[], sune: string[], anti_sune: string[], car: string[], blinker: string[] }

class CFOPGuide {
    rubiksCubeLogic: RubiksCubeLogic
    target: (rubiksCubeLogic: RubiksCubeLogic) => boolean;

    // f2lPairs: { redGreen: boolean, greenOrange: boolean, orangeBlue: boolean, blueRed: boolean }
    targetPairs: string[]
    pairProgress: number

    edge_orientation: EdgeOrientation
    edge_orientation_algs: EdgeOrientationAlgs
    corner_orientation: CornerOrientation
    corner_orientation_algs: CornerOrientationAlgs

    edge_orientation_case_order: string[];
    corner_orientation_case_order: string[];

    constructor(rubiksCubeLogic: RubiksCubeLogic) {
        this.rubiksCubeLogic = rubiksCubeLogic;

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
            // let res = str.match(CFOPGuide.targetStringToRegex('GG.GG.... .B..B.... ......... .W.WWWWW. ...RR.RR. ...OO....'))
            // first pair is redGreen
            let res = str.match(CFOPGuide.targetStringToRegex('.RR.RR... .O..O.... ......... .W.WWW.WW ...BB.... ...GG.GG.'))
            //                                                 0RR3RR433 4O04O0203 422325351 012111111 223444421 545552555
            //                                                 200200125 335533331 244320000 213111011 524442444 153554552
            return res != null;


            // return edges.every((colors, i) => { 
            //         return colors.includes(edge_colors[i][0]) && colors.includes(edge_colors[i][1])
            //     }) && 
            //     corners.every((colors, i) => { 
            //         return colors.includes(corner_colors[i][0]) && colors.includes(edge_colors[i][1]) && colors.includes(edge_colors[i][2])
            //     }) 
        }

        // TODO mark off 'solved by accident' pairs (using regex and string rep)
        this.targetPairs = ['redGreen', 'greenOrange', 'orangeBlue', 'blueRed']
        this.pairProgress = 0;

        // edge orientation
        // NOTE order matters in edge orientation
        this.edge_orientation = {
            full: CFOPGuide.targetStringToRegex('.Y.YYY.Y.'),
            opposite: CFOPGuide.targetStringToRegex('...YYY...'),
            adjacent: CFOPGuide.targetStringToRegex('....YY.Y.'),
            none: CFOPGuide.targetStringToRegex('.........'),
        };

        this.edge_orientation_algs = {
            full: [],
            opposite: "F R U R' U' F'".split(' '),
            adjacent: "f R U R' U' f'".split(' '),
            none: "F R U R' U' F' f R U R' U' f'".split(' '),
        };

        this.edge_orientation_case_order = ['full','opposite','adjacent','none']

        // NOTE order matters in corner orientation
        this.corner_orientation = {
            full: CFOPGuide.targetStringToRegex('YYYYYYYYY'),
            bowtie: CFOPGuide.targetStringToRegex('.YYYYYYY.'),
            headlights: CFOPGuide.targetStringToRegex('YYYYYY.Y.'), // +chameleon
            sune: CFOPGuide.targetStringToRegex('.Y.YYYYY.'), // +anti_sune
            car: CFOPGuide.targetStringToRegex('.Y.YYY.Y.'), // +blinker
        }
        this.corner_orientation_case_order = ['full', 'bowtie', 'headlights', 'sune', 'car']

        this.corner_orientation_algs = {
            full: [],
            bowtie: "F' r U R' U' r' F R".split(' '),
            headlights: "R R D R' U U R D' R' U U R'".split(' '),
            chameleon: "r U R' U' r' F R F'".split(' '),
            sune: "R U R' U R U U R'".split(' '),
            anti_sune: "R' U' R U' R' U U R".split(' '),
            car: "F R U R' U' R U R' U' R U R' U'".split(' '),
            blinker: "f R U R' U' f' F R U R' U' F'".split(' '),
        };
    }

    // assumes yellow on top, get pair
    // TODO type the pair
    isRotationTarget(rcl: RubiksCubeLogic, pair: string) {
        // find faces with these colors
        let faceColors = {
            [Face.FRONT]: rcl.cubes[22].getColor(Face.FRONT),
            [Face.RIGHT]: rcl.cubes[14].getColor(Face.RIGHT),
            [Face.UP]: rcl.cubes[16].getColor(Face.UP),
        };
        let colors;
        if (pair == 'redGreen')
            colors = [ColorName.RED, ColorName.GREEN]
        else if (pair == 'greenOrange')
            colors = [ColorName.ORANGE, ColorName.GREEN]
        else if (pair == 'orangeBlue')
            colors = [ColorName.ORANGE, ColorName.BLUE]
        else
            colors = [ColorName.BLUE, ColorName.RED]

        return colors.includes(faceColors[Face.FRONT]) && colors.includes(faceColors[Face.RIGHT]) && faceColors[Face.UP] == ColorName.YELLOW;
    }

    static applyTurns(rcl: RubiksCubeLogic, turns: string[]) {
        turns.forEach(turn => {
            if (turn[0] == 'y')
                rcl.turnY(turn.length > 1);
            else if (turn[0] == 'x')
                rcl.turnX(turn.length > 1);
            else if (turn[0] == 'R')
                rcl.turn(Face.RIGHT, turn.length > 1);
            else if (turn[0] == 'L')
                rcl.turn(Face.LEFT, turn.length > 1);
            else if (turn[0] == 'U')
                rcl.turn(Face.UP, turn.length > 1);
            else if (turn[0] == 'D')
                rcl.turn(Face.DOWN, turn.length > 1);
            else if (turn[0] == 'F')
                rcl.turn(Face.FRONT, turn.length > 1);
            else if (turn[0] == 'B')
                rcl.turn(Face.BACK, turn.length > 1);
            else if (turn[0] == 'r') {
                rcl.turn(Face.RIGHT, turn.length > 1);
                rcl.turn(Face.M, turn.length <= 1);
            }
            else if (turn[0] == 'l') {
                rcl.turn(Face.LEFT, turn.length > 1);
                rcl.turn(Face.M, turn.length > 1);
            }
            else if (turn[0] == 'u') {
                rcl.turn(Face.UP, turn.length > 1);
                rcl.turn(Face.E, turn.length <= 1);
            }
            else if (turn[0] == 'd') {
                rcl.turn(Face.DOWN, turn.length > 1);
                rcl.turn(Face.E, turn.length > 1);
            }
            else if (turn[0] == 'f') {
                rcl.turn(Face.FRONT, turn.length > 1);
                rcl.turn(Face.S, turn.length > 1);
            }
            else if (turn[0] == 'b') {
                rcl.turn(Face.BACK, turn.length > 1);
                rcl.turn(Face.S, turn.length <= 1);
            }
        });
    }

    static applyTurnsCube(rc: RubiksCube, turns: string[]) {
        turns.forEach(turn => {
            if (turn[0] == 'y')
                rc.turnY(turn.length > 1);
            else if (turn[0] == 'x')
                rc.turnX(turn.length > 1);
            else if (turn[0].toUpperCase() == 'R')
                rc.turnRight(turn.length > 1, turn[0] == 'r');
            else if (turn[0].toUpperCase() == 'L')
                rc.turnLeft(turn.length > 1, turn[0] == 'l');
            else if (turn[0].toUpperCase() == 'U')
                rc.turnUp(turn.length > 1, turn[0] == 'u');
            else if (turn[0].toUpperCase() == 'D')
                rc.turnDown(turn.length > 1, turn[0] == 'd');
            else if (turn[0].toUpperCase() == 'F')
                rc.turnFront(turn.length > 1, turn[0] == 'f');
            else if (turn[0].toUpperCase() == 'B')
                rc.turnBack(turn.length > 1, turn[0] == 'b');
        });
    }

    static targetStringToRegex(str: string) {
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

    getPossibleMoves(faces: Face[]) {
        let res : Turn[][] = []
        faces.forEach(face => {
            res.push([{ face: face, inverse: false }]);
            res.push([{ face: face, inverse: true }]);
        })
        return res;
    }

    formatSol(sol: Turn[]) {
        return sol.map(turn => {
            if (turn.face == Face.BACK)
                return `B${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.FRONT)
                return `F${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.RIGHT)
                return `R${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.LEFT)
                return `L${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.DOWN)
                return `D${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.UP)
                return `U${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.M)
                return `x${turn.inverse ? "'" : ''}`
            else if (turn.face == Face.E)
                return `y${turn.inverse ? "'" : ''}`
            return 'Unknown'
        });
    }

    generateNextTargetRegex() {
        // redGreen: false,
        // greenOrange: false,
        // orangeBlue: false,
        // blueRed: false,

        // front: green, right: orange, up: yellow
        // front     back      up        down      left      right
        // .G.G..... .B..B.... ......... .W.WWW.W. ...RR.... ...OO....  <-- cross
        // .RR.RR... .O..O.... ......... .W.WWW.WW ...BB.... ...GG.GG.  <-- redGreen
        // GGGGGG... .B..B.... ......... .W.WWWWWW ...RR.RR. ...OO.OO.  <-- greenOrange
        // OOOOOO... RR.RR.... ......... WW.WWWWWW GG.GG.GG. ...BB.BB.  <-- orangeBlue
        // BBBBBB... GGGGGG... ......... WWWWWWWWW OO.OO.OO. RR.RR.RR.  <-- blueRed
        if (this.pairProgress == 0)
            return CFOPGuide.targetStringToRegex('.RR.RR... .O..O.... ......... .W.WWW.WW ...BB.... ...GG.GG.')
        else if (this.pairProgress == 1)
            return CFOPGuide.targetStringToRegex('GGGGGG... .B..B.... ......... .W.WWWWWW ...RR.RR. ...OO.OO.')
        else if (this.pairProgress == 2)
            return CFOPGuide.targetStringToRegex('OOOOOO... RR.RR.... ......... WW.WWWWWW GG.GG.GG. ...BB.BB.')
        else if (this.pairProgress == 3)
            return CFOPGuide.targetStringToRegex('BBBBBB... GGGGGG... ......... WWWWWWWWW OO.OO.OO. RR.RR.RR.')
        return null;
    }

    // TODO make sure yellow is on top
    solveNextF2LPair(depth = 22) {
        let solution : string[] = [];

        // let unsolvedPairs = Object.keys(this.f2lPairs).filter(key => !this.f2lPairs[key as 'redGreen']);
        if (this.pairProgress == this.targetPairs.length)
            return { solution: [], insertion_sol: [], pair: '', rotation_sol: [] };

        let nextPair = this.targetPairs[this.pairProgress];
        // let nextPair = 'redGreen';
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

        let rotation_target = (rcl: RubiksCubeLogic) => {
            return this.isRotationTarget(rcl, nextPair);
        };

        // TODO make sure max is right
        copy = this.rubiksCubeLogic.copy();
        CFOPGuide.applyTurns(copy, solution);

        let rotation_sol = this.iterativeDeepening(copy, 6, this.getPossibleMoves([ Face.E, Face.M ]), rotation_target);
        let rotation_sol_formatted = (rotation_sol ? (this.formatSol(rotation_sol[2] as Turn[])) : []);
        CFOPGuide.applyTurns(copy, rotation_sol_formatted);
        
        let is_righty = false;
        corner = copy.getCornerPosition(ColorName.WHITE, colors[0], colors[1]);
        edge = copy.getEdgePosition(colors[0], colors[1]);
        corner_index = corner[0] as number;
        edge_index = edge[0] as number;

        if ((corner_index == 6 && edge_index == 15) ||
            (corner_index == 8 && edge_index == 7) ||
            (corner_index == 26 && edge_index == 17) ||
            (corner_index == 24 && edge_index == 25)) {
                is_righty = true;
        }
        // let faces = [ (is_righty ? Face.RIGHT : Face.LEFT), Face.UP, Face.E ];
        let faces;
        if (is_righty)
            faces = [ Face.RIGHT, Face.UP ];
        else 
            faces = [ Face.FRONT, Face.UP ];

        // let insertF2L = this.solve(copy, 4, this.getPossibleMoves(faces), rotation_target, '');
        let target = (rc: RubiksCubeLogic) => {
            let str = rc.toString()
            let nextTargetRegex = this.generateNextTargetRegex();
            if (!nextTargetRegex)
                return false;
            let res = str.match(nextTargetRegex);
            return res != null;
        }
        // TODO make sure max is right
        let insert_sol = this.iterativeDeepening(copy, 8, this.getPossibleMoves(faces), target);
        let insert_sol_formatted = (insert_sol ? (this.formatSol(insert_sol[2] as Turn[])) : []);

        // this.f2lPairs[nextPair as 'redGreen'] = true;
        this.pairProgress += 1;
        
        return {
            solution,
            rotation_sol: rotation_sol_formatted,
            insertion_sol: insert_sol_formatted,
            pair: nextPair
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

    detectOLLCase() {
        // TODO assumes top layer is yellow, fix
        let totalEdgeUTurns = 0;
        let copy = this.rubiksCubeLogic.copy();

        let edge_case;
        
        for (const i in this.edge_orientation_case_order) {
            let curr_case = this.edge_orientation_case_order[i];
            for (let j = 0; j < 4; j++) {
                let yellow_layer = copy.getFaceColors(Face.UP).join('');
                if (yellow_layer.match(this.edge_orientation[curr_case as 'full'])) {
                    edge_case = curr_case;
                    break;
                }
                copy.turn(Face.UP, false);
                totalEdgeUTurns += 1;
            }
            if (edge_case)
                break;
        }

        if (!edge_case)
            throw 'Invalid edge orientation case';
        
        console.log(`edge case: ${edge_case}`)
        CFOPGuide.applyTurns(copy, this.edge_orientation_algs[edge_case as 'full'])

        let corner_case;
        let totalCornerUTurns = 0;
        
        for (const i in this.corner_orientation_case_order) {
            let curr_case = this.corner_orientation_case_order[i];
            for (let j = 0; j < 4; j++) {
                let yellow_layer = copy.getFaceColors(Face.UP).join('');
                if (yellow_layer.match(this.corner_orientation[curr_case as 'full'])) {
                    corner_case = curr_case;
                    break;
                }
                copy.turn(Face.UP, false);
                totalCornerUTurns += 1;
            }
            if (corner_case)
                break;
        }

        console.log(`corner case (before): ${corner_case}`)

        if (!corner_case)
            throw 'Invalid corner orientation case';
        else if (corner_case == 'sune') {
            if (copy.cubes[26].getColor(Face.FRONT) != ColorName.YELLOW) {
                corner_case = 'anti_sune';
                totalCornerUTurns += 1;
            }
        } else if (corner_case == 'car') {
            if (copy.cubes[6].getColor(Face.BACK) == ColorName.YELLOW &&
                copy.cubes[8].getColor(Face.BACK) == ColorName.YELLOW) {
                if (copy.cubes[24].getColor(Face.LEFT) == ColorName.YELLOW) {
                    totalCornerUTurns += 3;
                    corner_case = 'blinker';
                }
            } else if (copy.cubes[6].getColor(Face.BACK) == ColorName.YELLOW) {
                totalCornerUTurns += 2;
                corner_case = 'blinker';
            } else if (copy.cubes[8].getColor(Face.BACK) == ColorName.YELLOW) {
                corner_case = 'blinker';
            } else if (copy.cubes[24].getColor(Face.LEFT) == ColorName.YELLOW) {
                totalCornerUTurns += 1;
            } else {
                totalCornerUTurns += 1;
                corner_case = 'blinker';
            }
        } else if (corner_case == 'headlights') {
            if (copy.cubes[26].getColor(Face.FRONT) != ColorName.YELLOW) {
                corner_case = 'chameleon';
                totalCornerUTurns += 1;
            }
        } else if (corner_case == 'bowtie') {
            if (copy.cubes[26].getColor(Face.FRONT) != ColorName.YELLOW) {
                totalCornerUTurns += 2;
            }
        }

        totalEdgeUTurns %= 4;
        totalCornerUTurns %= 4;

        console.log(`corner case (after): ${corner_case}`)

        return {
            edge: {
                case: edge_case,
                u_turns: totalEdgeUTurns
            },
            corner: {
                case: corner_case,
                u_turns: totalCornerUTurns
            }
        }
    }

    // Assumes f2l is done
    oll() {
        let oll_case = this.detectOLLCase();

        let edge_pre : string[] = [];
        if (oll_case.edge.u_turns == 3)
            edge_pre = [ "U'" ]
        else if (oll_case.edge.u_turns > 0)
            edge_pre = 'U '.repeat(oll_case.edge.u_turns).trim().split(' ');
           
        let corner_pre : string[] = [];
        if (oll_case.corner.u_turns == 3)
            corner_pre = [ "U'" ]
        else if (oll_case.corner.u_turns > 0)
            corner_pre = 'U '.repeat(oll_case.corner.u_turns).trim().split(' ');
    
        return {
            edge_orientation: edge_pre.concat(this.edge_orientation_algs[oll_case.edge.case as 'full']),
            corner_orientation: corner_pre.concat(this.corner_orientation_algs[oll_case.corner.case as 'full'])
        }
    }

    // Assumes oll is done
    pll() {
        // corner permutation
        let corner_permutation = {
            cw_corner: CFOPGuide.targetStringToRegex('YYYYYYYYY'),
            e_perm: CFOPGuide.targetStringToRegex('YYYYYYYYY'),
        }
    }

    solve(rubiksCubeLogic: RubiksCubeLogic, depth = 25, possible_moves: Turn[][], is_target: (rcl: RubiksCubeLogic) => boolean, str: string) : null | Turn[] {
        // if (visited.has(rubiksCubeLogic.toString()))
        //     return false;

        // if (this.target(rubiksCubeLogic))
        if (is_target(rubiksCubeLogic))
            return [];

        if (depth == 0)
            return null;
        
        // console.log(`${depth}: ${str}`)
        for (let i = 0; i < possible_moves.length; i++) {
            // move- resulting state
            let resultingState = rubiksCubeLogic.copy();
            // resultingState.turn(possible_moves[i].face, possible_moves[i].inverse);
            // TODO clean
            possible_moves[i].forEach(turn => {
                if (turn.face == Face.E)
                    resultingState.turnY(turn.inverse);
                else if (turn.face == Face.M)
                    resultingState.turnX(turn.inverse);
                else
                    resultingState.turn(turn.face, turn.inverse);
            });
            // let newStr = `${str} ${this.formatSol([possible_moves[i]])[0]}`;
            let newStr = ``;
            let res = this.solve(resultingState, depth - 1, possible_moves, is_target, newStr);
            // visited.add(resultingState.toString())
            
            if (res)
                return possible_moves[i].concat(res);
        }
        
        return null;
    }

    iterativeDeepening(rcl: RubiksCubeLogic, max_depth: number, possible_moves: Turn[][], is_target: (rcl: RubiksCubeLogic) => boolean) {
        let copy = rcl.copy();
        // Undo rotations
        // copy.rotations.slice().reverse().forEach(rot => {
        //     if (rot == CubeRotation.X)
        //         copy.turnX(true)
        //     else if (rot == CubeRotation.Xp)
        //         copy.turnX(false)
        //     else if (rot == CubeRotation.Y)
        //         copy.turnY(true)
        //     else if (rot == CubeRotation.Yp)
        //         copy.turnY(false)
        // });

        for (let i = 1; i <= max_depth; i++) {
            // const element = array[i];
            let res = this.solve(copy, i, possible_moves, is_target, '');
            // console.log(`${i}: ${res}`)
            
            if (res)
                return ['Undo: ', copy.rotations, res];
        }
        return null;
    }
}

export { CFOPGuide }