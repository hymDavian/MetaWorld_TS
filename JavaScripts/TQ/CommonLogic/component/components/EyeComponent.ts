import { ComponentBase, Entity } from "../componentBase";
import { PartitionComponent } from "./PartitionComponent";

/**视野组件 */
export class EyeComponent extends ComponentBase {

    public radius: number = 0;//半径
    public angle: number = 0;//角度
    public lookHeight: number = 0;//视线高度
    /**是否能查看到目标(隐身条件等) */
    public readonly lookCondition: ((target: Entity) => boolean)[];

    protected onRemove(): void {
        this.lookCondition.length = 0;
        this.radius = 0;
        this.angle = 0;
        this.lookHeight = 0;
    }
    protected onUpdate(dt: number): void {

    }

    onStart(radius: number, angle: number, height = 50): void {
        this.radius = radius;
        this.angle = angle;
        this.lookHeight = height;
    }

    /**获取视野范围内的目标 */
    public getViewTargets(): Entity[] {
        const partition = this.owner.getComponent(PartitionComponent);
        if (!partition) return [];//自身不在分区中
        const ret: Entity[] = [];
        const targets = partition.getNearEntityList(this.radius);//所有分区内的目标
        const selfForward = this.owner.transform.forward;
        const selfPos = this.owner.transform.location;
        for (const entity of targets) {
            const pos = entity.transform.location;
            const zDiff = Math.abs(pos.z - selfPos.z);
            if (zDiff > this.lookHeight) continue;//高度差过大
            const distance = Type.Vector.distance(selfPos, pos);
            if (distance > this.radius) continue;//距离过远
            const toDir = Type.Vector.subtract(pos, selfPos);
            const angle = Type.Vector.angle(selfForward, toDir);
            if (angle > this.angle) continue;//角度过大
            if (this.lookCondition.some((condition) => !condition(entity))) continue;//不满足查看条件
            ret.push(entity);
        }
    }
}