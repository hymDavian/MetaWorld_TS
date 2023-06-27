/* eslint-disable @typescript-eslint/padding-line-between-statements */
/* eslint-disable lines-between-class-members */
/* eslint-disable @typescript-eslint/type-annotation-spacing */

type ActionCallback = (() => void)[];//回调函数
type ConditionCallback<T> = ((arg?: T) => boolean)[];//条件函数
type MoveTransform = { location: Type.Vector, lookAt?: (look: Type.Vector, lookZ: boolean) => void };
const DEBUG = false;//是否显示坐标变更辅助小球
/**移动控制器 */
class MoveController {
    private _transform: MoveTransform;//自身移动组件
    private readonly _toPoint: Type.Vector = new Type.Vector();//目标点
    private readonly _tempMovePoint: Type.Vector = new Type.Vector();//临时移动点
    private _lookAt: Type.Vector = null;//最终朝向点
    public readonly onCompelete: ActionCallback = [];//移动完成回调
    public readonly moveCondition: ConditionCallback<any> = [];//移动条件
    public readonly moveLimitAxis: { x: boolean, y: boolean, z: boolean } = { x: false, y: false, z: false };//移动限制轴
    private readonly _moveLimitRect: { x: [number, number], y: [number, number], z: [number, number] } = { x: null, y: null, z: null };//移动限制矩形
    public endureDistance: number = 5;//移动容忍距离
    private _running: boolean = false;//是否正在移动
    public get running() { return this._running; }//是否正在移动
    public getSpeed: () => number = () => 0;//获取移动速度的方式

    public readonly onNextMovePosCheck: ConditionCallback<Type.Vector> = [];//下一次移动前检查回调
    private readonly _moveHelpDisplay: Core.GameObject = null;//移动辅助显示对象

    constructor() {

        if (DEBUG) {
            this._moveHelpDisplay = Core.GameObject.spawn({ guid: "7701" });
            this._moveHelpDisplay.worldScale = new Type.Vector(0.3, 0.3, 0.3);
            (this._moveHelpDisplay as Gameplay.Mesh).setMaterial("27010");
        }
    }

    /**设置移动限定区域 */
    public setLimitRect(axis: "x" | "y" | "z", a: number, b: number) {
        this._moveLimitRect[axis] = [Math.min(a, b), Math.max(a, b)];
    }

