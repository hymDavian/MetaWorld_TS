interface Class<T> extends Function {
    new(...args: any[]): T;
}
function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**数据 */
export namespace Datacenter {
    const EVENT_PLAYER_DATA_REQ_INIT_HYM = "EVENT_PLAYER_DATA_REQ_INIT_HYM";//玩家请求服务器数据
    const EVENT_PLAYER_DATA_RSP_INIT_HYM = "EVENT_PLAYER_DATA_RSP_INIT_HYM";//服务器响应数据返回
    const EVENT_PLAYER_CLIENTSYNC_HYM = "EVENT_PLAYER_CLIENTSYNC_HYM";//客户端同步给服务器的数据
    type dataBaseInfo = { [cls: string]: any };//硬盘数据类型
    const dataClassMap: Map<string, Class<PlayerSaveData>> = new Map();//可用类类型

    export let clientBeginDataFinish: boolean = false;//客户端自己的数据第一次初始完成

    /**初始化数据库
     * 
     * @param saveOnline 是否存在线上数据
     * @param dataTypes 可用的数据类型
     */
    export async function init(saveOnline: boolean, ...dataTypes: Class<PlayerSaveData>[]) {
        DataStorage.setTemporaryStorage(!saveOnline);
        for (let cls of dataTypes) {
            if (cls) {
                dataClassMap.set(cls.name, cls);
            }
        }
        if (Gameplay.isServer()) {
            serverInit();
        }
        else {
            clientBeginDataFinish = false;
            await clientInit();
        }
    }
    /**客户端初始化 */
    async function clientInit() {
        let localPlayer = await Gameplay.asyncGetCurrentPlayer();
        Events.addServerListener(EVENT_PLAYER_DATA_RSP_INIT_HYM, (pid: number, data: any, dataName: string) => {//自身拿到了谁的哪种数据，如果没有数据名，会是所有数据
            //todo 客户端数据创建或修改
            console.log("----------->dataLog:", "收到来自服务器的数据：", dataName ? `[${dataName}]` : "[全数据]", "数据值：" + JSON.stringify(data), "属于：" + pid);
            client.getDataFromServer(pid, data, dataName);
        });
        Events.dispatchToServer(EVENT_PLAYER_DATA_REQ_INIT_HYM, localPlayer.getPlayerID());//初始时请求获取自身的数据
        while (!clientBeginDataFinish) {
            await sleep(10);
        }
    }
    /**服务器初始化 */
    function serverInit() {
        Events.addPlayerJoinedListener(p => {//玩家加入时开始进行数据装载
            server.loadPlayerData(p);
        });
        Events.addPlayerLeftListener(p => {//玩家退出时存一次玩家数据
            server.savePlayerData(p);
            playerDataSet.delete(p.getPlayerID());//移除运行时数据
        });
        Events.addClientListener(EVENT_PLAYER_DATA_REQ_INIT_HYM, async (p, getid: number, dataName: string) => {
            server.callClientData(getid, p.getPlayerID(), dataClassMap.get(dataName));
        });
        Events.addClientListener(EVENT_PLAYER_CLIENTSYNC_HYM, (p, data: any, clsName: string) => {
            server.getClientSyncData(p.getPlayerID(), data, clsName);
            console.log("----------->dataLog:", "收到来自客户端的数据同步", JSON.stringify(data));
        })
    }


    /**被存储的数据类型 */
    export abstract class PlayerSaveData {
        /**自身属于哪个玩家 */
        public readonly pid: number;
        constructor(pid: number) {
            this.pid = pid;
        }

        public get className(): string {
            return this.constructor.name;
        }

        /**如何处理来自数据库的加载数据,如果不存在此数据，会是{} */
        public abstract initData(dataSet: any);

        /**[server] 保存到硬盘 本质上是保存此玩家的所有数据,仅服务器能执行 */
        public save() {
            if (Gameplay.isServer()) {
                Datacenter.server.savePlayerData(Gameplay.getPlayer(this.pid));
            }
        }

        /**此数据同步给自身对方端，如果是客户端调用，会同步给服务器，如果是服务器，会同步给客户端 */
        public sync() {
            if (Gameplay.isServer()) {
                let myplayer = Gameplay.getPlayer(this.pid)
                if (myplayer) {
                    Events.dispatchToClient(myplayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, this.pid, this.myData, this.className);
                }
            }
            else {
                Events.dispatchToServer(EVENT_PLAYER_CLIENTSYNC_HYM, this.myData, this.className);
            }
        }

        /**在Datacenter调用deleteData时被执行的函数，设置被清理后的myData数据形态 */
        public abstract clearMyData();

        /**执行数据保存或同步时，实际保存到硬盘的就是此get属性的返回值 */
        public abstract get myData(): any;
    }



    /**玩家的所有数据 */
    class playerAllDataSet {
        private readonly _dataSet: Map<string, PlayerSaveData> = new Map();
        public readonly pid: number;
        constructor(pid: number, data: dataBaseInfo) {
            this.pid = pid;
            this.fullAllData(data);
        }

