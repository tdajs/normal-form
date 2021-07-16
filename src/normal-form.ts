import { copyMat, idMat } from './utils';
import { exchangeCols, exchangeRows, replaceCol, replaceRow, multiplyRow, multiplyCol } from './elementary-ops';
import { isReducible, isZero, minimalEntry } from './utils' 

/**
 * Defines the main class for Smith normal form.
 * @category Reduction
 */
class NormalForm {
    /**
     * A (non-zero) integer matrix to be reduced to normal form. The matrix
     * `A` can be of any size, as long as it is a well-formed non-empty matrix.
     * For example,
     * ```ts
     * [[1,2,3],[2,-5,0]]
     * ```
     * is a valid input matrix of size `2×3`; whereas, 
     * ```ts
     * [[1,2,3],[2,-5]]
     * ```
     * is considered a mal-formed input matrix.
     */
    readonly A: number[][];

    /**
     * Number of rows of `A`
     */
    readonly n: number;

    /** 
     * Number of columns of `A`
     */
    readonly m: number;

    /**
     * Basechange matrix of dimension `m`.
     */
    P: number[][];

    /**
     * Basechange matrix of dimension `n`.
     */
    Q: number[][];

    /** Non-zero diagonal elements `d_0, d_2,..., d_k` after the reduction such that
     * `d_0 | d_2 |...| d_k`. 
     */
    diag: number[];

    /** 
     * Reduced diagonal matrix. Note that `D` may not be a square matrix. 
     * ```text
     * D = (inv Q)AP
     * ```
     */
    D: number[][];
    
    constructor(mat: number[][], options?: {
            copy: boolean,
            changeBasis: boolean,
        }) 
    {
        if(mat && mat.length === 0)
            throw new Error('Matrix is empty.');
            
        for(let row of mat)
            if(row.length === 0 || row.length !== mat[0].length)
                throw new Error('Matrix is malformed.');

        if(isZero(mat))
            throw new Error('Matrix has all zero entries.');
            
        this.A = copyMat(mat);
        this.n = mat.length;
        this.m = mat[0].length;
        this.P = idMat(this.n);
        this.Q = idMat(this.m);
        this.diag = new Array<number>();
        this.D = mat;
        this.reduce( );

        //console.log(equalMatrix(multiplyMat( multiplyMat(this.S, this.D), this.T), this.A));
    }

    // Main reduction method
    private reduce( ) {
        let offset: number = 0;        
        
        while(offset < this.m && offset < this.n && !isZero(this.D,offset)) {
            let [i,j] = this.improvePivot(offset);
            this.movePivot([i,j],offset);
            this.diagonalizePivot(offset);
            
            this.diag.push(this.D[offset][offset]);
            offset++;
        }
    }

    private improvePivot(offset: number) {
        let i,j: number; // Pivot position

        while(true) {
            [i,j]  = minimalEntry(this.D, offset);
            // Position of the element non-divisible by pivot or false
            let position = isReducible([i,j], this.D, offset);
            if(!position)
                break;
            
            let [s,t] = position;
            if(j === t) {
                let q = - Math.floor(this.D[s][j] / this.D[i][j]);
                replaceRow(s, i, q, this.D, { offset: offset });
                replaceCol(i, s, - q, this.Q, { offset: 0 }); //
            }
            else if(i === s) {
                let q = - Math.floor(this.D[i][t] / this.D[i][j]);
                replaceCol(t, j, q, this.D, { offset: offset});
                replaceCol(t, j, q, this.P, { offset: 0}); //
            }
            else {
                if(this.D[s][j] !== 0) {
                    let q = - Math.floor(this.D[s][j] / this.D[i][j]);
                    replaceRow(s, i, q, this.D, { offset: offset });
                    replaceCol(i, s, - q, this.Q, { offset: 0}); //
                }
                
                replaceRow(i, s, 1, this.D, { offset: offset });
                replaceCol(s, i, - 1, this.Q, { offset: 0}); //
                
                let q = - Math.floor(this.D[i][t] / this.D[i][j]);
                replaceCol(t, j, q, this.D, { offset: offset});
                replaceCol(t, j, q, this.P, { offset: 0}); //
            }
        }
        return [i,j];
    }

    private movePivot([i,j]: [number,number], offset: number) {
        if(i !== offset) {
            exchangeRows(offset, i, this.D);
            exchangeCols(offset, i, this.Q); //
        }
        if(j !== offset) {
            exchangeCols(offset, j, this.D);
            exchangeCols(offset, j, this.P); //
        }
        if(this.D[offset][offset] < 0 ) {
            multiplyRow(offset, -1, this.D);
            multiplyCol(offset, -1, this.Q); //
        }
    }

    private diagonalizePivot(offset: number) {
        // Make offset col zero
        for(let i = offset + 1; i < this.n; i++) {
            if(this.D[i][offset] === 0)
                continue;
            let q = - Math.floor(this.D[i][offset] / this.D[offset][offset]);
            replaceRow(i, offset, q, this.D, { offset: offset });
            replaceCol(offset, i, - q, this.Q, { offset: 0}); //
        }
    
        // Make offset row zero
        for(let j = offset + 1; j < this.m; j++) {
            if(this.D[offset][j] === 0)
                continue;
            let q = - Math.floor(this.D[offset][j] / this.D[offset][offset]);
            replaceCol(j,offset, q, this.D, { offset: offset});
            replaceCol(j,offset, q, this.P, { offset: 0 }); //
        }
    }
}
export { NormalForm };