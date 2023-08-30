
/**辅助函数工具箱 */
class Utils {
    /**神经元激活判定函数 */
    static sigmoid(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }
    static sigmodMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result: number[][] = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                result[i][j] = Utils.sigmoid(matrix[i][j]);
            }
        }
        return result;
    }
    /**生成正态分布的随机数
     * @param mean 均值
     * @param std 标准差(分布离散程度，越大越离散)
     * @returns 
     */
    static generateRandomNumber(mean: number, std: number) {
        // 生成标准正态分布下的随机数
        let u = 0, v = 0;
        while (u === 0) {
            u = Math.random();
        }
        while (v === 0) {
            v = Math.random();
        }
        const normalDistributionNumber = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        // 将标准正态分布下的随机数转换为指定均值和标准差下的随机数
        return normalDistributionNumber * std + mean;
    }

    /**生成正态分布的随机数矩阵
     * @param mean 均值
     * @param std 标准差
     * @param rows 输入层节点数
     * @param cols 隐藏层节点数
     * @returns 
     */
    static randomNumberMatrix(mean: number, std: number, rows: number, cols: number) {
        const matrix: number[][] = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = Utils.generateRandomNumber(mean, std);
            }
        }
        return matrix;
    }
    /**零矩阵 */
    static zeroMatrix(rows: number, cols: number) {
        const matrix: number[][] = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = 0;
            }
        }
        return matrix;
    }

    /**矩阵乘法 */
    static multiplyMatrix(matrixA: number[][], matrixB: number[][]): number[][] {
        const rowsA = matrixA.length;
        const colsA = matrixA[0].length;
        const colsB = matrixB[0].length;

        // 创建一个结果矩阵，并初始化为0
        const result: number[][] = [];
        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                result[i][j] = 0;
            }
        }

        // 
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsB; j++) {
                for (let k = 0; k < colsA; k++) {
                    result[i][j] += matrixA[i][k] * matrixB[k][j];
                }
            }
        }

        return result;
    }
    /**矩阵加法 */
    static addMatrix(matrixA: number[][], matrixB: number[][]): number[][] {
        const rows = matrixA.length;
        const cols = matrixA[0].length;

        const result: number[][] = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                result[i][j] = matrixA[i][j] + matrixB[i][j];
            }
        }

        return result;
    }
    /**矩阵减法 */
    static subtractMatrix(matrixA: number[][], matrixB: number[][]): number[][] {
        const rows = matrixA.length;
        const cols = matrixA[0].length;

        const result: number[][] = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                result[i][j] = matrixA[i][j] - matrixB[i][j];
            }
        }

        return result;
    }
    /**矩阵转置 */
    static transposeMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;

        const result: number[][] = [];
        for (let i = 0; i < cols; i++) {
            result[i] = [];
            for (let j = 0; j < rows; j++) {
                result[i][j] = matrix[j][i];
            }
        }

        return result;
    }
    /**矩阵元素平方 */
    static squareMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;

        const result: number[][] = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                result[i][j] = matrix[i][j] * matrix[i][j];
            }
        }

        return result;
    }
    /**矩阵元素开方 */
    static sqrtMatrix(matrix: number[][]): number[][] {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result: number[][] = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {
                result[i][j] = Math.sqrt(matrix[i][j]);
            }
        }

        return result;
    }
    /**矩阵元素求和 */
    static sumMatrix(matrix: number[][]): number {
        const rows = matrix.length;
        const cols = matrix[0].length;

        let sum = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                sum += matrix[i][j];
            }
        }

        return sum;
    }
    /**矩阵元素求平均 */
    static meanMatrix(matrix: number[][]): number {
        const rows = matrix.length;
        const cols = matrix[0].length;

        const sum = Utils.sumMatrix(matrix);
        return sum / (rows * cols);
    }
    /**矩阵元素遍历操作 */
    static compexByNumber(matrix: number[][], symbol: "+" | "-" | "*" | "/", number: number, rever: boolean = false) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result: number[][] = [];
        for (let i = 0; i < rows; i++) {
            result[i] = [];
            for (let j = 0; j < cols; j++) {

                switch (symbol) {
                    case "+": result[i][j] = matrix[i][j] + number; break;
                    case "-": result[i][j] = rever ? number - matrix[i][j] : matrix[i][j] - number; break;
                    case "*": result[i][j] = matrix[i][j] * number; break;
                    case "/": result[i][j] = rever ? (matrix[i][j] === 0 ? 0 : number / matrix[i][j]) : (number === 0 ? 0 : matrix[i][j] / number); break;
                    default: result[i][j] = matrix[i][j]; break;
                }
            }
        }
        return result;
    }
}

