import { Permutor } from '../src/permutor';

function get_rotation_map() {
    return {
        'f': 'f',
        'b': 'b',
        'r': 'r',
        'l': 'l',
        'u': 'u',
        'd': 'd',
    };
}

function get_y_keys() {
    return ['f', 'l', 'b', 'r'];
}

function get_x_keys() {
    return ['f', 'u', 'b', 'd'];
}

test("Permutations", () => {
    let rotations_map = get_rotation_map();
    let perumutor = new Permutor(rotations_map);

    let y0 = get_rotation_map();
    let y1 = { f: 'r', r: 'b', b: 'l', l: 'f', u: 'u', d: 'd' };
    let y2 = { f: 'b', r: 'l', b: 'f', l: 'r', u: 'u', d: 'd' };
    let y3 = { f: 'l', r: 'f', b: 'r', l: 'b', u: 'u', d: 'd' };

    let x1 = { f: 'u', u: 'b', b: 'd', d: 'f', r: 'r', l: 'l' };
    let x1y1 = { f: 'r', u: 'b', b: 'l', d: 'f', r: 'd', l: 'u' };

    let y1x1 = { f: 'u', u: 'l', b: 'd', d: 'r', r: 'b', l: 'f' };

    perumutor.cw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y1);
    
    perumutor.cw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y2);

    perumutor.cw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y3);

    perumutor.cw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y0);

    perumutor.ccw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y3);

    perumutor.ccw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y2);

    perumutor.ccw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y1);

    perumutor.ccw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y0);

    perumutor.ccw_perm(get_x_keys());
    expect(perumutor.obj).toEqual(x1);
    
    perumutor.cw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(x1y1);

    perumutor.ccw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(x1);

    perumutor.cw_perm(get_x_keys());
    expect(perumutor.obj).toEqual(y0);

    perumutor.cw_perm(get_y_keys());
    expect(perumutor.obj).toEqual(y1);

    perumutor.ccw_perm(get_x_keys());
    expect(perumutor.obj).toEqual(y1x1);
});