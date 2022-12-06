
import { ERoleProperty, ERolePropertyServer, LongNum } from "./Attrs";

type createArgs<T> = {
    /**初始化设置模型 */
    model?: Core.GameObject,
    /**初始化设置名称 */
    nickNmae?: string,
    /**初始化完毕后的回调函数 */
    callback?: (role: T) => void
}
/**角色属性同步对象基类(玩家和npc都基于此对象实现自己的属性同步类) */
export abstract class RoleAttrSync extends Core.Script {
    //所有被实例化过的角色属性同步对象都在此集合内
    private static readonly allRoles: Map<number, RoleAttrSync> = new Map();
    /**根据ID获取角色属性脚本 */
    public static getRole(roleid: number) { return RoleAttrSync.allRoles.get(roleid); }
    /**[server] 新实例化一个属性同步脚本对象
     * 
     * @param scriptClass 使用的脚本基类
     * @param id 唯一ID
     * @param args (可选)初始化参数
     * @returns 
     */
    public static createRole<T extends RoleAttrSync>(scriptClass: new (...args: unknown[]) => T, id: number, args?: createArgs<T>) {
        if (Gameplay.isClient()) { return; }//客户端无法创建
        if (RoleAttrSync.allRoles.has(id)) {
            if (args) {
                const role = RoleAttrSync.allRoles.get(id);
                args.model && role.setModel(args.model);
                args.nickNmae && role.setNickName(args.nickNmae);
                args.callback && args.callback(role as T);
            }
            return;
        } //之前创建过，直接返回
        const syncScript = Core.Script.spawnScript(scriptClass);
        syncScript.then(role => {
            setTimeout(() => {
                role.setRoleID(id);
                if (args) {
                    args.model && role.setModel(args.model);
                    args.nickNmae && role.setNickName(args.nickNmae);
                    args.callback && args.callback(role);
                }
            }, 100);
        });
    }

    /**[client] 当前玩家的属性脚本对象 */
    public static get currentRole(): RoleAttrSync {
        if (Gameplay.isServer()) { return null; }
        return RoleAttrSync.allRoles.get(Gameplay.getCurrentPlayer().getPlayerID());
    }

    @Core.Property({ replicated: true, onChanged: "onNameChange" })
    private _nickName: string = null;
    /**名称 */
    public get nickName(): string { return this._nickName; }
    /**[server] 设置名称 */
    public setNickName(name: string) {
        if (Gameplay.isServer()) {
            this._nickName = name;
        }
    }
    private onNameChange() {
        if (this._nickName) {
            this.onNickNameChange(this._nickName);
        }
    }
    /**仅客户端会调用，当角色名称nickName属性更改时执行 */
    protected abstract onNickNameChange(nickName: string);

    @Core.Property({ replicated: true, onChanged: "onIDChange" })
    private _roleID: number = null;
    /**自身角色数字ID,玩家为玩家ID，AI为一个自定义的自增数字ID */
    public get roleID(): number { return this._roleID; }
    /** 角色数字ID只能设置一次，用于Map内定位此对象 */
    private setRoleID(id: number): void {
        if (Gameplay.isServer()) {
            if (!this._roleID) {
                this._roleID = id;
                this.onIDChange();
            }
        }
    }
    //这里另外开一个函数作为属性变更回调，是用于可以让客户端和服务器都能在设置数字ID时放到静态Map内
    private onIDChange() {
        RoleAttrSync.allRoles.set(this._roleID, this);
        console.log("初始化属性同步对象：" + this.roleID);
    }

    @Core.Property({ replicated: true, onChanged: "onModelSet" })
    private _modelGuid: string = null;
    private onModelSet() {
        Core.GameObject.asyncFind(this._modelGuid).then(g => {
            this._model = g;
        })
    }

    private _model: Core.GameObject = null;
    /**自身模型对象 */
    public get model(): Core.GameObject {
        if (!this.model) {
            this._model = Core.GameObject.find(this._modelGuid);
        }
        return this._model;
    }
    public setModel(m: Core.GameObject): void {
        if (Gameplay.isServer()) {
            this._model = m;
            this._modelGuid = m.guid;
        }
    }

    //--------------------其他自定义属性同步变更-----------------------------
    /**相关属性变更后的表现 (双端对应时机都会调) */
    protected abstract onPropertyChange(ty: ERoleProperty, val: number);

    @Core.Property({ replicated: true, onChanged: "onAttrChange" })
    private _attrs: number[] = []
    private _oldValues: { [ty: number]: number } = {};
    /**客户端收到属性同步变更后要做的变更 */
    protected onAttrChange(): void {
        for (const k in this._attrs) {
            const newVal = this._attrs[k];
            this.clientSetAttr(Number(k), newVal);
        }
    }

    /**双端 根据属性类型获取属性值 */
    public getAttr(ty: ERoleProperty): number {
        let ret = 0;
        if (ERolePropertyServer.has(ty)) {
            if (Gameplay.isClient()) {
                console.error(`${ty}是一个服务器属性，但此时客户端在获取，请检查逻辑！`)
            }
            ret = this._serverData.get(ty);
        }
        else {
            ret = this._attrs[ty];
        }
        return ret ? ret : 0
    }

    /**服务器 设置属性类型对应的值 */
    public setAttr(ty: ERoleProperty, val: number) {
        if (Gameplay.isServer()) {
            this.serverSetAttr(ty, val);
        }
    }

    /**服务器 批量设置属性值 */
    public setAttrAll(...vals: [ERoleProperty, number][]) {
        if (Gameplay.isServer()) {
            if (!vals || vals.length <= 0) {
                return;
            }
            for (let arg of vals) {
                this.serverSetAttr(arg[0], arg[1]);
            }
        }

    }

    /**调用属性变更函数 */
    private serverSetAttr(ty: ERoleProperty, val: number) {
        ty = this.LongIndexToLower(ty);
        if (ERolePropertyServer.has(ty)) {//仅设置服务器属性
            const oldVal = this._serverData.get(ty);
            if (val === 0 && oldVal === 0) { return; }//旧值新值都为0时，不需要做变更调用
            if (!oldVal || oldVal != val) {
                this._serverData.set(ty, val);
                this.onPropertyChange(ty, val);
            }
            return;
        }

        if (!this._attrs) {
            this._attrs = [];
        }
        if (!this._oldValues) {
            this._oldValues = {};
        }
        const oldVal = this._oldValues[ty];
        if (!oldVal || oldVal != val) {
            this._oldValues[ty] = val;
            this._attrs[ty] = val;
            //补足不存在的元素0
            for (let i = 0; i < this._attrs.length; i++) {
                if (!this._attrs[i]) {
                    this._attrs[i] = 0;
                }
            }
            this.onPropertyChange(ty, val);
        }
    }

    private clientSetAttr(ty: ERoleProperty, val: number) {
        // ty = this.LongIndexToLower(ty);
        if (!this._oldValues) {
            this._oldValues = {};
        }
        const oldVal = this._oldValues[ty];
        if (val === 0 && oldVal === 0) { return; }//特殊情况，0也会作为计算机的false的判断条件
        if (!oldVal || oldVal != val) {
            this._oldValues[ty] = val;
            this.onPropertyChange(ty, val);
        }
    }

    /**将一些配置表的属性枚举值转为定义枚举值 */
    private LongIndexToLower(n1: number): number {
        return LongNum[n1] ? LongNum[n1] : n1;
    }

    /**仅服务器存在的数据 */
    private readonly _serverData: Map<ERoleProperty, number> = new Map();
}