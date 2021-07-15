import { copyMat } from "./utils";

// Elementary operations
export function replaceRow(i: number, k: number, q: number, mat: number[][], offset: number) {
    for(let j = offset; j < mat[0].length; j++)
        mat[i][j] += q * mat[k][j];
    
    return {
        operation: 'replaceRow',
        args: [i,k,q],
        output: copyMat(mat)
    };
}

export function replaceCol(j: number, k: number, q: number, mat: number[][], offset: number) {
    for(let i = offset; i < mat.length; i++)
        mat[i][j] += q * mat[i][k];
    return {
        operation: 'replaceCol',
        args: [j,k,q],
        output: copyMat(mat)
    };
}

export function exchangeRows(i: number, k: number, mat: number[][]) {
    let tmp = mat[i];
    mat[i] = mat[k];
    mat[k] = tmp;
    return {
        operation: 'exchangeRows',
        args: [i,k],
        output: copyMat(mat)
    };
}

export function exchangeCols(j: number, k: number, mat: number[][]) {
    for(let i = 0; i < mat.length; i++) {
        let tmp = mat[i][j];
        mat[i][j] = mat[i][k];
        mat[i][k] = tmp;
    }
    return {
        operation: 'exchangeCols',
        args: [j,k],
        output: copyMat(mat)
    };
}

export function multiplyRow(i: number, mat: number[][]) {
    mat[i] = mat[i].map(val => { return -val });
    return {
        operation: 'multiplyRow',
        args: [i],
        output: copyMat(mat)
    };
}

export function multiplyCol(j: number, mat: number[][]) {
    for(let i = 0; i < mat.length; i++)
        mat[i][j] *= -1;

    return {
        operation: 'multiplyCol',
        args: [j],
        output: copyMat(mat)
    };
}
