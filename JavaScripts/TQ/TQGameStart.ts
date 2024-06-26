import { Action1, Tween, UIExtend } from "./Tools/ExtensionType";
import { Class } from "./Tools/Tools";
import { Datacenter } from "./tqBase/Datacenter";
import { NetManager } from "./tqBase/NetManager";

export abstract class TQGameStart extends Core.Script {
    private static _instance: TQGameStart = null;
    /**单例 */
    public static get instance(): TQGameStart {
        return TQGameStart._instance;
    }
    private _customUpdateAct: Action1<number> = new Action1();//其他逻辑中加入的帧更新逻辑

    /** 当脚本被实例后，会在第一帧更新前调用此函数 */
    protected async onStart(): Promise<void> {
        if (!TQGameStart._instance) {
            TQGameStart._instance = this;
        }
        this.UIinit();//客户端初始化UI
        await Datacenter.init(Util.SystemUtil.isMobile(), ...this.getDataClass());//数据层初始化
        NetManager.initNetMgr();//网络传输层初始化
        this.useUpdate = true;//主循环脚本驱动更新
    }



    /** 
     * 会驱动CustomAct,NetManager,Tween
     */
    protected onUpdate(dt: number): void {
        NetManager.update();
        this._customUpdateAct.call(dt);
        Util.TweenUtil.TWEEN.update(dt);
    }

    /** 脚本被销毁时最后一帧执行完调用此函数 */
    protected onDestroy(): void {

    }

    /**返回需要被初始化的数据类的类型组 */
    protected abstract getDataClass(): Class<Datacenter.PlayerSaveData>[];

    /**第一个打开的UI,一般是loading界面 */
    protected abstract get firstUI(): Class<UI.UIBehavior>;

    /**UI初始化 */
    private UIinit() {
        if (Util.SystemUtil.isClient()) {
            if (this.firstUI) {//有自定义初始UI
                UIExtend.UIShowClass(this.firstUI);
            }
        }
    }

    /**添加到自身update生命周期的函数 */
    public addCustomAct(act: (dt: number) => void, thisArg?: any) {
        this._customUpdateAct.add(act, thisArg);
    }
    /**从自身update生命周期移除的函数 */
    public removeCustomAct(act: (dt: number) => void, thisArg: any) {
        this._customUpdateAct.remove(act, thisArg);
    }

}
