export namespace TEGameObject {
    type getarrps<T> = T extends [...infer _] ? _ : [T]
    type Class<T> = { new(...args: any[]): T }
    //隐藏mwGameObject中被此类封装的，以及不希望被访问的符号
    type hideMWKeys = {
        onDestroyDelegate, destroy,
        getChildren, getChildByName, getChildrenByName, getChildByPath, getChildByGameObjectId,
        clone, gameObjectId, setVisibility, getVisibility, asyncReady
    }

    //隐藏children这个数组被访问的函数符号
    type hideArrayFunc = {
        pop, push, concat, reverse, shift, sort, splice, unshift
    }

    interface TEGameObject1<T extends mw.GameObject> {
        /**唯一实例ID */
        readonly tid: number;
        /**实际mw游戏物体是否准备完毕 */
        get isReady(): boolean;
        /**mw的唯一实例ID */
        get guid(): string;
        /**世界变换 */
        readonly worldTransform: TTransform;
        /**本地变换 */
        readonly localTransform: TTransform;
        /**物体名称 */
        name: string;
        /**父物体 */
        parent: TGameObject<any>;
        /**标签 */
        tag: string;
        /**物体使用资源guid */
        get assetId(): string;
        /**子物体组，无法直接执行数组的增删操作 */
        readonly children: Omit<Array<TEGameObject1<any>>, keyof hideArrayFunc>;
        /**根据名称查找子物体 */
        getChildByName(name: string);
        /**自身显示状况 */
        get selfShow(): boolean;
        /**设置自身显隐状态 (如果父物体是隐藏的，依然是隐藏，只是自身会记录自己为显示状态) */
        setVisible(show: boolean);
        /**绑定的mw游戏物体 */
        get mwObj(): Omit<T, keyof (TEGameObject1<any> & hideMWKeys)>;
        /**实际对mwGameobject的操作需要写在这里面 */
        haveObjCall(func: (ARG: GameObject) => void)
    }

    /**可以同步调用逻辑的安全游戏物体类，
    * 此类可以有多个泛型参数实例绑定给同一mwGameObject
    */
    export type TGameObject<T extends mw.GameObject> = Omit<TEGameObject1<T>, "haveObjCall">;

    let _TGidseed: number = 0;
    const _tgobjMap: Map<Class<any>, Map<number, TEGameObject1<any>>> = new Map();
    /**根据tid获取TGameObject对象
     * @param tid tid
     * @param useType 预期中的类型。如果传入指定类型，将会加快查找速度
     * @returns 
     */
    export function getTGameObjectByTid<T extends mw.GameObject>(tid: number, useType: Class<T> = null): TGameObject<T> {
        let ret: TEGameObject1<T> = null;
        if (useType) {//指定了类型
            if (_tgobjMap.has(useType)) {//有这个类型map
                ret = _tgobjMap.get(useType).get(tid);//尝试获取
            }
        }
        if (ret == null) {//没找到
            ret = getTGameObjectFrommALLmAP(tid);//从所有map中查询
        }
        return ret;
    }
    //从所有map中找到这个tgameobj对象
    function getTGameObjectFrommALLmAP(tid: number): TEGameObject1<any> {
        for (const map of _tgobjMap.values()) {
            for (const [k, v] of map) {
                if (k === tid) { return v; }
            }
        }
        return null;
    }

    /**基于资源ID生成新TGameObject */
    export function spawn<T extends mw.GameObject>(asset: string, useType: Class<T>): TGameObject<T> {
        const ret = new InnerTGameObject<T>(asset, false, useType);
        return ret;
    }
    /**根据mw游戏物体的guid查找并获取TGameObject */
    export function getTGameObjectByGuid<T extends mw.GameObject>(guid: string, useType: Class<T>): TGameObject<T> {
        let ret: TEGameObject1<T> = null;
        const map = _tgobjMap.get(useType);
        if (map == null) {//这个类型map从来没有定义过,那么可以确定没有生成过此tgobj
            ret = new InnerTGameObject<T>(guid, true, useType);
        }
        else {
            for (const [k, v] of map) {//遍历这个类型map,尝试查找对应guid的对象
                if (v.guid === guid) {
                    ret = v;
                    break;
                }
            }
        }
        if (ret == null) {
            ret = new InnerTGameObject<T>(guid, true, useType);
        }

        return ret;
    }
    /**转mw.GameObject为TGameObject */
    export function convertTGameobject<T extends mw.GameObject>(g: mw.GameObject, useType: Class<T>): TGameObject<T> {
        let ret: TEGameObject1<T> = null;
        const map = _tgobjMap.get(useType);
        if (map == null) {//这个类型map从来没有定义过,那么可以确定没有生成过此tgobj
            ret = new InnerTGameObject<T>(g, false, useType);
        }
        else {
            for (const [k, v] of map) {//遍历这个类型map,尝试查找此mw对象
                if (v.mwObj === g) {
                    ret = v;
                    break;
                }
            }
        }
        if (ret == null) {
            ret = new InnerTGameObject<T>(g, false, useType);
        }
        return ret;
    }




