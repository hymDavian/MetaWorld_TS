
import { AIController } from "./AIController";

/**AI行为决策设计 */
export namespace AIBehaviorSetting {
    /**ai环境定义,会依次往下判断所处环境，进行决策 */
    export enum EAIEnv {
        // None = 0,//进行待机，进入对局前
        // killer,//作为杀手，或杀手辅助者，需要找到其他玩家进行追逐并攻击
        // dead,//死亡了,趴下不动
        // isRescue,//正在被救援 不要动
        // down,//倒下了，需要找到视野范围内的其他玩家进行追随
        // flee,//作为逃生者 随机找没有杀手的地方进行逃跑

    }
    /**ai行为定义 */
    export enum EBehaviorDef {
        // wait,//待机1秒
        // findSurvivor,//寻找其他存活逃生者的位置请求救援
        // findSafePlace,//寻找安全地方
        // move,//一直移动到当前目标位置
        // stopMove,//中断当前移动
        // attack,//攻击

    }

    //AI行为动态黑板数据
    export interface AIBlackBloard {
        // idleCD: number;//进入安全位置后空闲等待剩余时间，避免一直在一个位置待着
        // targetPoint: Vector;//移动目标点
    }

    type AIView = {}
    export type AICtrl = AIController.Controller<AIView, AIBlackBloard>;


    const behaviorMap: { [k in keyof typeof EBehaviorDef]?: TypeName<AIController.AIBehavior<AIView, AIBlackBloard>> } = {};
    export function registerAIBehavior(behaviorDef: EBehaviorDef) {
        return function <T extends AIController.AIBehavior<AIView, AIBlackBloard>>(constructor: TypeName<T>) {
            behaviorMap[EBehaviorDef[behaviorDef]] = constructor;
        }
    }



    export function fillNewAICtrl(aiCtrl: AICtrl) {
        // //环境检查逻辑
        // aiCtrl.registerEnvironmentCheck(EAIEnv.None, () => {
        //     return aiCtrl.model.role.state.hasany(RoleStateEnum.None_01);
        // });
        // aiCtrl.registerEnvironmentCheck(EAIEnv.killer, () => {
        //     return false;//todo 杀手辅助标记属性
        // });
        // aiCtrl.registerEnvironmentCheck(EAIEnv.dead, () => {
        //     return aiCtrl.model.role.state.hasany(RoleStateEnum.Death_100000);
        // });
        // aiCtrl.registerEnvironmentCheck(EAIEnv.isRescue, () => {
        //     return aiCtrl.model.role.rescueRole.length > 0;
        // })
        // aiCtrl.registerEnvironmentCheck(EAIEnv.down, () => {
        //     return aiCtrl.model.role.state.hasany(RoleStateEnum.Down_1000);
        // });
        // aiCtrl.registerEnvironmentCheck(EAIEnv.flee, () => {
        //     //不是逃生者，不进入逃跑
        //     if (aiCtrl.model.role.identity != RoleIdentityEnum.Survivor) {
        //         return false;
        //     }
        //     const killerid = GlobalModule.BoutMD_S.boutData.killer;
        //     if (killerid == aiCtrl.model.id) { return false; }//AI自身是杀手
        //     return true;
        // });



        // //具体行为定义
        // aiCtrl.addEnvironmrntAction(EAIEnv.None, [behaviorMap.stopMove, behaviorMap.wait], 1); //没进游戏，待机
        // aiCtrl.addEnvironmrntAction(EAIEnv.dead, [behaviorMap.stopMove, behaviorMap.wait], 1);//死了，待机
        // aiCtrl.addEnvironmrntAction(EAIEnv.isRescue, [
        //     behaviorMap.stopMove,
        //     behaviorMap.wait
        // ], 1);//被救援 停止移动
        // aiCtrl.addEnvironmrntAction(EAIEnv.down, [
        //     behaviorMap.stopMove,
        //     behaviorMap.findSurvivor,
        //     behaviorMap.move
        // ], 1);//找到其他玩家并移动过去

        // aiCtrl.addEnvironmrntAction(EAIEnv.flee, [
        //     behaviorMap.findSafePlace,
        //     behaviorMap.move,
        // ], 1);//找到安全的地方去逃跑

        // aiCtrl.addEnvironmrntAction(EAIEnv.killer, [
        //     behaviorMap.findSurvivor,
        //     behaviorMap.move,
        //     behaviorMap.attack,
        // ], 1);//追杀玩家



    }

    /**仅检查x和y方向上的距离是否在指定距离内 */
    function checkOnlyXYDistance(v1: { x: number, y: number }, v2: { x: number, y: number }, distance: number): boolean {
        let xFlag = Math.abs(v1.x - v2.x) < distance;
        let yFlag = Math.abs(v1.y - v2.y) < distance;
        return xFlag && yFlag;
    }
}