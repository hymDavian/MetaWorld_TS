import './cannon';
/**仅用于客户端的物理模拟 */
export namespace CANNONHelp {
    /**目前支持的形状枚举 */
    export enum EGeometry {
        /**矩形 */
        Box,
        /**球形 */
        Sphere,
        /**圆柱 */
        Cylinder,
        /**圆锥 */
        Cone,
        /**四棱锥 */
        Pyramids
    }
    /**根据MW游戏对象构建对应物理模型所需要的信息 */
    export interface IBuildPhysicsInfo {
        /**MW编辑器的游戏物体 */
        mw: Core.GameObject,
        /**对应需要契合的物理集合形状 */
        shape: EGeometry,
        /**大小缩放值 */
        // size: Type.Vector
    }

    let _CWorld: CANNON.World = null;
    const _idPair: Map<number, GameObject> = new Map();
    const _guidPair: Map<string, GameObject> = new Map();
    const _cnstraints: Map<number, [CANNON.Constraint, number, number]> = new Map();
    const _worldConfig = {
        /**重力参数 */
        gravity: [0, 0, -1000],
        /**相位实现，理解为多物体在物理空间内进行碰撞检查时的检查对筛选方式 */
        broadphase: null,
        /**约束方程解算器 迭代次数 ， 容忍偏差值 */
        solver: { iterations: 7, tolerance: 0.1 },
        /**材质碰撞属性 硬度 柔韧度 */
        contact: [1e11, 2],
        /**是否使用粗略计算的四元数，如果为false,会更精确，但是速度较慢 */
        quatNormalizeFast: true,
        /**四元数归一化频率，值越大计算效果越好 */
        quatNormalizeSkip: 1,
        /**默认质量大小，影响碰撞惯性和运动计算，一般设置在0.1-10符合正常效果 */
        defaultMass: 50,
        /**默认材质属性 摩擦，恢复系数。
         * 这两个值如果不是负数，将替代默认碰撞属性
         */
        defaultMat: { friction: 0.9, restitution: 0.1 },
        /**物理刷新频率 */
        stepFrequency: 60,
        /**每帧物理计算调用最大数量，用于大量物理计算分段处理 */
        maxSubSteps: 20,

        /**对于短时间内没收到其他物体影响的物理对象，是否会剔除这部分物体的物理计算 */
        allowSleep: true,
        /**物体速度向量的摸小于该值时会被视为休眠状态 */
        sleepSpeedLimit: 10,
        /**如果物体在这个时间内一直处于休眠标记中，将会正式进入休眠状态 */
        sleepTimeLimit: 3,
    }


    /**带有单端物理特性的游戏物体 */
    export class GameObject {
        public readonly mwObject: Core.GameObject;
        private _body: CANNON.Body = null;
        public get cannonObject(): CANNON.Body { return this._body; }
        private readonly _allMwObject: Core.GameObject[] = [];//物体组
        private readonly _allGeometry: EGeometry[] = [];//形状组
        private readonly _offset: CANNON.Vec3[] = [];//偏移量信息
        private readonly _opition: CANNON.IBodyOptions = null;//碰撞设定
        constructor(mw: [Core.GameObject, EGeometry, CANNON.Vec3][], cannon: CANNON.Body, opition: CANNON.IBodyOptions) {
            this.mwObject = mw[0][0];
            mw.forEach(val => {
                this._allMwObject.push(val[0]);
                this._allGeometry.push(val[1]);
                this._offset.push(val[2])
            })
            this._body = cannon;
            this.position = this.mwObject.worldLocation;
            this._opition = opition;

            _idPair.set(cannon.id, this);
            _guidPair.set(this.mwObject.guid, this);
        }

        public get position(): Type.Vector {
            return this.mwObject.worldLocation;
        }
        public set position(pos: Type.Vector) {
            const [mwx, mwy, mwz] = [pos.x, pos.y, pos.z];
            this.cannonObject.position.set(mwx, mwy, mwz);
            this.cannonObject.wakeUp();
        }

