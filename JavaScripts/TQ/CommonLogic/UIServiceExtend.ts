//这里写一些自定义的对mwUI扩展函数 需要在下面的同名类里面实现对应的函数
type getOnShowParamsType<T extends mw.UIScript> = T extends { onShow: (...args: infer P) => void } ? P : any[];
declare namespace mw {
    /**UIService扩展类 */
    class UIServiceExtend extends UIService {
        /**显示UI(带参数提示) */
        static showEx<T extends mw.UIScript>(PanelClass: {
            new(): T;
        }, ...params: getOnShowParamsType<T>[]): T;

    }

    export interface TextBlock {
        textCache: string;
    }

}
class UIServiceExtend extends mw.UIService {
    static showEx<T extends mw.UIScript>(PanelClass: {
        new(): T;
    }, ...params: getOnShowParamsType<T>): T {
        return mw.UIService.show(PanelClass, ...params);
    }

}
(globalThis as any)["UIServiceExtend"] = UIServiceExtend;
mw.UIServiceExtend = UIServiceExtend;

//重复文本复制过滤
const textSet = Object.getOwnPropertyDescriptor(mw.TextBlock.prototype, "text");
const oldSet = textSet.set;
textSet.set = function (v) {
    if (this.textCache == v) {
        return;
    }
    this.textCache = v;
    oldSet.call(this, v);
}
Object.defineProperty(mw.TextBlock.prototype, "text", textSet);