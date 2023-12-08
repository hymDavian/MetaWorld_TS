type Class<T> = { new(...args: any[]): T }

const EVENT_RANK_REP = "EVENT_RANK_REP";
const EVENT_RANK_REQ = "EVENT_RANK_REQ";

/**
 * 排行榜工具类，泛型参数为每条排行所用的数据类型
 */
export class RankLogic<T> {
    /**是否是 C/S 数据传输结构 */
    private readonly C2S: boolean = true;
    /**使用的传输类名作为事件监听标志符 */
    private readonly infoTypeName: string = null;
    /**排序依据 */
    private readonly sortBasis: [string, number, boolean][] = [];

    private readonly abreast: boolean = false;

    constructor(infoName: Class<T>, property: { c2s: boolean, abreast: boolean } = { c2s: true, abreast: false }) {
        this.infoTypeName = infoName.name;
        this.C2S = property.c2s;
        this.abreast = property.abreast;
        this.clientInit();
        this.serverInit();
    }

    /**获得排行榜数据后干的事情 */
    private uiAct: (infos: [number, T][]) => void = null;
    /**被请求后如何创建排行榜数据的函数 */
    private dataAct: () => T[] = null;

    /**注册 收到排行榜后执行排行数据 */
    private clientInit() {
        let eventFunc = this.C2S ? mw.Event.addServerListener : mw.Event.addLocalListener;

        eventFunc(`${EVENT_RANK_REP}_${this.infoTypeName}`, (infos: T[]) => {
            if (this.uiAct) {
                const doactInofs: [number, T][] = [];
                if (this.sortBasis.length > 0) {
                    infos.sort(this.sortFunc);
                    let rankIndex = 1;
                    //当前拿到的首个跟上一个的排行值不等 或 不存在第一个值
                    // if (doactInofs.length < 0 || !this.isEqual(doactInofs[doactInofs.length - 1][1], getFirst)) {
                    //     rankIndex++//排行+1
                    // }
                    // doactInofs.push([rankIndex, getFirst]);
                    for (let i = 0; i < infos.length; i++) {
                        if (this.abreast) {//存在并列的情况
                            if (doactInofs.length > 0) {//有上一个进入值了
                                //与当前做比较，如果不同
                                if (!this.isEqual(doactInofs[doactInofs.length - 1][1], infos[i])) {
                                    rankIndex = doactInofs.length + 1 //排行+1
                                }
                            }
                        }
                        else {
                            rankIndex++;
                        }
                        doactInofs.push([rankIndex, infos[i]]);
                    }
                }
                this.uiAct(doactInofs);
            }
        })
    }
    private sortFunc(a: T, b: T): number {
        if (this.isEqual(a, b)) {
            return 0;
        }
        type kt = keyof T;
        for (let i = 0; i < this.sortBasis.length; i++) {
            //依据[i]的字段名排序
            const isUp = this.sortBasis[i][2];
            const ka = this.sortBasis[i][0] as kt;
            const kb = this.sortBasis[i][0] as kt;
            if (a[ka] == null || a[ka] == undefined || b[kb] == null || b[kb] == undefined) { continue; }//不存在这个字段
            if (a[ka] == b[kb]) { continue; }//字段值相等
            let [na, nb] = [Number(a[ka]), Number(b[kb])];
            if (Number.isNaN(na) || Number.isNaN(nb)) { continue; }//无法转为数字

            //最后，比较字段的值，进行排序,根据字段是否为更高值选择往前还是往后排
            return isUp ? nb - na : na - nb;
        }

        return 0
    }
    /**判断两个对象的排序依据内容是否相等 */
    private isEqual(a: T, b: T): boolean {
        type kt = keyof T;
        for (let i = 0; i < this.sortBasis.length; i++) {
            //依据[i]的字段名排序
            const k = this.sortBasis[i][0] as kt;
            if (a[k] != b[k]) {//查找到任何一个不等
                return false;
            }
        }

        return true;
    }

    /**注册 收到请求后创建并发送排行数据 */
    private serverInit() {
        if (this.C2S) {
            mw.Event.addClientListener(`${EVENT_RANK_REQ}_${this.infoTypeName}`, (player) => {
                this.sendRank(player);
            })
        }
        else {
            mw.Event.addLocalListener(`${EVENT_RANK_REQ}_${this.infoTypeName}`, () => {
                let data: T[] = this.dataAct ? this.dataAct() : [];
                mw.Event.dispatchToLocal(`${EVENT_RANK_REP}_${this.infoTypeName}`, data);
            })
        }
    }


    /**[client] 主动请求刷新排行榜 */
    public requestRank(): void {
        if (SystemUtil.isClient()) {
            if (this.C2S) {
                mw.Event.dispatchToServer(`${EVENT_RANK_REQ}_${this.infoTypeName}`);
            }
            else {
                mw.Event.dispatchToLocal(`${EVENT_RANK_REQ}_${this.infoTypeName}`);
            }

        }
    }

    /**主动发送排行榜数据给对应客户端,C2C时主动发送给自身，pid无效 */
    public sendRank(pid: number | mw.Player, data?: T[]) {
        if (!data) {
            data = this.dataAct ? this.dataAct() : [];
        }
        if (data.length <= 0) {
            return;
        }
        if (this.C2S && SystemUtil.isServer()) {
            let p: mw.Player = (pid instanceof mw.Player) ? pid : mw.Player.getPlayer(pid);

            mw.Event.dispatchToClient(p, `${EVENT_RANK_REP}_${this.infoTypeName}`, data);
        }
        else {
            mw.Event.dispatchToLocal(`${EVENT_RANK_REP}_${this.infoTypeName}`, data);
        }
    }

    /**[server] 仅服务器调用，给所有玩家发送排行数据*/
    public sendAllRank(data?: T[]) {
        if (!this.C2S || SystemUtil.isClient()) { return; }

        if (!data) {
            data = this.dataAct ? this.dataAct() : [];
        }

        mw.Player.getAllPlayers().forEach(p => {
            mw.Event.dispatchToClient(p, `${EVENT_RANK_REP}_${this.infoTypeName}`, data);
        });


    }


    /**设置客户端收到排行榜数据后的所作行为 */
    public setClientAction(action: (infos: [number, T][]) => void) {
        this.uiAct = action;
    }

    /**设置服务器的排行榜数据生成函数 */
    public setCreateData(action: () => T[]) {
        this.dataAct = action;
    }

    /**设置排序依据 [字段名,优先级,此值更高是往前排] 。。。 */
    public setSortBasis(...basis: [string, number, boolean][]) {
        this.sortBasis.length = 0;
        basis.sort((a, b) => {
            return b[1] - a[1];
        })
        this.sortBasis.push(...basis);
    }


}




