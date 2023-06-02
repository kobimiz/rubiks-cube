class Permutor {
    obj: any;

    constructor(obj: any) {
        this.obj = obj;
    }

    permute_obj(perm: any) {
        let copy: any = {};
        Object.assign(copy, this.obj);
    
        for (const key in perm)
            this.obj[perm[key]] = copy[key];
    }
    
    cw_perm(keys: Array<any>) {
        let perm: any = {};
        for (let i = 0; i < keys.length - 1; i++)
            perm[keys[i]] = keys[i + 1];
        perm[keys[keys.length - 1]] = keys[0];
    
        this.permute_obj(perm);
    }
    
    ccw_perm(keys: Array<any>) {
        let perm: any = {};
        for (let i = 1; i < keys.length; i++)
            perm[keys[i]] = keys[i - 1];
        perm[keys[0]] = keys[keys.length - 1];
    
        this.permute_obj(perm);
    }
}

export { Permutor };