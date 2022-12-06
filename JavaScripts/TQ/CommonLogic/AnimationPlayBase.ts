type Class<T> = { new(...args: unknown[]): T };//类类型
type findObjectFunc = (id: number) => Gameplay.CharacterBase;//根据ID查找角色的函数行为类型
const curAnimationState: Map<number, AnimationPlayBase> = new Map();//角色ID对应的动画当前状态
type playInfo = {
    /**是否循环 */
    loop?: boolean,
    /**播放速度 */
    speed?: number,
    /**完结回调 */
    finish?: () => void,
    /**是否强制执行 */
    execute?: boolean,
    /**动画资源覆盖 */
    coverGuid?: string
}
/**动画播放基类 */
export abstract class AnimationPlayBase {
    protected get _asset(): string {
        return this["asset"];
    }
    protected get _level(): EAnimationLevel {
        return this["level"];
    }
    private static aniObjMap: Map<string, AnimationPlayBase> = new Map();
    private static getAniByClass<T extends AnimationPlayBase>(cls: Class<T>): T {
        if (!AnimationPlayBase.aniObjMap.has(cls.name)) {
            const ani = new cls();
            AnimationPlayBase.aniObjMap.set(cls.name, ani);
        }
        return AnimationPlayBase.aniObjMap.get(cls.name) as T;
    }
    private static findObject: findObjectFunc = null;//如何去根据ID拿到动画播放者角色的方式
    /**初始化注册根据ID查找角色的方式 */
    public static registerGetObjectFunc(f: findObjectFunc) {
        AnimationPlayBase.findObject = f;
    }
    /**让目标播放此动画，会正确执行相关动画优先级，并返回是否可以播放
     * 
     * @param cls 动画片脚本对象
     * @param objID 播放动画的角色
     */
    public static playToChar<T extends AnimationPlayBase>(cls: Class<T>, objID: number, info?: playInfo): boolean {
        if (!AnimationPlayBase.findObject) { return false; }//无法找到播放者
        const char = AnimationPlayBase.findObject(objID);
        if (!char) { return false; }
        const curAni = AnimationPlayBase.getAniByClass(cls);//当前需要被播放的动画
        if (!info || !info.execute) {//没有额外执行参数，或不需要强制执行
            //正常判断动画等级
            const oldAni = curAnimationState.has(objID) ? curAnimationState.get(objID) : null;//以前播放的动画
            if (oldAni && curAni._level < oldAni._level) {//此动画的优先级低于此角色当前动画的等级
                return false;
            }
        }
        curAni.toPlay(objID, info);
        curAnimationState.set(objID, curAni);//设置到新动画
        return true;
    }

    /**停止某个单位当前动画 */
    public static stopByChar(objID: number) {
        if (!AnimationPlayBase.findObject) { return; }//无法找到播放者
        const char = AnimationPlayBase.findObject(objID);
        if (!char) { return; }
        const curAni = curAnimationState.has(objID) ? curAnimationState.get(objID) : null;//当前需要播放的角色的动画等级
        if (curAni) {
            curAni.toStop(objID);
        }
    }


    /**播放此脚本的动画信息集合 */
    private _aniPlayInfo: Map<number, Gameplay.Animation> = new Map();
    private toPlay(objID: number, info?: playInfo) {
        const obj = AnimationPlayBase.findObject(objID);
        if (!obj) { return; }
        this.onPlayBegin(obj, objID);
        if (this._asset && this._asset.length > 0) {
            const ani = obj.playAnimation((info && info.coverGuid) ? info.coverGuid : this._asset, (info && info.loop) ? 0 : 1, (info && info.speed != 1) ? info.speed : 1);
            this._aniPlayInfo.set(objID, ani);
            ani.onAnimFinished.add(() => {
                if (info && info.finish) {
                    info.finish();
                }
                this._aniPlayInfo.delete(objID);
                this.toStop(objID);
            });
        }
        else {
            if (info && info.finish) {
                info.finish();
            }
        }
    }

    private toStop(id: number) {
        const ani = this._aniPlayInfo.get(id);
        if (ani) {
            ani.stop();
            this._aniPlayInfo.delete(id);
        }
        if (this._level != EAnimationLevel.Normal && this._level != EAnimationLevel.Die) {//当前不是一般动画，也不是死亡动画，在停止时都要回到一般动画
            AnimationPlayBase.playToChar(NormalAnimation, id, null);
        }
        const obj = AnimationPlayBase.findObject(id);
        if (obj) {
            this.onPlayEnd(obj, id);
        }
    }

    /**当此动画刚开始播放后要做的事 */
    protected abstract onPlayBegin(char: Gameplay.CharacterBase, roleID: number);
    /**当此动画结束播放后要做的事 */
    protected abstract onPlayEnd(char: Gameplay.CharacterBase, roleID: number);
}

export interface AnimationPlayBase {
    readonly asset: string;
    readonly level: EAnimationLevel;
}

/**设置动画脚本默认动画资源和等级信息
 * 
 * @param defaultAsset 默认动画
 * @param aniLv 播放等级
 * @returns 
 */
export function setAnimationInfo(defaultAsset: string, aniLv: EAnimationLevel) {
    return function <T extends AnimationPlayBase>(constructor: Class<T>) {
        Object.defineProperty(constructor.prototype, 'asset', {
            value: defaultAsset
        });
        Object.defineProperty(constructor.prototype, 'level', {
            value: aniLv
        });
    }
}

//同级动画可以互相覆盖，低级动画不会覆盖高级动画
/**动画类型和优先级 */
export enum EAnimationLevel {
    /**一般闲置 */
    Normal,
    /**受击 */
    GetDmg,
    /**使用武器(包括装卸) */
    UseWeapon,
    /**飞扑 */
    Jump,
    /**飞行中(被击飞，被传送) */
    Fly,
    /**趴在地面上，倒地 */
    FallDown,
    /**其他类型 */
    Other,
    /**死亡 */
    Die,
}

@setAnimationInfo("", EAnimationLevel.Normal)
export class NormalAnimation extends AnimationPlayBase {
    protected onPlayEnd(char: Gameplay.CharacterBase, roleID: number) {
        console.log(roleID + "离开闲置动画")
    }
    protected onPlayBegin(char: Gameplay.CharacterBase, roleID: number) {
        console.log(roleID + "回到闲置动画")
    }

}