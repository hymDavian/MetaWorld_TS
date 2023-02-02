
// export class BackpackModuleC extends ModuleC<BackpackModuleS, BackpackDataHelper>
// {
//     public get myData() {
//         return this.data;
//     }

//     /**客户端获得某个道具信息同步下来 */
//     public net_updateItem(itemObjs: itemNetSync[]) {
//         for (let net of itemObjs) {
//             this.data.syncClientItem(net);
//         }
//     }

//     /**请求给自己增加一个新道具 */
//     public reqCreateItem(itemCfgid: number, amount: number, unique: boolean, column: number = 0) {
//         this.server.net_playerCreateItem(itemCfgid, amount, unique, column);
//     }

//     /**请求移除一批道具 */
//     public reqRemoveItem(id: (number | string)[]) {
//         this.server.net_removeItem(id);
//     }

//     /**请求更新独特道具的特殊信息 */
//     public reqUpdateItem(guid: string, set: { k: string, v: number }[]) {
//         this.server.net_updateItem(guid, set);
//     }
// }

// export class BackpackModuleS extends ModuleS<BackpackModuleC, BackpackDataHelper>
// {
//     net_playerCreateItem(itemCfgid: number, amount: number, unique: boolean, column: number = 0) {
//         this.createItem(this.currentPlayer.getPlayerID(), itemCfgid, amount, unique, column);
//     }

//     public createItem(pid: number, itemCfgid: number, amount: number, unique: boolean, column: number = 0) {
//         let player = GamePlay.getPlayer(pid);
//         let data = this.getPlayerData(player);
//         if (data) {
//             let info = data.createNewItem(itemCfgid, amount, unique, column);
//             this.callClientFun(player, this.client.net_updateItem(info))
//         }
//     }

//     public net_removeItem(id: (number | string)[]) {
//         this.removeItem(this.currentPlayer.getPlayerID(), id);
//     }

//     public removeItem(pid: number, id: (number | string)[]) {
//         let player = GamePlay.getPlayer(pid);
//         let data = this.getPlayerData(player);
//         if (data) {
//             let infos = data.removeItem(id);
//             this.callClientFun(player, this.client.net_updateItem(infos))
//         }
//     }

//     public net_updateItem(id: string, set: { k: string, v: number }[]) {
//         this.updateItem(this.currentPlayer.getPlayerID(), id, set);
//     }

//     public updateItem(pid: number, id: string, set: { k: string, v: number }[]) {
//         let player = GamePlay.getPlayer(pid);
//         let data = this.getPlayerData(player);
//         if (data) {
//             let netinfo = data.changeData(id, set);
//             this.callClientFun(player, this.client.net_updateItem([netinfo]))
//         }
//     }

//     public getDataByPid(pid: number): BackpackDataHelper {
//         return this.getPlayerData(GamePlay.getPlayer(pid));
//     }
// }


// /**堆叠物品 */
// export type stackItem = {
//     cfgid: number,
//     amount: number,
//     cid: number
// }

// /**独特物品 */
// export type uniqueItem = {
//     guid: string,
//     cfgid: number,
//     amount: number,
//     /**运行时才会产生并保存的独特数据，例如武器经验值掌握度这些 */
//     data: { [key: string]: number },
//     cid: number
// }

// type columnMap = {
//     myCid: number,
//     stacks: {
//         [cfgid: number]: stackItem
//     },
//     uniques: {
//         [guid: string]: uniqueItem
//     }
// }

// /**服务器同步某个道具变更/新增时的网络数据体 */
// type itemNetSync = { id: number | string, info: stackItem | uniqueItem, amount: number, column: number };

// class BackpackInfo extends DataInfo {
//     items: {
//         [column: number]: columnMap
//     } = {}
// }

// export class BackpackDataHelper extends ModuleData<BackpackInfo>
// {
//     private static guidSeed: number = 0;

//     constructor() {
//         super(BackpackInfo)
//     }

//     protected initDefaultData(): void {
//         this.dataInfo.items = {};
//     }
//     /**检查/新建背包栏 */
//     private checkColumn(cid: number) {
//         if (!this.dataInfo.items[cid]) {
//             this.dataInfo.items[cid] = {
//                 myCid: cid,
//                 stacks: {},
//                 uniques: {}
//             }
//         }
//     }

