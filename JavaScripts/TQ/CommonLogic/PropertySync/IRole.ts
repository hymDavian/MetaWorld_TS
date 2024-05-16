namespace CustomDeclare {

    /**属性枚举 */
    export enum EBattleProperty {
        /**血量 */
        Hp,
        /**能量 */
        Energy,
        /**移动速度 */
        MoveSpeed,
    }

    /**属性操作对象类 */
    export interface IRoleBattleProperty<T extends string> {
        readonly ownerKey: number;
        readonly attrFlag: T;
        /**基础值 */
        base: number;
        /**额外百分比 */
        pct: number;
        /**额外固定值 */
        add: number;
        /**清除所有值信息 */
        clear(): IRoleBattleProperty<T>;
        /**获取当前计算总值 */
        get value(): number;
    }

    /**属性枚举字面字符集 */
    export type EBattlePropertyKeys = keyof typeof EBattleProperty;
    /**属性枚举对应数字字段集 */
    export type AttrKeysToNumber = { [k in EBattlePropertyKeys]?: number };
    /**属性操作对象集 */
    export type BattleATTRS = {
        readonly [k in EBattlePropertyKeys]: IRoleBattleProperty<EBattlePropertyKeys>;
    };

}


globalThis.CustomDeclare = globalThis.CustomDeclare == null ? CustomDeclare : { ...globalThis.CustomDeclare, ...CustomDeclare };

