export namespace AIController {

    export enum EAIBehaviorState {
        /**当前动作需要继续执行 */
        Running,
        /**当前动作完毕，可以继续执行下一个动作 */
        Compeleted,
        /**当前动作被打断，需要清空行为栈 */
        Break
    }
    export abstract class AIBehavior<T, bk> {
        protected _state: EAIBehaviorState = EAIBehaviorState.Running;
        public get state(): EAIBehaviorState { return this._state; }

        public readonly agent: Controller<T, bk>;
        constructor(agent: Controller<T, bk>) {
            this.agent = agent;
        }
        /**动作重置/初始化 */
        public abstract reset(): void;

        protected abstract _update(dt: number): EAIBehaviorState;
        /**行为更新 */
        public update(dt: number): EAIBehaviorState {
            this._state = this._update(dt);
            return this._state;
        }
        public break() {
            this._state = EAIBehaviorState.Break;
        }
    }

    type InferClsPropertyType<Cls, KeyName extends keyof Cls> = Cls extends { [K in KeyName]: infer V } ? V : never;
    class BlackBoard<T extends { [k in string]: any }> {


        private readonly _blackboard: Map<string, any> = new Map();

        public getValue<KeyName extends keyof T>(key: KeyName): InferClsPropertyType<T, KeyName> {
            return this._blackboard.get(key as string);
        }

        public setValue<KeyName extends keyof T>(key: KeyName, value: InferClsPropertyType<T, KeyName>) {
            this._blackboard.set(key as string, value);
        }

        public clear() {
            this._blackboard.clear();
        }
    }


    export class Controller<T, bk> {
        private readonly _behaviorStack: TStack<AIBehavior<T, bk>>;//行为栈
        private readonly _environmentCheck: { check: () => boolean, env: number }[] = [];//环境检查
        private readonly _environmentAction: Map<number, { env: number, actionarray: mw.TypeName<AIBehavior<T, bk>>[], weight: number }[]> = new Map();//环境行为
        private _environment: number = 0;//当前决策环境
        private _decTimer: number = 0;//决策计时器

        public onenvchange: (env: number) => void = null;
        /**是否启用 */
        public enable: boolean = false;
        /**操作的模型/逻辑对象 */
        public readonly model: T;
        /**敏感度 */
        public sensitivity: number = 0.5;
        /**黑板 */
        public readonly blackboard: BlackBoard<bk> = new BlackBoard<bk>();
        /**当前环境 */
        public get environment(): number { return this._environment; }
        /**当前行为 */
        public get curBehavior(): AIBehavior<T, bk> { return this._behaviorStack.top; }
        constructor(model: T, sensitivity: number = 0.5) {
            this.sensitivity = sensitivity;
            this.model = model;
            this._behaviorStack = new TStack<AIBehavior<T, bk>>();
        }



        /**注册环境判断,不可小于0，负数环境保留含义为任意环境 */
        public registerEnvironmentCheck(env: number, check: () => boolean) {
            let findindex = this._environmentCheck.findIndex((v) => { return v.env == env; });
            if (findindex >= 0) {
                this._environmentCheck[findindex] = { check, env };
            }
            else {
                this._environmentCheck.push({ check, env });
                this._environmentCheck.sort((a, b) => { return a.env - b.env });
            }

        }

        /**添加在指定环境下的行为
         * @param env 环境
         * @param AIBehaviors 行为组
         * @param weight 选取权重
         */
        public addEnvironmrntAction(env: number, AIBehaviors: mw.TypeName<AIBehavior<T, bk>>[], weight: number) {
            if (AIBehaviors == null) { return; }
            if (!this._environmentAction.has(env)) {
                this._environmentAction.set(env, []);
            }
            AIBehaviors = AIBehaviors.filter(v => { return v != null; });
            this._environmentAction.get(env).push({ env: env, actionarray: AIBehaviors, weight });
        }

        //检查当前所处环境
        private _checkEnvironment(): boolean {
            let isChange: boolean = false;
            for (let i = 0; i < this._environmentCheck.length; i++) {
                if (this._environmentCheck[i].check()) {
                    if (this._environment != this._environmentCheck[i].env) {
                        isChange = true;
                        this._environment = this._environmentCheck[i].env;
                    }
                    break;
                }
            }
            if (isChange) {
                this.onenvchange && this.onenvchange(this._environment);
            }
            return isChange;
        }

        //决策
        private _decide() {
            this._behaviorStack.clear();
            if (this._environmentAction.has(this._environment)) {
                let actions = this._environmentAction.get(this._environment);
                let totalWeight = 0;
                for (let i = 0; i < actions.length; i++) {
                    totalWeight += actions[i].weight;
                }
                let random = Math.random() * totalWeight;
                let tempWeight = 0;
                for (let i = 0; i < actions.length; i++) {
                    tempWeight += actions[i].weight;
                    if (random <= tempWeight) {
                        // this._behaviorStack.push();
                        for (let j = actions[i].actionarray.length - 1; j >= 0; j--) {
                            const cls = actions[i].actionarray[j];
                            let behavior = new cls(this);
                            behavior.reset();
                            this._behaviorStack.push(behavior);
                        }
                        break;
                    }
                }
            }
        }

        public stop() {
            this._behaviorStack.clear();
        }

        public reset(env: number) {
            this._behaviorStack.clear();
            this.blackboard.clear();
            this._decTimer = 0;
            this._environment = env;
        }

        public update(dt: number) {
            if (!this.enable) { return; }
            if (this._decTimer > 0) {
                this._decTimer -= dt;
            }
            if (this._decTimer <= 0) {
                let ischange = this._checkEnvironment();
                if (this._behaviorStack.isEmpty || ischange) {//环境改变了
                    this._decide();//下一阶段行为重新决策
                }
                this._decTimer = this.sensitivity;//环境检查间隔
            }
            if (!this._behaviorStack.isEmpty) {
                let behavior = this._behaviorStack.top;

                const state = behavior.update(dt);
                if (state == EAIBehaviorState.Compeleted) {
                    this._behaviorStack.pop();
                }
                else if (state == EAIBehaviorState.Break) {
                    this._behaviorStack.clear();
                }
            }
        }

    }


    export class TStack<T> {
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

        public get isEmpty(): boolean {
            return this._data.length == 0;
        }

        public get toArray(): T[] {
            return this._data.slice();
        }

        toString() {
            return `stack[${this._data.map(v => { return v.toString() }).join(',')}]`
        }
    }
}