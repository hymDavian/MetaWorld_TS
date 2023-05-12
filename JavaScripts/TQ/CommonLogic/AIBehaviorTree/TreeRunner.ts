import { TreeActor } from "./AIConst";
import { BaseNode } from "./TreeNode/BaseNode";
import { RootNode } from "./TreeNode/ControlNode";

class TreeRunner {
    private static _ins: TreeRunner = null;
    public static get instance(): TreeRunner {
        if (!TreeRunner._ins) {
            TreeRunner._ins = new TreeRunner();
        }
        return TreeRunner._ins;
    }

    public readonly allTree: Map<number, RootNode> = new Map();

    /**一些初始化 */
    private constructor() {

    }

    /**让单位使用某种行为树 */
    public setActorBehaviorTree<T extends TreeActor>(actor: T, tree: RootNode) {

        tree.addActor(actor);
        if (!this.allTree.has(tree.key)) {
            this.allTree.set(tree.key, tree);
        }

    }
    /**让单位使用某种行为树(树的key) */
    public setActorBehaviorKey<T extends TreeActor>(actor: T, key: number) {
        if (this.allTree.has(key)) {
            this.allTree.get(key).addActor(actor);
        }
    }

    private _time: number = 0;
    /**更新驱动入口 */
    public update(): void {
        if (!this._time) { this._time = Date.now(); }
        for (const tree of this.allTree) {
            tree[1].tick(Date.now() - this._time);
        }
        this._time = Date.now();
    }
}
const BehaviorTree = TreeRunner.instance;
const TreeData: Map<string, any> = new Map();
export { BehaviorTree, TreeData }