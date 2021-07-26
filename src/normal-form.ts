import { copyMat, equalMatrix, idMat, multiplyMat } from './utils';
import { exchangeCols, exchangeRows, replaceCol, replaceRow, multiplyRow, multiplyCol } from './elementary-ops';
import { findAntiPivot, isZero, findPivot } from './utils' 

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
     * Record the reduction steps if needed.
     */
    recordSteps?: boolean
}

const DefaultNFOpts: NFOpts = {
    copy: true,
    changeBases: true,
    recordSteps: false
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
     * 
     */
    steps: any[];

    /** 
     * Optional arguments
     */
    opts: NFOpts;
    /**
     * 
     */
    Qinv: number[][];

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
        this.steps = [];

        this.A = copyMat(mat);
        this.n = this.A.length;
        this.m = this.A[0].length;

        this.D = this.opts.copy ? copyMat(mat) : mat;
        [this.P, this.Q, this.Qinv] = this.opts.changeBases ? 
            [idMat(this.m), idMat(this.n), idMat(this.n)] : [[], [], []];
        
        this.diag = new Array<number>();
        this.reduce(0, Math.min(this.m, this.n));
    }
    
    /**
     * Checks if the decomposition is valid.
     * @returns `true` is the decomposition is valid, otherwise `false`.
     */
    isValid() {
        return equalMatrix( multiplyMat(this.A, this.P), multiplyMat(this.Q, this.D) );
    }

    private reduce(startOffset: number, endOffset: number) {
        if( startOffset >= endOffset || isZero(this.D, startOffset) )
            return;

            let [i,j] = this.improvePivot(startOffset);
            this.addStep({ name: "improvedPivot", pivot: [i,j], antiPivot: [], offset: startOffset });
            this.movePivot([i,j], startOffset);        
            this.diagonalizePivot(startOffset);
            this.addStep({ name: "offset", offset: startOffset });
            this.diag.push(this.D[startOffset][startOffset]);
            this.reduce(startOffset + 1, endOffset);
        }
        
    private improvePivot(offset: number) {
        let i,j: number; // Pivot position
        
        while(true) {
            [i,j]  = findPivot(this.D, offset);
            
            // Position of the element non-divisible by pivot or false
            let antiPivot = findAntiPivot([i,j], this.D, offset);
            if(antiPivot.length === 0)
                break;
            
            let [s,t] = antiPivot;
            this.addStep({ name: "improvePivot", pivot: [i,j], antiPivot: [s,t], offset: offset });
 
            if(j === t) {
                let q = - Math.floor(this.D[s][j] / this.D[i][j]);
                let [, E, Einv] = replaceRow(s, i, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if(this.opts.changeBases) {
                    this.Q = multiplyMat(this.Q, Einv);
                    this.Qinv = multiplyMat(E, this.Qinv);
                }
                this.addStep({ name: "replaceRow", args: [s, i, q], offset: offset });
            }
            else if(i === s) {
                let q = - Math.floor(this.D[i][t] / this.D[i][j]);
                let [,E,] = replaceCol(t, j, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if(this.opts.changeBases) this.P = multiplyMat(this.P, E);
                this.addStep({ name: "replaceCol", args: [t, j, q], offset: offset });
            }
            else {
                if(this.D[s][j] !== 0) {
                    let q = - Math.floor(this.D[s][j] / this.D[i][j]);
                    let [R, E, Einv] = replaceRow(s, i, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                    if(this.opts.changeBases) {
                        this.Q = multiplyMat(this.Q, Einv);
                        this.Qinv = multiplyMat(E, this.Qinv);
                    }
                    this.addStep({ name: "replaceRow", args: [s, i, q], offset: offset });
                }

                let [R, E, Einv] = replaceRow(i, s, 1, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if(this.opts.changeBases) {
                    this.Q = multiplyMat(this.Q, Einv);
                    this.Qinv = multiplyMat(E, this.Qinv);
                }
                this.addStep({ name: "replaceRow", args: [i, s, 1], offset: offset });
                
                let q = - Math.floor(this.D[i][t] / this.D[i][j]);
                [R, E, Einv] = replaceCol(t, j, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
                if(this.opts.changeBases) this.P = multiplyMat(this.P, E);
                this.addStep({ name: "replaceCol", args: [t, j, q], offset: offset });
            }
        }
        return [i,j];
    }

    private movePivot([i,j]: [number,number], offset: number) { 
        if(i !== offset) {
            let [R, E, Einv] = exchangeRows(offset, i, this.D, { changeBase: this.opts.changeBases });
            if(this.opts.changeBases) {
                this.Q = multiplyMat(this.Q, Einv);
                this.Qinv = multiplyMat(E, this.Qinv);
            }
            this.addStep({ name: "exchangeRows", args: [offset, i], offset: offset });
        }
        if(j !== offset) {
            let [R, E, Einv] = exchangeCols(offset, j, this.D, { changeBase: this.opts.changeBases });
            if(this.opts.changeBases) this.P = multiplyMat(this.P, E);
            this.addStep({ name: "exchangeCols", args: [offset, j], offset: offset });
        }
        if(this.D[offset][offset] < 0 ) {
            let [R, E, Einv] = multiplyRow(offset, -1, this.D, { changeBase: this.opts.changeBases });
            
            if(this.opts.changeBases) {
                this.Q = multiplyMat(this.Q, E);
                this.Qinv = multiplyMat(E, this.Qinv);
            }
            this.addStep({ name: "multiplyRow", args: [offset, -1], offset: offset });
        }
    }

    private diagonalizePivot(offset: number) {
        // Make offset col zero
        for(let i = offset + 1; i < this.n; i++) {
            if(this.D[i][offset] === 0)
                continue;
            let q = - Math.floor(this.D[i][offset] / this.D[offset][offset]);
            let [R, E, Einv] = replaceRow(i, offset, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
            if(this.opts.changeBases) {
                this.Q = multiplyMat(this.Q, Einv);
                this .Qinv = multiplyMat(E, this.Qinv);
            }
            this.addStep({ name: "replaceRow", args: [i, offset], offset: offset })
        }
    
        // Make offset row zero
        for(let j = offset + 1; j < this.m; j++) {
            if(this.D[offset][j] === 0)
                continue;
            let q = - Math.floor(this.D[offset][j] / this.D[offset][offset]);
            let [R, E, Einv] = replaceCol(j,offset, q, this.D, { offset: offset, changeBase: this.opts.changeBases });
            if(this.opts.changeBases) this.P = multiplyMat(this.P, E);
            this.addStep({ name: "replaceCol", args: [j, offset], offset: offset })
        }
    }

    private addStep(step: any) {
        if(this.opts.recordSteps) {
            step.mat = copyMat(this.D);
            this.steps.push(step);
        }
        return;
    }
}
export { NormalForm, NFOpts };