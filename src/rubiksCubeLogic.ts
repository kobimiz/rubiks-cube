import { ColorName, Cube } from "./cube";
import { CubeLogic } from "./cubeLogic";
import { Face, FacePermutor } from "./facePermutor";
import { Permutor } from "./permutor";

enum CubeRotation {
    X = 'X',
    Xp = 'Xp',
    Y = 'Y',
    Yp = 'Yp'
};

class RubiksCubeLogic {
    static permutorMap = {
        [Face.RIGHT]: [Face.FRONT, Face.UP, Face.BACK, Face.DOWN],
        [Face.LEFT] : [Face.DOWN, Face.BACK, Face.UP, Face.FRONT],
        [Face.UP]   : [Face.FRONT, Face.LEFT, Face.BACK, Face.RIGHT],
        [Face.DOWN] : [Face.RIGHT, Face.BACK, Face.LEFT, Face.FRONT],
        [Face.FRONT]: [Face.UP, Face.RIGHT, Face.DOWN, Face.LEFT],
        [Face.BACK] : [Face.LEFT, Face.DOWN, Face.RIGHT, Face.UP],
        [Face.M]    : [Face.DOWN, Face.BACK, Face.UP, Face.FRONT],
        [Face.E]    : [Face.RIGHT, Face.BACK, Face.LEFT, Face.FRONT],
        [Face.S]    : [Face.UP, Face.RIGHT, Face.DOWN, Face.LEFT],
    };
    static oppositeFaceMap = {
        [Face.RIGHT]: Face.LEFT,
        [Face.LEFT] : Face.RIGHT,
        [Face.UP]   : Face.DOWN,
        [Face.DOWN] : Face.UP,
        [Face.FRONT]: Face.BACK,
        [Face.BACK] : Face.FRONT,
        [Face.M]    : Face.RIGHT,
        [Face.E]    : Face.UP,
        [Face.S]    : Face.BACK,
    };

    cubes: CubeLogic[] | Cube[];
    facePermutor: FacePermutor;
    permutor: Permutor;
    rotations: CubeRotation[]

    constructor(cubes: CubeLogic[] | Cube[]) {
        this.cubes = cubes;
        this.facePermutor = new FacePermutor(this.cubes);
        this.permutor = new Permutor(this.cubes);
        this.rotations = [];
    }

    turn(face: Face, inverse = false) {
        this.facePermutor.turn(face, inverse);
        let perm = RubiksCubeLogic.permutorMap[inverse ? RubiksCubeLogic.oppositeFaceMap[face] : face];

        FacePermutor.getFaceIndices(face)?.forEach(i => {
            this.cubes[i].permutor.cw_perm(perm);
        });
    }

    turnX(inverse = false) {
        if (inverse) {
            if (this.rotations.at(-1) == CubeRotation.X)
                this.rotations.pop();
            else
                this.rotations.push(inverse ? CubeRotation.Xp : CubeRotation.X)
        } else if (this.rotations.at(-1) == CubeRotation.Xp) {
            this.rotations.pop();
        } else
            this.rotations.push(inverse ? CubeRotation.Xp : CubeRotation.X)
        
        let all_mapping = [18,19,20,9,10,11,0,1,2,21,22,23,12,13,14,3,4,5,24,25,26,15,16,17,6,7,8];

        let obj: object;
        if (inverse)
            obj = Object.fromEntries(all_mapping.map((newI, i) => [newI, i]));
        else
            obj = Object.fromEntries(all_mapping.map((newI, i) => [i, newI]));

        let perm = RubiksCubeLogic.permutorMap[inverse ? Face.LEFT : Face.RIGHT];
        this.cubes.forEach(cube => {
            cube.permutor.cw_perm(perm);
        }); 

        this.permutor.permute_obj(obj);
    }

    turnY(inverse = false) {
        if (inverse) {
            if (this.rotations.at(-1) == CubeRotation.Y)
                this.rotations.pop();
            else
                this.rotations.push(inverse ? CubeRotation.Yp : CubeRotation.Y)
        } else if (this.rotations.at(-1) == CubeRotation.Yp) {
            this.rotations.pop();
        } else
            this.rotations.push(inverse ? CubeRotation.Yp : CubeRotation.Y)

        let all_mapping = [2,11,20,5,14,23,8,17,26,1,10,19,4,13,22,7,16,25,0,9,18,3,12,21,6,15,24];
        let obj: object;
        if (inverse)
            obj = Object.fromEntries(all_mapping.map((newI, i) => [newI, i]));
        else
            obj = Object.fromEntries(all_mapping.map((newI, i) => [i, newI]));

        let perm = RubiksCubeLogic.permutorMap[inverse ? Face.DOWN : Face.UP];
        this.cubes.forEach(cube => {
            cube.permutor.cw_perm(perm);
        });

        this.permutor.permute_obj(obj);
    }

    getColors(indices: number[], face: Face) {
        return this.cubes
                .filter((cube, i) => indices.includes(i))
                .map(cube => {
                    return cube.color[cube.permutor.obj[face] as Face.BACK]
                })
    }

    isSolved() {
        let faces = [Face.BACK, Face.FRONT, Face.DOWN, Face.UP, Face.RIGHT, Face.LEFT];
        let isSolved = true;

        faces.forEach(face => {
            let indices = FacePermutor.getFaceIndices(face) as number[];
            let faceColors = this.getColors(indices, face);
            let faceColor = faceColors[0];

            isSolved = isSolved && faceColors.every(color => color == faceColor);
            if (!isSolved) return;
        });

        return isSolved;
    }

    getEdges() {
        return [1,3,5,7, 9,11,15,17, 19,21,23,25].map(i => this.cubes[i]);
    }

    copy() {
        let cubesCopy = this.cubes.map(cube => {
            let res = new CubeLogic(cube.color);
            res.permutor.obj = JSON.parse(JSON.stringify(cube.permutor.obj));
            
            return res;
        });
        let res = new RubiksCubeLogic(cubesCopy)
        res.rotations = this.rotations.slice();
        return res;
    }

    getFaceColors(face: Face) {
        let faceCubes = FacePermutor.getFaceIndices(face)
                        ?.map(i => this.cubes[i])
        
        let faceColors = faceCubes?.map(cube => cube.color[cube.permutor.obj[face] as Face.BACK]) as ColorName[];

        return faceColors;
    }

    // TODO checks that corner exists
    // TODO maybe turn static
    getCornerPosition(c1: ColorName, c2: ColorName, c3: ColorName) {
        let cube_colors = this.cubes.map(cube => Object.values(cube.color) as ColorName[]);
        let index = cube_colors.findIndex(colors => {
            return colors.includes(c1) && colors.includes(c2) && colors.includes(c3)
        });

        return [index, this.cubes[index]];
    }

    // TODO checks that edge exists
    getEdgePosition(c1: ColorName, c2: ColorName) {
        let edge_positions = [1,3,5,7,9,11,15,17,19,21,23,25];
        let edges = this.cubes.filter((cube, index) => {
            return edge_positions.includes(index);
        });
        
        let cube_colors = edges.map(cube => Object.values(cube.color) as ColorName[]);
        let index = cube_colors.findIndex(colors => {
            return colors.includes(c1) && colors.includes(c2)
        });

        return [edge_positions[index], edges[index]];
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
};

export { RubiksCubeLogic, CubeRotation };