        /**获取旋转角值,基于这个获取值去设置内部成员属性不会起作用 */
        public get rotation(): Type.Rotation {
            return this.mwObject.worldRotation;
        }
        /**设置旋转 */
        public set rotation(rot: Type.Rotation) {
            this.cannonObject.quaternion.setFromEuler(rot.x, rot.y, rot.z);//   .set(x, y, z, w);
            this.cannonObject.wakeUp();
        }

        public get scale(): Type.Vector {
            return this.mwObject.worldScale;
        }

        public set scale(s: Type.Vector) {
            const currentScale = this.mwObject.worldScale.clone();
            //太近的差距没必要修改
            if (nearNumber(currentScale.x, s.x) && nearNumber(currentScale.y, s.y) && nearNumber(currentScale.z, s.z)) {
                return;
            }
            this.mwObject.worldScale = s;//修改引擎内的显示物体大小
            const [changeX, changeY, changeZ] = [s.x / currentScale.x, s.y / currentScale.y, s.z / currentScale.z];//每个轴更改的变化量
            const newCannonObject = new CANNON.Body({ mass: this._opition.mass, material: this._opition.material });//新的钢体
            newCannonObject.allowSleep = true;
            newCannonObject.sleepSpeedLimit = _worldConfig.sleepSpeedLimit;
            newCannonObject.sleepTimeLimit = _worldConfig.sleepTimeLimit;
            //修改物理空间内的大小
            for (let i = 0; i < this._allGeometry.length; i++) {
                const eshape = this._allGeometry[i];

                const size = this._allMwObject[i].worldScale;
                let shapeObj: CANNON.Shape = getShapeByMWObject(eshape, size.multiply(100));
                // switch (eshape) {
                //     case EGeometry.Box:
                //         shapeObj = new CANNON.Box(new CANNON.Vec3((size.x * 100) / 2, (size.y * 100) / 2, (size.z * 100) / 2));
                //         break;
                //     case EGeometry.Sphere:
                //         shapeObj = new CANNON.Sphere((size.x * 100) / 2);
                //         break;
                // }
                this._offset[i].x *= changeX;
                this._offset[i].y *= changeY;
                this._offset[i].z *= changeZ;

                newCannonObject.addShape(shapeObj, this._offset[i]);
            }

            newCannonObject.position = this.cannonObject.position;
            newCannonObject.quaternion = this.cannonObject.quaternion;

            _CWorld.removeBody(this.cannonObject);
            _CWorld.addBody(newCannonObject);
            this._body = newCannonObject;
            this.sync();

        }



        /**围绕指定轴旋转目标角度 */
        // public rotateTo(axis: Type.Vector, angle: number) {
        //     this.mwObject.transform.rotate(axis, angle);
        //     const mwQua = this.mwObject.worldRotation.toQuaternion()
        //     this.cannonObject.quaternion.set(mwQua.x, mwQua.y, mwQua.z, mwQua.w);
        //     this.sync();
        // }

        /**根据自身物理空间对应的物理信息体，同步自身实际物体的绘制 */
        public sync() {
            const pos = this.cannonObject.position;
            const qua = this.cannonObject.quaternion;
            const rot = new Type.Quaternion(qua.x, qua.y, qua.z, qua.w);
            this.mwObject.worldLocation = ConvertMWV3(pos);
            this.mwObject.worldRotation = rot.toRotation();
        }

        /**基于当前位置，增量设置位置 */
        public addPosition(x: number = 0, y: number = 0, z: number = 0) {
            const addX = this.cannonObject.position.x + x;
            const addY = this.cannonObject.position.y + y;
            const addZ = this.cannonObject.position.z + z;
            this.cannonObject.position.set(addX, addY, addZ);
            this.sync();
        }

        /**设置向某个方向的位置移动速度，会受到物理属性影响衰减 */
        public movePosition(direction: Type.Vector, speed: number) {
            this.cannonObject.velocity.set(
                direction.x * speed,
                direction.y * speed,
                direction.z * speed
            );
        }

        /**设置指定向量的角旋转速度，会受到物理属性影响衰减 */
        public moveAngle(eulerAngle: Type.Vector) {
            this.cannonObject.angularVelocity.set(
                eulerAngle.x,
                eulerAngle.y,
                eulerAngle.z
            );
        }


    }

    function nearNumber(n1: number, n2: number, check: number = 0.01): boolean {
        return Math.abs(n1 - n2) <= check
    }

