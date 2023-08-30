/**感知器 */
class Perceptron<T extends number | string> {
    private _weights: { [k in T]: number } = null;//权重
    private _bias: number = 0;//偏置
    private _alpha: number = 0.1;//学习率
    public constructor(bias: number, alpha: number) {
        this._weights = {} as { [k in T]: number };

        this._bias = bias;
        this._alpha = alpha;
    }

    //训练，给出哪些值应该在左侧，哪些值应该在右侧
    //修正这个感知器的权重值集合和偏置值
    public train(datas: { [k in T]?: number }[], flags: number[], iteration: number): void {
        for (let i = 0; i < iteration; i++) {
            for (let i = 0; i < datas.length; i++) {
                const data = datas[i];
                // const y_hat = this.f(x);

                const y_pre = this.getPredict(data);//计算当前情况下的预测值
                const y = flags[i];//获取样本的标签,实际值

                const diff = y - y_pre;//计算误差
                //修正各个影响因素的权重值
                for (const key in data) {
                    this._weights[key] = this._weights[key] ?? 0;
                    this._weights[key] += this._alpha * diff * data[key];
                }
                this._bias += this._alpha * diff;
            }
        }
    }

    //预测函数,基于当前权值判断某个样本应该在左侧还是右侧 1表示右侧 -1表示左侧
    public getPredict(x: { [k in T]?: number }): number {
        const y_hat = this.f(x);
        return this.sign(y_hat);
    }

    //输出自身当前权重参数集和偏置值
    public logInfo(): void {
        console.log(`权重:${JSON.stringify(this._weights)} 偏置:${this._bias}`);
    }


    //计算某个样本在此感知器的参数下的输出
    private f(x: { [k in T]?: number }): number {
        let ret = 0;
        for (const key in x) {
            ret += x[key] * this._weights[key]?.valueOf() ?? 0;
        }
        return ret + this._bias;
    }

    //预测函数
    private sign(y_hat: number): 1 | -1 {
        return y_hat >= 0 ? 1 : -1;
    }
}
