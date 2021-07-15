export function mat2Tex(m: number[][]) {
    const string = m.map((row) => {
      return row.map((col) => col).join(' & ')
    }).join(" \\\\ ")
    
    const s = `\\left(\\begin{matrix}
      ${string}
    \\end{matrix}\\right)`
    
    const ss = s.replace('/\/\g', '\\')    
    return ss
}

export function vec2Tex(vec: number[]) {
    const string = "\\left(" +  vec.join(', ') + "\\right)";
    const ss = string.replace('/\/\g', '\\')
    return ss;
}

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

export function exchangeRowsMat(i: number, j: number, dim: number) {
  // const mat = nj.identity(dim);

}


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

export function copyMat(mat: number[][]) {
    return mat.map(col => {
        return col.slice();
    });
}

export function printMat(mat: number[][]) {
    for(let row of mat)
        console.log(row.join(' '));
}

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
            for(let k = 0; k < A[0].length; k++)
                sum += A[i][k] * B[k][j];
            prod[i][j] = sum;    
        }
    return prod;    
}

export function equalMatrix(A: number[][], B: number[][]) {
    if(A.length !== B.length || A[0].length !== B[0].length) {
        return false;
    }

    for(let i = 0; i < A.length; i++)
        for(let j = 0; j < A[0].length; j++)
            if(A[i][j] !== B[i][j]) {
                console.log(A[i][j] + ':' + B[i][j]);
                return false;
            }
    return true;                
}
