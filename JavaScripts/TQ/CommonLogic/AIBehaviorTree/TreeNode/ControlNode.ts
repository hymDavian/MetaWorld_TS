import { ENodeResult, TreeActor } from "../AIConst";
import { BaseNode } from "./BaseNode";

/**控制节点 */
abstract class ControlNode extends BaseNode {
    protected selfState: ENodeResult;
    protected get precondition(): boolean {
        return true;
    }
    public get currentState(): ENodeResult {
        return this.selfState;
    }

    /**如果有子节点需要在下一帧继续执行，赋值到此 */
    protected runningChild: BaseNode = null;

}

/**选择节点(一直到某一个执行成功或正在运行) */
class SelectorNode extends ControlNode {
    public run(actor: TreeActor, dt: number): void {
        if (this.runningChild != null) {//有子节点
            this.runningChild["run"](actor, dt);
            if (this.runningChild.currentState != ENodeResult.Running) {
                this.runningChild = null;
            }
            return;
        }

        this.selfState = ENodeResult.Failure;//默认失败
        //遍历子节点
        let lastNodeIndex = 0;
        for (lastNodeIndex = 0; lastNodeIndex < this.children.length; lastNodeIndex++) {
            const cnode = this.children[lastNodeIndex];
            if (!cnode["precondition"]) {
                continue;
            }
            cnode["init"](actor);
            cnode["run"](actor, dt);
            if (cnode.currentState == ENodeResult.Running) {
                this.runningChild = cnode;
            }
            this.selfState = cnode.currentState;//自身状态设为此节点状态
            //任意一个节点运行成功 或 正在运行
            if (this.selfState != ENodeResult.Failure) {
                break;
            }
        }
    }
}
/**序列节点(一直到某一个失败) */
class SequenceNode extends ControlNode {
    public run(actor: TreeActor, dt: number): void {
        if (this.runningChild != null) {//有子节点
            this.runningChild["run"](actor, dt);
            if (this.runningChild.currentState != ENodeResult.Running) {
                this.runningChild = null;
            }
            return;
        }

        this.selfState = ENodeResult.Success;//默认成功
        //遍历子节点
        let lastNodeIndex = 0;
        for (lastNodeIndex = 0; lastNodeIndex < this.children.length; lastNodeIndex++) {
            const cnode = this.children[lastNodeIndex];
            if (!cnode["precondition"]) {
                continue;
            }
            cnode["init"](actor);
            cnode["run"](actor, dt);
            if (cnode.currentState == ENodeResult.Running) {
                this.runningChild = cnode;
            }
            this.selfState = cnode.currentState;//自身状态设为此节点状态
            //任意一个节点没成功 或 正在运行
            if (this.selfState != ENodeResult.Success) {
                break;
            }
        }
    }
}
/**并行节点(全体执行) */
class ParallelNode extends ControlNode {
    public run(actor: TreeActor, dt: number): void {
        this.selfState = ENodeResult.Success;//默认成功
        //遍历子节点，执行所有节点
        for (const cnode of this.children) {
            if (!cnode["precondition"]) {
                continue;
            }
            cnode["init"](actor);
            cnode["run"](actor, dt);
            //并行节点的返回结果以主节点为准
            if (this._mainNode == cnode) {
                this.selfState = cnode.currentState;
            }
        }
        return;
    }

    private readonly _mainNode: BaseNode;

    constructor(...children: BaseNode[]) {
        super(...children);
        if (children.length > 0) {
            this._mainNode = children[0];
        }
    }
}

let rootNodeKeySeed = 0;
/**根节点,一个特殊的选择节点
 * 持有被决策的实体对象
 * 帧更新入口
 */
class RootNode extends SelectorNode {
    /**此行为树的唯一实例ID */
    public readonly key: number = 0;
    private readonly _actors: { actor: TreeActor, enable: boolean }[] = [];//使用此行为树的对象集

    constructor(...children: BaseNode[]) {
        super(...children);
        this.key = ++rootNodeKeySeed;
    }

    /**根节点行为树驱动 */
    public run(actor: TreeActor, dt: number): BaseNode {
        super.run(actor, dt)
        return null;;
    }

    /**添加被决策单位对象 */
    public addActor(actor: TreeActor) {
        if (this._actors.findIndex(val => { return val.actor == actor; }) < 0) {
            this._actors.push({ actor: actor, enable: true });
        }
    }

    /**设置被决策者是否启动此行为树 */
    public setActorEnable(actor: TreeActor, enable: boolean) {
        for (let i = 0; i < this._actors.length; i++) {
            if (this._actors[i].actor == actor) {
                this._actors[i].enable = enable;
            }
        }
    }

    /**管理器实际调用的行为树运作入口 */
    public tick(dt: number) {
        for (const actorInfo of this._actors) {
            if (actorInfo.enable) {
                this.run(actorInfo.actor, dt);
            }
        }
    }
}

export { SelectorNode, SequenceNode, ParallelNode, RootNode }