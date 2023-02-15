//对一些新api下的类型写法简化与扩展。
export type Action = Type.Action;
export type Action1<T> = Type.Action1<T>;
export type Action2<T, S> = Type.Action2<T, S>;
export type Action3<T, S, P> = Type.Action3<T, S, P>;
export const StringUtil = Util.StringUtil;
export class Tween<T> extends Util.TweenUtil.Tween<T>{ };
export const SoundManager = SoundService.getInstance();
export const EffectManager = EffectService.getInstance();

/**UI的一些扩展辅助函数 */
export class UIExtend {
    private static _languageCfg: ICfgBase = null;
    public static readonly UIMgr = UI.UIManager.instance;
    public static UIMiddleShow(UIObj: UI.UIBehavior, ...params: any[]) {
        return UIExtend.UIMgr.showUI(UIObj, UI.UILayerMiddle, ...params);
    }
    public static UITopShow(UIObj: UI.UIBehavior, ...params: any[]) {
        return UIExtend.UIMgr.showUI(UIObj, UI.UILayerTop, ...params);
    }
    public static UIShowClass<T extends UI.UIBehavior>(PanelClass: { new(): T; }, ...params: any[]) {
        return UIExtend.UIMgr.show(PanelClass, ...params);
    }
    public static UICreate<T extends UI.UIBehavior>(PanelClass: { new(): T; }, parent?: UI.Canvas): T {
        let ui: T = UIExtend.UIMgr.create(PanelClass);
        if (parent) {
            parent.addChild(ui.uiObject);
        }
        return ui;
    }
    public static UIHide(UIObj: UI.UIBehavior) {
        UIExtend.UIMgr.hideUI(UIObj);
    }
    public static UIHideClass<T extends UI.UIBehavior>(PanelClass: { new(): T; }) {
        UIExtend.UIMgr.hide(PanelClass);
    }
    /**注册UI多语言逻辑
     * 
     * @param languageCfg 多语言配置对象
     */
    public static BindLanguage(languageCfg: ICfgBase) {
        this._languageCfg = languageCfg;
        UI.UIBehavior.addBehavior("lan", (ui: UI.StaleButton | UI.TextBlock) => {
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
     * @param lid 多语言表ID
     * @param errorStr 如果没找到的替代文本
     * @param args 多语言格式化参数列表
     * @returns 
     */
    public static Lanstr(lid: number, errorStr?: string, ...args: any[]): string {
        let ret: string = errorStr;
        if (this._languageCfg) {
            let cfg = this._languageCfg.getElement(lid);
            if (cfg) {
                ret = StringUtil.format(cfg.Value, ...args);
            }
            else {
                ret = errorStr ? StringUtil.format(errorStr, ...args) : "" + args;//errorStr
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
