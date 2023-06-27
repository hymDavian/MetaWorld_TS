/* eslint-disable eqeqeq */
/* eslint-disable mwts-rules/no-chinese-character */
/* eslint-disable lines-between-class-members */

//属于某个玩家的所有单位的属性同步脚本
export abstract class RoleAttrSync<T> extends Core.Script {
    /**分配某种属性给某个单位 */
    protected setDataToUnitInfo(ty: string, uid: number) {
        if (!globalThis.battleModuleClient.isLocalBattlePlayer(this.pid)) return;//不是本地正在作战的玩家，不需要去分配属性
        const length = this.getvalueLength(ty);//单个单位所需此属性的长度
        const uidIndex = this.unitIDS.indexOf(uid);//单位ID索引
        if (uidIndex < 0) return;
        const dataArr = this.getAttrArrayByType(ty);//属性集合
        const unit = this._allUnits.get(uid);
        if (!unit) return;
        const attrIndex = uidIndex * length;
        const data = dataArr.slice(attrIndex, attrIndex + length);
        if (data.length === 0) return;
        if (length === 1) {//单一值属性
            if (unit.object) {
                this.onAttrSyncChange(unit.object, ty, data[0]);
            }
        }
        else {
            if (unit.object) {
                this.onAttrSyncChange(unit.object, ty, data);
            }
        }
    }
    protected abstract onAttrSyncChange(obj: T, ty: string, data: unknown)
    /**分配某种属性给全体单位 */
    protected setDataToUnitInfoAll(ty: string) {
        if (!globalThis.battleModuleClient.isLocalBattlePlayer(this.pid)) return;
        for (const uid of this.unitIDS) {
            this.setDataToUnitInfo(ty, uid);
        }
    }
    /**根据属性类型获取自身某个数组成员 */
    protected abstract getAttrArrayByType(type: string): unknown[];
    /**实际在客户端删除对象实体和模型 */
    protected abstract realDeleteOnClient(uid: number);
    /**清除某个单位的数据 */
    protected clearDataByUid(uid: number) {
        const uidIndex = this.unitIDS.indexOf(uid);//单位ID索引
        if (uidIndex < 0) return;
        for (const k of this.allKeys) {
            const length = this.getvalueLength(k);//单个单位所需此属性的长度
            const attrIndex = uidIndex * length;
            const dataArr = this.getAttrArrayByType(k);//属性集合
            dataArr.splice(attrIndex, length);
        }
    }
    /**获取某个单位 */
    public getUnitInfo(uid: number) {
        return this._allUnits.get(uid);
    }
    /**删除某个单位 */
    public deleteUnit(uid: number) {
        if (this.unitIDS.indexOf(uid) >= 0) {
            this.clearDataByUid(uid);
            this.unitIDS.splice(this.unitIDS.indexOf(uid), 1);
        }
        if (SystemUtil.isClient() && globalThis.battleModuleClient.isLocalBattlePlayer(this.pid)) {
            this.realDeleteOnClient(uid);//删除这个单位
        }
        else {
            if (this._allUnits.has(uid)) {
                this._allUnits.delete(uid);
            }
        }
    }
    /**设置属性值(非权威端端调用会被同步覆盖) */
    public setAttr(uid: number, attr: string, val: unknown) {
        const index = this.unitIDS.indexOf(uid);//这个单位的属性索引
        if (index < 0) { return; }
        const arr = this.getAttrArrayByType(attr);
        const length = this.getvalueLength(attr);
        if (length > 1) {//数组集合信息要做特殊处理
            const indexBegin = index * length;
            for (let i = 0; i < length; i++) {
                arr[indexBegin + i] = val[i] ? val[i] : 0;
            }
        }
        else {
            arr[index] = val ? val : 0;
        }
        // this.getUnit(uid)[attr] = val as any;
        this.setDataToUnitInfo(attr, uid);
    }
    /**创建双端都持有的属性集 */
    protected abstract createDefaultUnitInfo(uid: number): IUnitInfo<T>;
    /**创建客户端控制对象 */
    protected abstract createClientObject(uid: number): T;
    /**获取各个属性的取值长度 */
    protected abstract getvalueLength(ty: string): number;
    /**获取所有属性的键名 */
    protected abstract get allKeys(): string[];
    /**创建此玩家的指定某个单位数据 */
    public createUnit(uid: number): IUnitInfo<T> {
        if (!this._allUnits.has(uid) && this.unitIDS.indexOf(uid) >= 0) {
            const defaultUnitInfo = this.createDefaultUnitInfo(uid);
            this._allUnits.set(uid, defaultUnitInfo)
            if (SystemUtil.isClient() && globalThis.battleModuleClient.isLocalBattlePlayer(this._pid)) {//客户端一定要生成表现对象组件
                this._allUnits.get(uid).object = this.createClientObject(uid);
            }
        }
        return this._allUnits.get(uid);
    }
    /**当所有单位被清理后要做的事 */
    public abstract onClaerAll();




    /**所有单位信息(外部友好的数据结构) */
    protected readonly _allUnits: Map<number, IUnitInfo<T>> = new Map();
    public static readonly AllScripts: Map<string, RoleAttrSync<any>> = new Map();
    @Core.Property({ replicated: true, onChanged: "oncreate" })
    private _pid: string;
    /**玩家唯一平台ID */
    public get pid() { return this._pid; }
    private oncreate() {
        RoleAttrSync.AllScripts.set(this._pid, this);
    }

    @Core.Property({ replicated: true, onChanged: "onIDChange" })
    /**可信数据 单位id */
    public readonly unitIDS: number[] = [];
    private onIDChange() {
        for (let i = 0; i < this.unitIDS.length; i++) {
            const uid = this.unitIDS[i];
            if (!this._allUnits.has(uid)) {//如果之前没有创建过这个单位，但可能属性已经被同步过来了
                this.createUnit(uid);
                for (const k of this.allKeys) {
                    this.setDataToUnitInfo(k, uid);
                }
            }
        }
        for (const [k] of this._allUnits) {//从已有的客户端数据集内与属性同步的单位ID做比对
            if (!this.unitIDS.includes(k)) {//属性同步上的单位ID已经不存在这个单位了，但是客户端数据还存在
                this.realDeleteOnClient(k);//删除这个单位
            }
        }
    }

}

/**双端的纯数据层单位对象 */
export interface IUnitInfo<T> {
    /**单位唯一ID */
    uid: number,
    /**逻辑运用单位类 */
    object: T

    /**其他自定义成员 */
    // [k: string]: unknown,

}


