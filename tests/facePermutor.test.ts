import { Face, FacePermutor } from "../src/facePermutor";

test('face permutor', () => {
    // let gl: WebGL2RenderingContext;
    // let cubes = new RubiksCube(gl);
    FacePermutor.init();
    
    let faceMap = {
        back : [0 ,1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ],
        front: [18,19,20,21,22,23,24,25,26],
        up   : [6 ,7 ,8 ,15,16,17,24,25,26],
        down : [0 ,1 ,2 ,9 ,10,11,18,19,20],
        right: [2 ,5 ,8 ,11,14,17,20,23,26],
        left : [0 ,3 ,6 ,9 ,12,15,18,21,24],
        // m    : [1 ,4 ,7 ,10,13,16,19,22,25],
    };

    // clockwise
    let facePermutations = {
        back : [2 ,5 ,8 ,1 ,4 ,7 ,0 ,3 ,6 ],
        front: [24,21,18,25,22,19,26,23,20],
        up   : [8 ,17,26,7 ,16,25, 6,15,24],
        right: [20,11,2 ,23,14,5 ,26,17,8 ],
        down : [18,9 ,0 ,19,10,1 ,20,11, 2],
        left : [6 ,15,24,3 ,12,21,0 ,9 ,18],
    };
    
    let cubes = Array.from(Array(3**3).keys());
    let facePermutor = new FacePermutor(cubes);

    facePermutor.turn(Face.BACK, false);
    let backFace = cubes.filter((v,i) => faceMap.back.includes(i))
    expect(backFace).toEqual(facePermutations.back);
    facePermutor.turn(Face.BACK, true);
    backFace = cubes.filter((v,i) => faceMap.back.includes(i))
    expect(backFace).toEqual(faceMap.back);

    facePermutor.turn(Face.FRONT, false);
    let frontFace = cubes.filter((v,i) => faceMap.front.includes(i))
    console.log(frontFace);
    console.log(facePermutations.front);
    expect(frontFace).toEqual(facePermutations.front);
    facePermutor.turn(Face.FRONT, true);
    frontFace = cubes.filter((v,i) => faceMap.front.includes(i))
    expect(frontFace).toEqual(faceMap.front);

    facePermutor.turn(Face.RIGHT, false);
    let rightFace = cubes.filter((v,i) => faceMap.right.includes(i))
    expect(rightFace).toEqual(facePermutations.right);
    facePermutor.turn(Face.RIGHT, true);
    rightFace = cubes.filter((v,i) => faceMap.right.includes(i))
    expect(rightFace).toEqual(faceMap.right);

    facePermutor.turn(Face.LEFT, false);
    let leftFace = cubes.filter((v,i) => faceMap.left.includes(i))
    expect(leftFace).toEqual(facePermutations.left);
    facePermutor.turn(Face.LEFT, true);
    leftFace = cubes.filter((v,i) => faceMap.left.includes(i))
    expect(leftFace).toEqual(faceMap.left);

    facePermutor.turn(Face.DOWN, false);
    let downFace = cubes.filter((v,i) => faceMap.down.includes(i))
    expect(downFace).toEqual(facePermutations.down);
    facePermutor.turn(Face.DOWN, true);
    downFace = cubes.filter((v,i) => faceMap.down.includes(i))
    expect(downFace).toEqual(faceMap.down);

    facePermutor.turn(Face.UP, false);
    let upFace = cubes.filter((v,i) => faceMap.up.includes(i))
    expect(upFace).toEqual(facePermutations.up);
    facePermutor.turn(Face.UP, true);
    upFace = cubes.filter((v,i) => faceMap.up.includes(i))
    expect(upFace).toEqual(faceMap.up);
});