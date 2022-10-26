import { Datacenter } from "./Data/Datacenter";
import NewUI from "./NewUI";
import { BuildingData } from "./test/CreateModule/BuildingData";
import { NetManager } from "./Tools/NetManager";

@Core.Class
export default class HYMGame extends Core.Script {

	@Core.Property()
	private preloadAssets: string = "21586,21588,21592,23775";
	/** 当脚本被实例后，会在第一帧更新前调用此函数 */
	protected async onStart(): Promise<void> {
		await Datacenter.init(false, BuildingData);
		NetManager.initNetMgr();
		this.UIinit();
		this.useUpdate = true;
	}

	/** 
	 * 每帧被执行,与上一帧的延迟 dt 秒
	 * 此函数执行需要将this.bUseUpdate赋值为true
	 */
	protected onUpdate(dt: number): void {
		NetManager.update();
	}

	/** 脚本被销毁时最后一帧执行完调用此函数 */
	protected onDestroy(): void {

	}

	/**UIC初始化 */
	protected UIinit() {
		if (Gameplay.isClient()) {
			Extension.UIManager.getInstance(Extension.UIManager);
			Extension.UIManager.instance.show(NewUI);
		}
	}

}
