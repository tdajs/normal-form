import { copyMat, idMat } from './utils';
import { exchangeCols, exchangeRows, replaceCol, replaceRow, multiplyRow, multiplyCol } from './elementary-ops';
import { isReducible, isZero, minimalEntry } from './utils' 

/**
 * Optional arguments
 * @category Normal Form
 */
interface NFOpts {
    /**
     * If `true`, the input is left unchanged, and the reduced matrix `D`
     * is a new matrix. Otherwise, `A` is mutated to `D`, and the reference to
     * `A` to returned as `D`. Default is `true`.
     */
    copy?: boolean,
    /**
     * Updates the basechange matrices `P` and `Q` if `true`. If set to `false`, 
     * the matrices remains empty.
     */
    changeBases?: boolean,
    /**
     * 
     */
    beforeFn: (step: ReductionStep) => void,
    /**
     * 
     */
    afterFn: (step: ReductionStep) => void
}

const DefaultNFOpts: NFOpts = {
    copy: true,
    changeBases: true,
    beforeFn: () => {},
    afterFn: () => {}
}

interface ReductionStep {
    name: string,
    args?: any
}

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
     * is considered a malformed input matrix.
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
    
    /** 
     * Optional arguments
     */
    opts: NFOpts;

    constructor(mat: number[][], options?: NFOpts)
    {
        if(mat && mat.length === 0)
            throw new Error('Matrix is empty.');
            
        for(let row of mat)
            if(row.length === 0 || row.length !== mat[0].length)
                throw new Error('Matrix is malformed.');

        if(isZero(mat))
            throw new Error('Matrix has all zero entries.');
        
        this.opts = {...DefaultNFOpts,...options};
        
        this.A = this.opts.copy ? copyMat(mat) : mat;
        this.n = this.A.length;
        this.m = this.A[0].length;
        [this.P, this.Q] = this.opts.changeBases ? [idMat(this.n), idMat(this.m)] : [[],[]];
        this.diag = new Array<number>();
        this.D = this.A;
        this.reduce(0, Math.min(this.m, this.n));
        //this.reduce(0, 1);
    }

    private reduce(startOffset: number, endOffset: number) {
        if( startOffset >= endOffset || isZero(this.D, startOffset) )
            return;
        
        this.opts.beforeFn({ name: 'offset', args: [startOffset, endOffset] }); // step
        
        let [i,j] = this.improvePivot(startOffset);
        
        this.movePivot([i,j], startOffset);
        
        this.diagonalizePivot(startOffset);
        
        this.diag.push(this.D[startOffset][startOffset]);
        
        this.reduce(startOffset + 1, endOffset);
    }

    private improvePivot(offset: number) {
        let i,j: number; // Pivot position

        while(true) {
            [i,j]  = minimalEntry(this.D, offset);
            
            // Position of the element non-divisible by pivot or false
            let position = isReducible([i,j], this.D, offset);
            if(!position)
            break;
            
            this.opts.afterFn({ name: 'minimal', args: [i, j] }); // step
            
            let [s,t] = position;
            this.opts.afterFn({ name: 'position', args: [s, t] }); // step
            
            if(j === t) {
                let q = - Math.floor(this.D[s][j] / this.D[i][j]);
                this.opts.beforeFn({ name: 'replaceRow', args: [s, i, q, offset] }); // step
                replaceRow(s, i, q, this.D, { offset: offset });
                this.opts.beforeFn({ name: 'replaceCol', args: [i, s, - q, offset] }); // step
                replaceCol(i, s, - q, this.Q, { offset: 0 }); //
            }
            else if(i === s) {
                let q = - Math.floor(this.D[i][t] / this.D[i][j]);
                this.opts.beforeFn({ name: 'replaceCol', args: [t, j, q, offset] }); // step
                replaceCol(t, j, q, this.D, { offset: offset});
                this.opts.beforeFn({ name: 'replaceRow', args: [t, j, q, offset] }); // step
                replaceCol(t, j, q, this.P, { offset: 0}); //
            }
            else {
                if(this.D[s][j] !== 0) {
                    let q = - Math.floor(this.D[s][j] / this.D[i][j]);
                    this.opts.beforeFn({ name: 'replaceRow', args: [s, i, q, offset] }); // step
                    replaceRow(s, i, q, this.D, { offset: offset });
                    this.opts.beforeFn({ name: 'replaceCol', args: [i, s, - q, offset] }); // step
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
export { NormalForm, NFOpts };