type ClsData<T> = T extends BaseMatrix<infer U> ? U : never;
/**矩阵基类 */
export abstract class BaseMatrix<T>{
    protected readonly _rows: number;//行数
    protected readonly _cols: number;//列数
    protected readonly _data: T[][];//数据

    constructor(rows: number, cols: number, data: T[][] = null) {
        this._rows = rows;
        this._cols = cols;
        if (data) {
            this._data = data;
            this._rows = data.length;
            this._cols = data[0].length;
        }
        else {
            this._data = [];
            for (let i = 0; i < this._rows; i++) {
                this._data[i] = [];
                for (let j = 0; j < this._cols; j++) {
                    let value = this.getDefaultValue();
                    if (data && data[i] && data[i][j]) {
                        value = data[i][j];
                    }
                    this._data[i][j] = value;
                }
            }
        }
    }

    /**空矩阵填充默认值 */
    protected abstract getDefaultValue(): T;

    /**返回矩阵内某个位置的值 */
    public getItem(row: number, col: number): T {
        if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
            return null;
        }
        return this._data[row][col];
    }

    /**设置矩阵内某个位置的值 */
    public setItem(row: number, col: number, value: T) {
        if (row < 0 || row >= this._rows || col < 0 || col >= this._cols) {
            return;
        }
        this._data[row][col] = value;
    }

    /**获取某个值在矩阵内的索引位置 */
    public indexOf(val: number): [number, number] {
        for (let i = 0; i < this._rows; i++) {
            for (let j = 0; j < this._cols; j++) {
                if (this._data[i][j] === val) {
                    return [i, j];
                }
            }
        }
        return [-1, -1];
    }

    /**将一个二维数组的值填充此矩阵 */
    public fromArray(array: T[][], df: T = null) {
        for (let i = 0; i < this._rows; i++) {
            for (let j = 0; j < this._cols; j++) {
                let value = df;
                if (array[i] && array[i][j]) {
                    value = array[i][j];
                }
                this._data[i][j] = value;
            }
        }
    }
    public static fromArray<MCls extends BaseMatrix<any>>(
        array: ClsData<MCls>[][],
        df: ClsData<MCls> = null,
    ): MCls {
        const cls = this as any as { new(rows: number, cols: number, data: ClsData<MCls>[][]): MCls };
        return new cls(array.length, array[0].length, array);
    }

    /**全部填充一个值到此矩阵的所有位置 */
    public fill(val: T) {
        for (let i = 0; i < this._rows; i++) {
            for (let j = 0; j < this._cols; j++) {
                this._data[i][j] = val;
            }
        }
    }

    /**对自身的所有元素遍历 */
    public foreach(method: (num: T) => void): void {
        for (let i = 0; i < this._rows; i++) {
            for (let j = 0; j < this._cols; j++) {
                method(this._data[i][j]);
            }
        }
    }

    /**矩阵列 */
    public get colunms(): number {
        return this._cols;
    }
    /**矩阵行 */
    public get rows(): number {
        return this._rows;
    }
    /**实际内容数据二维数组 */
    public get data(): T[][] {
        return this._data;
    }
}

/**矩阵 */
export class Matrix extends BaseMatrix<number> {
    protected getDefaultValue(): number {
        return 0;
    }



