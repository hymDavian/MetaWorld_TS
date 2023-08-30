import { ComponentBase, Entity } from "../componentBase";


export class SelectComponent extends ComponentBase {
    /**选择条件 */
    public readonly chooseCondition: ((target: Entity) => boolean)[] = [];
    /**排序方式 */
    public sortAction: (a: Entity, b: Entity) => number = null;
    /**获取所有可选取目标的方式 */
    public getAllTargets: () => Entity[] = null;
    /**当前选取的所有符合条件的目标 */
    public get currentTarget(): Entity {
        if (this._lockTarget.lock) {
            return this._lockTarget.target;
        }
        if (this._cycle <= 0) {
            this.doGetChooseList();
        }
        return this._chooseList.length > 0 ? this._chooseList[0] : null;
    }

    private _lockTarget: { target: Entity, lock: boolean } = { target: null, lock: false };
    private _cycle: number = 0;//选取周期 小于0时只在调用currentTarget时选取
    private _timer: number = 0;//计时器
    private readonly _targets: Entity[] = [];
    private readonly _chooseList: Entity[] = [];

    onStart(cycle: number): void {
        this._cycle = cycle;
    }

    protected onRemove(): void {
        this._targets.length = 0;
        this._chooseList.length = 0;
        this.chooseCondition.length = 0;
        this.sortAction = null;
        this.getAllTargets = null;
        this._cycle = 0;
        this._timer = 0;
        this._lockTarget.lock = false;
        this._lockTarget.target = null;
    }
    protected onUpdate(dt: number): void {
        if (this._cycle > 0) {
            this._timer += dt;
            if (this._timer < this._cycle) {
                return;
            }
            this._timer -= this._cycle;
            this.doGetChooseList();
        }
    }

    private doGetChooseList() {
        if (!this.getAllTargets) { return; }
        this._targets.length = 0;
        this._chooseList.length = 0;
        const findArr = this.getAllTargets();
        findArr?.forEach((value, index) => {
            this._targets.push(value);
        });
        if (this._targets.length === 0) {//没有任何可选对象
            return;
        }
        this._targets.forEach((value, index) => {
            if (this.chooseCondition.every((value1, index1) => { return value1(value); })) {
                this._chooseList.push(value);
            }
        });
        if (this.sortAction) {
            this._chooseList.sort(this.sortAction);
        }
    }

    /**强制锁定目标 */
    public lockTarget(target: Entity) {
        this._lockTarget.target = target;
        this._lockTarget.lock = true;
    }
    /**解除锁定目标 */
    public unlockTarget() {
        this._lockTarget.lock = false;
        this._lockTarget.target = null;
    }
}