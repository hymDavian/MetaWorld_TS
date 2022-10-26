
/** 
 * AUTHOR: 一路向前
 * TIME: 2022.10.25-13.14.56
 */

import { CreateModule } from "./test/CreateModule/CreateModule";
import { NetManager } from "./TQ/tqBase/NetManager";
import NewUI_Generate from "./ui-generate/NewUI_generate";

export default class NewUI extends NewUI_Generate {

	/** 
	* 构造UI文件成功后，在合适的时机最先初始化一次 
	*/
	protected onStart() {
		//设置能否每帧触发onUpdate
		this.canUpdate = false;
		this.layer = Extension.UILayerMiddle;
		//this.initButtons();

		this.btn_Set.onClicked.add(() => {
			NetManager.getModule(CreateModule).setObject();
		});
		this.btn_cube.onClicked.add(() => {
			NetManager.getModule(CreateModule).switchObj(0);
		});
		this.btn_cone.onClicked.add(() => {
			NetManager.getModule(CreateModule).switchObj(1);
		});
		this.btn_sphere.onClicked.add(() => {
			NetManager.getModule(CreateModule).switchObj(2);
		});
		this.btn_jump.onClicked.add(() => {
			Gameplay.getCurrentPlayer().character.jump();
		})
	}

	/** 
	* 构造UI文件成功后，onStart之后 
	* 对于UI的根节点的添加操作，进行调用
	* 注意：该事件可能会多次调用
	*/
	protected onAdded() {
	}

	/** 
	 * 构造UI文件成功后，onAdded之后
	 * 对于UI的根节点的移除操作，进行调用
	 * 注意：该事件可能会多次调用
	 */
	protected onRemoved() {
	}

	/** 
	* 构造UI文件成功后，UI对象再被销毁时调用 
	* 注意：这之后UI对象已经被销毁了，需要移除所有对该文件和UI相关对象以及子对象的引用
	*/
	protected onDestroy() {
	}

	/**
	* 每一帧调用
	* 通过canUpdate可以开启关闭调用
	* dt 两帧调用的时间差，毫秒
	*/
	//protected onUpdate(dt :number) {
	//}

	/**
	 * 设置显示时触发
	 */
	//protected onShow(...params:any[]) {
	//}

	/**
	 * 设置不显示时触发
	 */
	//protected onHide() {
	//}

}
