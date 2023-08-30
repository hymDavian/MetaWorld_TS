type ComponentType<T extends ComponentBase> = { new(...args: unknown[]): T };
type getStartParams<T extends ComponentBase> = T extends { onStart: (...args: infer P) => void } ? P : [];

interface ITransformComponent {
    location: Type.Vector;
    rotation: Type.Rotation;
    scale: Type.Vector;
    lookAt(target: Type.Vector);
    forward: Type.Vector;
}
export class Entity {
    public name: string = "";
    private static readonly entityPool: Entity[] = [];
    public static getNewEntity(): Entity {
        let entity: Entity = null;
        if (Entity.entityPool.length > 0) {
            entity = Entity.entityPool.pop();
        } else {
            entity = new Entity();
        }
        entity.name = "new Entity";
        entity._active = true;
        return entity;
    }

    private static uidSeed: number = 0;
    public readonly uid: number;

    private constructor() {
        this.uid = Entity.uidSeed++;
    }

    private readonly _components: ComponentBase[] = [];
    public get components(): ComponentBase[] {
        return this._components.slice();
    }

    private _transform: ITransformComponent = null;
    public get transform(): ITransformComponent {
        if (!this._transform) {
            this._transform = this.tryGetComponent(globalThis.TransformComponentCtor) as any;
        }
        return this._transform;
    }

    /**添加逻辑组件 */
    public addComponent<T extends ComponentBase>(type: ComponentType<T>, ...startParams: getStartParams<T>): T {
        const comp = ComponentBase.addComponent(this, type, ...startParams);
        return comp;
    }
    /**获取逻辑组件 */
    public getComponent<T extends ComponentBase>(type: ComponentType<T>): T {
        const clsName = type.name;
        const comp = this._components.find((value, index) => {
            return value.constructor.name == clsName;
        });
        return comp ? comp as T : null;
    }
    /**获取逻辑组件,如果没有会尝试创建一个并返回 */
    public tryGetComponent<T extends ComponentBase>(type: ComponentType<T>, startParams?: getStartParams<T>): T {
        let comp = this.getComponent(type);
        if (comp == null) {
            startParams = startParams ? startParams : [] as any;
            comp = this.addComponent(type, ...startParams);
        }
        return comp;
    }
    /**移除逻辑组件(组件类型) */
    public removeComponent<T extends ComponentBase>(type: ComponentType<T>) {
        ComponentBase.removeComponent(this, type);
    }
    /**移除自身，清理所有组件对象 */
    public destory() {
        this.onDestory();
        Entity.entityPool.push(this);
    }

    private onDestory() {
        const tempComps = this._components.slice();
        for (let i = tempComps.length - 1; i >= 0; i--) {
            ComponentBase.removeComponentObj(this, tempComps[i]);
        }
        this._components.length = 0;
        this._transform = null;
    }

    private _active: boolean = true;
    /**是否激活 */
    public get activeSelf(): boolean {
        return this._active;
    }

    /**设置激活状态 */
    public setActive(value: boolean) {
        if (this._active != value) {
            this._active = value;
            this._components.forEach((comp, index) => {
                if (value && comp.enable) {
                    comp["onEnable"]();
                }
                else {
                    comp["onDisable"]();
                }
            });
        }
    }
}

export abstract class ComponentBase {
    private static cidSeed: number = 0;
    private static readonly compMapPool: Map<string, ComponentBase[]> = new Map<string, ComponentBase[]>();
    private static readonly runningComponents: ComponentBase[] = [];
    /**外部驱动帧更新 */
    public static update(dt: number) {
        ComponentBase.runningComponents.forEach((value, index) => {
            value.owner.activeSelf && value.enable && value.onUpdate(dt);
        });
    }
    private static getNewComponent<T extends ComponentBase>(type: ComponentType<T>): T {
        const clsName = type.name;
        if (!ComponentBase.compMapPool.has(clsName)) {
            ComponentBase.compMapPool.set(clsName, []);
        }
        const pool = ComponentBase.compMapPool.get(clsName);
        let result: T = null;
        if (pool.length == 0) {
            result = new type();
        }
        else {
            result = pool.pop() as T;
        }
        return result;
    }

    /**添加逻辑组件 */
    public static addComponent<T extends ComponentBase>(entity: Entity, type: ComponentType<T>, ...startParams: getStartParams<T>): T {
        const comp = ComponentBase.getNewComponent(type);
        (comp as any)["owner"] = entity;
        entity["_components"].push(comp);
        comp.onAdd();
        comp.onStart(...startParams);
        comp.setEnable(true);
        ComponentBase.runningComponents.push(comp);
        return comp;
    }
    /**移除逻辑组件(组件对象) */
    public static removeComponentObj(entity: Entity, comp: ComponentBase) {
        if (entity == null) {
            return;
        }
        const entityIndex = entity["_components"].indexOf(comp);
        if (entityIndex >= 0) {
            entity["_components"].splice(entityIndex, 1);
        }
        const clsName = comp.constructor.name;
        const index = ComponentBase.runningComponents.indexOf(comp);
        if (index >= 0) {
            ComponentBase.runningComponents.splice(index, 1);
        }
        comp.setEnable(false);
        comp.onRemove();
        (comp as any)["owner"] = null;
        const pool = ComponentBase.compMapPool.get(clsName);
        pool.push(comp);
    }
    /**移除逻辑组件(组件类) */
    public static removeComponent<T extends ComponentBase>(entity: Entity, type: ComponentType<T>) {
        if (entity == null) {
            return;
        }
        const comp = entity.getComponent(type);
        if (comp == null) {
            return;
        }
        ComponentBase.removeComponentObj(entity, comp);
    }


    /**组件实例ID */
    public readonly cid: number = 0;
    private _enable: boolean = false;
    /**是否激活 */
    public get enable(): boolean { return this._enable; }
    public constructor() {
        this.cid = ComponentBase.cidSeed++;
    }

    /**所属实体 */
    public readonly owner: Entity;

    /**组件附加 */
    protected onAdd(): void { }
    /**组件启动 */
    onStart(...args: unknown[]) { }
    /**组件移除 */
    protected abstract onRemove(): void;
    /**组件帧更新 */
    protected abstract onUpdate(dt: number): void;
    /**获取组件 */
    protected getComponent<T extends ComponentBase>(type: ComponentType<T>): T {
        if (this.owner == null) {
            return null;
        }
        return this.owner.getComponent(type);
    }

    protected onEnable() { };
    protected onDisable() { };


    /**设置组件是否激活(驱动update) */
    public setEnable(enable: boolean) {
        this._enable = enable;
        if (enable && this.owner.activeSelf) {
            this.onEnable();
        }
        else {
            this.onDisable();
        }
    }
}