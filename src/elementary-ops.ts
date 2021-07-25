/**
 * This module declares the elementary row and column
 * operations used in the reduction to Smith normal form.
 * @module
 */
import { copyMat , idMat } from "./utils";

/**
 * Interface for optional parameters for the elementary
 * operations.
 * @category Elementary Operations
 */
export interface Options {
    /**
     * Offset of the matrix used. Default is `0`. One can make use of
     * it to speed up the operations substantially.
     */
    offset?: number,
    /**
     * if `true`, the original matrix is left unchanged, and
     * a new copy of the reduced matrix is returned. Default is 
     * `true`.
     */
    copy?: boolean,
    /**
     * if `true`, the corresponding elemetary matrix `E` and the inverse, `Einv`, thereof 
     * are returned. Default is `true`. For row operation on a matrix `A`, the resulting 
     * matrix is equal to `EA`. For column operation on a matrix `A`, the resulting 
     * matrix is equal to `AE`. 
     */
    changeBase?: boolean
}
/**
 * The default options used for the elementary operations.
 */
const DefaultOptions: Options = {
    offset: 0,
    copy: false,
    changeBase: true
}

const ElementaryOptions: Options = {
    offset: 0,
    copy: false,
    changeBase: false
}

/**
 * Performs the elementary row operation to
 * exchanges the i-th and k-th rows of a matrix.
 * @category Elementary Operations
 * @param i index of the row to be exchanged
 * @param k index of the row to be exchanged
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of three matrices. The first matrix is the resultant matrix and the last two are
 * the corresponding elementary matrix and its inverse (if `changeBase: true` is set in the `options`).
 */
export function exchangeRows(i: number, k: number, mat: number[][], options?: Options): 
        [result: number[][], E: number[][], Einv: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    let tmp = result[i];
    result[i] = result[k];
    result[k] = tmp;

    const E = opts.changeBase ? exchangeRows(i, k, idMat(result.length), ElementaryOptions)[0] : [];
    return [result, E, E];
}

/**
 * Performs the elementary row operation to
 * replace the i-th row by q * the k-th row of a matrix.
 * @category Elementary Operations
 * @param i index of the row to be replaced
 * @param k index of the other row
 * @param q (integer) mutiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of three matrices. The first matrix is the resultant matrix and the last two are
 * the corresponding elementary matrix and its inverse (if `changeBase: true` is set in the `options`).
 */
export function replaceRow(i: number, k: number, q: number, mat: number[][], options?: Options):
        [result: number[][], E: number[][], Einv: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let j = opts.offset || 0; j < result[0].length; j++)
        result[i][j] += q * result[k][j];
    
    let E: number[][] = [], Einv: number[][] = [];
    if(opts.changeBase) {
        E = replaceRow(i, k, q, idMat(result.length), ElementaryOptions)[0];
        Einv = replaceRow(i, k, -q, idMat(result.length), ElementaryOptions)[0];
    }
    return [result, E, Einv];
}

/**
 * Performs the elementary row operation to
 * multiply the entries of the i-th row by q of a matrix.
 * @category Elementary Operations
 * @param i index of the row to be multiplied
 * @param q (integer) multiplier (`q=+1, -1`)
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of three matrices. The first matrix is the resultant matrix and the last two are
 * the corresponding elementary matrix and its inverse (if `changeBase: true` is set in the `options`).
 */
export function multiplyRow(i: number, q: number, mat: number[][], options?: Options):
        [result: number[][], E: number[][], Einv: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    result[i] = result[i].map(val => q * val );
    
    const E = opts.changeBase ? multiplyRow(i, q, idMat(result.length), ElementaryOptions)[0] : [];
    return [result, E, E];
}

/**
 * Performs the elementary column operation to
 * exchanges the j-th and k-th columns of a matrix.
 * @category Elementary Operations
 * @param i index of the column to be exchanged
 * @param k index of the column to be exchanged
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of three matrices. The first matrix is the resultant matrix and the last two are
 * the corresponding elementary matrix and its inverse (if `changeBase: true` is set in the `options`).
 */
export function exchangeCols(j: number, k: number, mat: number[][], options?: Options):
        [result: number[][], E: number[][], Einv: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let i = 0; i < result.length; i++) {
        let tmp = result[i][j];
        result[i][j] = result[i][k];
        result[i][k] = tmp;
    }
    
    const E = opts.changeBase ? exchangeCols(j, k, idMat(result[0].length), ElementaryOptions)[0] : [];
    return [result, E, E];
}

/**
 * Performs the elementary column operation to
 * replace the j-th column by q * the k-th column of a matrix.
 * @category Elementary Operations
 * @param i index of the column to be replaced
 * @param k index of the other column
 * @param q (integer) mutiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of three matrices. The first matrix is the resultant matrix and the last two are
 * the corresponding elementary matrix and its inverse (if `changeBase: true` is set in the `options`).
 */
export function replaceCol(j: number, k: number, q: number, mat: number[][], options?: Options):
        [result: number[][], E: number[][], Einv: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let i = opts.offset || 0; i < result.length; i++)
    result[i][j] += q * result[i][k];
    
    let E: number[][] = [], Einv: number[][] = [];
    if(opts.changeBase) {
        E = replaceCol(j, k, q, idMat(result[0].length), ElementaryOptions)[0];
        Einv = replaceCol(j, k, - q, idMat(result[0].length), ElementaryOptions)[0];
    }
    return [result, E, Einv];
}

/**
 * Performs the elementary column operation to
 * multiply the entries of the i-th column by q of a matrix.
 * @category Elementary Operations
 * @param j index of the column to be multiplied
 * @param q (integer) multiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of three matrices. The first matrix is the resultant matrix and the last two are
 * the corresponding elementary matrix and its inverse (if `changeBase: true` is set in the `options`).
 */
export function multiplyCol(j: number, q: number, mat: number[][], options?: Options):
        [result: number[][], E: number[][], Einv: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    
    for(let i = 0; i < result.length; i++)
    result[i][j] *= q;
    
    const E = opts.changeBase ? multiplyCol(j, q, idMat(result[0].length), ElementaryOptions)[0] : [];
    return [result, E, E];
}