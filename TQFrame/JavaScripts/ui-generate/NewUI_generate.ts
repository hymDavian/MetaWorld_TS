
/**
 * AUTO GENERATE BY UI EDITOR.
 * WARNING: DO NOT MODIFY THIS FILE,MAY CAUSE CODE LOST.
 * AUTHOR: 一路向前
 * UI: UI/NewUI.ui
 * TIME: 2022.10.25-15.22.30
 */

 

 @UI.UICallOnly('UI/NewUI.ui')
 export default class NewUI_Generate extends UI.UIBehaviour {
	 @UI.UIMarkPath('RootCanvas/btn_cube')
    public btn_cube: UI.Button=undefined;
    @UI.UIMarkPath('RootCanvas/btn_cone')
    public btn_cone: UI.Button=undefined;
    @UI.UIMarkPath('RootCanvas/btn_sphere')
    public btn_sphere: UI.Button=undefined;
    @UI.UIMarkPath('RootCanvas/btn_Set')
    public btn_Set: UI.Button=undefined;
    @UI.UIMarkPath('RootCanvas/btn_jump')
    public btn_jump: UI.StaleButton=undefined;
    

 
	protected onAwake() {
		this.btn_cube.onClicked.add(()=>{
			 
		})
	this.btn_cone.onClicked.add(()=>{
			 
		})
	this.btn_sphere.onClicked.add(()=>{
			 
		})
	this.btn_Set.onClicked.add(()=>{
			 
		})
	
	}
	 
 }
 