    class InnerTGameObject<T extends mw.GameObject> implements TEGameObject1<T> {
        /**将自身转化为另外一种TGameObject (必须是成功生成或查找后，否则null对象无法转化为任何类型) */
        public AsOtherTGameObject<T2 extends mw.GameObject>(useType: Class<T2>): TGameObject<T2> {
            if (useType as unknown == this.useType) {
                return this as any;
            }
            if (this._mwObj == null) { return null; }
            return convertTGameobject(this._mwObj, useType);
        }


        public readonly tid: number;
        private readonly _waitSpawnSuccess: TAction<[T]> = new TAction();
        private _mwObj: T = null;
        private readonly _tempObj: { [k: string]: any } = {};
        private _ready: boolean;
        public readonly useType: Class<T> = null;

        constructor(asset: string | mw.GameObject, find: boolean, useType: Class<T>) {
            this.useType = useType;
            this.tid = ++_TGidseed;
            if (!_tgobjMap.has(useType)) { _tgobjMap.set(useType, new Map()); }
            _tgobjMap.get(useType).set(this.tid, this);
            this.worldTransform = new TTransform(true, this, this.haveObjCall.bind(this));
            this.localTransform = new TTransform(false, this, this.haveObjCall.bind(this));
            this._ready = false;
            this._tempObj = {};
            this._tempObj.guid = `tempGuid_${this.tid}`;
            if (typeof asset === "string") {
                this._tempObj.assetId = asset;
                if (find) {
                    mw.GameObject.asyncFindGameObjectById(asset).then(g => {
                        this.initSetMWObj(g, true);
                    });
                }
                else {
                    mw.GameObject.asyncSpawn<T>(asset).then(g => {
                        this.initSetMWObj(g, false);
                    })
                }
            }
            else {
                this._tempObj.assetId = this._tempObj.guid
                this.initSetMWObj(asset, true)
            }
        }

        private initSetMWObj(g: mw.GameObject, activebymw: boolean) {
            console.log(`MW游戏物体 ${this.assetId} 异步完成时间：${Date.now()}`)
            this._mwObj = g as T;
            this._tempObj.name = g ? g.name : "EmptyGameObject";
            this._tempObj.assetId = g ? g.assetId : this._tempObj.assetId;
            this._tempObj.tag = g ? g.tag : "";
            this._tempObj.guid = g ? g.gameObjectId : this._tempObj.guid;
            if (this._mwObj == null) {
                console.error("TGameobkect初始化了一个null游戏物体!");
            }
            else {
                if (g != null) {
                    if (activebymw) {
                        const oldvisible = g.getVisibility();
                        this.setVisible(oldvisible);
                    }
                    else {
                        this.setVisible(true);
                    }

                    const mwChildren = g.getChildren();
                    for (const mwg of mwChildren) {
                        const childTG = convertTGameobject(mwg, mw.GameObject);
                        childTG.parent = this;
                        childTG.setVisible(this._selfShow);//初始化子物体显隐需要与自身保持一致
                    }
                    this._waitSpawnSuccess.call(this._mwObj);
                }
            }
            this._ready = true;
        }


        haveObjCall(func: (ARG: GameObject) => void) {
            if (this._ready) {
                try {
                    this._mwObj && func(this._mwObj);
                } catch (error) {
                    console.error(error.stack);
                }
            }
            else {
                this._waitSpawnSuccess.add(func);
            }
        }

        public get isReady(): boolean {
            return this._ready;
        }

        public get guid(): string { return this._mwObj ? this._mwObj.gameObjectId : this._tempObj.guid; }

        public readonly worldTransform: TTransform;
        public readonly localTransform: TTransform;