        /**装载全部数据 */
        public fullAllData(_data: dataBaseInfo) {
            for (let clsName in _data) {
                if (dataClassMap.has(clsName)) {
                    const dataClass = dataClassMap.get(clsName);
                    let obj = new dataClass(this.pid);
                    obj.initData(_data[clsName]);
                    this._dataSet.set(clsName, obj);
                }
            }
        }

        /**获取此玩家数据集的某种数据 */
        public getDataByType<T extends PlayerSaveData>(dataType: Class<T>): T {
            let clsName = dataType.name;
            if (!this._dataSet.has(clsName)) {
                let tempData = {};
                let clsData = new dataType(this.pid);
                clsData.initData(tempData);
                this._dataSet.set(clsName, clsData);
            }
            return this._dataSet.get(clsName) as T;
        }

        /**填充刷新某种数据给此玩家 */
        public fullData<T extends PlayerSaveData>(dataType: Class<T>, data: any): T {
            if (!data) {
                data = {};
            }
            let clsName = dataType.name;
            if (!this._dataSet.has(clsName)) {
                let clsData = new dataType(this.pid);
                clsData.initData(data);
                this._dataSet.set(clsName, clsData);
            }
            return this._dataSet.get(clsName) as T;
        }

        /**此玩家的完整数据集 */
        public get myAllData(): dataBaseInfo {
            let ret: dataBaseInfo = {};
            for (const [k, v] of this._dataSet) {//获取运行时的实时变动数据
                ret[k] = v.myData;
            }
            return ret;
        }
    }

    const playerDataSet: Map<number, playerAllDataSet> = new Map();//客户端上的玩家数据
    //#region -----------------------客户端-----------------------
    export namespace client {





        /**获取玩家的某种数据对象
         * 
         * @param getServer 是否需要从服务器获取最新数据,如果为true,最多等待1000ms后就返回结果
         * @param dataType 数据类型
         * @param getid 获取谁的数据，如果是-1则获取自身数据
         */
        export async function getDataByType<T extends PlayerSaveData>(dataType: Class<T>, getServer: boolean = false, getid: number = -1): Promise<T> {
            if (getid == -1) {
                getid = Gameplay.getCurrentPlayer().getPlayerID();
            }
            if (!getServer) {//只需要直接从本地获取时
                if (playerDataSet.has(getid)) {
                    return playerDataSet.get(getid).getDataByType(dataType);
                }
                else {
                    return null;
                }
            }
            else {
                Events.dispatchToServer(EVENT_PLAYER_DATA_REQ_INIT_HYM, getid, dataType.name);//进行数据更新获取请求
                await sleep(1000);
                if (playerDataSet.has(getid)) {
                    return playerDataSet.get(getid).getDataByType(dataType);
                }
                else {
                    return null;
                }
            }
        }

        /**数据装载到本地(框架回调，不需要自行调用)
         * 
         * @param pid 谁的数据
         * @param data 数据体
         * @param dataName 数据类型名，如果没有，则代表全部数据
         */
        export function getDataFromServer(pid: number, data: any, dataName: string) {
            if (!clientBeginDataFinish) {
                if (pid == Gameplay.getCurrentPlayer().getPlayerID()) {
                    clientBeginDataFinish = true;
                }
            }
            if (!playerDataSet.has(pid)) {
                playerDataSet.set(pid, new playerAllDataSet(pid, {}));
            }
            let allDataObj = playerDataSet.get(pid);
            if (dataName) {
                let dataType = dataClassMap.get(dataName);
                if (dataType) {
                    allDataObj.fullData(dataType, data);
                }
            }
            else {
                allDataObj.fullAllData(data);
            }
        }
    }
    //#endregion

    //#region -------------------服务器-----------------
    export namespace server {
        const isloadingPlayer: number[] = [];//正在装载玩家数据的玩家id


        /**保存玩家数据到硬盘 */
        export function savePlayerData(player: Gameplay.Player) {
            if (!player) {
                console.error("----------->dataLog:", "save playerData error,player is " + player);
                return;
            }
            let pid = player.getPlayerID();

            if (playerDataSet.has(pid)) {
                let playerMap = playerDataSet.get(pid);
                DataStorage.asyncSetPlayerData(player, playerMap.myAllData);
            }
        }

        /**移除某种数据。不可逆，慎用！消除某类型数据，在消除逻辑后会执行一次全数据保存 */
        export function deleteData<T extends PlayerSaveData>(player: Gameplay.Player, dataType: Class<T>) {
            if (!player) {
                console.error("----------->dataLog:", "delete playerData error,player is " + player);
                return;
            }
            let pid = player.getPlayerID();
            if (playerDataSet.has(pid)) {
                let className = dataType.name;
                let data = playerDataSet.get(pid).getDataByType(dataType);
                if (data) {
                    data.clearMyData();
                }
                savePlayerData(player);
            }
        }

