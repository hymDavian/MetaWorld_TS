namespace IntervalMgr {
    const baseDotTimeStep = 100;//基本执行间隔，最少的执行周期都会在此之后开始执行
    class TimerInfo {
        /**唯一标识 */
        readonly key: number;
        constructor(_k: number) { this.key = _k; }
        /**周期时间 */
        targetTime: number;
        /**计算时间 */
        time: number;
        /**执行回调 */
        callback: () => void;
        /**被停止时是否需要执行一次回调 */
        stopDo: boolean;
        /**是否处于冻结状态 */
        freeze: boolean;
    }

    const timeAction: Map<number, TimerInfo> = new Map();
    let inited: boolean = false;
    let passTime: number = 0;
    let keySeed: number = 0;
    const keyPool: number[] = [];
    function init() {
        if (inited) { return; }
        inited = true;
        passTime = Date.now();
        setInterval(() => {
            const t = Date.now() - passTime;
            for (const timer of timeAction.values()) {
                if (timer.freeze) { continue; }//冻结状态不参与计时增加
                timer.time += t;
                if (timer.time >= timer.targetTime) {
                    timer.callback();
                    timer.time -= timer.targetTime;
                }
            }
        }, baseDotTimeStep)
    }

    /** 设置一个间隔运行的周期函数 返回此周期任务的唯一key,可以通过此key移除或暂停此周期任务
     * @param key 唯一标识
     * @param time 周期间隔(毫秒ms)
     * @param act 执行回调
     * @param stopDo 是否在被结束时运行一次
     */
    export function setIntervalAction(time: number, act: () => void, stopDo: boolean = false): number {
        init();
        const key = keyPool.length > 0 ? keyPool.shift() : ++keySeed;
        let content: TimerInfo = null;
        //之前设置过此key
        if (timeAction.has(key)) {
            content = timeAction.get(key);
            if (content.stopDo) {//需要在结束时执行一次回调
                content.callback();
            }
        }
        else {
            timeAction.set(key, new TimerInfo(key));
        }
        content.freeze = false;//每次设置都必然不是冻结状态
        content.time = 0;
        content.targetTime = time;
        content.callback = act;
        content.stopDo = stopDo;
        return key;
    }

    /**停止指定周期函数 */
    export function stopInterval(key: number) {
        if (timeAction.has(key)) {
            const content = timeAction.get(key);
            if (content.stopDo) {//需要在结束时执行一次回调
                content.callback();
            }
            timeAction.delete(key);
            keyPool.push(key);
        }
    }

    /**设置周期函数是否冻结 */
    export function setFreezeInterval(key: number, freeze: boolean) {
        if (timeAction.has(key)) {
            const content = timeAction.get(key);
            if (content.freeze && !freeze) {//如果时从非冻结态变为冻结态，将计时归零
                content.time = 0;
            }
            content.freeze = freeze;
        }
    }


}

export { IntervalMgr }