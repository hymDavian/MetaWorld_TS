// import { Datacenter } from "../tqBase/Datacenter";
// import { NetManager, NetModuleBase } from "../tqBase/NetManager";

// /**服务器背包模块 */
// @NetManager.netFlagClass
// class Backpack extends NetModuleBase {



//     protected onStart() {
//     }
//     protected onUpdate(dt: number) {
//     }

//     protected onPlayerEnter(pid: number): void {
//     }

//     public getModuleIndex(): number {
//         return 1;
//     }


// }

// /**物品操作 */
// export enum EItemCommand {
//     /**新增 */
//     Add,
//     /**移除 */
//     Remove,
//     /**修改 */
//     Update,
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

// /**背包硬盘数据格式 */
// type BackpackInfo = {
//     [column: number]: columnMap
// }

// /**服务器同步某个道具变更/新增时的网络数据体 */
// type itemNetSync = { id: number | string, info: stackItem | uniqueItem, amount: number, column: number };

// export class BackpackData extends Datacenter.PlayerSaveData {
//     private bkdata: BackpackInfo = null;

//     public initData(dataSet: BackpackInfo) {
//         this.bkdata = dataSet;
//     }
//     public clearMyData() {
//         this.bkdata = {};
//     }
//     public get myData(): BackpackInfo {
//         return this.bkdata;
//     }

// }

// export namespace BackpackTool {

// }