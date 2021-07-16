import { copyMat , idMat } from "./utils";

interface Options {
    offset?: number,
    copy?: boolean,
    changeBase?: boolean
}

const DefaultOptions: Options = {
    offset: 0,
    copy: true,
    changeBase: true
}

export function exchangeRows(i: number, k: number, mat: number[][], options?: Options) {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    let tmp = result[i];
    result[i] = result[k];
    result[k] = tmp;
    
    const baseChangeMat: number[][] = opts.changeBase ? exchangeRows(i, k, idMat(result.length), {
        copy: false,
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat];
}

export function replaceRow(i: number, k: number, q: number, mat: number[][], options?: Options) {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let j = opts.offset || 0; j < result[0].length; j++)
    result[i][j] += q * result[k][j];
    
    const baseChangeMat: number[][] = opts.changeBase ? replaceRow(i, k, - q, idMat(result.length), {
        copy: false, 
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat];
}


export function multiplyRow(i: number, q: number, mat: number[][], options?: Options) {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    result[i] = result[i].map(val => q * val );
    
    const baseChangeMat: number[][] = opts.changeBase ? multiplyRow(i, - q, idMat(result.length), {
        copy: false,
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat];
}

export function exchangeCols(j: number, k: number, mat: number[][], options?: Options) {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let i = 0; i < result.length; i++) {
        let tmp = result[i][j];
        result[i][j] = result[i][k];
        result[i][k] = tmp;
    }
    
    const baseChangeMat: number[][] = opts.changeBase ? exchangeCols(j, k, idMat(result[0].length), {
        copy: false,
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat];
}

export function replaceCol(j: number, k: number, q: number, mat: number[][], options?: Options) {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let i = opts.offset || 0; i < result.length; i++)
    result[i][j] += q * result[i][k];
    
    const baseChangeMat: number[][] = opts.changeBase ? replaceCol(j, k, q, idMat(result[0].length), {
        copy: false,
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat];
}

export function multiplyCol(j: number, q: number, mat: number[][], options?: Options) {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let i = 0; i < result.length; i++)
    result[i][j] *= q;
    
    const baseChangeMat: number[][] = opts.changeBase ? multiplyCol(j, q, idMat(result[0].length), {
        copy: false,
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat]; 
}