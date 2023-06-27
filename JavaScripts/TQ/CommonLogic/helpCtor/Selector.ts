/* eslint-disable lines-between-class-members */


/**选取控制器 */
class SelectController<TargetType, ExtendsType> {
    private readonly _targets: TargetType[] = [];//目标列表
    private readonly _ex: ExtendsType[] = [];//额外参数
    private readonly _chooseList: [TargetType, ExtendsType][] = [];//已选取列表
    private _timer: number = 0;//计时器

    /**自定选取条件 */
    public readonly chooseCondition: ((target: TargetType, ex?: ExtendsType) => boolean)[] = [];//选择条件
    /**排序条件 */
    public sortCondition: (a: [TargetType, ExtendsType], b: [TargetType, ExtendsType]) => number = null;//排序条件

    /**注册 获取所有可选取目标的方式
     * 如果cycle>0则只会进行周期性的获取
     * 如果cycle<=0则只会在每次调用currentTarget时获取
     */
    public readonly howToGetAllTargets: { get: () => [TargetType, ExtendsType?][], cycle: number } = { get: null, cycle: 0 };
    /**当前选取的目标 */
    public get currentTarget(): TargetType {
        if (this.howToGetAllTargets.cycle <= 0) {
            this.doGetChooseList();
        }
        return this._chooseList.length > 0 ? this._chooseList[0][0] : null;
    }
    /**获取特定目标组 */
    public getTargetByCondition(condition: (target: TargetType, ex?: ExtendsType) => boolean): TargetType[] {
        if (this.howToGetAllTargets.get == null) { return []; }
        const findArr = this.howToGetAllTargets.get();
        const ret = []
        findArr.forEach((value, index) => {
            if (condition(value[0], value[1])) {
                ret.push(value[0]);
            }
        });
        return ret;
    }

    public update(dt: number) {
        if (this.howToGetAllTargets.get == null) { return; }
        if (this.howToGetAllTargets.cycle > 0) {
            this._timer += dt;
            if (this._timer < this.howToGetAllTargets.cycle) {
                return;
            }
            this._timer = 0;
            this.doGetChooseList();
        }
    }

    private doGetChooseList() {
        this._targets.length = 0;
        this._chooseList.length = 0;
        const findArr = this.howToGetAllTargets.get();
        findArr?.forEach((value, index) => {
            this._targets[index] = value[0];
            this._ex[index] = value[1];
        });
        if (this._targets.length === 0) {//没有任何可选对象
            return;
        }
        for (let i = 0; i < this._targets.length; i++) {
            const target = this._targets[i];
            if (this.chooseCondition.length == 0) {//如果没有任何条件
                this._chooseList.push([target, this._ex[i]]);
            }
            else if (this.chooseCondition.every((v) => v(target, this._ex[i]))) {//如果满足所有条件
                this._chooseList.push([target, this._ex[i]]);
            }
        }
        if (this.sortCondition != null) {
            this._chooseList.sort(this.sortCondition);
        }
    }

    private onRemove() {
        this._targets.length = 0;
        this._ex.length = 0;
        this._chooseList.length = 0;
        this._timer = 0;
        this.chooseCondition.length = 0;
        this.sortCondition = null;
        this.howToGetAllTargets.get = null;
        this.howToGetAllTargets.cycle = 0;
    }
}

const selecterPool: SelectController<any, any>[] = [];

function getSelector<TargetType, ExtendsType>(): SelectController<TargetType, ExtendsType> {
    let ret = selecterPool.pop();
    if (ret == null) {
        ret = new SelectController<TargetType, ExtendsType>();
    }
    return ret;
}
function removeSelector(selecter: SelectController<any, any>) {
    selecter["onRemove"]();
    selecterPool.push(selecter);
}
export { SelectController, getSelector, removeSelector }