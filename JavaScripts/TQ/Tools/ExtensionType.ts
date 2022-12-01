//对一些新api下的类型写法简化与扩展。

export class Action extends Extension.FunctionUtil.Action { };
export class Action1<T> extends Extension.FunctionUtil.Action1<T>{ };
export class Action2<T, U> extends Extension.FunctionUtil.Action2<T, U>{ };
export class Action3<T, U, V> extends Extension.FunctionUtil.Action3<T, U, V>{ };
export class StringUtil extends Extension.StringUtil { };
export class Tween<T> extends Extension.TweenUtil.Tween<T>{ };
export class GoPool extends Extension.GoPool {
    public static get instance() {
        return Extension.GoPool.getInstance();
    }
};
export class SoundManager extends Extension.SoundManager {
    public static get instance() {
        return Extension.SoundManager.getInstance();
    }
};
export const EffectManager = Extension.EffectManager;
// export class EffectManager extends Extension.EffectManager {
//     public static get instance() {
//         return Extension.EffectManager.getInstance();
//     }
// }

/**UI的一些扩展辅助函数 */
export class UIExtend {
    private static _languageCfg: ICfgBase
    private static _uimgr: Extension.UIManager = null;
    public static get UIMgr(): Extension.UIManager {
        if (!UIExtend._uimgr) {
            UIExtend._uimgr = Extension.UIManager.instance;
        }
        return UIExtend._uimgr;
    }
    public static UIMiddleShow(UIObj: UI.UIBehaviour, ...params: any[]) {
        return UIExtend.UIMgr.showUI(UIObj, Extension.UILayerMiddle, ...params);
    }
    public static UITopShow(UIObj: UI.UIBehaviour, ...params: any[]) {
        return UIExtend.UIMgr.showUI(UIObj, Extension.UILayerTop, ...params);
    }
    public static UIShowClass<T extends UI.UIBehaviour>(PanelClass: { new(): T; }, ...params: any[]) {
        return UIExtend.UIMgr.show(PanelClass, ...params);
    }
    public static UICreate<T extends UI.UIBehaviour>(PanelClass: { new(): T; }, parent?: UI.Canvas): T {
        let ui: T = UIExtend.UIMgr.create(PanelClass);
        if (parent) {
            parent.addChild(ui.uiObject);
        }
        return ui;
    }
    public static UIIsShow(UIObj: UI.UIBehaviour) {
        return UIExtend.UIMgr.isShow(UIObj);
    }
    public static UIHide(UIObj: UI.UIBehaviour) {
        UIExtend.UIMgr.hideUI(UIObj);
    }
    public static UIHideClass<T extends UI.UIBehaviour>(PanelClass: { new(): T; }) {
        UIExtend.UIMgr.hide(PanelClass);
    }
    /**注册UI多语言逻辑
     * 
     * @param languageCfg 多语言配置对象
     */
    public static BindLanguage(languageCfg: ICfgBase) {
        this._languageCfg = languageCfg;
        UI.UIBehaviour.addBehaviour("lan", (ui: UI.StaleButton | UI.TextBlock) => {
            let key: string = ui.text;
            if (key) {
                let lan = this._languageCfg.getElement(key);
                if (lan) {
                    ui.text = (lan.Value);
                }
            }
        });
    }

    /**获取多语言字符
     * 
     * @param lid 多语言表ID
     * @param errorStr 如果没找到的替代文本
     * @param args 多语言格式化参数列表
     * @returns 
     */
    public static Lanstr(lid: number, errorStr: string, ...args: any[]): string {
        let ret: string = errorStr;
        if (this._languageCfg) {
            let cfg = this._languageCfg.getElement(lid);
            if (cfg) {
                ret = StringUtil.format(cfg.Value, ...args);
            }
            else {
                ret = StringUtil.format(errorStr, ...args);//errorStr
            }
        }
        return ret;
    }
}
//用于多语言配置虚接口定义解耦
interface ILanguage {
    Value: string
}
interface ICfgBase {
    getElement(id: number | string): ILanguage;
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