    /**随机正态分布矩阵 */
    public static randomMatrix(mean: number, std: number, rows: number, cols: number): Matrix {
        const data = Utils.randomNumberMatrix(mean, std, rows, cols);
        return new Matrix(rows, cols, data);
    }

    /**全0矩阵 */
    public static zeroMatrix(rows: number, cols: number): Matrix {
        const data = Utils.zeroMatrix(rows, cols);
        return new Matrix(rows, cols, data);
    }

    /**自身矩阵加上目标矩阵，返回新矩阵 */
    public add(matrix: Matrix): Matrix {
        const result = Utils.addMatrix(this._data, matrix._data);
        return new Matrix(this._rows, this._cols, result);
    }
    public static add(matrixA: Matrix, matrixB: Matrix): Matrix {
        return matrixA.add(matrixB);
    }

    /**对矩阵每个元素进行基本算术运算 */
    public compexByNumber(symbol: "+" | "-" | "*" | "/", num: number, rever: boolean = false): Matrix {
        const result = Utils.compexByNumber(this._data, symbol, num, rever);
        return new Matrix(this._rows, this._cols, result);
    }

    /**自身矩阵减去目标矩阵，返回新矩阵 */
    public subtract(matrix: Matrix): Matrix {
        const result = Utils.subtractMatrix(this._data, matrix._data);
        return new Matrix(this._rows, this._cols, result);
    }
    public static subtract(matrixA: Matrix, matrixB: Matrix): Matrix {
        return matrixA.subtract(matrixB);
    }

    /**自身矩阵乘以目标矩阵，返回新矩阵 */
    public multiply(matrix: Matrix): Matrix {
        const result = Utils.multiplyMatrix(this._data, matrix._data);
        return new Matrix(this._rows, matrix._cols, result);
    }
    public static multiply(matrixA: Matrix, matrixB: Matrix): Matrix {
        return matrixA.multiply(matrixB);
    }

    /**自身矩阵转置，返回新矩阵 */
    public transpose(): Matrix {
        const result = Utils.transposeMatrix(this._data);
        return new Matrix(this._cols, this._rows, result);
    }
    public static transpose(matrix: Matrix): Matrix {
        return matrix.transpose();
    }

    /**自身矩阵元素平方，返回新矩阵 */
    public square(): Matrix {
        const result = Utils.squareMatrix(this._data);
        return new Matrix(this._rows, this._cols, result);
    }
    public static square(matrix: Matrix): Matrix {
        return matrix.square();
    }

    /**自身矩阵元素开方，返回新矩阵 */
    public sqrt(): Matrix {
        const result = Utils.sqrtMatrix(this._data);
        return new Matrix(this._rows, this._cols, result);
    }
    public static sqrt(matrix: Matrix): Matrix {
        return matrix.sqrt();
    }

    /**神经元激活计算，返回新矩阵 */
    public sigmod(): Matrix {
        const result = Utils.sigmodMatrix(this._data);
        return new Matrix(this._rows, this._cols, result);
    }
    public static sigmod(x: number): number {
        return 1 / (1 + Math.exp(-x));
    }

    /**自身矩阵元素求和*/
    public get sum(): number {
        return Utils.sumMatrix(this._data);
    }

    /**自身矩阵元素求平均*/
    public get mean(): number {
        return Utils.meanMatrix(this._data);
    }



}

/**正矩阵 */
export class SquareMatrix extends Matrix {
    constructor(size: number, data: number[][] = null) {
        if (data) {
            const tempData = [];
            for (let i = 0; i < 2; i++) {
                tempData[i] = [];
                for (let j = 0; j < 2; j++) {
                    tempData[i][j] = data[i][j] || 0;
                }
            }
            super(size, size, tempData);
        }
        else {
            super(size, size)
        }
    }
}

/**2x2矩阵 */
export class Matrix2X2 extends SquareMatrix {
    constructor(data: number[][] = null) {
        super(2, data);
    }
}



