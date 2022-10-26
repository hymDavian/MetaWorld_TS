

// 用户可以自定义自己的UIManager继承类
Extension.UIManager.getInstance(Extension.UIManager);

@UI.UICallOnly('UI/UIDefault.ui')
export default class UIDefault extends UI.UIBehaviour {

	/** 
	* 构造UI文件成功后，在合适的时机最先初始化一次 
	*/
	protected onStart() {
        //找到跳跃的按钮
		const JumpBtn = this.rootcanvas.getChildByName('MWButton_Jump') as UI.Button;
		//点击跳跃按钮
        JumpBtn.onClicked.add(()=>{
			Gameplay.asyncGetCurrentPlayer().then((player : Gameplay.Player)=>{
				player.character.jump();
			})
		});
    }

	/** 
	   * 构造UI文件成功后，onInitialized之后 
	   * 对于UI的根节点的添加操作，进行调用
	   * 注意：该事件可能会多次调用
	   */
	protected onConstruct() {
	}

	 /** 
	  * 构造UI文件成功后，construct之后
	  * 对于UI的根节点的移除操作，进行调用
	  * 注意：该事件可能会多次调用
	  */
	protected onDestruct() {
	}

	 /** 
	 * 构造UI文件成功后，UI对象再被销毁时调用 
	 * 注意：这之后UI对象已经被销毁了，需要移除所有对该文件和UI相关对象以及子对象的引用
	 */
	//protected onDestroy() {
	//}

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
	//protected onVisible(...params:any[]) {
	//}

	/**
	 * 设置不显示时触发
	 */
	//protected onInVisible() {
	//}

}