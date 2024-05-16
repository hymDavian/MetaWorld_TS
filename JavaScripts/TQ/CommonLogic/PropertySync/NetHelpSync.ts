interface INetHelpSync {
    /**服务器通知 */
    syncData(pid: number, key: string, data: string);

    /**客户端响应事件集 */
    get onSyncData(): TAction<[netPckInfo[]]>
}

/**网络同步帮助对象，需要外部去继承 NetHelpSync 并在服务器进行双端生成这个脚本对象 */
declare var nethelp: INetHelpSync;

type netPckInfo = { pid: number, key: string, data: string };
abstract class NetHelpSync extends mw.Script implements INetHelpSync {
    private readonly _waitClientRoleTasks: Map<number, (() => void)[]> = new Map();//等待实际玩家存在后要执行的逻辑
    private readonly _tickDistance: number = 3;//多少帧同步一次数据
    private _tick: number = 0;
    private readonly _cacheTasks: netPckInfo[] = [];//缓存的此帧段内需同步的值
    private _netid: number = 0;//当前的网络包id
    private groupid: number = 0;//当前的网络组id
    private readonly _serverCacheLength: number = 100;//服务器缓存的网络帧数据最大长度
    private readonly _serverPcks: { groupid: number, netid: number, data: netPckInfo[] }[] = [];//服务器缓存的网络帧数据

    protected onStart(): void {
        globalThis.nethelp = this;
        this.useUpdate = true;

        if (SystemUtil.isClient()) {
            this.initClientEvent();
        }
        if (SystemUtil.isServer()) {
            this.initServerEvent();
        }
    }

    protected onUpdate(dt: number): void {
        if (SystemUtil.isServer()) {
            this._tick++;
            if (this._tick % this._tickDistance === 0) {
                const tempsync: string[] = [this.groupid.toString(), (this._netid++).toString()];//实际传输的序列化对象 格式：groupid, netid,pid,key,data,pid,key,data...
                for (const task of this._cacheTasks) {
                    tempsync.push(task.pid.toString());
                    tempsync.push(task.key);
                    tempsync.push(task.data);
                }
                this._tickData = tempsync;//进行赋值，触发属性同步给客户端
                let curpcks = { groupid: this.groupid, netid: this._netid, data: this._cacheTasks.slice() };
                this._serverPcks.push(curpcks);//缓存当前帧网络数据
                if (this._netid > this._serverCacheLength) { //服务器仅维护一定长度的网络帧数据
                    this._netid = 0;
                    this.groupid++;
                }
                if (this._serverPcks.length > this._serverCacheLength) {
                    this._serverPcks.shift();//排除最早的数据
                }
                this._cacheTasks.length = 0;//清空传输块
            }
        }
        if (SystemUtil.isClient()) {
            if (this._waitClientRoleTasks.size > 0) {
                for (const [pid, tasks] of this._waitClientRoleTasks) {
                    if (Player.getPlayer(pid)) {
                        for (const task of tasks) {
                            task();
                        }
                        this._waitClientRoleTasks.delete(pid);
                    }
                }
            }
        }
    }


    //#endregion 客户端同步收到信息的处理
    private _clientNetID: { netid: number, groupid: number } = null;//客户端当前的网络帧序号


    @mw.Property({ replicated: true, onChanged: "onNetTickDataSync" })
    private _tickData: string[] = [];
    private onNetTickDataSync() {
        const [groupidstr, netidstr, ...data] = this._tickData;
        const groupid = Number(groupidstr);
        const netid = Number(netidstr);
        if (this._clientNetID == null) {
            const clientInfo: netPckInfo[] = [];
            for (let i = 0; i < data.length; i += 3) {//转字符串数组为实际使用类型数据
                clientInfo.push({ pid: Number(data[i]), key: data[i + 1], data: data[i + 2] });
            }
            this.callServerSyncData(groupid, netid, clientInfo);
            return;
        }

        if (this._clientNetID.groupid == groupid && this._clientNetID.netid == netid) { return; }//重复数据
        if (this._clientNetID.groupid > groupid) { return; }//过时数据
        if (this._clientNetID.groupid == groupid && this._clientNetID.netid > netid) { return; }//过时数据
        //预期应该获取的数据
        let { groupid: willgroupid, netid: willnetid } = this.willNetID;

        if (groupid == willgroupid && netid == willnetid) {//复合预期的网络ID
            const clientInfo: netPckInfo[] = [];
            for (let i = 0; i < data.length; i += 3) {//转字符串数组为实际使用类型数据
                clientInfo.push({ pid: Number(data[i]), key: data[i + 1], data: data[i + 2] });
            }
            this.callServerSyncData(groupid, netid, clientInfo);
        }
        else {
            this.requestServerSyncData();
        }

    }

    //具体执行通知客户端网络逻辑
    private callServerSyncData(groupid: number, netid: number, data: netPckInfo[]) {
        this._clientNetID = { groupid: groupid, netid: netid };
        this.onSyncData.call(data);
    }

    //服务器网络通知的具体逻辑实现


    private get willNetID(): { groupid: number, netid: number } {
        if (this._clientNetID.netid === this._serverCacheLength) {
            return { groupid: this._clientNetID.groupid + 1, netid: 0 };
        }
        else {
            return { groupid: this._clientNetID.groupid, netid: this._clientNetID.netid + 1 };
        }
    }

    //#region 

    //客户端请求补发
    private requestServerSyncData() {
        let { groupid: willgroupid, netid: willnetid } = this.willNetID;
        //请求服务器稳定补发数据 
        Event.dispatchToServer("Request_NetHelpSync", { groupid: willgroupid, netid: willnetid });
    }

    private initClientEvent() {
        //服务器补发数据响应
        Event.addServerListener("Response_NetHelpSync", (netdatas: { groupid: number, netid: number, data: netPckInfo[] }[]) => {

            for (const netdata of netdatas) {
                let { groupid: willgroupid, netid: willnetid } = this.willNetID;
                if (netdata.groupid >= willgroupid && netdata.netid === willnetid) {
                    this.callServerSyncData(netdata.groupid, netdata.netid, netdata.data);
                    return;
                }
            }
        });
    }

    private initServerEvent() {
        Event.addClientListener("Request_NetHelpSync", (p, reqid: { groupid: number, netid: number }) => {
            const send: { groupid: number, netid: number, data: netPckInfo[] }[] = [];
            for (const pck of this._serverPcks) {
                if (pck.groupid >= reqid.groupid && pck.netid >= reqid.netid) {
                    send.push(pck);
                }
            }
            Event.dispatchToClient(p, "Response_NetHelpSync", send);
        });
    }





    protected clientPlayer(pid: number, callback: () => void) {
        if (pid === -1 || Player.getPlayer(pid)) {
            callback();
        }
        else {
            let tasks = this._waitClientRoleTasks.get(pid);
            if (!tasks) {
                tasks = [];
                this._waitClientRoleTasks.set(pid, tasks);
            }
            tasks.push(callback);
        }
    }


    public syncData(pid: number, key: string, data: string) {
        if (SystemUtil.isClient()) return;
        this._cacheTasks.push({ pid: pid, key: key, data: data });
    }

    /**客户端响应网络通知事件 */
    public abstract get onSyncData(): TAction<[netPckInfo[]]>;

}

(globalThis as any)["NetHelpSync"] = NetHelpSync;