import { replaceCol, replaceRow } from "./elementary-ops"

/**
 * Generates a string that MathJax/KaTex can use to print
 * a matrix.
 * @param mat matrix to be printed
 * @returns Latex/KaTex ready string
 * @category Utility
 */
export function mat2Tex(mat: number[][]) {
    const string = mat.map((row) => {
      return row.map((col) => col).join(' & ')
    }).join(" \\\\ ")
    
    const s = `\\left(\\begin{matrix}
      ${string}
    \\end{matrix}\\right)`
    
    const ss = s.replace('/\/\g', '\\')    
    return ss
}

/**
 * Generates a string that MathJax/KaTex can use to print
 * a vector.
 * @param vec vector to be printed 
 * @returns Latex/KaTex ready string
 * @category Utility
 */
export function vec2Tex(vec: number[]) {
    const string = "\\left(" +  vec.join(', ') + "\\right)";
    const ss = string.replace('/\/\g', '\\')
    return ss;
}

/**
 * Transforms an old basis to a new basis by post multiplying
 * by the basechange matrix.
 * @param oldBasis vector of basis elements
 * @param basechangeMat basechange matrix
 * @returns vector of new basis
 * @category Utility
 */
export function changeBasis(oldBasis: string[], basechangeMat: number[][]) {
    const newBasis = [];
    const dim = oldBasis.length;
    
    for(let j = 0; j < dim; j++) {
        let string = '';

        for(let i = 0; i < dim; i++) {
          const entry = basechangeMat[i][j];
          
          if(entry === 0)
            continue;
          else if(entry === 1)
            string += '+' + oldBasis[i];
          else if(entry === -1)
            string += '-' + oldBasis[i]; 
          else if(entry > 1)
            string += '+' + entry + oldBasis[i];
          else
            string += '-' + Math.abs(entry) + oldBasis[i];
        }
        if(string[0] === '+')
          string = string.slice(1);
        newBasis[j] = string;
    }
    return newBasis;
}

/**
 * Generates a copy of the identity matrix of a given size.
 * @param size 
 * @returns an identity matrix
 * @category Utility
 */
export function idMat(size: number) {
    let mat = new Array<number[]>(size);
    for(let i = 0; i < size; i++) {
        let col = new Array<number>(size);
        for(let j = 0; j < size; j++)
            col[j] = 0;
        col[i] = 1;
        mat[i] = col;
    }
    return mat;
}

/**
 * Returns a shallow copy/clone of a matrix
 * @param mat matrix to be copied
 * @returns shallow copy of the input matrix
 * @category Utility
 */
export function copyMat(mat: any[][]) {
    return mat.map(col => {
        return col.slice();
    });
}

/**
 * Post multiplies the matrix A by the matrix B, provided they
 * are of compatible dimensions. 
 * @param A 
 * @param B 
 * @returns a new copy of the product matrix
 * @category Utility
 */
export function multiplyMat(A: number[][], B: number[][]) {
    if(A[0].length !== B.length)
        throw new Error('Matrix dimension mismatch.');

    let prod = new Array<number[]>(A.length);
    for(let i = 0; i < A.length; i++) {
        prod[i] = new Array<number>(B[0].length);
    }

    for(let i = 0; i < A.length; i++)
        for(let j = 0; j < B[0].length; j++) {
            let sum = 0;  
            for(let k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
                if(!Number.isSafeInteger(sum))    
                    throw new Error('Integers too big.');
            }
            prod[i][j] = sum;    
        }
    return prod;    
}

/**
 * Checks equality of two matrices
 * @param A 
 * @param B 
 * @returns `true` if equal; otherwise, `false`
 * @category Utility
 */
export function equalMatrix(A: number[][], B: number[][]) {
    if(A.length !== B.length || A[0].length !== B[0].length) {
        return false;
    }

    for(let i = 0; i < A.length; i++)
        for(let j = 0; j < A[0].length; j++)
            if(A[i][j] !== B[i][j]) {
                return false;
            }
    return true;                
}

export function isZero(mat: number[][], offset: number = 0) {
    for(let i = offset; i <  mat.length; i++)
        for(let j = offset; j < mat[0].length; j++) {
            if(!Number.isSafeInteger(mat[i][j]))
                throw new Error('Integers too big.');
            if(mat[i][j] !== 0)
                return false;
    }
    return true;    
}

export function findAntiPivot([s,t]: [number,number], mat: number[][], offset: number) {
    let alpha = Math.abs(mat[s][t]);
    for(let i = offset; i < mat.length; i++)
        for(let j = offset; j < mat[0].length; j++) {
            if(mat[i][j] % alpha !== 0) {
                return [i,j];
            }
        }
    return [];
}

export function findPivot(mat: number[][], offset: number) {
    if(mat.length === offset)
        throw new Error('Matrix must be non-empty.');

    let min = Number.MAX_VALUE;
    let pos = new Array<number>(2);
        
    for(let i = offset; i < mat.length; i++) {
        if(mat[i].length === offset)
            throw new Error('Column must be non-empty.');
            
        for(let j = offset; j < mat[0].length; j++) {
            if(!Number.isInteger(mat[i][j]))
                throw new Error('Matrix can not have non-integer values.');
                
            let elm = mat[i][j];
            if(Math.abs(elm) > 0 && Math.abs(min) > Math.abs(elm)) {
                min = elm;
                pos = [i,j];
            }
        }
    }
        
    if(min === Number.MAX_VALUE)
        throw new Error('Matrix can not have all zeros.');
        
    return pos;
}

export function improvePivot(pivot: number[], antiPivot: number[], mat: number[][], offset = 0) {
    const [i,j] = pivot;
    mat = copyMat(mat);

    if(antiPivot.length === 0)
        return mat;

    const [s,t] = antiPivot;
 
    if(j === t) {
        let q = - Math.floor(mat[s][j] / mat[i][j]);
        replaceRow(s, i, q, mat, { offset: offset });
    }
    else if(i === s) {
        let q = - Math.floor(mat[i][t] / mat[i][j]);
        replaceCol(t, j, q, mat, { offset: offset});
    }
    else {
        if(mat[s][j] !== 0) {
            let q = - Math.floor(mat[s][j] / mat[i][j]);
            replaceRow(s, i, q, mat, { offset: offset });
        }        
        replaceRow(i, s, 1, mat, { offset: offset });
        let q = - Math.floor(mat[i][t] / mat[i][j]);
        replaceCol(t, j, q, mat, { offset: offset});
    }
    return mat;
}