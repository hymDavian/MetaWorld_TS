
/**奖励收发工具 */
export namespace rewardLogic {
    const EVENT_RECEIVE_REWARD = "EVENT_RECEIVE_REWARD";
    let getLog: boolean = false;
    type rewardAct = (pid: number, items: unknown[]) => void;
    let actions_C: Map<number, rewardAct[]> = new Map();
    let actions_S: Map<number, rewardAct[]> = new Map();

    /**[C/S] 注册领取奖励时执行的事情 */
    export function setReceiveFunc(cmd: number, act: rewardAct) {
        let map = Gameplay.isClient() ? actions_C : actions_S;

        if (!map.has(cmd)) {
            map.set(cmd, []);
        }
        map.get(cmd).push(act)
    }

    /**[C/S] 初始化*/
    export function initRewardAct(log: boolean = false) {
        if (Gameplay.isClient()) {
            Events.addServerListener(EVENT_RECEIVE_REWARD, doRewardAction)
        }
        getLog = log;
    }

    /**
     * [Server] 发放奖励
     * @param pid 发给谁
     * @param cmd 收到后执行哪种操作
     * @param items 具体奖励内容组
     */
    export function sendReward(pid: number, cmd: number, ...items: unknown[]) {
        if (Gameplay.isClient()) { return; }
        //通知自身
        doRewardAction(pid, cmd, items);//服务器本身的奖励领取
        //然后通知客户端
        Events.dispatchToClient(Gameplay.getPlayer(pid), EVENT_RECEIVE_REWARD, pid, cmd, items);

    }

    function doRewardAction(pid: number, ty: number, rws: unknown[]) {
        if (getLog) {
            console.log(`\n${pid} 收到奖励类型 ${ty} :\n ${JSON.stringify(rws)}`);
        }
        let map = Gameplay.isClient() ? actions_C : actions_S;
        if (map.has(ty)) {
            map.get(ty).forEach(act => {
                act(pid, rws);
            })
        }
    }

}