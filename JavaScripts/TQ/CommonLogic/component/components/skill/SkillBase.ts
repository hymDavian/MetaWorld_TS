import { Entity } from "../../componentBase";

export class SkillBase {
    private static skillPool: Map<number, SkillBase[]> = new Map<number, SkillBase[]>();
    public static getSkill(skillID: number, owner: Entity): SkillBase {
        let skillArr = this.skillPool.get(skillID);
        if (!skillArr) {
            skillArr = [];
            this.skillPool.set(skillID, skillArr);
        }
        let ret: SkillBase = null;
        if (skillArr.length > 0) {
            ret = skillArr.pop();
        }
        else {
            ret = new SkillBase(skillID);
        }
        ret.onInit();
        ret.owner = owner;
        ret.onLearn.forEach((callback) => {
            callback(owner);
        });
        return ret;
    }
    private static returnSkill(skill: SkillBase) {
        let skillArr = this.skillPool.get(skill.skillID);
        if (!skillArr) {
            skillArr = [];
            this.skillPool.set(skill.skillID, skillArr);
        }
        skillArr.push(skill);
    }

    public owner: Entity = null;
    /**技能ID */
    public readonly skillID: number = 0;
    /**配置信息 */
    public readonly skillConfig: ISkillConfig = null;
    /**施法条件 */
    public readonly castConditions: ((target: Entity) => boolean)[] = [];
    /**施法行为 */
    public readonly onCastAction: ((caster: Entity, target: Entity, point: Type.Vector) => void)[] = [];
    /**持续行为 */
    public readonly onDotAction: ((time: number) => void)[] = [];
    /**技能学习行为 */
    public readonly onLearn: ((stu: Entity) => void)[] = [];
    /**技能遗忘行为 */
    public readonly onRemberse: ((forsaken: Entity) => void)[] = [];
    /**冷却刷新回调 */
    public readonly onCooldownRefresh: ((time: number, ratio: number) => void)[] = [];

    private readonly _customData: Map<string, any> = new Map();//自定义数据
    private _cd: number = 0;

    private constructor(skillID: number) {
        this.skillID = skillID;
        // this.skillConfig = Gameconfig.skill.get(this.skillID); //todo 技能表
        this.onInit();
    }

    private onInit() {
        //todo 配置施法条件
        //todo 配置施法行为
        //todo 配置持续行为
        //todo 配置技能学习行为
        //todo 配置技能遗忘行为
    }
    public onUpdate(time: number) {
        if (this._cd > 0) {
            this._cd -= time;
            if (this._cd < 0) {
                this._cd = 0;
            }
            this.onCooldownRefresh.forEach((callback) => {
                callback(this._cd, this._cd / this.skillConfig.CD);
            });
        }
        else {
            this.onDotAction.forEach((callback) => {
                this.checkCondition() && callback(time);
            });
        }
    }


    private onDestory() {
        SkillBase.returnSkill(this);
        this._customData.clear();
        this.castConditions.length = 0;
        this.onCastAction.length = 0;
        this.onCooldownRefresh.length = 0;
        this.onDotAction.length = 0;
        this.onLearn.length = 0;
        this.onRemberse.length = 0;
        this.owner = null;
    }
    public destory() {
        this.onRemberse.forEach((callback) => {
            callback(this.owner);
        });
        this.onDestory();
    }

    public getCustomData(key: string): any {
        return this._customData.get(key);
    }

    public setCustomData(key: string, value: any) {
        this._customData.set(key, value);
    }

    public get cd(): number {
        return this._cd;
    }
    public setCd(cd: number) {
        this._cd = cd;
    }

    private checkCondition(entity: Entity = null) {
        if (this._cd > 0) {
            return false;
        }
        let canCast = true;
        this.castConditions.forEach((callback) => {
            if (!callback(entity)) {
                canCast = false;
            }
        });
        return canCast;
    }
    public Cast(targets: Entity[], point: Type.Vector): boolean {
        // if (!this.checkCondition()) {
        //     return false;
        // }
        let canCast = true;
        this.castConditions.forEach((callback) => {
            if (!callback(targets ? targets[0] : null)) {
                canCast = false;
            }
        });
        if (!canCast) {
            return false;
        }

        if (targets && targets.length > 0) {
            for (const target of targets) {
                this.onCastAction.forEach((callback) => {
                    callback(this.owner, target, point);
                });
            }
        }
        else if (point != null) {
            this.onCastAction.forEach((callback) => {
                callback(this.owner, targets ? targets[0] : null, point);
            });
        }
        this._cd = this.skillConfig.CD;
        return true;
    }
}

interface ISkillConfig {
    ID: number;
    CD: number;
}