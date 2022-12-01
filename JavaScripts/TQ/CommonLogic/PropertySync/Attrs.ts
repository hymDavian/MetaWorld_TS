/**角色属性属性同步定义 */
export enum ERoleProperty {
    //占位的俩个冷热武器
    HotWeapon,
    ColdWeapon,
    //Item表的ItemType定义，仅对玩家有效
    /**上衣 */
    Skin_UpCloth,
    /**裤子 */
    Skin_LowCloth,
    /**帽子 */
    Skin_Hat,
    /**手套 */
    Skin_Gloves,
    /**鞋子 */
    Skin_Shoe,


    //角色配置定义的角色属性-----------------------------
    /**当前血量 */
    CurHp,
    /**最大血量 */
    MaxHp,
    /**冲量抗性 */
    ImpulseDef,
    /**防御力 */
    Defence,
    /**基础攻击力 */
    BaseAtk,
    /**攻击增幅 */
    ExDamage,
    /**走路速度 */
    WalkSpeed,
    /**跑步速度 */
    RunSpeed,


    //自定义的属性-------------------------------
    /**等级 */
    Level,
    /**存活状态 0死亡1存活 */
    IsLife,
    /**最后一次受到伤害的来源 */
    LastHurtSource,
    /**额外移动速度(百分比) */
    ExSpeed,
    /**当前的移动状态 0:走路 1:跑步 */
    CurMoveState,

    /**是否被变形 (无法攻击) 0否 1是 */
    Deformation,

    /**当前模型高度 */
    Height,

}

/**仅在服务器上存在的属性,不需要同步给其他玩家 */
export const ERolePropertyServer: Set<ERoleProperty> = new Set([
    ERoleProperty.LastHurtSource,
    ERoleProperty.ExSpeed,
    ERoleProperty.CurMoveState,
    ERoleProperty.RunSpeed,
    ERoleProperty.WalkSpeed,
    ERoleProperty.Defence,
    ERoleProperty.Skin_Gloves,
    ERoleProperty.Skin_Hat,
    ERoleProperty.Skin_LowCloth,
    ERoleProperty.Skin_Shoe,
    ERoleProperty.Skin_UpCloth,
]);


/**配置表上的ID和实际运用的代码枚举对应关系 */
export const LongNum = {
    [2]: ERoleProperty.Skin_UpCloth,
    [3]: ERoleProperty.Skin_LowCloth,
    [4]: ERoleProperty.Skin_Hat,
    [5]: ERoleProperty.Skin_Gloves,
    [6]: ERoleProperty.Skin_Shoe,
    [1000]: ERoleProperty.CurHp,
    [1001]: ERoleProperty.MaxHp,
    [1002]: ERoleProperty.ImpulseDef,
    [1004]: ERoleProperty.Defence,
    [1005]: ERoleProperty.ExDamage,
    [1006]: ERoleProperty.BaseAtk,
    [1007]: ERoleProperty.WalkSpeed,
    [1008]: ERoleProperty.RunSpeed,

}