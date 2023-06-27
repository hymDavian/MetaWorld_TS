/* eslint-disable eqeqeq */
/* eslint-disable lines-between-class-members */

type SkillInfo = {
    /**指向这个技能常量定义的唯一ID */
    key: number,
    /**技能的cd时间 */
    cd: number,
}
/**技能状态管理器 */
class SkillController<T extends SkillInfo> {
    private readonly _skills: Map<number, T> = new Map();//所有技能信息
    private readonly _cds: Map<number, number> = new Map();//处于cd中的技能
    private readonly _castConditions: Map<number, () => boolean> = new Map();//所有技能的各自施放条件
    private readonly _castActions: Map<number, () => void> = new Map();//所有技能的各自具体执行行为
    /**通用施放条件 */
    public castCondition: (sk: T) => boolean = null;
    /**通用施放行为(用于一些外部特殊的技能实现逻辑，这里可以做最终的释放运行后的结果返回，一般而言返回true就行) */
    public castAction: (sk: T) => boolean = null;

    /**注册技能 */
    public registerSkill(skill: T) {
        this._skills.set(skill.key, skill);
        this._cds.set(skill.key, skill.cd);
    }
    /**重设技能某个属性 */
    public resetSkillInfo(key: number, k: keyof T, v: T[keyof T]) {
        const skill = this._skills.get(key);
        if (skill != null) {
            skill[k] = v;
        }
    }
    /**技能cd刷新回调 */
    public onCoolDownRefresh: (skill: number, cd: number, ratio: number) => void = null;
    /**注册特定技能施放条件 */
    public setSkillCastCondition(key: number, condition: () => boolean) {
        if (this._skills.has(key)) {
            this._castConditions.set(key, condition);
        }
    }
    /**指定技能cd到特定值 */
    public setSkillCooldown(key: number, cd: number) {
        this._cds.set(key, cd);
    }
    /**设置技能释放效果 */
    public setCastAction(key: number, action: () => void) {
        this._castActions.set(key, action);
    }
    /**所有可以释放的技能组 */
    public get canCastSkills(): T[] {
        const ret: T[] = [];
        for (const [key, skill] of this._skills) {
            if (this._cds.has(key)) {
                continue;
            }
            if (this.castCondition != null && !this.castCondition(skill)) {
                continue;
            }
            if (this._castConditions.has(key) && !this._castConditions.get(key)()) {
                continue;
            }
            ret.push(skill);
        }
        return ret;
    }
    public get allSkills(): T[] {
        return Array.from(this._skills.values());
    }


    update(dt: number) {
        this._cds.forEach((value, key) => {
            value -= dt;
            if (value <= 0) {
                this._cds.delete(key);
                if (this.onCoolDownRefresh != null) {
                    this.onCoolDownRefresh(key, 0, 0);
                }
            }
            else {
                this._cds.set(key, value);
                if (this.onCoolDownRefresh != null) {
                    this.onCoolDownRefresh(key, value, value / this._skills.get(key).cd);
                }
            }
        });
    }

    /**释放技能，并返回是否释放成功 */
    cast(key: number, force: boolean = false): boolean {
        if (!force) {
            if (this.castCondition != null && !this.castCondition(this._skills.get(key))) { return false; }
            if (this._cds.has(key)) { return false; }
            if (this._castConditions.has(key) && !this._castConditions.get(key)()) { return false; }
        }
        if (this.castAction != null) {//通用行为
            if (!this.castAction(this._skills.get(key))) {
                return false;
            }
        }
        if (this._castActions.has(key)) {//自定义行为
            this._castActions.get(key)();
        }
        this._cds.set(key, this._skills.get(key).cd);
        return true;
    }

    private onRemove() {
        this._skills.clear();
        this._cds.clear();
        this._castConditions.clear();
        this._castActions.clear();
    }
}

const skillPool: SkillController<any>[] = [];
function getSkillController<T extends SkillInfo>(): SkillController<T> {
    if (skillPool.length > 0) {
        return skillPool.pop();
    }
    return new SkillController<T>();
}
function removeSkillController(controller: SkillController<SkillInfo>) {
    controller["onRemove"]();
    skillPool.push(controller);
}

export { SkillController, getSkillController, removeSkillController }