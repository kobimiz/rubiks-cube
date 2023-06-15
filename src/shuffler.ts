import { RubiksCube } from "./rubiksCube";

type TurnMap = {
    [key: string]: (inverse?: boolean, isUserMove?: boolean) => void
}

class Shuffler {
    rubiksCube: RubiksCube;
    private turnMap: TurnMap;
    private turnKeys: Array<string>;

    constructor(rubiksCube: RubiksCube) {
        this.rubiksCube = rubiksCube;

        this.turnMap = {
            U: this.rubiksCube.turnUp.bind(this.rubiksCube),
            D: this.rubiksCube.turnDown.bind(this.rubiksCube),
            F: this.rubiksCube.turnFront.bind(this.rubiksCube),
            B: this.rubiksCube.turnBack.bind(this.rubiksCube),
            R: this.rubiksCube.turnRight.bind(this.rubiksCube),
            L: this.rubiksCube.turnLeft.bind(this.rubiksCube),
        }

        this.turnKeys = Object.keys(this.turnMap);
        this.turnKeys.sort((a, b) => a.localeCompare(b));
    }

    shuffle(moveCount: number) {
        if (moveCount < 1) return [];

        let shuffleMoves = [];

        let face = Math.floor(Math.random() * 6);
        if      (face == 1) this.rubiksCube.turnX();
        else if (face == 2) this.rubiksCube.turnX(true);
        else if (face == 3) this.rubiksCube.turnY();
        else if (face == 4) this.rubiksCube.turnY(true);
        else if (face == 5) [0,1].forEach(i => this.rubiksCube.turnX());


        let lastTurn = {
            move: this.getRandomTurn(),
            inverse: !!Math.floor(Math.random() * 2)
        };
        this.turnMap[lastTurn.move](lastTurn.inverse, false);
        shuffleMoves.push(lastTurn);

        // number of repetitions of the same turn. can be max 2
        let consecutive = 1;

        for (let i = 0; i < moveCount; i++) {
            let turn = {
                move: this.getRandomTurn(),
                inverse: !!Math.floor(Math.random() * 2)
            };

            while (turn.move == lastTurn.move && (consecutive == 2 || turn.inverse != lastTurn.inverse)) {
                turn = {
                    move: this.getRandomTurn(),
                    inverse: !!Math.floor(Math.random() * 2)
                };  
            }

            if (turn.move == lastTurn.move) {
                consecutive = 2;
                // count double turns as a single turn
                i--;
            }
            else
                consecutive = 1;

            lastTurn = turn;
            this.turnMap[lastTurn.move](lastTurn.inverse, false);
            shuffleMoves.push(lastTurn);
        }

        return shuffleMoves;
    }

    private getRandomTurn() {
        return this.turnKeys[Math.floor(Math.random() * 6)];
    }
}

export { Shuffler };