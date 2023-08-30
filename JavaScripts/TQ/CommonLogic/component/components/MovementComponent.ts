import { ComponentBase } from "../componentBase";

export class MovementComponent extends ComponentBase {
    /**移动完成时回调 */
    public readonly onCompelete: Type.Action = new Type.Action();
    /**移动条件 */
    public readonly moveCondition: ((nextPos: Type.Vector) => boolean)[] = [];
    /**移动限制轴,会在执行设置移动目标时限定到目标点的对应轴不进行变化 */
    public readonly moveLimitAxis: { x: boolean, y: boolean, z: boolean } = { x: false, y: false, z: false };
    /**移动容忍距离 */
    public get endureDistance() { return this._endureDistance; }
    public set endureDistance(value: number) {
        this._endureDistance = value;
        this._endureDistanceSquare = value * value;
    }
    /**移动速度 */
    public moveSpeed: number = 5;
    /**每帧坐标变化的预检查条件。与移动条件的检查时机不同
     * 移动条件只会在下达移动命令时检查一次
     * 此条件可以在每帧移动运行修改坐标前进行检查
     */
    public readonly onNextMovePosCheck: ((nextPos: Type.Vector) => boolean)[] = [];
    /**强制在地面移动(基于射线检查地面点，性能很差) */
    public inGround: boolean = false;
    /**是否正在移动 */
    public get running(): boolean {
        return this._running;
    }

    private readonly _targetPos: Type.Vector[] = [];//阶段目标路径点
    private _targetIndex: number = 0;//当前目标点索引
    // private readonly _tempMovePoint: Type.Vector = new Type.Vector();//每帧临时移动点
    private readonly _lookPoint: Type.Vector = new Type.Vector;//最终朝向点
    private _running: boolean = false;//是否正在移动
    private _endureDistance: number = 1;
    private _endureDistanceSquare: number = 1;
    private _stepTickNum: number = 0;//每阶段所需帧数
    private readonly _tickVector: Type.Vector = new Type.Vector();//每帧移动的向量

    protected onRemove(): void {
        this.onCompelete.clear();
        this.moveCondition.length = 0;
        this.onNextMovePosCheck.length = 0;
        this.moveLimitAxis.x = false;
        this.moveLimitAxis.y = false;
        this.moveLimitAxis.z = false;
        this._endureDistance = 1;
        this._endureDistanceSquare = 1;
        this.moveSpeed = 5;
        this.inGround = false;
        this._running = false;
        this._targetIndex = 0;
        this._targetPos.length = 0;
    }
    protected onUpdate(dt: number): void {
        if (!this._running) { return; }
        // const targetPos = this._targetPos[this._targetIndex];
        if (this._stepTickNum > 0) {
            this._stepTickNum--;
            const _tempMovePoint = this.owner.transform.location.add(this._tickVector);
            for (const callback of this.onNextMovePosCheck) {
                if (!callback(_tempMovePoint)) { return; }
            }
            this.owner.transform.location = _tempMovePoint;
        }
        else {
            this._targetIndex++;
            if (this._targetIndex >= this._targetPos.length) {
                this.owner.transform.location = this._targetPos[this._targetPos.length - 1];
                this.stop(true);
                return;
            }
            const nextPos = this._targetPos[this._targetIndex];
            this.owner.transform.lookAt(nextPos);
            this.copexPos(nextPos);
        }
        // const squareDistance = Type.Vector.squaredDistance(this.owner.transform.location, targetPos);
        // if (squareDistance <= this._endureDistanceSquare) {
        //     this.owner.transform.location = targetPos;
        //     this._targetIndex++;
        //     if (this._targetIndex >= this._targetPos.length) {
        //         this.stop(true);
        //         return;
        //     }
        //     this.owner.transform.lookAt(this._targetPos[this._targetIndex]);
        // }
        // if (this.moveSpeed <= 0) { return; }
        // const distance = Math.sqrt(squareDistance);
        // const lerp = Math.clamp(dt * this.moveSpeed / distance, 0, 1);

        // Type.Vector.lerp(this.owner.transform.location, targetPos, lerp, this._tempMovePoint);

    }

    onStart(speed?: number): void {
        this.moveSpeed = speed || this.moveSpeed;
    }