//     /**[client] 从服务器收到一个同步道具信息给自身 */
//     public syncClientItem(netPack: itemNetSync) {
//         this.checkColumn(netPack.column);
//         const [remove, isStack] = [netPack.amount <= 0, (typeof netPack.id) == "number"];
//         let sync: boolean = false;
//         let map = this.dataInfo.items[netPack.column];



//         if (isStack) {
//             if (map.stacks[netPack.id]) {
//                 if (remove) {
//                     map.stacks[netPack.id] = null;
//                 }
//                 else {
//                     map.stacks[netPack.id].amount = netPack.info.amount
//                 }
//                 sync = true;
//             }
//         }
//         else {
//             if (map.uniques[netPack.id]) {
//                 if (remove) {
//                     map.uniques[netPack.id] = null;
//                 }
//                 else {
//                     map.uniques[netPack.id].data = (netPack.info as uniqueItem).data;
//                 }
//                 sync = true;
//             }
//         }

//         if (!sync) //如果不是同步操作，说明是个新增操作
//         {
//             if (isStack) {
//                 map.stacks[netPack.id] = netPack.info;
//             }
//             else {
//                 map.uniques[netPack.id] = netPack.info as uniqueItem;
//             }
//         }

//         let cmd = remove ? EItemCommand.Remove : (sync ? EItemCommand.Update : EItemCommand.Add);

//         if (isStack) {
//             BackpackTool.refreshSingleStack.call(netPack.info, cmd);
//         }
//         else {
//             BackpackTool.refreshSingleUnique.call(netPack.info as uniqueItem, cmd);
//         }

//     }

//     /**
//      * [server] 新建道具
//      * @param itemCfgid 使用的基本配置数据ID
//      * @param amount 数量
//      * @param unique 是否为独特道具
//      * @param column 放到哪一种背包栏内(默认0)
//      * @returns
//      */
//     public createNewItem(itemCfgid: number, amount: number, unique: boolean, column: number = 0): itemNetSync[] {
//         if (Util.SystemUtil.isClient()) {
//             return;
//         }

//         this.checkColumn(column);
//         if (unique) {
//             let result: itemNetSync[] = []
//             for (let i = 0; i < amount; i++) {
//                 let item: uniqueItem = {
//                     guid: `${Date.now()}_${Math.floor(Math.random() * 10)}_${itemCfgid}_${++BackpackDataHelper.guidSeed}`,
//                     cfgid: itemCfgid,
//                     data: {},
//                     amount: 1,
//                     cid: column
//                 }
//                 let keys = BackpackTool.getUniqueKeys(itemCfgid);
//                 for (let [k, v] of keys) {
//                     item.data[k] = v;
//                 }
//                 this.dataInfo.items[column].uniques[item.guid] = item;
//                 BackpackTool.refreshSingleUnique.call(item, EItemCommand.Add);
//                 result.push({ id: item.guid, info: item, amount: 1, column: column })
//             }

//             this.saveData(false);
//             return result;
//         }
//         else {
//             if (!this.dataInfo.items[column].stacks[itemCfgid]) {
//                 this.dataInfo.items[column].stacks[itemCfgid] = {
//                     cfgid: itemCfgid,
//                     amount: amount,
//                     cid: column
//                 };
//                 BackpackTool.refreshSingleStack.call(this.dataInfo.items[column].stacks[itemCfgid], EItemCommand.Add);
//             }
//             else {
//                 this.dataInfo.items[column].stacks[itemCfgid].amount += amount;

//                 if (this.dataInfo.items[column].stacks[itemCfgid].amount <= 0) {
//                     this.dataInfo.items[column].stacks[itemCfgid] = null;
//                     BackpackTool.refreshSingleStack.call(this.dataInfo.items[column].stacks[itemCfgid], EItemCommand.Remove);
//                 }
//                 else {
//                     BackpackTool.refreshSingleStack.call(this.dataInfo.items[column].stacks[itemCfgid], EItemCommand.Update);
//                 }
//             }

//             this.saveData(false);
//             return [{
//                 id: itemCfgid,
//                 info: this.dataInfo.items[column].stacks[itemCfgid],
//                 amount: amount,
//                 column: column
//             }];
//         }
//     }

