type size = [number, number]
/**3dui管理器 */
export namespace worldUIMgr {
    type uiType = { new(guid: string, space: Gameplay.WidgetSpaceMode, uisize: size): baseWorldui };
    let _worldUiDic: Map<string, Array<baseWorldui>> = new Map();
    let _hideUiDic: Map<string, baseWorldui[]> = new Map();
    /**外部调用,驱动3dui的更新 */
    export function update(dt: number) {
        if (Gameplay.isServer()) //这是一个纯客户端展示逻辑
        {
            return;
        }
        for (let v of _worldUiDic.values()) {
            v.forEach(ui => {
                if (ui.activeSelf) {
                    if (ui.buseUpdate) {
                        ui.onUpdate(dt);
                    }
                }
            })
        }
    }

    /**
     * 获取正在活跃的某种ui
     * @param uiname ui资源名+ui使用的类型名组成的标识字符
     * @returns 
     */
    export function getuiArray<T extends baseWorldui>(uiname: string): Array<T> {
        let result: Array<T> = [];
        if (_worldUiDic.has(uiname)) {
            let array = _worldUiDic.get(uiname);
            for (let ui of array) {
                result.push(ui as T);
            }
        }
        return result;
    }

    /**获取并显示一个3dUI */
    export function getWorldUI<T extends baseWorldui>(ty: uiType, uiprefab: string, space: Gameplay.WidgetSpaceMode, uisize: size): T {
        let typeName = uiprefab + ty.name;//根据资源id和ui使用的类名，组成一个 类型唯一识别字符串
        let result: baseWorldui = null;
        if (_hideUiDic.has(typeName))//先从回收站取
        {
            result = _hideUiDic.get(typeName).pop();
        }

        if (!result) //还没有取到就新实例化一个
        {
            result = new ty(uiprefab, space, uisize);
            result.onStart();
            result.baseui.refresh();
        }
        if (!_worldUiDic.has(typeName)) {
            _worldUiDic.set(typeName, new Array<T>())
        }
        _worldUiDic.get(typeName).push(result);
        result.setActive(true);
        return result as T;
    }

    /**回收并隐藏一个3dUI */
    export function recycle(ui: baseWorldui) {
        let typeName = ui.assetID + ui.constructor.name;
        //从显示数组中移除
        let array = _worldUiDic.get(typeName);
        if (array) {
            let index = array.indexOf(ui);
            if (index >= 0) {
                _worldUiDic.get(typeName).splice(index, 1);
            }
        }
        //加入回收站
        if (!_hideUiDic.has(typeName)) {
            _hideUiDic.set(typeName, []);
        }
        _hideUiDic.get(typeName).push(ui);
        //设为隐藏
        ui.setActive(false);
    }
}

/**3dui基类 */
export abstract class baseWorldui {
    public readonly baseui: Gameplay.UIWidget;
    public readonly assetID: string;
    /**每帧运行 */
    public abstract onUpdate(dt: number): void
    /**第一次出现时初始化 */
    public abstract onStart(): void

    protected onActive(b: boolean): void { }

    /**在激活状态下是否执行update */
    public buseUpdate: boolean = false;
    /**
     * 3dUI
     * @param ui ui资源id
     * @param space 展示模式
     * @param attachTo 附加的游戏物体
     * @param localPos 必须是有附加物体，才能设置的局部坐标
     */
    constructor(ui: string, space: Gameplay.WidgetSpaceMode, uisize: size) {
        this.baseui = Core.GameObject.spawnGameObject("16037") as Gameplay.UIWidget;
        this.baseui.widgetSpace = space;
        this.baseui.pivot = new Type.Vector2(0.5, 0.5);
        this.baseui.setUI(ui);
        this.baseui.drawSize = new Type.Vector2(uisize[0] ? uisize[0] : 100, uisize[1] ? uisize[1] : 100);
        this.assetID = ui;
    }

    private _attachObject: Core.GameObject = null;
    private _localPos: Type.Vector = Type.Vector.zero;

    public get localPos(): Type.Vector {
        return this._localPos;
    }
    /**设置/获取 局部坐标，如果没有父级，设置世界坐标 */
    public set localPos(pos: Type.Vector) {
        this._localPos = pos;
        if (this._attachObject) {
            this.baseui.setRelativeLocation(pos);
        }
        else {
            this.baseui.worldLocation = pos;
        }
    }

    public get parent(): Core.GameObject {
        return this._attachObject;
    }
    /**设置/获取 父级游戏物体，如果设置父级是角色对象，会附加到头顶 */
    public set parent(obj: Core.GameObject) {
        this.baseui.detachFromGameObject();
        this._attachObject = obj;
        if (obj) {
            if (obj instanceof Gameplay.CharacterBase) {
                (obj as Gameplay.CharacterBase).attach(this.baseui, Gameplay.SlotType.Head);
            }
            else {
                this.baseui.attachToGameObject(obj);
            }

            this.baseui.relativeLocation = (this._localPos);
        }
    }

    /**看向摄像机 */
    public lookAtCamera(onlyZ: boolean = true) {
        let rotation = Type.Vector.subtract(baseWorldui.cameraPos(), this.baseui.worldLocation).toRotation();
        if (onlyZ) {
            rotation.x = 0;
            rotation.y = 0;
        }
        this.baseui.worldRotation = rotation;
    }

    /**看向玩家 */
    public lookAtPlayer(onlyZ: boolean = true) {
        let rotation = Type.Vector.subtract(Gameplay.getCurrentPlayer().character.worldLocation, this.baseui.worldLocation).toRotation();
        if (onlyZ) {
            rotation.x = 0;
            rotation.y = 0;
        }
        this.baseui.worldRotation = rotation;
    }
    private _active: boolean = true;
    public get activeSelf(): boolean {
        return this._active;
    }

    /**设置显示 激活状态(是否执行update,比useupdate先判断) */
    public setActive(b: boolean) {
        if (this._active == b) { return; }
        this._active = b;
        this.baseui.setVisibility(b ? Type.PropertyStatus.On : Type.PropertyStatus.Off);
        this.onActive(b);
    }

    private static _camera: Gameplay.CameraSystem = null;
    private static cameraPos(): Type.Vector {
        if (!Gameplay.getCurrentPlayer()) { return Type.Vector.zero; }
        if (baseWorldui._camera == null) {
            baseWorldui._camera = Gameplay.getCurrentPlayer().character.cameraSystem;
        }
        if (baseWorldui._camera != null) {
            return baseWorldui._camera.cameraWorldTransform.location;
        }
        else {
            return Type.Vector.zero;
        }
    }
}