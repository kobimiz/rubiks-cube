import { Cube, Color } from "./cube";

import Shader from "./shader";

class RubiksCube {
    cubes: Cube[];

    constructor(size: number, gl: WebGL2RenderingContext, shader: Shader) {
        this.cubes = [];

        let scale = [0.4, 0.4, 0.4];

        for (let i = 0; i < Math.pow(size, 3); i++) {
            let x = 0.4 * (i % 3) - 0.5;
            let y = 0.4 * (Math.floor(i / 3) % 3) - 0.5;
            let z = 0.5 * (Math.floor(i / 9) % 9) - 4.0;
            this.cubes.push(new Cube(gl, shader, [x, y, z] ,scale, Color[i % 6]));
        }
    }

    draw() {
        this.cubes.forEach(cube => cube.draw());
    }
}


export default RubiksCube;