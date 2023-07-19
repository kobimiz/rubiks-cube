import { ColorName } from "./cube";
import { Face } from "./facePermutor";
import { CubeRotation, RubiksCubeLogic } from "./rubiksCubeLogic";

enum Stage {
    CROSS = 'Cross',
    F2L = 'F2L',
    OLL1 = 'OLL1',
    OLL2 = 'OLL2',
    PLL1 = 'PLL1',
    PLL2 = 'PLL2',
    SOLVED = 'Solved'
}

class CurrentStage {
    rcl: RubiksCubeLogic

    private allElements: (HTMLElement | null)[];

    constructor(rcl: RubiksCubeLogic) {
        this.rcl = rcl;

        this.allElements = [
            document.getElementById('solveCross'),
            document.getElementById('solveNextPair'),
            document.getElementById('solveOLL1'),
            document.getElementById('solveOLL2'),
            document.getElementById('solvePLL1'),
            document.getElementById('solvePLL2'),
        ];
    }

    getStage(): Stage {
        let copy = this.rcl.copy();

        // restore original state- yellow on top
        copy.rotations.reverse().forEach(rot => {
            if (rot == CubeRotation.X)
                copy.turnX(true);
            else if (rot == CubeRotation.Xp)
                copy.turnX(false);
            else if (rot == CubeRotation.Y)
                copy.turnY(true);
            else if (rot == CubeRotation.Yp)
                copy.turnX(false);
        })
        
        let temp = this.rcl;
        this.rcl = copy;

        let res = Stage.CROSS;

        if (this.isSolved())
            res = Stage.SOLVED;
        else if (this.isPLL2())
            res = Stage.PLL2;
        else if (this.isPLL1())
            res = Stage.PLL1;
        else if (this.isOLL2())
            res = Stage.OLL2;
        else if (this.isOLL1())
            res = Stage.OLL1;
        else if (this.isF2L())
            res = Stage.F2L;

        this.rcl = temp;
        return res;
    }

    updateUI() {
        let stage = this.getStage();
        document.getElementById('solutionStage')!.textContent = stage;

        // this.allElements.forEach(element => element!.style.display = 'none');

        // if (stage == Stage.CROSS)
        //     document.getElementById('solveCross')!.style.display = 'initial';
        // else if (stage == Stage.F2L)
        //     document.getElementById('solveNextPair')!.style.display = 'initial';
        // else if (stage == Stage.OLL1)
        //     document.getElementById('solveOLL1')!.style.display = 'initial';
        // else if (stage == Stage.OLL2)
        //     document.getElementById('solveOLL2')!.style.display = 'initial';
        // else if (stage == Stage.PLL1)
        //     document.getElementById('solvePLL1')!.style.display = 'initial';
        // else if (stage == Stage.PLL2)
        //     document.getElementById('solvePLL2')!.style.display = 'initial';
        
    }

    private isSolved() {
        let faces = [ Face.BACK, Face.FRONT, Face.UP, Face.DOWN, Face.RIGHT, Face.LEFT ]
        for (const i in faces) {
            let faceColors = this.rcl.getFaceColors(faces[i]);

            if (!faceColors.every(c => c == faceColors[0]))
                return false;
        }
        return true;
    }

    private isPLL2() {
        let faces = [ Face.BACK, Face.FRONT, Face.UP, Face.DOWN, Face.RIGHT, Face.LEFT ]
        let pieces_to_ignore = [7,7,null,null,5,5]
        for (const i in faces) {
            let faceColors = this.rcl.getFaceColors(faces[i]);
            if (pieces_to_ignore[i])
                faceColors.splice(pieces_to_ignore[i] as number, 1)

            if (!faceColors.every(c => c == faceColors[0]))
                return false;
        }
        return true;
    }

    private isPLL1() {
        let faces = [ Face.BACK, Face.FRONT, Face.UP, Face.DOWN, Face.RIGHT, Face.LEFT ]
        let pieces_to_ignore = [
            [6,7,8],
            [6,7,8],
            [],
            [],
            [2,5,8],
            [2,5,8],
        ]
        for (const i in faces) {
            let faceColors = this.rcl.getFaceColors(faces[i]);
            if (pieces_to_ignore[i].length > 0)
                faceColors = faceColors.filter((c,j) => !pieces_to_ignore[i].includes(j))

            if (!faceColors.every(c => c == faceColors[0]))
                return false;
        }
        return true;
    }

    private isOLL2() {
        let faces = [ Face.BACK, Face.FRONT, Face.UP, Face.DOWN, Face.RIGHT, Face.LEFT ]
        let pieces_to_ignore = [
            [6,7,8],
            [6,7,8],
            [0,2,6,8],
            [],
            [2,5,8],
            [2,5,8],
        ]
        for (const i in faces) {
            let faceColors = this.rcl.getFaceColors(faces[i]);
            if (pieces_to_ignore[i].length > 0)
                faceColors = faceColors.filter((c,j) => !pieces_to_ignore[i].includes(j))

            if (!faceColors.every(c => c == faceColors[0]))
                return false;
        }
        return true;
    }

    private isOLL1() {
        let faces = [ Face.BACK, Face.FRONT, Face.UP, Face.DOWN, Face.RIGHT, Face.LEFT ]
        let pieces_to_ignore = [
            [6,7,8],
            [6,7,8],
            [0,1,2,3,4,5,6,7,8],
            [],
            [2,5,8],
            [2,5,8],
        ]
        for (const i in faces) {
            let faceColors = this.rcl.getFaceColors(faces[i]);
            if (pieces_to_ignore[i].length > 0)
                faceColors = faceColors.filter((c,j) => !pieces_to_ignore[i].includes(j))

            if (!faceColors.every(c => c == faceColors[0]))
                return false;
        }
        return true;
    }

    // TODO count pairs
    private isF2L() {
        let down_pieces = this.rcl.getFaceColors(Face.DOWN);

        let edge_pieces_idx = [1,3,4,5,7];

        let edge_colors = edge_pieces_idx.map(idx => down_pieces[idx])

        return edge_colors.every(c => c == ColorName.WHITE);
    }
}

export { CurrentStage, Stage }