    /**停止移动
     * @param compelete 是否需要执行移动完成回调
     */
    public stop(compelete: boolean = false) {
        this._running = false;
        this.owner.transform.lookAt(this._lookPoint);
        this._targetPos.length = 0;
        this._targetIndex = 0;
        this._stepTickNum = 0;
        // this.owner.transform.location = this._targetPos[this._targetIndex];
        if (compelete) {
            this.onCompelete.call();
        }
    }

    /**移动条件检查 */
    private checkTargetPos(pos: Type.Vector): boolean {
        if (!pos) {
            return false;
        }
        if (!this.moveCondition.every((v) => v(pos))) {
            return false;
        }
        if (this.endureDistance > 0) {
            const distance = Type.Vector.squaredDistance(this.owner.transform.location, pos);
            if (distance <= this._endureDistanceSquare) {
                return false;
            }
        }
        return true;
    }

    /**移动到目标点*/
    public moveTo(targetPos: Type.Vector[], lookPoint?: Type.Vector) {
        if (!targetPos || targetPos.length <= 0) { return; }
        for (let i = targetPos.length - 1; i >= 0; i--) {
            const pos = targetPos[i];
            if (!this.checkTargetPos(pos)) {//前置检查
                targetPos.splice(i, 1);
                continue;
            }
            if (this.inGround) {
                const posInMeshPoint = this.getPosInMeshPoint(pos);
                if (posInMeshPoint) {
                    pos.set(posInMeshPoint);
                }
            }
            if (this.moveLimitAxis.x) {
                pos.x = this.owner.transform.location.x;
            }
            if (this.moveLimitAxis.y) {
                pos.y = this.owner.transform.location.y;
            }
            if (this.moveLimitAxis.z) {
                pos.z = this.owner.transform.location.z;
            }
        }
        if (targetPos.length <= 0) { return; }
        this._targetPos.length = 0;
        this._targetPos.push(...targetPos);
        this._lookPoint.set(lookPoint || targetPos[targetPos.length - 1]);
        this._targetIndex = 0;
        this._running = true;
        this.owner.transform.lookAt(this._targetPos[this._targetIndex]);
        this.copexPos(this._targetPos[this._targetIndex]);
    }

    private copexPos(pos: Type.Vector): void {
        Type.Vector.subtract(pos, this.owner.transform.location, this._tickVector);
        this._tickVector.normalize().multiply(this.moveSpeed);
        this._stepTickNum = Math.floor(Type.Vector.distance(pos, this.owner.transform.location) / this.moveSpeed);
        // const ret: Type.Vector[] = [];
        // const tempDistance = Type.Vector.distance(this.owner.transform.location, pos);
        // const speed = this.moveSpeed;
        // let step = speed;
        // let dis = tempDistance;
        // while (dis > step) {
        //     let beforePos = ret[ret.length - 1] || this.owner.transform.location;
        //     let tempPos = new Type.Vector();
        //     Type.Vector.lerp(beforePos, pos, step / dis, tempPos);
        //     if (this.inGround) {
        //         const posInMeshPoint = this.getPosInMeshPoint(tempPos);
        //         if (posInMeshPoint) {
        //             tempPos.set(posInMeshPoint);
        //         }
        //     }
        //     ret.push(tempPos);
        //     dis -= step;
        // }
        // ret.push(pos);
        // return ret;
    }

    private readonly tempHigerPoint: Type.Vector = new Type.Vector();
    private readonly tempLowerPoint: Type.Vector = new Type.Vector();
    private getPosInMeshPoint(pos: Type.Vector): Type.Vector {
        // const height = new Type.Vector(pos.x, pos.y, pos.z + 1000);
        this.tempHigerPoint.set(pos.x, pos.y, pos.z + 1000);
        // const rayDownPoint = new Type.Vector(pos.x, pos.y, pos.z - 100);
        this.tempLowerPoint.set(pos.x, pos.y, pos.z - 100);
        const hits = Gameplay.lineTrace(this.tempHigerPoint, this.tempLowerPoint, true, false);
        let ret: Type.Vector = new Type.Vector(pos.x, pos.y, pos.z);
        if (hits.length > 0) {
            for (const hit of hits) {
                if (hit.gameObject instanceof Gameplay.Mesh && hit.gameObject.getCollision() == Type.PropertyStatus.On) {
                    ret.z = hit.location.z;
                    break;
                }
            }
        }
        return ret;
    }
}