    /**物理空间初始化
     * 
     */
    export function CANNANInit() {
        _CWorld = new CANNON.World();
        _CWorld.quatNormalizeSkip = _worldConfig.quatNormalizeSkip;
        _CWorld.quatNormalizeFast = _worldConfig.quatNormalizeFast;
        _CWorld.gravity.set(_worldConfig.gravity[0], _worldConfig.gravity[1], _worldConfig.gravity[2]);
        _CWorld.broadphase = new CANNON.NaiveBroadphase();
        const solver = new CANNON.GSSolver();
        solver.iterations = _worldConfig.solver.iterations;
        solver.tolerance = _worldConfig.solver.tolerance;
        _CWorld.solver = new CANNON.SplitSolver(solver);
        _CWorld.defaultContactMaterial.contactEquationStiffness = _worldConfig.contact[0];
        _CWorld.defaultContactMaterial.contactEquationRelaxation = _worldConfig.contact[1];
        _CWorld.allowSleep = _worldConfig.allowSleep;
        const defaultWorldMaterial = new CANNON.ContactMaterial(new CANNON.Material(_worldConfig.defaultMat), new CANNON.Material(_worldConfig.defaultMat),)
        _CWorld.addContactMaterial(defaultWorldMaterial)
    }

    /**创建一个物理平面
     * 
     * @param forward 平面朝向
     * @param position 平面位置
     */
    export function createGround(forward: [number, number, number], position: [number, number, number]) {
        const dir = new CANNON.Vec3(...forward).normalize();
        const groundShape = new CANNON.Plane(dir);
        const groundBody = new CANNON.Body({ mass: 0, material: new CANNON.Material(_worldConfig.defaultMat) });
        groundBody.position.set(...position);
        groundBody.addShape(groundShape);
        _CWorld.addBody(groundBody);
    }

    let lastCallTime = 0;
    /**物理驱动 */
    export function doUpdate() {
        const timeStep = 1 / _worldConfig.stepFrequency;
        const now = Date.now() / 1000;//当前时间戳 类似performance.now(),不过performance会根据浏览器的不同获取的精度也不一致
        if (!lastCallTime) {//上一次驱动时间未保存，无法根据经过的时间做运算，这里跳过
            _CWorld.step(timeStep);
            lastCallTime = now;
            return;
        }
        const timeSinceLastCall = now - lastCallTime;//当前驱动时与上一次驱动经过的时间
        _CWorld.step(timeStep, timeSinceLastCall, _worldConfig.maxSubSteps);
        for (const [id, obj] of _idPair) {
            obj.sync();
        }

        lastCallTime = now;
    }

    /**查找物理空间游戏物体 */
    export function findGameObject(key: number | string): GameObject {
        if (typeof key === "string") {//字符串key
            return _guidPair.get(key);
        }
        else {
            return _idPair.get(key);
        }
    }

    /**设置混合物带有物体特性,会以第一个物体作为此混合对象的根节点
     * @param mwObjs 混合物体集组 {mw游戏对象，对应的形状枚举，大小(scale*100),物理碰撞中心点偏移(只第一个有效)   }
     * @param mass 质量
     * @param mat 材质信息
     */
    export function setMixture(mwObjs: IBuildPhysicsInfo[], mass?: number, mat?: CANNON.IMaterialOptions): GameObject {
        if (mwObjs.length <= 0) { return null; }
        const guid = mwObjs[0].mw.guid;
        if (_guidPair.has(guid)) {
            return _guidPair.get(guid);
        }

        const opition = {
            mass: mass ? mass : _worldConfig.defaultMass,
            material: mat ? new CANNON.Material(mat) : new CANNON.Material(_worldConfig.defaultMat)
        }

        const body = new CANNON.Body(opition);
        body.allowSleep = true;
        body.sleepSpeedLimit = _worldConfig.sleepSpeedLimit;
        body.sleepTimeLimit = _worldConfig.sleepTimeLimit;

        const allObj: [Core.GameObject, EGeometry, CANNON.Vec3][] = [];
        const { mw: firstobj, shape: firstgeometry } = mwObjs.splice(0, 1)[0];
        const firstsize = firstobj.getBoundingBoxSize(true);
        const rootShape = getShapeByMWObject(firstgeometry, firstsize);
        const rootWorldPos = ConvertCannonV3(firstobj.worldLocation);

        const rootOffset = new CANNON.Vec3(0, 0, firstsize.z / 2);
        allObj.push([firstobj, firstgeometry, rootOffset]);
        body.addShape(rootShape, rootOffset);//实际碰撞需要向上偏移高度的一半值
        for (const { mw, shape } of mwObjs) {
            const worldPos = ConvertCannonV3(mw.worldLocation);
            const subVec = worldPos.vsub(rootWorldPos);//根节点到此子物体的物理空间向量
            //再加上自身根节点偏移值向量
            subVec.x += rootOffset.x;
            subVec.y += rootOffset.y;
            subVec.z += rootOffset.z;
            body.addShape(getShapeByMWObject(shape, mw.getBoundingBoxSize(true)), subVec);
            allObj.push([mw, shape, subVec]);
        }
        _CWorld.addBody(body);
        return new GameObject(allObj, body, opition);
    }

