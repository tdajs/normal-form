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
     * Offset of the matrix used. Default is `0`.
     */
    offset?: number,
    /**
     * if `true`, the original matrix is left unchanged, and
     * a new copy of the reduced matrix is returned. Default is 
     * `true`.
     */
    copy?: boolean,
    /**
     * if `true`, the basechange matrix is returned. Default is `true`. 
     */
    changeBase?: boolean
}

const DefaultOptions: Options = {
    offset: 0,
    copy: false,
    changeBase: true
}

/**
 * Performs the elementary row operation to
 * exchanges the i-th and k-th rows of a matrix.
 * @category Elementary Operations
 * @param i index of the row to be exchanged
 * @param k index of the row to be exchanged
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of two matrices. The first matrix is the reduced matrix, and the second
 * matrix is the basechange matrix (if `changeBase: true` is set in the `options`)
 */
export function exchangeRows(i: number, k: number, mat: number[][], options?: Options): 
        [result: number[][], baseChangeMat: number[][]] {
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

/**
 * Performs the elementary row operation to
 * replace the i-th row by q * the k-th row of a matrix.
 * @category Elementary Operations
 * @param i index of the row to be replaced
 * @param k index of the other row
 * @param q (integer) mutiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of two matrices. The first matrix is the reduced matrix, and the second
 * matrix is the basechange matrix (if `changeBase: true` is set in the `options`)
 */
export function replaceRow(i: number, k: number, q: number, mat: number[][], options?: Options):
        [result: number[][], baseChangeMat: number[][]] {
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


/**
 * Performs the elementary row operation to
 * multiply the entries of the i-th row by q of a matrix.
 * @category Elementary Operations
 * @param i index of the row to be multiplied
 * @param q (integer) multiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of two matrices. The first matrix is the reduced matrix, and the second
 * matrix is the basechange matrix (if `changeBase: true` is set in the `options`)
 */
export function multiplyRow(i: number, q: number, mat: number[][], options?: Options):
        [result: number[][], baseChangeMat: number[][]] {
    const opts = {...DefaultOptions, ...options};
    const result = opts.copy ? copyMat(mat) : mat;
    result[i] = result[i].map(val => q * val );
    
    const baseChangeMat: number[][] = opts.changeBase ? multiplyRow(i, q, idMat(result.length), {
        copy: false,
        changeBase: false
    })[0] : [];
    return [result, baseChangeMat];
}

/**
 * Performs the elementary column operation to
 * exchanges the j-th and k-th columns of a matrix.
 * @category Elementary Operations
 * @param i index of the column to be exchanged
 * @param k index of the column to be exchanged
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of two matrices. The first matrix is the reduced matrix, and the second
 * matrix is the basechange matrix (if `changeBase: true` is set in the `options`)
 */
export function exchangeCols(j: number, k: number, mat: number[][], options?: Options):
        [result: number[][], baseChangeMat: number[][]] {
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

/**
 * Performs the elementary column operation to
 * replace the j-th column by q * the k-th column of a matrix.
 * @category Elementary Operations
 * @param i index of the column to be replaced
 * @param k index of the other column
 * @param q (integer) mutiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of two matrices. The first matrix is the reduced matrix, and the second
 * matrix is the basechange matrix (if `changeBase: true` is set in the `options`)
 */
export function replaceCol(j: number, k: number, q: number, mat: number[][], options?: Options):
        [result: number[][], baseChangeMat: number[][]] {
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

/**
 * Performs the elementary column operation to
 * multiply the entries of the i-th column by q of a matrix.
 * @category Elementary Operations
 * @param j index of the column to be multiplied
 * @param q (integer) multiplier
 * @param mat matrix to perform the operation on
 * @param options optional arguments; see [[Options]] for more details
 * @returns array of two matrices. The first matrix is the reduced matrix, and the second
 * matrix is the basechange matrix (if `changeBase: true` is set in the `options`)
 */
export function multiplyCol(j: number, q: number, mat: number[][], options?: Options):
        [result: number[][], baseChangeMat: number[][]] {
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