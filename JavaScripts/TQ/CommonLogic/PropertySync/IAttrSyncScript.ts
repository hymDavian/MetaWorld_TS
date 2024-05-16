namespace CustomDeclare {
    type Class<T> = { new(...args: unknown[]): T };//类类型
    export let attrSyncCls: Class<mwSyncScript> = null;
    export const attrSync: mwSyncScript = null;
    /**属性同步脚本限定类 */
    export abstract class mwSyncScript extends mw.Script {
        /**属性缓存 */
        private readonly _cacheAllRole: Map<number, AttrKeysToNumber> = new Map();

        protected onStart(): void {
            (CustomDeclare as any)["attrSync"] = this;

            if (SystemUtil.isServer()) {
                this.useUpdate = true;
            }
        }
        protected onUpdate(dt: number): void {
            if (this._cacheNetTasks.length > 0) {
                const tempArr: number[] = [];
                this._cacheNetTasks.forEach(val => {
                    tempArr.push(val.id, val.type, val.value);
                });
                this._cacheNetTasks.length = 0;
                this._attrs = tempArr;
            }
        }


        public setAttr(id: number, type: EBattleProperty, value: number) {
            if (SystemUtil.isClient()) { return; }//只能由服务器调用
            const strkey = EBattleProperty[type] as EBattlePropertyKeys;
            if (this._cacheAllRole.has(id)) {
                const oldVal = this._cacheAllRole.get(id)[strkey];
                if (oldVal != null && oldVal == value) {
                    return;
                }
            }
            else {
                this._cacheAllRole.set(id, { [strkey]: value });
            }

            this._cacheNetTasks.push({ id, type, value });
        }


        private _cacheNetTasks: { id: number, type: EBattleProperty, value: number }[] = [];

        @mw.Property({ replicated: true, onChanged: "attUpdate" })
        private _attrs: number[] = [];

        private attUpdate() {
            for (let i = 0; i < this._attrs.length - 3; i += 3) {
                const [id, ty, val] = [this._attrs[i], this._attrs[i + 1], this._attrs[i + 2]];
                const strkey = EBattleProperty[ty] as EBattlePropertyKeys;
                if (this._cacheAllRole.has(id)) {
                    const oldVal = this._cacheAllRole.get(id)[strkey];
                    if (oldVal != null && oldVal == val) {
                        continue;
                    }
                }
                this.onAttrChange(id, ty, val);
                if (!this._cacheAllRole.has(id)) {
                    this._cacheAllRole.set(id, { [strkey]: val });
                }
                else {
                    this._cacheAllRole.get(id)[strkey] = val;
                }
            }
        }

        /**任意属性在服务器上被更新了 */
        protected abstract onAttrChange(id: number, type: EBattleProperty, value: number);

    }
}
//0 1 2 3 4 5 6 7 8
globalThis.CustomDeclare = globalThis.CustomDeclare == null ? CustomDeclare : { ...globalThis.CustomDeclare, ...CustomDeclare };