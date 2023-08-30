//神经网格反向传播法

// import { Matrix } from "./Matrix";

function sigmod(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

type LayerInfo = { weightArr: number[][], bias: number[] };//神经网络单层级信息

/**反向传播神经网络 */
class BackPropagation {
    /**激活函数,默认sigmod */
    public activeFunction: (x: number) => number = sigmod;
    /**激活函数的导函数 */
    public elActiveFunction: (x: number) => number = (x) => {
        const f_x = this.activeFunction(x);
        return f_x * (1 - f_x);
    }
    public loseFunction: (a: number, b: number) => number = (a, b) => { return (a - b) ** 2 };//损失函数,默认差值
    public learn: number = 0.5;//学习率
    public readonly initRandomWeights: { mean: number, std: number } = { mean: 0, std: 1 };//初始化权值的均值和标准差
    public testLog: boolean = false;

    /**反向传播神经网络
     * @param inputLength 输入层节点数
     * @param hideNode 初始的一层隐藏层节点数量
     * @param outNode 输出层节点数量
     */
    public constructor(inputLength: number, hideNode: number, outNode: number) {
        this.dirty = true;
        this.inputLength = inputLength;
        this.addLayer(hideNode);
        this.addLayer(outNode);
    }


    private readonly hideLayers: LayerInfo[] = [];//隐藏层神经元集
    private readonly tempNodeValues: number[][] = [];//某次计算后的各个节点具体输出值
    private readonly inputLength: number = 2;//输入层节点数
    private readonly inputNums: number[] = [];//输入层节点值

    private dirty: boolean = true;//脏标记，获取时是否需要重新前向计算各节点的值

    //获取随机数
    private generateRandomNumber() {
        const { mean, std } = this.initRandomWeights;
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

    /**获取此神经网络的答案 */
    getResult(...num: number[]) {
        if (this.inputNums.toString() == num.toString()) {
            this.testLog && console.log("等值")
            return this.forwardOutPutByLayer();
        }
        this.inputNums.length = 0;
        for (let i = 0; i < this.inputLength; i++) {
            this.inputNums[i] = num[i] || 0;//如果输入值不足，用0补足
        }
        this.dirty = true;
        return this.forwardOutPutByLayer();
    }

    /**获取指定层数的输出节点列 */
    private forwardOutPutByLayer(layer: number = -1): number[] {
        if (this.dirty) {
            this.testLog && console.log("重新计算")
            this.dirty = false;
            this.tempNodeValues.length = 0;
            for (let n = 0; n < this.hideLayers.length; n++) {
                const layerData: LayerInfo = this.hideLayers[n];
                const weightsArr = layerData.weightArr;
                const outputLength = weightsArr.length;//输出节点数
                const bias = layerData.bias;
                const output: number[] = [];
                const input = n >= 1 ? this.tempNodeValues[n - 1] : this.inputNums;//以上一层的输出值 或 如果为首层隐藏层则以输入值作为输入
                for (let i = 0; i < outputLength; i++) {
                    const weights = weightsArr[i];//第i个节点的权值组
                    this.testLog && console.log("输入:" + input, "权值:" + weights, "偏置:" + bias[i]);
                    let net = 0;
                    let index = 0;

                    for (const v of input) {//遍历所有输入值
                        if (weights[index] == null) {
                            break;
                        }
                        this.testLog && console.log(` ${net} += ${v} * ${weights[index]} `);
                        net += v * weights[index++];
                        this.testLog && console.log(`${net}`)

                    }
                    net += bias[i];//最后节点加上偏置值
                    output[i] = this.activeFunction(net);//执行激活函数
                    this.testLog && console.log(`activeFunc: ${output[i]}`)
                }
                this.tempNodeValues.push(output);
                this.testLog && console.log(`层 ${n} 输出:${output}`);
            }
        }


        return layer < 0 ? this.tempNodeValues[this.tempNodeValues.length - 1] : this.tempNodeValues[layer];
    }

    /**
     * 反向传播权值修正
     * @param target 期望输出值
     */
    private backPropagation(target: number[]) {
        this.dirty = true;//训练模式下每次都重新计算
        let thisOutPut = this.forwardOutPutByLayer();//本次输出值
        //先修正输出层节点参数
        const outputLayer = this.hideLayers[this.hideLayers.length - 1];
        const outputLength = outputLayer.weightArr.length;//输出节点数
        for (let i = 0; i < outputLength; i++) {
            const outPut = thisOutPut[i];//输出值
            const targetValue = target[i];//期望值
            const lose = this.loseFunction(outPut, targetValue);//损失值
            const weightdelta = lose * this.elActiveFunction(outPut);//权重梯度
            //更新权重
            for (let j = 0; j < outputLayer.weightArr[i].length; j++) {
                const old = outputLayer.weightArr[i][j];
                outputLayer.weightArr[i][j] = old - this.learn * weightdelta;
            }
            //更新偏置
            // outputLayer.bias[i] = outputLayer.bias[i] - weightdelta;

        }
        //修正隐藏层的节点参数
        this.testLog && console.log("总层数：" + this.hideLayers.length);
        for (let i = this.hideLayers.length - 2; i >= 0; i--) {
            thisOutPut = this.forwardOutPutByLayer(i);
            const afterLayer = this.hideLayers[i + 1];//后置层级
            const selfLayer = this.hideLayers[i];//当前操作的层级
            const selfLength = selfLayer.weightArr.length;//当前层级节点数
            this.testLog && console.log(`第${i}层有${selfLength}个节点`);
            for (let j = 0; j < selfLength; j++) {//遍历当前节点
                let total = 0;//权值和梯度的乘积 的 累加和
                afterLayer.weightArr.forEach((afArr, index) => {//遍历后续节点
                    const lineThisNodeWeight = afArr[j];//后置节点联系到当前节点的权重值
                    total += lineThisNodeWeight * afterLayer.bias[index];
                });
                let delta = total * this.elActiveFunction(thisOutPut[j]);//计算当前节点梯度
                selfLayer.weightArr[j].forEach((val, index, arr) => {
                    arr[index] = val - this.learn * delta;
                });
            }
        }
        this.testLog && this.logData();
        this.dirty = true;//标记需要更新
    }


    /**添加一层隐藏层神经元 */
    addLayer(nodeLength: number, initData: { ws?: number[][], b?: number[] } = null) {
        const add: LayerInfo = {
            weightArr: [],
            bias: []
        }
        this.dirty = true;//标记需要重新计算值
        if (initData != null) {
            if (initData.ws != null) {
                add.weightArr = initData.ws;
            }
            if (initData.b != null) {
                add.bias = initData.b;
            }
        }
        if (add.weightArr != null && add.weightArr.length === nodeLength && add.bias != null && add.bias.length === nodeLength) {//全部都有填充足够的预设初始化值
            this.hideLayers.push(add);
            return;
        }

        const layer = this.hideLayers.length;

        for (let i = 0; i < nodeLength; i++) {
            if (add.weightArr[i] == null) {
                const weights: number[] = [];
                const oldNodeLength = layer >= 1 ? this.hideLayers[layer - 1].weightArr.length : this.inputLength;//基于上一层的节点数获取权值数量
                for (let j = 0; j < oldNodeLength; j++) {
                    weights[j] = this.generateRandomNumber();//初始化权值为随机数
                }
                add.weightArr[i] = weights;
            }
            if (add.bias[i] == null) {
                add.bias[i] = 1;
            }
        }
        this.hideLayers.push(add);
    }

    logData() {
        for (const layer of this.hideLayers) {
            console.log(layer.weightArr);
            console.log(layer.bias);
        }
    }


    //训练
    train(input: number[], epoch: number, target: number[]) {
        this.inputNums.length = 0;
        for (let i = 0; i < this.inputLength; i++) {
            this.inputNums[i] = input[i] == null ? 0 : input[i];//如果输入值不足，用0补足
        }
        const outLength = this.hideLayers[this.hideLayers.length - 1].weightArr.length;
        for (let i = 0; i < outLength; i++) {
            target[i] = target[i] == null ? 0 : target[i];
        }
        for (let i = 0; i < epoch; i++) {
            this.backPropagation(target);
        }
    }
}


//测试训练数据
let ai = new BackPropagation(3, 2, 3);
ai.testLog = false;
ai.learn = 0.1;
ai.train([1, 2, 3], 1000, [1, 2, 3]);

console.log("结果1:", ai.getResult(3, 2, 1));
console.log("结果2:", ai.getResult(1, 2, 3));

ai.logData();





// {
//     const input_nodes = 2;//输入层节点数
//     const hidden_nodes = 2;//隐藏层节点数
//     const output_nodes = 1;//输出层节点数

//     let weights_input_to_hidden = Matrix.randomMatrix(0, input_nodes ** -0.5, hidden_nodes, input_nodes);//输入层到隐藏层的权重矩阵
//     let weights_hidden_to_output = Matrix.randomMatrix(0, hidden_nodes ** -0.5, hidden_nodes, output_nodes);//隐藏层到输出层的权重矩阵
//     let hidden_bias = Matrix.zeroMatrix(1, hidden_nodes);//隐藏层偏置
//     let output_bias = Matrix.zeroMatrix(1, output_nodes);//输出层偏置

//     //前向传播
//     function forward_pass(inputs: Matrix): [Matrix, Matrix] {
//         const hidden_inputs = Matrix.multiply(inputs, weights_input_to_hidden).add(hidden_bias);//隐藏层输入
//         const hidden_outputs = hidden_inputs.sigmod();//隐藏层输出
//         const final_inputs = Matrix.multiply(hidden_outputs, weights_hidden_to_output).add(output_bias);//输出层输入
//         const final_outputs = final_inputs.sigmod();//输出层输出
//         return [final_outputs, hidden_outputs];
//     }
//     //反向传播梯度更新权值和偏置
//     function backward_pass(inputs: Matrix, targets: Matrix, final_outputs: Matrix, hidden_outputs: Matrix, learn_rate: number) {
//         const error = targets.subtract(final_outputs);//误差
//         const output_error_term = error.multiply(final_outputs).multiply(final_outputs.compexByNumber("-", 1, true));//输出层误差项
//         const hidden_error = Matrix.multiply(output_error_term, weights_hidden_to_output.transpose());//隐藏层误差
//         const hidden_error_term = hidden_error.multiply(hidden_outputs).multiply(hidden_outputs.compexByNumber("-", 1, true));//隐藏层误差项
//         weights_hidden_to_output = weights_hidden_to_output.add(
//             Matrix.multiply(hidden_outputs.transpose(), output_error_term) //隐藏层输出转置后与输出层误差项相乘
//                 .compexByNumber("*", learn_rate) //乘以学习率
//         );//更新隐藏层到输出层的权重
//         weights_input_to_hidden = weights_input_to_hidden.add(
//             Matrix.multiply(inputs.transpose(), hidden_error_term) //隐藏层误差转置后与输入层相乘
//                 .compexByNumber("*", learn_rate) //乘以学习率
//         );//更新输入层到隐藏层的权重
//         output_bias = output_bias.add(output_error_term.compexByNumber("*", learn_rate));//更新输出层偏置
//         hidden_bias = hidden_bias.add(hidden_error_term.compexByNumber("*", learn_rate));//更新隐藏层偏置
//     }

//     //训练
//     function train(inputs: Matrix, targets: Matrix, epoch: number, learn_rate: number) {
//         for (let i = 0; i < epoch; i++) {
//             const [final_outputs, hidden_outputs] = forward_pass(inputs);
//             backward_pass(inputs, targets, final_outputs, hidden_outputs, learn_rate);
//         }
//     }

// }

