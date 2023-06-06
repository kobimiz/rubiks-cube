import { Cube } from "./cube";
import { Face, FacePermutor } from "./facePermutor";

class RubiksCubeLogic {
    cubes: Cube[];
    facePermutor: FacePermutor;

    constructor(cubes: Cube[]) {
        this.cubes = cubes;

        this.facePermutor = new FacePermutor(this.cubes);
    }

    turn(face: Face, inverse = false) {
        this.facePermutor.turn(face, inverse);
    }

    getFaceIndices(face: Face) {
        return this.facePermutor.getFaceIndices(face);
    }
};

export { RubiksCubeLogic };