//     /**
//      * 从自身数据库中查找一个道具信息并返回
//      * @param id 数字:return配置ID的堆叠物品，字符串:return同guid的独特物品
//      * @param column 固定查找物品栏，如果有值，会只针对查找此物品栏下的道具
//      */
//     public findItem(id: number | string, column?: number): { ret: stackItem | uniqueItem, cid: number } {
//         let findColumn: columnMap[] = [];
//         if (column) {
//             findColumn.push(this.dataInfo.items[column]);
//         }
//         else {
//             for (let c in this.dataInfo.items) {
//                 findColumn.push(this.dataInfo.items[c]);
//             }
//         }

//         let result: { ret: stackItem | uniqueItem, cid: number } = null;
//         const isStack: boolean = typeof id == "number";//是否为堆叠道具
//         for (let map of findColumn) {

//             if (isStack) //堆叠道具
//             {
//                 if (map.stacks[id]) {
//                     result = {
//                         ret: map.stacks[id],
//                         cid: map.myCid
//                     };
//                     break;
//                 }
//             }
//             else {
//                 if (map.uniques[id]) {
//                     result = {
//                         ret: map.uniques[id],
//                         cid: map.myCid
//                     };
//                     break;
//                 }
//             }
//         }

//         return result;

//     }

//     /**[server] 移除道具 */
//     public removeItem(ids: (number | string)[]): itemNetSync[] {
//         if (Util.SystemUtil.isClient()) {
//             return;
//         }
//         let result: itemNetSync[] = null;
//         let findColumn: columnMap[] = [];
//         for (let c in this.dataInfo.items) {
//             findColumn.push(this.dataInfo.items[c]);
//         }
//         for (let id of ids) {
//             let ret: itemNetSync = null;
//             let isStack: boolean = typeof id == "number";//是否为堆叠道具
//             for (let map of findColumn) {
//                 if (isStack) {
//                     if (map.stacks[id]) {


//                         ret = {
//                             id: id,
//                             info: null,
//                             amount: 0,
//                             column: map.myCid
//                         }
//                         map.stacks[id] = null;
//                         BackpackTool.refreshSingleStack.call(map.stacks[id], EItemCommand.Remove);
//                         break;
//                     }
//                 }
//                 else {
//                     if (map.uniques[id]) {


//                         ret = {
//                             id: id,
//                             info: null,
//                             amount: 0,
//                             column: map.myCid
//                         }
//                         map.uniques[id] = null;
//                         BackpackTool.refreshSingleUnique.call(map.uniques[id], EItemCommand.Remove);
//                         break;
//                     }
//                 }
//             }
//             if (!result && ret) { result = []; }
//             if (ret) {
//                 result.push(ret);
//             }
//         }


//         this.saveData(false);
//         return result;
//     }

//     /**[server] 修改某个独特道具的某些属性 */
//     public changeData(guid: string, set: { k: string, v: number }[]): itemNetSync {
//         if (Util.SystemUtil.isClient()) {
//             return;
//         }

//         let result: itemNetSync = null;
//         let find = this.findItem(guid);
//         if (find) {
//             let item: uniqueItem = find.ret as uniqueItem;
//             for (let kv of set) {
//                 item.data[kv.k] = item.data[kv.v];
//                 BackpackTool.refreshSingleUnique.call(item, EItemCommand.Update);
//             }

//             result = {
//                 id: guid,
//                 info: item,
//                 amount: 1,
//                 column: find.cid
//             }
//         }
//         this.saveData(false);
//         return result;

//     }

//     /**获取某个背包栏的所有数据 */
//     public getColumnMap(cid: number): columnMap {
//         this.checkColumn(cid);
//         return this.dataInfo.items[cid];
//     }
// }

// export enum EItemCommand {
//     /**新增 */
//     Add,
//     /**移除 */
//     Remove,
//     /**修改 */
//     Update,
// }

// /**背包工具 */
// export namespace BackpackTool {
//     let uniqueItemKes: Map<number, Map<string, number>> = new Map();

