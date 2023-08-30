import { ComponentBase, Entity } from "../../componentBase";
import { SkillBase } from "./SkillBase";

export class SkillComponent extends ComponentBase {
    private readonly _skills: Map<number, SkillBase> = new Map<number, SkillBase>();//所有技能对象

    onStart(...skids: number[]): void {
        this._skills.clear();
        for (let skid of skids) {
            this._skills.set(skid, SkillBase.getSkill(skid, this.owner));
        }
    }

    /**学习技能 */
    public learnSkill(skillID: number) {
        if (!this._skills.has(skillID)) {
            this._skills.set(skillID, SkillBase.getSkill(skillID, this.owner));
        }
    }

    /**遗忘技能 */
    public remberseSkill(skillID: number) {
        if (this._skills.has(skillID)) {
            this._skills.get(skillID).destory();
            this._skills.delete(skillID);
        }
    }

    /**对单位释放技能 */
    public castSkillUnit(skillID: number, ...targets: Entity[]): boolean {
        if (this._skills.has(skillID)) {
            return this._skills.get(skillID).Cast(targets, null);
        }
        return false;
    }
    /**对点释放技能 */
    public castSkillPoint(skillID: number, point: Type.Vector): boolean {
        if (this._skills.has(skillID)) {
            return this._skills.get(skillID).Cast(null, point);
        }
        return false;
    }

    /**设置技能cd */
    public setSkillCD(skillID: number, cd: number) {
        if (this._skills.has(skillID)) {
            this._skills.get(skillID).setCd(cd);
        }
    }
    /**获取技能cd */
    public getSkillCD(skillID: number): number {
        if (this._skills.has(skillID)) {
            return this._skills.get(skillID).cd;
        }
        return 0;
    }

    /**获取技能自定义数据 */
    public getSkillCustomData(skillID: number, key: string): any {
        if (this._skills.has(skillID)) {
            return this._skills.get(skillID).getCustomData(key);
        }
        return null;
    }
    /**设置技能自定义数据 */
    public setSkillCustomData(skillID: number, key: string, value: any) {
        if (this._skills.has(skillID)) {
            this._skills.get(skillID).setCustomData(key, value);
        }
    }
    /**获取技能对象 */
    public getSkill(skillID: number): SkillBase {
        if (this._skills.has(skillID)) {
            return this._skills.get(skillID);
        }
        return null;
    }

    /**准备完毕的技能 */
    public readySkills(): number[] {
        let result: number[] = [];
        this._skills.forEach((value, key) => {
            if (value.cd <= 0) {
                result.push(key);
            }
        });
        return result;
    }

    protected onRemove(): void {
        this._skills.forEach((skill) => {
            skill.destory();
        });
        this._skills.clear();
    }
    protected onUpdate(dt: number): void {
        this._skills.forEach((skill) => {
            skill.onUpdate(dt);
        });
    }

}