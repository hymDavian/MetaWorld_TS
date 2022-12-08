/**动画机 */
export namespace AnimatorMachine {
    const _curAnimationMap: Map<string, [AnimatorClip, string]> = new Map();//角色动画集合
    const _curStanceMap: Map<string, [AnimatorClip, string]> = new Map();//角色姿态集合
    /**返回某个角色的当前执行的动画片信息
     * 注:动画片是一个全局的对象，并不特定属于某一个角色
     * @param guid 角色guid
     * @param stance 是否为姿态
     * @returns [AnimatorClip,string]
     */
    export function getCurrentClip(guid: string, stance: boolean): [AnimatorClip, string] {
        const map = stance ? _curStanceMap : _curAnimationMap;
        return map.get(guid);
    }
    /**使角色播放某个动画片
     * @param cls 动画脚本
     * @param role 播放的角色
     * @param info 动画播放的额外信息
     * @returns 返回是否成功播放
     */
    export function playAnimatorClip<T extends AnimatorClip>(cls: Class<T>, role: Gameplay.CharacterBase, info?: playInfo): boolean {
        if (!role) { return false; }//角色不存在
        const roleGuid = role.guid;
        const curClip = AnimatorClip["getClip"](cls);//将要执行的动画片段
        const useAsset = (info && info.coverGuid) ? info.coverGuid : curClip.defaultAsset;//当前需要执行的资源字符串
        if (curClip.bStance) {
            if (role.animationStance === useAsset) {//要换姿态，但是已经是这个姿态了，返回，不做多余操作
                return true;
            }
        }
        const map = curClip.bStance ? _curStanceMap : _curAnimationMap;
        const oldClip: AnimatorClip = map.has(roleGuid) ? map.get(roleGuid)[0] : null;
        if (oldClip) {//有老动画
            if (!info || !info.execute) {//没有额外优先级需求
                if (curClip.level < oldClip.level) {//新动画等级低于老动画
                    return false;//动画切换失败
                }
            }
            oldClip["toStop"](role);//停止老动画
        }
        curClip["toPlay"](role, info);
        map.set(roleGuid, [curClip, useAsset]);
        console.log(`${roleGuid} 动画等级切换 ${oldClip ? oldClip.level : 0}->${curClip.level}`);
        return true;
    }
    /**停止角色的当前动画
     * @param role 停止的角色
     * @param lv 停止类型 -1全部 0动画 1姿态
     * @returns 
     */
    export function stopByRole(role: Gameplay.CharacterBase, lv: stopType) {
        if (!role) { return; }//无法找到播放者
        const curAni = _curAnimationMap.has(role.guid) ? _curAnimationMap.get(role.guid) : null;//当前需要播放的角色的动画等级
        if (curAni && (lv === -1 || lv === 0)) {
            curAni[0]["toStop"](role);
            _curAnimationMap.delete(role.guid);
        }
        const curSt = _curStanceMap.has(role.guid) ? _curStanceMap.get(role.guid) : null;
        if (curSt && (lv === -1 || lv === 1)) {
            curSt[0]["toStop"](role);
            _curAnimationMap.delete(role.guid);
        }
    }
}

type stopType = -1 | 0 | 1;//停止等级字面变量 
type Class<T> = { new(...args: unknown[]): T };//类类型

/**动画片段 */
export abstract class AnimatorClip {
    private static readonly _clipClassMap: Map<string, AnimatorClip> = new Map();//动画片类对象集合
    protected constructor() { }
    /**获取某种动画片段 */
    private static getClip<T extends AnimatorClip>(cls: Class<T>): T {
        if (!AnimatorClip._clipClassMap.has(cls.name)) {
            AnimatorClip._clipClassMap.set(cls.name, new cls());
        }
        return AnimatorClip._clipClassMap.get(cls.name) as T;
    }
    private readonly _playingActors: Map<string, [Gameplay.Animation, () => void]> = new Map();
    /**将此动画片段在某个角色身上播放 尽量不要直接调用,使用动画机：AnimatorMachine */
    private toPlay(role: Gameplay.CharacterBase, info: playInfo) {
        if (!role) { return; }
        let useAsset = (info && info.coverGuid) ? info.coverGuid : this.defaultAsset;
        this.onPlayBegin(role, useAsset);
        if (this.bStance) {//是一个姿态
            role.animationStance = useAsset;
        }
        else {
            const ani = role.playAnimation(
                useAsset,
                (info && info.loop) ? 0 : 1,
                (info && info.speed != 1) ? info.speed : 1
            );
            this._playingActors.set(role.guid, [ani, info ? info.finish : null]);
            ani.onAnimFinished.add(() => {
                this.toStop(role);
            });
        }
    }
    /**停止 */
    private toStop(role: Gameplay.CharacterBase) {
        if (!role) { return; }
        if (this.bStance) {
            role.animationStance = "";
        }
        else {
            if (this._playingActors.has(role.guid)) {
                const ani = this._playingActors.get(role.guid);
                if (ani[0].isPlaying) {
                    ani[0].stop();
                }
                if (ani[1]) {
                    try {
                        ani[1]();
                    } catch (error) {
                        console.error("动画结束回调错误:" + error.stack);
                    }
                }
                this._playingActors.delete(role.guid);
            }
        }
        this.onPlayEnd(role);
    }

    /**此动画从角色上开始播放前调用 */
    protected abstract onPlayBegin(character: Gameplay.CharacterBase, asset: string);
    /**此动画从角色上停止播放后调用 */
    protected abstract onPlayEnd(character: Gameplay.CharacterBase);
}
export interface AnimatorClip {
    readonly defaultAsset: string;
    readonly level: number;
    readonly bStance: boolean;
}
/**装饰动画片信息 */
export function setAnimatorInfo(defaultAsset: string, aniLv: number, stance: boolean) {
    return function <T extends AnimatorClip>(constructor: Class<T>) {
        Object.defineProperty(constructor.prototype, 'defaultAsset', {
            value: defaultAsset
        });
        Object.defineProperty(constructor.prototype, 'level', {
            value: aniLv
        });
        Object.defineProperty(constructor.prototype, 'bStance', {
            value: stance
        });
    }
}
/**播放动画片段的辅助信息 */
export type playInfo = {
    /**是否循环 */
    loop?: boolean,
    /**播放速度 */
    speed?: number,
    /**完结回调,如果是个姿态，此项无效 */
    finish?: () => void,
    /**是否强制执行 */
    execute?: boolean,
    /**动画资源覆盖 */
    coverGuid?: string,
}