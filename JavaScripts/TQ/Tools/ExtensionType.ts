
export class Action extends Extension.FunctionUtil.Action { };
export class Action1<T> extends Extension.FunctionUtil.Action1<T>{ };
export class Action2<T, U> extends Extension.FunctionUtil.Action2<T, U>{ };
export class Action3<T, U, V> extends Extension.FunctionUtil.Action3<T, U, V>{ };
export class StringUtil extends Extension.StringUtil { };
export class Tween<T> extends Extension.TweenUtil.Tween<T>{ };


export let UIMgr = Extension.UIManager.instance;
export function UIMiddleShow(UIObj: UI.UIBehaviour, ...params: any[]) {
    console.log("打开UI到中层:" + UIObj.constructor.name)
    return UIMgr.showUI(UIObj, Extension.UILayerMiddle, ...params);
}
export function UITopShow(UIObj: UI.UIBehaviour, ...params: any[]) {
    console.log("打开UI到顶层:" + UIObj.constructor.name)
    return UIMgr.showUI(UIObj, Extension.UILayerTop, ...params);
}
export function UIShowClass<T extends UI.UIBehaviour>(PanelClass: { new(): T; }, ...params: any[]) {
    UIMgr.show(PanelClass, ...params);
}


export function UICreate<T extends UI.UIBehaviour>(PanelClass: { new(): T; }, parent?: UI.Canvas): T {
    let ui: T = UIMgr.create(PanelClass);
    if (parent) {
        parent.addChild(ui.uiObject);
    }
    return ui;
}
export function UIIsShow(UIObj: UI.UIBehaviour) {
    return UIMgr.isShow(UIObj);
}
export function UIHide(UIObj: UI.UIBehaviour) {
    UIMgr.hideUI(UIObj);
}
export function UIHideClass<T extends UI.UIBehaviour>(PanelClass: { new(): T; }) {
    UIMgr.hide(PanelClass);
}

//选项卡组
export class TabGroup<T extends { onClicked: Common.MulticastDelegate<() => void> }> {
    private tabArr: Array<T>;
    private selectCallBack: (index: number) => void;
    private selectChecker: (index: number) => boolean;//检测是否可以切换
    private tabStyleHandle: (btn: T, isSelect: boolean) => void;//设置标签的样式方法
    private _currentIndex: number = -1;
    /**
     * 构造
     * @param tabArr 标签的按钮数组
     */
    constructor(tabArr: Array<T>) {
        this.tabArr = tabArr;
    }
    /**
     * 初始化
     * @param tabStyleHandle 设置标签的样式方法（方法参数：按钮）
     * @param selectCallBack 选择标签的回调方法
     * @param thisArg 域
     * @param defaultIndex 默认选择的标签索引
     */
    public init(tabStyleHandle: (btn: T, isSelect: boolean) => void, selectCallBack: (index: number) => void, thisArg: any, defaultIndex: number = 0) {
        this.tabStyleHandle = tabStyleHandle.bind(thisArg);
        this.selectCallBack = selectCallBack.bind(thisArg);
        for (let i = 0; i < this.tabArr.length; i++) {
            this.tabArr[i].onClicked.add(() => {
                this.select(i);
            });
        }
        this.select(defaultIndex);
    }
    /**
     * 设置标签是否可选择的判断方法
     * @param selectChecker 判断方法
     * @param thisArg 域
     */
    public setSelectChecker(selectChecker: (index: number) => boolean, thisArg: any) {
        this.selectChecker = selectChecker.bind(thisArg);
    }
    /**
     * 设置当前的标签
     * @param index 标签索引
     * @param ignoreSame 是否忽略相同索引
     * @returns 是否成功
     */
    public select(index: number, ignoreSame: boolean = true): boolean {
        if (ignoreSame && this._currentIndex == index) return;
        if (this.selectChecker != null && !this.selectChecker(index)) {
            return false;
        }
        this._currentIndex = index;
        this.refreshTabs();
        this.selectCallBack(index);
        return true;
    }
    /**当前选择的标签索引 */
    public get currentIndex(): number {
        return this._currentIndex;
    }
    //刷新所有便签的显示样式
    private refreshTabs() {
        for (let i = 0; i < this.tabArr.length; i++) {
            this.tabStyleHandle(this.tabArr[i], i == this.currentIndex);
        }
    }
}

/**
* 根据类型和路径查找子对象
* @param ChildType 子对象的类型
* @param path 节点路径(不带canvas本身)
* @returns 子节点对象
*/
export function findChildByPath<T extends UI.Widget>(canvas: UI.Canvas, ChildType: { new(...param: any[]): T }, path: string): T {
    let child = canvas.findChildByPath(path);
    if (child == null) {
        console.error('CanvasController: The child was not found!  path=' + path);
        return null;
    }
    let widget: unknown = child as T;//ChildType.get(child);
    // if (ChildType.name == UI.Button.name || ChildType.name == UI.Button.name) {
    //     (widget as any).setFocusable(false);//设置了这个 按钮就不会按下后自动抛出抬起事件了
    //     (widget as any).setTouchMethod(UI.ButtonTouchMethod.PreciseTap);//设置了这个后 滑动列表里的按钮不用再单独设置了
    // }
    return widget as T;
}

/**
 * 根据类型，获取画布下的所有此类型的对象
 * @param canvas 画布
 * @param ObjClass 类型类型
 * @returns 对象数组
 */
export function getCanvasChildren<T extends UI.Widget>(canvas: UI.Canvas, ObjClass: { new(): T }): Array<T> {
    let arr = [];
    if (canvas == null) return arr;
    let childNum: number = canvas.getChildrenCount();
    for (let i = 0; i < childNum; i++) {
        let child: UI.Widget = canvas.getChildAt(i);
        let obj: T = widgetToUIElement(ObjClass, child);
        if (obj != null) {
            arr.push(obj);
        }
    }
    return arr;
}



/**
* 将UI节点转换为实际的UI元素对象
* @param EleClass UI元素的类
* @param widget 节点对象
* @returns UI元素对象
*/
export function widgetToUIElement<T extends UI.Widget>(EleClass: { new(): T }, widget: UI.Widget): T {
    if (!(widget instanceof EleClass)) {
        return null;
    }
    let element: T = (widget) as T;
    if (element == null || !(widget instanceof EleClass)) return null;
    if (element instanceof UI.Button) {
        let btn = element;
        btn.focusable = (false);//设置了这个 按钮就不会按下后自动抛出抬起事件了
        btn.touchMethod = (UI.ButtonTouchMethod.PreciseTap);//不设置这个，滑动列表里的按钮会阻止滑动
        if (btn.visibility == UI.SlateVisibility.HitTestInvisible || btn.visibility == UI.SlateVisibility.SelfHitTestInvisible) {
            btn.visibility = (UI.SlateVisibility.Visible);//不设置Visible，按钮就无法点击
        }
    }
    return element as T;
}