//     /**
//      * 设置独特道具的运行时独特属性字段
//      * amount为保留字段，不能自定义
//      */
//     export function setUniqueKeys(cfgid: number, ...keys: { k: string, v?: number }[]) {
//         if (!uniqueItemKes.has(cfgid)) {
//             uniqueItemKes.set(cfgid, new Map());
//         }
//         for (let key of keys) {
//             if (key.k != "amount") {
//                 if (!uniqueItemKes.get(cfgid).has(key.k)) {
//                     uniqueItemKes.get(cfgid).set(key.k, key.v ? key.v : 0);
//                 }
//             }
//         }
//     }
//     /**获取某种道具的独特属性字段集,外部不需要调用 */
//     export function getUniqueKeys(cfgid: number) {
//         if (!uniqueItemKes.has(cfgid)) {
//             uniqueItemKes.set(cfgid, new Map());
//         }
//         return uniqueItemKes.get(cfgid);
//     }


//     /**更新某个独特道具后执行<道具数据，行为> */
//     export const refreshSingleUnique: Action2<uniqueItem, EItemCommand> = new Action2();
//     /**更新某个堆叠道具后执行<道具数据，行为> */
//     export const refreshSingleStack: Action2<stackItem, EItemCommand> = new Action2();




//     /**
//      * 新产生一个物品
//      * @param itemCfgid 配置ID
//      * @param amount 增加数量，如果是独特道具，此值无效，如果是堆叠物，此值也可以用于移除效果(负数参数，数量减到0)
//      * @param unique 是否为独特物品(非堆叠的，同基本配置下有独立属性的)
//      * @param column 放到哪个背包栏(默认0)
//      * @param pid 给哪个玩家,客户端调随意固定为自身，服务器调用时必传，无效玩家ID将不会产生物品
//      */
//     export function createNewItem(itemCfgid: number, amount: number, unique: boolean, column: number = 0, pid: number = -1) {
//         if (Util.SystemUtil.isClient()) {
//             //通知服务器新增道具
//             ModuleManager.instance.getModule(BackpackModuleC).reqCreateItem(itemCfgid, amount, unique, column);
//         }
//         else {
//             //服务器产生物品
//             ModuleManager.instance.getModule(BackpackModuleS).createItem(pid, itemCfgid, amount, unique, column);
//         }
//     }

//     /**移除某些物品,pid:客户端随意，服务器指定的某玩家 */
//     export function removeItem(pid: number, ...id: (number | string)[]) {
//         if (Util.SystemUtil.isClient()) {
//             //通知服务器移除道具
//             ModuleManager.instance.getModule(BackpackModuleC).reqRemoveItem(id);
//         }
//         else {
//             //服务器移除物品
//             ModuleManager.instance.getModule(BackpackModuleS).removeItem(pid, id);
//         }
//     }

//     /**修改独特道具的某些属性，pid:客户端随意，服务器指定的某玩家 */
//     export function updateItem(pid: number, id: string, ...set: { k: string, v: number }[]) {
//         if (Util.SystemUtil.isClient()) {
//             ModuleManager.instance.getModule(BackpackModuleC).reqUpdateItem(id, set);
//         }
//         else {
//             ModuleManager.instance.getModule(BackpackModuleS).updateItem(pid, id, set);
//         }
//     }

//     /**获取某个道具,根据传入的是配置ID(number)还是唯一ID(string) 返回堆叠道具或独特道具,返回所在背包栏 */
//     export function findItem(id: number | string, pid?: number): { ret: stackItem | uniqueItem, cid: number } {
//         let dp: BackpackDataHelper = null;
//         if (Util.SystemUtil.isClient()) {

//             dp = ModuleManager.instance.getModule(BackpackModuleC).myData;
//         }
//         else {
//             if (pid) {
//                 dp = ModuleManager.instance.getModule(BackpackModuleS).getDataByPid(pid);
//             }
//         }
//         return dp ? dp.findItem(id) : null;
//     }

//     /**获取某一背包栏的所有数据 */
//     export function getColumnMap(cid: number, pid?: number): columnMap {
//         let dp: BackpackDataHelper = null;
//         if (Util.SystemUtil.isClient()) {

//             dp = ModuleManager.instance.getModule(BackpackModuleC).myData;
//         }
//         else {
//             if (pid) {
//                 dp = ModuleManager.instance.getModule(BackpackModuleS).getDataByPid(pid);
//             }
//         }

//         return dp ? dp.getColumnMap(cid) : null;
//     }
// }