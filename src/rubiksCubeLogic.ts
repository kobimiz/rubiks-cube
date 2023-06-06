import { Cube } from "./cube";
import { Face, FacePermutor } from "./facePermutor";
import { Permutor } from "./permutor";

class RubiksCubeLogic {
    static permutorMap = {
        [Face.RIGHT]: [Face.FRONT, Face.UP, Face.BACK, Face.DOWN],
        [Face.LEFT] : [Face.DOWN, Face.BACK, Face.UP, Face.FRONT],
        [Face.UP]   : [Face.FRONT, Face.LEFT, Face.BACK, Face.RIGHT],
        [Face.DOWN] : [Face.RIGHT, Face.BACK, Face.LEFT, Face.FRONT],
        [Face.FRONT]: [Face.UP, Face.RIGHT, Face.DOWN, Face.LEFT],
        [Face.BACK] : [Face.LEFT, Face.DOWN, Face.RIGHT, Face.UP],
    };
    static oppositeFaceMap = {
        [Face.RIGHT]: Face.LEFT,
        [Face.LEFT] : Face.RIGHT,
        [Face.UP]   : Face.DOWN,
        [Face.DOWN] : Face.UP,
        [Face.FRONT]: Face.BACK,
        [Face.BACK] : Face.FRONT,
    };

    cubes: Cube[];
    facePermutor: FacePermutor;
    permutor: Permutor;

    constructor(cubes: Cube[]) {
        this.cubes = cubes;
        this.facePermutor = new FacePermutor(this.cubes);
        this.permutor = new Permutor(this.cubes);
    }

    turn(face: Face, inverse = false) {
        this.facePermutor.turn(face, inverse);
        let perm = RubiksCubeLogic.permutorMap[inverse ? RubiksCubeLogic.oppositeFaceMap[face] : face];

        this.getFaceIndices(face)?.forEach(i => {
            this.cubes[i].permutor.cw_perm(perm);
        });
    }

    turnX(inverse = false) {
        let all_mapping = [18,19,20,9,10,11,0,1,2,21,22,23,12,13,14,3,4,5,24,25,26,15,16,17,6,7,8];

        let obj: object;
        if (inverse)
            obj = Object.fromEntries(all_mapping.map((newI, i) => [newI, i]));
        else
            obj = Object.fromEntries(all_mapping.map((newI, i) => [i, newI]));
        this.permutor.permute_obj(obj);
    }

    turnY(inverse = false) {
        let all_mapping = [2,11,20,5,14,23,8,17,26,1,10,19,4,13,22,7,16,25,0,9,18,3,12,21,6,15,24];
        let obj: object;
        if (inverse)
            obj = Object.fromEntries(all_mapping.map((newI, i) => [newI, i]));
        else
            obj = Object.fromEntries(all_mapping.map((newI, i) => [i, newI]));
        this.permutor.permute_obj(obj);
    }

    getFaceIndices(face: Face) {
        return this.facePermutor.getFaceIndices(face);
    }
};

export { RubiksCubeLogic };