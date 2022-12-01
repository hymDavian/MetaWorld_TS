
export type logicType = { new(G: Core.GameObject, _update: boolean): ComponentBase };

export abstract class ComponentBase {
    /**每次新建组件时自增的唯一ID值 */
    private static _insID: number = 0;

    /**自身绑定的游戏物体 */
    public readonly gameObject: Core.GameObject;
    /**唯一实例ID */
    public readonly MyID: number;
    /**是否执行update */
    public bUseUpdate: boolean = false;

    private _activeSelf: boolean = true;



    /**是否执行Update 初始化值 */
    private readonly originalUpdate: boolean;
    /**碰撞状态 初始化值 */
    private readonly originalColliderState: Type.PropertyStatus;

    /**
     * 尽量不要直接使用New Component  ,使用AddComponent来给游戏物体添加这个逻辑组件
     * 默认不启用Update
     *  */
    public constructor(_gobj: Core.GameObject, _update: boolean = false) {
        this.gameObject = _gobj;
        this.MyID = ComponentBase._insID++;

        this.originalColliderState = _gobj.getCollision() as Type.PropertyStatus;
        this.originalUpdate = _update;
        this.bUseUpdate = _update;
    }

    /**被添加到游戏物体上时调用 */
    protected abstract Start(arg: any[]): void;

    /**每帧调用 */
    public abstract Update(dt: number): void;

    /**组件被移除时调用 */
    protected abstract OnRemove(): void;

    /**绑定的游戏物体被移除时调用，会先调用OnRemove */
    protected abstract OnDestory(): void;

    /**显示时的响应函数 初始化会在Start之后必定执行一次*/
    protected abstract OnEnable(): void;

    /**隐藏时的响应函数 */
    protected abstract OnDisable(): void;


    private Remove() {
        this.OnRemove();
    }

    private Destory() {
        this.OnRemove();
        this.OnDestory();
    }

    /**设置自身激活状态
     * 隐藏会关闭游戏物体的显示和碰撞体
     * 隐藏后会停止Update执行，
     * 如有需要可以额外调用bUseUpdate启用相关功能。
     *  */
    public SetActive(_active: boolean) {
        if (this._activeSelf == _active) { return; }
        this._activeSelf = _active;
        if (this.gameObject) {
            this.gameObject.setCollision(_active ? this.originalColliderState : Type.PropertyStatus.Off);
            this.gameObject.setVisibility(_active ? Type.PropertyStatus.On : Type.PropertyStatus.Off);
        }
        this.bUseUpdate = _active ? this.originalUpdate : false;
        if (_active) {
            this.OnEnable();
        }
        else {
            this.OnDisable();

        }
    }


    //#region 静态成员


    /**游戏物体和游戏组件的键值对集合 */
    private static ComponentMapper: Map<string, Map<string, ComponentBase>> = new Map<string, Map<string, ComponentBase>>();

    /**获取这个游戏物体的所有组件 */
    public static GetAllComponent(_gobj: Core.GameObject): Map<string, ComponentBase> {
        if (ComponentBase.ComponentMapper.has(_gobj.guid)) {
            return ComponentBase.ComponentMapper.get(_gobj.guid);
        }
        else {
            return null;
        }
    }

    /**获取游戏物体的某个特定类型名称对应组件，如果没有会返回null */
    public static GetComponent<T extends ComponentBase>(_gobj: Core.GameObject, c: logicType): T {
        if (!_gobj) //被添加游戏组件的物体为空
        {
            console.log("addComp Gobj is ", typeof _gobj);
            return null
        }
        let map = ComponentBase.GetAllComponent(_gobj);
        let comp: T = null;
        if (map) {
            if (map.has(c.name)) {
                comp = map.get(c.name) as T;
            }
        }
        return comp;
    }