    /**移动向目标，返回是否已经成功抵达了不需要移动 */
    public moveTo(toPoint: Type.Vector | [number, number, number], lookAt: Type.Vector = null): boolean {
        if (!toPoint) { return true; }
        for (const condition of this.moveCondition) {
            if (!condition()) {
                return true;
            }
        }
        this._lookAt = lookAt;
        let [x, y, z] = (toPoint instanceof Array) ? toPoint : [toPoint.x, toPoint.y, toPoint.z];
        //进行移动范围和轴限定设置
        if (this._moveLimitRect.x) {
            x = this.clamp(x, this._moveLimitRect.x[0], this._moveLimitRect.x[1]);
        }
        if (this._moveLimitRect.y) {
            y = this.clamp(y, this._moveLimitRect.y[0], this._moveLimitRect.y[1]);
        }
        if (this._moveLimitRect.z) {
            z = this.clamp(z, this._moveLimitRect.z[0], this._moveLimitRect.z[1]);
        }
        if (this.moveLimitAxis.x) {
            x = this._transform.location.x;
        }
        if (this.moveLimitAxis.y) {
            y = this._transform.location.y;
        }
        if (this.moveLimitAxis.z) {
            z = this._transform.location.z;
        }
        this._toPoint.set(x, y, z);
        //判断限定后的目标点与当前点距离是否小于容忍距离，如果小于则不需要移动
        if (this.endureDistance > 0) {
            const distance = this.compexDistance(this._toPoint, true);
            if (distance < this.endureDistance) {
                return true;
            }
        }
        this._transform.lookAt && this._transform.lookAt(this._toPoint, false);
        this._running = true;
        if (DEBUG) {
            this._moveHelpDisplay.worldLocation = this._toPoint;
            this._moveHelpDisplay.setVisibility(Type.PropertyStatus.On);
        }
        return false;
    }
    /**停止移动
     * @param compelete 是否需要执行移动完毕回调
     */
    public stopMove(compelete: boolean = true) {
        if (compelete) {
            for (const callback of this.onCompelete) {
                callback();
            }
            this._transform.lookAt && this._transform.lookAt(this._lookAt || this._toPoint, false);
        }
        if (DEBUG) {
            this._moveHelpDisplay.setVisibility(Type.PropertyStatus.Off);
        }
        this._running = false;
    }
    /**驱动移动更新 */
    update(dt: number) {
        if (!this._running) return;
        let distance = this.compexDistance(this._toPoint, true);
        if (distance <= this.endureDistance) {
            this._transform.location = this._toPoint;
            this.stopMove(true);
            return;
        }

        const speed = this.getSpeed();
        if (speed <= 0) return;
        // const { x, y, z } = this._transform.location;
        // const { x: x1, y: y1, z: z1 } = this._toPoint;
        // const [x2, y2, z2] = this._lookAt ? [this._lookAt.x, this._lookAt.y, this._lookAt.z] : [x1, y1, z1];
        // const [dx, dy, dz] = [x2 - x, y2 - y, z2 - z];
        // const distance2 = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // const [vx, vy, vz] = [dx / distance2, dy / distance2, dz / distance2];
        // const [vx1, vy1, vz1] = [vx * speed * dt, vy * speed * dt, vz * speed * dt];
        // const [x3, y3, z3] = [x + vx1, y + vy1, z + vz1];
        // this._tempMovePoint.set(x3, y3, z3);
        distance = Math.sqrt(distance);
        const lerp = this.clamp(speed * dt, 0, distance) / distance;
        Type.Vector.lerp(this._transform.location, this._toPoint, lerp, this._tempMovePoint);
        for (const callback of this.onNextMovePosCheck) {
            if (!callback(this._tempMovePoint)) {
                callback(this._tempMovePoint)
                return;
            }
        }
        this._transform.location = this._tempMovePoint;
    }

    private onRemove() {
        this.stopMove(false);
        this.onCompelete.length = 0;
        this._transform = null;
        this._toPoint.set(0, 0, 0);
        this._lookAt = null;
        this.moveCondition.length = 0;
        this.onNextMovePosCheck.length = 0;
        this.getSpeed = null;
        this.moveLimitAxis.x = false;
        this.moveLimitAxis.y = false;
        this.moveLimitAxis.z = false;
        this._moveLimitRect.x = null;
        this._moveLimitRect.y = null;
        this._moveLimitRect.z = null;
        this.endureDistance = 0.1;
    }
    private compexDistance(point: Type.Vector, squared: boolean = false): number {
        if (!this._transform) return 999;
        return squared ? Type.Vector.squaredDistance(this._transform.location, point) : Type.Vector.distance(this._transform.location, point);

        // const { x: x1, y: y1, z: z1 } = this._transform.location;
        // const [x2, y2, z2] = (point instanceof Array) ? point : [point.x, point.y, point.z];
        // const compexNums: number[] = [];
        // compexNums.push(x1 - x2);
        // compexNums.push(y1 - y2);
        // compexNums.push(z1 - z2);
        // const squaredNums = compexNums.map((num) => num * num);
        // if (squared) {
        //     return squaredNums.reduce((a, b) => a + b, 0);
        // }
        // return Math.sqrt(squaredNums.reduce((a, b) => a + b, 0));
    }
    private clamp(num: number, min: number, max: number): number {
        return Math.min(Math.max(num, min), max);
    }
}

const aIMovePool: MoveController[] = [];

function getAIMove(transform: MoveTransform): MoveController {
    let move: MoveController = null;
    if (aIMovePool.length > 0) {
        move = aIMovePool.pop();
    }
    else {
        move = new MoveController();
    }
    move["_transform"] = transform;
    return move;
}
function removeAIMove(move: MoveController) {
    move["onRemove"]();
    aIMovePool.push(move);
}

export { MoveController, getAIMove, removeAIMove }