        public get name(): string { return this._mwObj ? this._mwObj.name : this._tempObj.name; }
        public set name(v: string) {
            this._tempObj.name = v;
            this.haveObjCall(tg => { tg.name = v; })
        }
        public get tag(): string { return this._mwObj ? this._mwObj.tag : this._tempObj.tag; }
        public set tag(v: string) {
            this._tempObj.tag = v;
            this.haveObjCall(tg => { tg.tag = v; })
        }

        private _parent: TEGameObject1<any> = null;
        public get parent(): TEGameObject1<any> { return this._parent; }
        public set parent(parentTG: TEGameObject1<any>) {
            console.log(`${this.assetId} 尝试设置父物体 ${parentTG.assetId}`)
            const oldParent: TEGameObject1<any> = this._parent;//暂存旧的父物体引用
            this._parent = parentTG;//标记自身父物体的引用
            if (parentTG != null) {//需要设为父物体
                const index = parentTG.children.indexOf(this);
                if (index === -1) {//先让父物体标记自己为子物体
                    parentTG.children["push"](this);
                }
                parentTG.haveObjCall(parenttg => {//一直到父物体自认为准备完毕以后
                    this.haveObjCall(tg => {
                        tg.parent = parenttg;//实际设置mw的物体父子关系
                        //重新覆盖一次本地变换信息
                        this.localTransform.position = this.localTransform.position;
                        this.localTransform.rotation = this.localTransform.rotation;
                        this.localTransform.scale = this.localTransform.scale;
                    })
                });
            }
            else {
                if (oldParent != null) {
                    const index = oldParent.children.indexOf(this);
                    oldParent.children["splice"](index, 1);
                }
                this.haveObjCall(tg => {
                    tg.parent = null;
                })
            }

        }

        public get assetId(): string {
            if (this._mwObj != null) {
                return this._mwObj.assetId;
            }
            else {
                return this._tempObj.assetId;
            }
        }

        public readonly children: TEGameObject1<any>[] = [];

        getChildByName(name: string) {
            if (name == null || name === "") { return null; }
            for (const child of this.children) {
                if (child.name === name) {
                    return child;
                }
            }
            return null;
        }

        private _selfShow: boolean = true;//自身显隐状态
        public get selfShow(): boolean {
            return this._selfShow;
        }

        setVisible(show: boolean) {
            this._selfShow = show;
            let setshow = this._selfShow;
            if (this._parent != null) {
                setshow = setshow && this._parent.selfShow;
            }
            this.haveObjCall(tg => {
                tg.setVisibility(setshow, false);
                this.children.forEach(c => {
                    c.haveObjCall(() => {//等待子物体实例化完毕后
                        const childShow = this._selfShow && c.selfShow;
                        c.setVisible(childShow);
                    })
                })
            })
        }

        private _GetterProxy: Omit<T, keyof (TEGameObject1<any> & hideMWKeys)> = null;
        public get mwObj(): Omit<T, keyof (TEGameObject1<any> & hideMWKeys)> {
            if (this._ready && this._mwObj) {
                return this._mwObj as T;
            }
            else {
                if (this._GetterProxy == null) {
                    const thisArg = this;
                    this._GetterProxy = new Proxy(this._tempObj, {
                        set(target, p, newValue, receiver) {
                            thisArg.haveObjCall(tg => {
                                tg[p] = newValue;
                            });
                            return Reflect.set(target, p, newValue, receiver);
                        },
                        get(target, p, receiver) {
                            const tempret = target[p.toString()];
                            if (tempret == null) {//直接访问为空
                                if (thisArg.useType.prototype[p] == null) {//类型描述里面不存在这个成员
                                    return null;
                                }
                                //判断在类型描述里面，这个访问的符号是否为函数
                                const isfunc = typeof thisArg.useType.prototype[p] == "function";
                                if (isfunc) {//类型描述表示这个访问的符号应该是函数，在代理内构建这个函数
                                    target[p.toString()] = function (...arg: unknown[]) {
                                        thisArg.haveObjCall(tg => {
                                            tg[p](...arg);
                                        })
                                    }
                                }
                                return target[p.toString()];
                            }
                            else {
                                return tempret;
                            }
                        },

                    }) as any;
                }
                return this._GetterProxy;
            }
        }
    }

