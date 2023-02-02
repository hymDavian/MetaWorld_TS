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
