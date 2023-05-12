import { ENodeResult, TreeActor } from "../AIConst";

/**节点基类 */
abstract class BaseNode {
    /**此节点完全运行完毕后传递给父节点的结果状态 */
    public abstract get currentState(): ENodeResult;
    /**此节点自身子节点集合 */
    public readonly children: BaseNode[];
    private _parent: BaseNode = null;
    /**节点父级 */
    public get parent(): BaseNode { return this._parent; }
    /**选择运作此节点的依据条件 */
    protected abstract get precondition(): boolean;
    /**被父节点每次第一次调用时执行,先于run执行。如果本次run之后返回running，后续帧不会再次调用此init函数 */
    protected init(actor: TreeActor): void { }
    /**此节点单帧要执行的事(dt:ms) */
    protected abstract run(actor: TreeActor, dt: number): void;



    constructor(...children: BaseNode[]) {
        this.children = children;
        for (const cnode of children) {
            cnode._parent = this;
        }
    }
}

/**一个运行时的具体业务逻辑节点基类 */
abstract class ActionNode<T extends TreeActor> extends BaseNode {
    public editParams: Map<string, any> = new Map();//编辑器提供的可用参数集
    public abstract run(actor: T, dt: number): void;
    public init(actor: T): void {

    }
}


export { BaseNode, ActionNode }