    abstract class InnerTGProperty<T extends mw.GameObject> {
        public readonly Obj: InnerTGameObject<T>;
        protected readonly readyCall: (func: (ARG: GameObject) => void) => void;
        constructor(tg: InnerTGameObject<T>, bindWaitFunc: (func: (ARG: GameObject) => void) => void) {
            this.Obj = tg;
            this.readyCall = bindWaitFunc;
        }
    }

    export class TTransform extends InnerTGProperty<mw.GameObject> {
        private readonly _isWorld: boolean = false;
        private readonly _pos = new mw.Vector(0, 0, 0);
        private readonly _rot = new mw.Rotation(0, 0, 0);
        private readonly _scl = new mw.Vector(0, 0, 0);
        private get _tra(): Transform {
            if (this.Obj.mwObj == null) { return null; }
            return this._isWorld ? this.Obj["_mwObj"].worldTransform : this.Obj["_mwObj"].localTransform;
        }
        constructor(isWorld: boolean, tg: InnerTGameObject<mw.GameObject>, bindWaitFunc: (func: (ARG: GameObject) => void) => void) {
            super(tg, bindWaitFunc);
            this._isWorld = isWorld;
            bindWaitFunc(tg => {
                this._pos.set(this._tra ? this._tra.position : mw.Vector.zero);
                this._rot.set(this._tra ? this._tra.rotation : mw.Rotation.zero);
                this._scl.set(this._tra ? this._tra.scale : mw.Vector.zero);
            })
        }

        toString() {
            return `pos:[${this._pos.x},${this._pos.y},${this._pos.z}]\nrot:[${this._rot.x},${this._rot.y},${this._rot.z}]\nscl:[${this._scl.x},${this._scl.y},${this._scl.z}]`;
        }

        getForwardVector(): mw.Vector {
            return this._tra ? this._tra.getForwardVector() : mw.Vector.zero;
        }

        lookAt(target: mw.Vector): void {
            this.readyCall(tg => {
                if (this._tra) {
                    this._tra.lookAt(target);
                }
            })
        }

        get position(): mw.Vector { return this._pos.clone(); }
        get rotation(): mw.Rotation { return this._rot.clone(); }
        get scale(): mw.Vector { return this._scl; }

        set position(v: mw.Vector) {
            this._pos.set(v);
            this.readyCall(tg => {
                this._tra && (this._tra.position = v);
            });
        }
        set rotation(v: mw.Rotation) {
            this._rot.set(v);
            this.readyCall(tg => {
                this._tra && (this._tra.rotation = v);
            });
        }
        set scale(v: mw.Vector) {
            this._scl.set(v);
            this.readyCall(tg => {
                this._tra && (this._tra.scale = v);
            });
        }


    }

    export class TAction<T, R = void> {
        private readonly _callback: ((...ps: getarrps<T>) => R)[] = [];

        add(fn: (...ps: getarrps<T>) => R): void {
            this._callback.push(fn);
        }

        call(...ps: getarrps<T>): R[] {
            const ret: R[] = [];
            for (let i = 0; i < this._callback.length; i++) {
                let inret;
                try {
                    inret = this._callback[i](...ps);
                } catch (error) {
                    console.error(error.stack);
                }
                ret.push(inret || null);
            }
            return ret;
        }

        clear() {
            this._callback.length = 0;
        }

        remove(fn: (...ps: getarrps<T>) => R) {
            for (let i = 0; i < this._callback.length; i++) {
                if (this._callback[i] == fn) {
                    this._callback.splice(i, 1);
                    return;
                }
            }
        }

        includes(fn: (...ps: getarrps<T>) => R): boolean {
            for (let i = 0; i < this._callback.length; i++) {
                if (this._callback[i] == fn) {
                    return true;
                }
            }
            return false;
        }

        get count(): number {
            return this._callback.length;
        }
    }

    function getdeepKeys(obj: Object, check: (k: string | symbol) => boolean): (string | symbol)[] {
        const ret: (string | symbol)[] = Reflect.ownKeys(obj.constructor.prototype).filter(v => {
            return check(v);
        });
        if (obj["__proto__"]) {
            ret.push(...getdeepKeys(obj["__proto__"], check))
        }
        return ret;
    }
}

export type TGameObject<T extends mw.GameObject> = TEGameObject.TGameObject<T>;
export type TAction<T, R = void> = TEGameObject.TAction<T, R>;
export type TTransform = TEGameObject.TTransform;
