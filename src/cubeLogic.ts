import { CubeColors } from "./cube";
import { Face } from "./facePermutor";
import { Permutor } from "./permutor";

class CubeLogic {
    color: CubeColors;
    permutor: Permutor;

    constructor(color: CubeColors) {
        this.color = color;

        this.permutor = new Permutor({
            [Face.FRONT]: Face.FRONT,
            [Face.BACK] : Face.BACK,
            [Face.RIGHT]: Face.RIGHT,
            [Face.LEFT] : Face.LEFT,
            [Face.UP]   : Face.UP,
            [Face.DOWN] : Face.DOWN,
        });
    }
}

export { CubeLogic, CubeColors };