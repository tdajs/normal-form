/**
 * Defines the main class for Smith normal form.
 * @module
 */
import { copyMat, idMat } from './utils';
import { exchangeCols, exchangeRows, replaceCol, replaceRow, multiplyRow, multiplyCol } from './elementary-ops';
import { isReducible, isZero, minimalEntry } from './utils' 

class NormalForm {
    A: number[][];
    n: number; // rows
    m: number; // cols
    P: number[][];
    Q: number[][];
    diag: number[];
    D: number[][];
        
    constructor(mat: number[][],recordSteps: boolean = false) {
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
    reduce( ) {
        let offset: number = 0;        
        
        while(offset < this.m && offset < this.n && !isZero(this.D,offset)) {
            let [i,j] = this.improvePivot(offset);
            this.movePivot([i,j],offset);
            this.diagonalizePivot(offset);
            
            this.diag.push(this.D[offset][offset]);
            offset++;
        }
    }

    improvePivot(offset: number) {
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

    movePivot([i,j]: [number,number], offset: number) {
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

    diagonalizePivot(offset: number) {
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