    /**根据形状获取物体的网格信息对象 */
    function getShapeByMWObject(geometry: EGeometry, size: Type.Vector): CANNON.Shape {
        switch (geometry) {
            case EGeometry.Box://物理空间的Box形状只需要一半的信息
                return new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
            case EGeometry.Sphere:
                return new CANNON.Sphere(size.x / 2);
            case EGeometry.Cylinder:
                return new CANNON.Cylinder(size.x / 2, size.x / 2, size.z, 20);
            case EGeometry.Cone:
                return new CANNON.Cylinder(1, size.x / 2, size.z, 20);
            case EGeometry.Pyramids:
                return new CANNON.Cylinder(1, size.x / 2, size.z, 4);

        }
    }

    /**移除某个物体的物理性 */
    export function removeCANNONBody(guid: string | GameObject) {
        let gameobject: GameObject = null;
        if (typeof guid === "string") {
            const gameobject = findGameObject(guid);
            if (!gameobject) { return; }
        }
        else {
            findConstraint(gameobject).forEach(c => {
                removeConstraint(c.id);
            })
            _CWorld.remove(gameobject.cannonObject);
        }
    }

    /**将两个物体依据自身的某个局部坐标点链接约束到一起 */
    export function addConstraint(g1: GameObject, offset1: Type.Vector, g2: GameObject, offset2: Type.Vector): number {
        let vof1: CANNON.Vec3 = ConvertCannonV3(offset1);
        let vof2: CANNON.Vec3 = ConvertCannonV3(offset2);

        const Constraint = new CANNON.PointToPointConstraint(g1.cannonObject, vof1, g2.cannonObject, vof2);
        _cnstraints.set(Constraint.id, [Constraint, g1.cannonObject.id, g2.cannonObject.id]);
        _CWorld.addConstraint(Constraint);
        return Constraint.id;
    }
    /**根据ID移除某链接器 */
    export function removeConstraint(id: number) {
        if (_cnstraints.has(id)) {
            const constraint = _cnstraints.get(id)[0];
            _CWorld.removeConstraint(constraint);
        }
    }
    /**获取物体上的所有链接点 */
    export function findConstraint(gameObject: GameObject): CANNON.Constraint[] {
        const gid = gameObject.cannonObject.id;
        const ret: CANNON.Constraint[] = []
        for (const [con, id1, id2] of _cnstraints.values()) {
            if (id1 === gid || id2 === gid) {
                ret.push(con);
            }
        }
        return ret;
    }
    /**设置物体朝某个方向移动 */
    export function setVelocity(gameObject: GameObject, direction: Type.Vector, speed: number) {
        gameObject.cannonObject.velocity.set(
            direction.x * speed,
            direction.y * speed,
            direction.z * speed
        );
    }

    /**cannon向量->mw向量 */
    function ConvertMWV3(v3: CANNON.Vec3): Type.Vector {
        return new Type.Vector(v3.x, v3.y, v3.z);
    }
    /**mw向量->cannon向量 */
    function ConvertCannonV3(v3: Type.Vector) {
        return new CANNON.Vec3(v3.x, v3.y, v3.z);
    }
}

