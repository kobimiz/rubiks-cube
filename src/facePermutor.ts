import { Permutor } from "./permutor";

enum Face {
    RIGHT,
    LEFT,
    UP,
    DOWN,
    BACK,
    FRONT
};

class FacePermutor {
    static faceMap : Map<Face, number[]> = new Map([
        [Face.BACK , [0 ,1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ]],
        [Face.FRONT, [18,19,20,21,22,23,24,25,26]],
        [Face.UP   , [6 ,7 ,8 ,15,16,17,24,25,26]],
        [Face.DOWN , [0 ,1 ,2 ,9 ,10,11,18,19,20]],
        [Face.RIGHT, [2 ,5 ,8 ,11,14,17,20,23,26]],
        [Face.LEFT , [0 ,3 ,6 ,9 ,12,15,18,21,24]],
        // [Face.M    , [1 ,4 ,7 ,10,13,16,19,22,25]],
    ]);

    static perms       : Map<Face, Map<number, number>>;
    static inversePerms: Map<Face, Map<number, number>>;

    private permutor: Permutor;

    constructor(cubes: any[]) {
        this.permutor = new Permutor(cubes);
    }

    static init() {
        FacePermutor.perms = new Map();
        FacePermutor.inversePerms = new Map();

        // precalc permutations and their inverses
        FacePermutor.faceMap.forEach((faceIndices, face) => {
            let perm : Map<number, number> = new Map([
                [faceIndices[2], faceIndices[0]],
                [faceIndices[5], faceIndices[1]],
                [faceIndices[8], faceIndices[2]],
                [faceIndices[1], faceIndices[3]],
                // [faceIndices[4], faceIndices[4]],
                [faceIndices[7], faceIndices[5]],
                [faceIndices[0], faceIndices[6]],
                [faceIndices[3], faceIndices[7]],
                [faceIndices[6], faceIndices[8]],
            ]);

            let inversePerm = new Map(
                Array.from(perm, ([a,b]) => [b,a])
            );

            if (face == Face.BACK || face == Face.LEFT || face == Face.UP) {
                FacePermutor.perms.set(face, inversePerm);
                FacePermutor.inversePerms.set(face, perm);
            } else {
                FacePermutor.perms.set(face, perm);
                FacePermutor.inversePerms.set(face, inversePerm);
            }
        });
        
    }

    turn(face: Face, inverse = false) {
        let perm;
        if (!inverse) perm = FacePermutor.perms.get(face);
        else perm = FacePermutor.inversePerms.get(face);

        if (!perm)
            throw 'Invalid face to permute';

        console.log(perm);
        this.permutor.permute_obj_from_map(perm);
    }    
};

export { FacePermutor, Face }