    /**给游戏物体添加一个组件并返回，无法重复添加同类的组件 */
    public static AddComponent<T extends ComponentBase>(_gobj: Core.GameObject, c: logicType, _update: boolean = false, ...arg: any[]): T {

        if (!_gobj) //被添加游戏组件的物体为空
        {
            console.log("addComponent fail! _gobj is ", _gobj);
            return null
        }
        //被添加的组件类名
        let typeName = c.name
        let comp: T = null;
        //先创建外部map
        if (!ComponentBase.ComponentMapper.has(_gobj.guid)) {
            console.log("create component map by:" + _gobj.name);
            ComponentBase.ComponentMapper.set(_gobj.guid, new Map<string, ComponentBase>());
        }
        //已经存在了
        if (ComponentBase.ComponentMapper.get(_gobj.guid).has(typeName)) {
            console.log("comp is haved!")
            comp = ComponentBase.ComponentMapper.get(_gobj.guid).get(typeName) as T;
        }
        else {
            console.log("success create comp :", typeName);
            comp = new c(_gobj, _update) as T;
            comp.Start(arg);
            comp.OnEnable();
            ComponentBase.ComponentMapper.get(_gobj.guid).set(typeName, comp);
        }
        return comp;

    }


    /**
     * 根据guid新建一个物体，并提供一个指定的组件
     * @param _guid 新建物体的资源guid
     * @param c 组件类型
     * @param _update 是否更新
     */
    public static NewComponentObject<T extends ComponentBase>(_guid: string, c: logicType, _update: boolean = false, ...arg: any[]): T {
        let _gobj = Core.GameObject.spawnGameObject(_guid);
        if (!_gobj) {
            console.log(`create GameObject Fail! Use GUID [${_guid}] maybe not imported !`);
            return null;
        }
        //被添加的组件类名
        let typeName = c.name
        let comp: T = null;
        //先创建外部map
        ComponentBase.ComponentMapper.set(_gobj.guid, new Map<string, ComponentBase>());
        //创建对应组件对象
        console.log("success create comp :", typeName);
        comp = new c(_gobj, _update) as T;
        //初始化组件并加入map
        comp.Start(arg);
        comp.OnEnable();
        ComponentBase.ComponentMapper.get(_gobj.guid).set(typeName, comp);
        return comp;
    }

    /**移除一个游戏组件 只是执行了相关移除函数，并在这之后无法执行相关生命周期，会返回被移除的组件 */
    public static RemoveComponent<T extends ComponentBase>(_gobj: Core.GameObject, c: logicType): T {

        //游戏物体不存在
        if (!_gobj) {
            console.log("Gobj is null!");
            return null
        }
        let typeName = c.name;
        let comp: T = null;
        let map = ComponentBase.GetAllComponent(_gobj);
        if (map) {
            if (map.has(typeName)) {
                console.log("remove component", typeName, "from", _gobj.guid);
                comp = map.get(typeName) as T;
                comp.Remove();
                map.delete(typeName);
                if (map.size == 0) {
                    ComponentBase.ComponentMapper.delete(_gobj.guid);
                }
            }
        }
        else {
            console.log("not have component:", typeName);
        }

        return comp;
    }

    /**移除游戏物体，会正确执行移除相关组件逻辑 */
    public static DestoryGameObject(_gobj: Core.GameObject): void {
        if (!_gobj) //空游戏物体，直接返回
        {
            return;
        }
        let children = _gobj.getChildren();//所有子物体
        if (children && children.length > 0)//存在子物体时，递归从最下级子物体开始删除
        {
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                ComponentBase.DestoryGameObject(child);
            }
        }
        else {
            let comps = ComponentBase.GetAllComponent(_gobj);
            if (!comps)//没有创建过组件，普通删除
            {
                _gobj.destroy();
            }
            else {
                for (let comp of comps.values()) {
                    comp.Destory();
                }
                comps.clear();//清空这个游戏物体相关guid维护的组件集合
                ComponentBase.ComponentMapper.delete(_gobj.guid);//从总组件集合中移除这个游戏物体对应的key
                _gobj.destroy();
            }
        }



    }

    /**组件的Update运作 */
    public static DoComponentUpdate(_dt: number): void {
        for (let p of ComponentBase.ComponentMapper.values()) {
            for (let comp of p.values()) {
                if (comp.bUseUpdate) {
                    comp.Update(_dt);
                }
            }
        }
    }

    //#endregion

}