        /**装载玩家数据 */
        export async function loadPlayerData(player: Gameplay.Player): Promise<playerAllDataSet> {
            if (!player) {//这个玩家还不存在！
                console.error("----------->dataLog:", "load playerData error,player is " + player);
                return null;
            }
            let pid = player.getPlayerID();
            if (isloadingPlayer.indexOf(pid) >= 0) {//如果此玩家正在装载数据
                while (!playerDataSet.has(pid)) {
                    await sleep(10);
                }
                return playerDataSet.get(pid);
            }
            isloadingPlayer.push(pid);

            let data: dataBaseInfo = null;
            let waitTime: number = 0;
            let getDataSuccess: boolean = false;
            let awaitDataTask = DataStorage.asyncGetPlayerData(player);
            awaitDataTask.then(val => {
                data = val;
                getDataSuccess = true;
                console.log("----------->dataLog:", "data get sucess! pid:" + pid);
            })

            while (waitTime < 100 && !getDataSuccess) {
                console.log("----------->dataLog:", "wait get PlayerData pid:" + pid);
                await sleep(100);
                waitTime++;
            }

            if (!data) {//等了 10秒还没拿到数据 出问题了，创建空数据，并提示
                awaitDataTask.finally();
                data = {};
                console.error("----------->dataLog:", "longTime not get playerData,create emptyData, pid:" + pid);
            }

            playerDataSet.set(pid, new playerAllDataSet(pid, data));

            isloadingPlayer.splice(isloadingPlayer.indexOf(pid), 1);
            return playerDataSet.get(pid);
        }

        /**获取玩家的某种数据 */
        export async function getPlayerData<T extends PlayerSaveData>(p: Gameplay.Player | number, dataType: Class<T>): Promise<T> {
            let player: Gameplay.Player = null;
            let pid = -1;
            if (typeof p == "number") {
                player = Gameplay.getPlayer(p);
                pid = p;
            }
            else {
                player = p;
                pid = p.getPlayerID();
            }
            if (!player) {
                console.error("----------->dataLog:", "get playerData error,player is " + player);
                return null;
            }


            let allData: playerAllDataSet = null;//所有数据
            if (playerDataSet.has(pid)) {
                allData = playerDataSet.get(pid);
            }
            else {
                allData = await loadPlayerData(player);
            }
            if (!allData) {
                console.error("----------->dataLog:", "not find playerdata in server,pid:" + pid);
                return null;
            }

            return allData.getDataByType(dataType);
        }

        /** 将服务器上谁的数据通知给某个客户端
         * @param data 数据属于者
         * @param toPlayer 通知的玩家
         * @param dataType 同步的数据类型，如果没有会同步全数据
         */
        export async function callClientData(dataid: number, toPlayerid: number, dataType: Class<PlayerSaveData> = null) {
            let toPlayer = Gameplay.getPlayer(toPlayerid);
            if (!toPlayer) {//需要数据的玩家没了
                console.error("----------->dataLog:", "server have not player,pid:" + toPlayer);
                return;
            }
            let getPlayer = Gameplay.getPlayer(dataid);//数据来源玩家
            let dataName = dataType ? dataType.name : null;//数据类型名
            if (!getPlayer) {//数据所属玩家没了
                console.error("----------->dataLog:", "server have not data,pid:" + dataid);
                Events.dispatchToClient(toPlayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, dataid, null, dataName);
                return;
            }



            let allData: playerAllDataSet = null;//通知的数据体
            if (playerDataSet.has(dataid)) {
                allData = playerDataSet.get(dataid);
            }
            else {
                allData = await loadPlayerData(getPlayer);
            }
            if (!allData) {//这个玩家没有数据
                console.error("----------->dataLog:", "not find playerdata in server,pid:" + dataid);
                Events.dispatchToClient(toPlayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, dataid, null, dataName);
                return;
            }



            let toData: any = null;
            if (!dataName) {//没有指定要同步哪种数据时
                toData = allData.myAllData;
            }
            else {
                toData = allData.getDataByType(dataType).myData;
            }

            Events.dispatchToClient(toPlayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, dataid, toData, dataName);
        }

        /**装载玩家的某种数据 (框架回调 不需要自行调用) */
        export function getClientSyncData(pid: number, data: any, clsName: string) {
            let syncPlayer = Gameplay.getPlayer(pid);
            if (!syncPlayer) {//被同步数据的玩家在服务器上没了
                console.error("----------->dataLog:", "server have not player,pid:" + pid);
                return;
            }
            let allData: playerAllDataSet = null;//通知的数据体
            if (!playerDataSet.has(pid)) {//此玩家的数据不存在！
                console.error("----------->dataLog:", "not find playerdata in server,pid:" + pid);
                return;
            }
            allData = playerDataSet.get(pid);
            let dataType = dataClassMap.get(clsName);
            if (dataType) {
                allData.fullData(dataType, data);
                savePlayerData(syncPlayer);
            }

        }
    }





    //#endregion
}