
/**栈数据结构 */
class Stack<T>{
    private readonly _data: T[] = [];//具体数据
    constructor() {
        this._data = [];
    }

    /**添加新内容到栈顶，不接受空对象 */
    public push(obj: T) {
        if (obj == null) { return; }
        this._data.push(obj);
    }

    public pop(): T {
        if (this._data.length <= 0) { return null; }
        return this._data.pop();
    }

    public clear() {
        this._data.length = 0;
    }

    public get top(): T {
        if (this._data.length <= 0) { return null; }
        return this._data[this._data.length - 1];
    }

    public get length(): number {
        return this._data.length;
    }
}

export class AIAction<T> {
    private readonly _owner: AI<T, any>;
    private readonly _action: (ai: AI<T, any>) => void;
    private readonly _check: (ai: AI<T, any>) => boolean;

    /**ai行为对象
     * @param ai 所属ai
     * @param act 具体行为动作
     * @param check 此行为的结束条件,没有则表示执行一次后立即记作完成
     */
    constructor(ai: AI<T, any>, act: (ai: AI<T, any>) => void, check?: (ai: AI<T, any>) => boolean) {
        this._owner = ai;
        this._action = act;
        this._check = check;
    }

    /**返回是否已执行完毕当前行为 */
    public tick(dt: number): boolean {
        this._action(this._owner);
        return this._check == null || this._check(this._owner)
    }

}

export class AI<T, M> {
    private readonly _behaviorStack: Stack<AIAction<T>> = new Stack();//行为栈
    private _state: T = null;//当前状态
    public role: M;//自身控制的ai实体
    /**ai逻辑是否激活 */
    public enable: boolean = false;

    /**需要外部帧驱动 */
    public update(dt: number) {
        if (!this.enable) { return; }

        const finish = this._behaviorStack.length >= 1 ? this._behaviorStack.top.tick(dt) : true;//执行并返回 当前动作是否完毕
        const change = this.checkenvironment();//决策环境检查

        if (change || finish) {//环境变更了 或 动作完成了
            this.stopCurAct();//停止当前行为
            this.decision();//进行下一步决策
        }
    }

    //切换当前决策环境 返回是否切换到新环境了
    private checkenvironment(): boolean {
        for (let i = 0; i < this._environmentCheck.length; i++) {
            if (this._environmentCheck[i].environment == this._state) { continue; }//环境没变化
            const meet = this._environmentCheck[i].check();//是否达成此环境的条件
            if (meet) {
                this._state = (this._environmentCheck[i].environment);//进入此环境状态
                return true;
            }
        }
        return false
    }



    /**添加新行为到栈顶 */
    public addAction(act: AIAction<T>): void;
    /**根据权重，随机添加新行为到栈顶 */
    public addAction(act: { weight: number, act: AIAction<T> }[]): void;
    public addAction(act: AIAction<T> | { weight: number, act: AIAction<T> }[]) {
        if (act instanceof AIAction) {
            this._behaviorStack.push(act);
        }
        else {
            const ws = act.map(v => { return v.weight });
            const index = Math.randomByWeight(ws);
            this._behaviorStack.push(act[index].act);
        }
    }

    /**结束所有行为并停止决策 */
    public stopAll() {
        this._behaviorStack.clear();
        this.enable = false;
    }

    /**立即结束当前行为 */
    public stopCurAct() {
        this._behaviorStack.pop();
    }

    /**进行决策 */
    public decision() {
        const curState = this._state;
        if (this._environmentMap.has(curState)) {
            const arr = this._environmentMap.get(curState);
            if (arr.length <= 1) {//只有一个行为，直接启动
                this._behaviorStack.push(arr[0].act);
            }
            else {//根据权重随机选择一个行为
                const ws = arr.map(v => { return v.weight; });
                const index = Math.randomByWeight(ws);
                this._behaviorStack.push(arr[index].act);
            }
        }
        else {
            return;//没有注册过当前情况下该做的事情，啥也不干
        }
    }

    /**取得当前环境 */
    public getEnvironment(): T {
        return this._state;
    }


    private _environmentMap: Map<T, { act: AIAction<T>, weight: number }[]> = new Map();
    /**设置什么环境下执行哪件事情 */
    public setEnvironmentAction(e: T, act: AIAction<T>, weight: number = 1) {
        let arr: { act: AIAction<T>, weight: number }[] = null;
        if (this._environmentMap.has(e)) {
            arr = this._environmentMap.get(e);
        }
        else {
            arr = [];
            this._environmentMap.set(e, arr);
        }
        const find = arr.find(v => { return v.act == act; });
        if (find == null) {
            arr.push({ act, weight });
        }
        else {
            find.weight = weight;
        }

    }

    private readonly _environmentCheck: { check: () => boolean, environment: T }[] = [];
    /**注册，什么样的情况下算是进入什么环境 */
    public registerWhatToEnvironment(check: () => boolean, environment: T) {
        this._environmentCheck.push({ check, environment });
    }
}

