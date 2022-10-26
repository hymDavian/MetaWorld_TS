// import { Class } from "./Tools";

/**网络管理器 */
export namespace NetManager {
    const netInstanceObj: Map<string, NetModuleBase> = new Map();//网络实例对象
    const EVENT_NETMGR_SEND_SERVER = "EVENT_NETMGR_SEND_SERVER";//发送到服务器
    const EVENT_NETMGR_SEND_CLIENT = "EVENT_NETMGR_SEND_CLIENT";//发送到客户端
    const EVENT_NETMGR_PLAYERENTER = "EVENT_NETMGR_PLAYERENTER";//客户端初始化完成了
    type respFunc = { objType: string, func: (...arg: unknown[]) => void, cmdid: number };//收到消息后干的事儿
    const netRegistFunc: Map<number, respFunc[]> = new Map();//所有网络回调集合
    /**网络数据格式 */
    interface INetPackage {
        data: any[],
        cmdid: number,
    }
    /**服务器发送给客户端的消息 */
    class sendClientPackage implements INetPackage {
        data: any[];
        cmdid: number;
        errorid: number;

    }
    /**客户端发送给服务器的消息 */
    class sendServerPackage implements INetPackage {
        data: any[];
        cmdid: number;
        pid: number;
    }

    type errorTipsAct = { errorid: number, act: string | ((id: number) => void) };//错误提示方式
    const errorMap: Map<number, errorTipsAct> = new Map();

    /**[client] 注册收到错误信息后的提示 */
    export function setErrorTips(errorid: number, tips: string | ((id: number) => void)) {
        if (Gameplay.isClient()) {
            errorMap.set(errorid, { errorid: errorid, act: tips });
        }
    }


    /**发送网络数据 不会触发同端的对应cmd函数
     * 例如，如果在客户端合服务器都定义了cmd 1 的函数，如果是客户端执行sendNet，只会调用服务器的 cmd 1 的函数，同理服务器也只会通知客户端的cmd 1
     * 
     * @param cmd 操作ID
     * @param data 数据
     * @param pid [server]发送给谁
     * @param errorid [server]错误提示
     */
    export function sendNet(cmd: number, data: any[], pid?: number, errorid: number = 0) {
        if (Gameplay.isServer()) {
            let net: sendClientPackage = {
                errorid: errorid,
                data: data,
                cmdid: cmd
            }
            if (pid) {
                let p = Gameplay.getPlayer(pid);
                if (p) {
                    Events.dispatchToClient(p, EVENT_NETMGR_SEND_CLIENT, net);
                }
                else {
                    console.error("not find player:" + pid)
                }
            }
            else {
                Events.dispatchToAllClient(EVENT_NETMGR_SEND_CLIENT, net);
            }
        }
        if (Gameplay.isClient()) {
            let locPlayer = Gameplay.getCurrentPlayer();
            if (!locPlayer) {
                console.error("current player notFind !")
                return;
            }
            let net: sendServerPackage = {
                data: data,
                cmdid: cmd,
                pid: locPlayer.getPlayerID()
            }
            Events.dispatchToServer(EVENT_NETMGR_SEND_SERVER, net);
        }

    }

    /**网络传输初始化 */
    export function initNetMgr() {
        if (Gameplay.isServer()) {
            //收到来自客户端的数据时
            Events.addClientListener(EVENT_NETMGR_SEND_SERVER, (p: Gameplay.Player, net: sendServerPackage) => {
                const netFunc = netRegistFunc.get(net.cmdid);
                if (netFunc) {
                    for (let f of netFunc) {
                        let obj = netInstanceObj.get(f.objType);
                        if (!obj) { continue; }
                        try {
                            f.func.call(obj, net.pid, ...net.data);
                        } catch (error) {
                            console.error("net response error!");
                            console.error(error.stack);
                        }

                    }
                }
            })
            //客户端初始化完成
            Events.addClientListener(EVENT_NETMGR_PLAYERENTER, p => {
                for (let [k, v] of netInstanceObj) {
                    v["playerEnter"](p.getPlayerID());
                }
            })
        }

        if (Gameplay.isClient()) {
            //收到来自服务器的数据
            Events.addServerListener(EVENT_NETMGR_SEND_CLIENT, (net: sendClientPackage) => {
                if (errorMap.has(net.errorid)) {//错误提示
                    let tip = errorMap.get(net.errorid);
                    if (typeof tip.act == "string") {
                        console.log(tip);
                    }
                    else {
                        tip.act(net.errorid);
                    }
                }
                const netFunc = netRegistFunc.get(net.cmdid);
                if (netFunc) {
                    for (let f of netFunc) {
                        let obj = netInstanceObj.get(f.objType);
                        if (!obj) { continue; }
                        try {
                            f.func.call(obj, ...net.data);
                        } catch (error) {
                            console.error("net response error!");
                            console.error(error.stack);
                        }

                    }
                }

            })
        }

        for (let [k, v] of netInstanceObj) {
            v["start"]();
        }

        if (Gameplay.isClient()) {
            Events.dispatchToServer(EVENT_NETMGR_PLAYERENTER);//此客户端初始化完成了，所有模块start已经走完，通知服务器，玩家进入
        }
    }

    let time: number = 0;
    /**帧更新逻辑驱动 */
    export function update() {
        const now = Date.now();
        if (time == 0) { time = now };
        for (let [k, v] of netInstanceObj) {
            v["update"](now - time);
        }
        time = now;
    }




    /**装饰器，注册网络类 */
    export function netFlagClass<T extends { new(...args: any[]): NetModuleBase }>(constructor: T) {
        const netObj = new constructor();
        netInstanceObj.set(constructor.name, netObj);
    }


    /**装饰器，注册网络回调,如果是个服务器回调，注册函数的第一个参数一定得是玩家ID */
    export function netFlagFunc(cmdid: number) {
        return function (target: any, propertyRey: string, description: PropertyDescriptor) {
            if (!description.value || typeof description.value != "function") {
                return;
            }
            const className: string = target.constructor.name;//类名
            const func = description.value;//函数对象
            if (!netRegistFunc.has(cmdid)) {//以前没注册过此操作ID
                netRegistFunc.set(cmdid, new Array<respFunc>());
            }
            let f: respFunc = {
                objType: className,
                func: func,
                cmdid: cmdid
            }
            netRegistFunc.get(cmdid).push(f);
        }
    }

    /**获取网络逻辑模块 */
    export function getModule<T extends NetModuleBase>(cls: { new(...args: any[]): T }): T {
        if (netInstanceObj.has(cls.name)) {
            return netInstanceObj.get(cls.name) as T;
        }
        return null;
    }
}

/**网络对象 */
export abstract class NetModuleBase {

    /**自身是否为服务器对象 */
    public readonly isServer: boolean = true;
    public constructor() {
        this.isServer = Gameplay.isServer();
        this.onAwake();
    }

    /**构造后调用 */
    protected onAwake() {

    }

    private start() {
        this.onStart();
    }
    /**网络初始化完毕后调用 */
    protected abstract onStart();

    private update(dt: number) {
        this.onUpdate(dt);
    }

    /**
     * 帧逻辑
     * @param dt 与上一帧间隔(ms)
     */
    protected abstract onUpdate(dt: number);

    private playerEnter(pid: number) {
        this.onPlayerEnter(pid);
    }

    /**[server] 仅服务器触发，任意玩家进入游戏*/
    protected onPlayerEnter(pid: number) {

    }
}



