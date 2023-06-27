/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable mwts-rules/no-chinese-character */
/* eslint-disable prefer-const */

interface ErrorMessageUI {
    messageScroll: UI.ScrollBox

    /**UI集合对象 */
    rootCanvas: UI.Canvas,
    uiObject: UI.Widget,
    /**设置显隐 */
    setVisible: (active: boolean) => void,
}

const openLog: boolean = false;//是否开启此打印

export namespace UIDebug {
    let uiObject: ErrorMessageUI = null;
    let txtSize: number = 15
    const msgTxts: UI.TextBlock[] = [];
    let TxtWidth: number = 960
    /**初始化 */
    function setUIClass() {
        uiObject = createMsgUI();
        uiObject.uiObject.zOrder = -1000;
        UI.UIManager.instance.canvas.addChild(uiObject.uiObject);
        uiObject.setVisible(false);
    }

    function createMsgUI(): ErrorMessageUI {
        let ret: ErrorMessageUI = {
            messageScroll: null,
            rootCanvas: null,
            uiObject: null,
            setVisible: null
        }
        //根节点和UI对象
        const screen = Util.WindowUtil.getViewportSize();
        const root = UI.UserWidgetPrefab.newObject();
        root.size = screen
        root.rootContent = UI.Canvas.newObject();
        root.rootContent.size = screen
        root.rootContent.position = Type.Vector2.zero;
        root.addToViewport(UI.UILayerScene);
        ret.uiObject = root;
        ret.rootCanvas = root.rootContent;
        //滚动区
        ret.messageScroll = UI.ScrollBox.newObject(ret.rootCanvas);
        ret.messageScroll.position = new Type.Vector(0, screen.y / 3);
        TxtWidth = screen.x / 2 - 10;
        ret.messageScroll.size = new Type.Vector(screen.x / 2, screen.y - (screen.y / 3));
        ret.setVisible = (active: boolean) => {
            ret.rootCanvas.visibility = active ? UI.SlateVisibility.SelfHitTestInvisible : UI.SlateVisibility.Collapsed;
        }
        return ret;
    }
    /**关闭 */
    export function closeAll() {
        if (!uiObject) { return; }
        clear();
        uiObject.setVisible(false);
    }
    /**文本清理 */
    export function clear() {
        if (!uiObject) { return; }
        for (let i = 0; i < msgTxts.length; i++) {
            msgTxts[i].text = "";
            msgTxts[i].size = Type.Vector.zero;

        }
        lastUseIndex = -1;
        nextPosY = 0;
        logNumMap.clear();
    }

    const logNumMap: Map<number, { num: number, index: number }> = new Map();
    const usedKeys: number[] = [];
    /**添加新文本并显示,返回文本ID */
    export function log(msg: string, color: Type.LinearColor = Type.LinearColor.white, key: number = null, size?: number): number {
        if (!msg || msg.length <= 0) {
            return;
        }
        if (!uiObject) {
            setUIClass();
        }
        uiObject.setVisible(true);


        if (key == null) {//没有指定key
            // console.log("空值")
            return getTxtBlock(msg, color, size ? size : txtSize);
        }
        else {
            if (logNumMap.has(key) && msgTxts[logNumMap.get(key).index]) {//指定了key 且实际存在
                const val = logNumMap.get(key);
                val.num += 1;
                msgTxts[val.index].text = `<${key}>:${msg}(${val.num})`;
                msgTxts[val.index].fontColor = color;
                logNumMap.set(key, val);
                return key;
            }
            else {
                return getTxtBlock(msg, color, size ? size : txtSize, key);
            }
        }

        // uiObject.messageScroll.scrollToEnd();
    }

    let lastUseIndex: number = -1;
    let nextPosY: number = 0;

    export function getShowItemNum() {
        return lastUseIndex + 1;
    }
    function getTxtBlock(txt: string, color: Type.LinearColor, size: number, useKey: number = -1): number {
        let index: number = 0;
        let txtObj: UI.TextBlock = null;
        if (lastUseIndex >= (msgTxts.length - 1)) {//需要新建文本对象

            txtObj = UI.TextBlock.newObject(uiObject.rootCanvas);
            uiObject.messageScroll.addChild(txtObj);
            txtObj.textHorizontalLayout = UI.UITextHorizontalLayout.AutoWarpText;
            txtObj.size = new Type.Vector(TxtWidth, 1);
            // ret.position = new Type.Vector(0, nextPosY);
            txtObj.lineHeightPercentage = 0.6
            txtObj.fontSize = txtSize;
            txtObj.outlineColor = Type.LinearColor.black;
            txtObj.outlineSize = 1;
            msgTxts.push(txtObj);
            lastUseIndex = msgTxts.length - 1;
            index = lastUseIndex;
        }
        else {
            lastUseIndex++;
            txtObj = msgTxts[lastUseIndex];
            index = lastUseIndex;
        }
        txtObj.fontSize = size;
        txtObj.text = txt;

        txtObj.size = new Type.Vector(TxtWidth, txtObj.textHeight + 10);
        txtObj.position = new Type.Vector(0, nextPosY);
        nextPosY = txtObj.size.y + nextPosY;
        // lastPosY += ret.size.y;
        txtObj.fontColor = color;

        const key = useKey ? useKey : Math.max(...usedKeys) + 1;
        const val = { num: 1, index: index };
        logNumMap.set(key, val);
        usedKeys.push(key);
        // console.log("新建key" + ret)
        return key;
    }
    /**输出红色的ERROR堆栈字符串 */
    export function logError(error: string) {
        let arr: string[] = error.split('\n');
        const strtitle = arr.splice(0, 1)[0];
        log(strtitle, Type.LinearColor.red);

        arr.forEach(s => {
            const begin = s.indexOf('at') + 2;
            const end = s.indexOf('(');
            const stackStr = s.slice(begin, end);
            log(stackStr, Type.LinearColor.red, 25);
        })
    }

    const errorLine: Set<number> = new Set();
    export function attachError() {
        if (!openLog) { return; }
        return function (target: any, propertyRey: string, description: PropertyDescriptor) {
            if (description.value && typeof description.value === "function") {
                let oldFunc = description.value;
                description.value = function (...args: any[]) {
                    try {
                        return oldFunc.call(this, ...args);
                    } catch (error) {//   \\game.js:8106:15)\n
                        let ss = error.stack.match(/(js:).*:/);//s:xxx:
                        let line = Number(ss[0].split(':')[1]);
                        if (errorLine.has(line)) {
                            return;
                        }
                        errorLine.add(line);
                        log("-------", Type.LinearColor.red);
                        logError(error.stack);
                        log("-------", Type.LinearColor.red);
                    }

                }
            }
        }
    }

    // const funcCallNum: Map<string | symbol, number> = new Map();
    const colorLevel: [number, Type.LinearColor][] = [
        [0.1, Type.LinearColor.green],
        [1, Type.LinearColor.white],
        [10, Type.LinearColor.blue]
    ];
    const funcCallTime: Map<string, number> = new Map();
    const funcNameBindNumber: Map<string, number> = new Map();
    const funcCallTotalNum: Map<string, number> = new Map();
    const checkUpdate = false;
    export function attachFuncCallNum<T extends { new(...args: any[]): {} }>(clsObj: T) {
        if (!openLog) {
            return;
        }
        let proto = clsObj.prototype;
        const selfKeys = Reflect.ownKeys(proto);
        let base = Object.getPrototypeOf(proto)
        const baseKeys = Reflect.ownKeys(base);
        const funcs = new Set<string>();
        selfKeys.concat(baseKeys).filter(key => {
            if (typeof key === "string") {
                let isfunc = false;
                try {
                    isfunc = typeof proto[key] === "function";

                } catch (error) {
                    isfunc = true;
                }
                return isfunc;
            }
            return false;
        }).forEach(key => {
            if (key.toString().toLowerCase().includes("update")) {
                if (checkUpdate) {
                    funcs.add(key as string);
                }
            }
            else {
                funcs.add(key as string);
            }
        })
        // const ret = class extends clsObj {
        //     constructor(...args: any[]) {
        //         super(...args);
        //         // return new Proxy(this, {
        //         //     get(target, p, receiver) {

        //         //         if (typeof (target[p]) === "function" && !p.toString().toLowerCase().includes("update")) {
        //         //             // const afterTime = funcBeforeTime.get(p) ? funcBeforeTime.get(p) : Date.now();
        //         //             // funcBeforeTime.set(p, afterTime);
        //         //             // const passTime = Date.now() - afterTime;
        //         //             // const total = (funcCallTime.get(p) ? funcCallTime.get(p) : 0) + passTime;
        //         //             // funcCallTime.set(p, total);

        //         //             if (!funcCallNum.has(p)) {
        //         //                 funcCallNum.set(p, 1);
        //         //             }
        //         //             else {
        //         //                 funcCallNum.set(p, funcCallNum.get(p) + 1);
        //         //             }
        //         //             let n = log(`[${p.toString()}]调用次数：${funcCallNum.get(p)} `, Type.LinearColor.green, funcNameBindNumber.get(p));
        //         //             funcNameBindNumber.set(p, n);
        //         //         }
        //         //         return target[p]
        //         //     }
        //         // })
        //     }
        // }
        funcs.forEach(funcName => {
            const isGet = !!Object.getOwnPropertyDescriptor(clsObj.prototype, funcName)?.get;
            const isSet = !!Object.getOwnPropertyDescriptor(clsObj.prototype, funcName)?.set;

            if (isGet || isSet) {
                // console.error(`${clsObj.name}.${funcName.toString()} isget:${isGet} | isset:${isSet}`);
                return;
            }
            const func = clsObj.prototype[funcName];
            if (typeof func === "function") {
                const funcClsName = `${clsObj.name}.${funcName.toString()}`

                clsObj.prototype[funcName] = function (...args: any[]) {
                    const beginTime = Date.now();
                    const ret = func.call(this, ...args);
                    const passTime = Date.now() - beginTime;
                    const total = (funcCallTime.get(funcClsName) ? funcCallTime.get(funcClsName) : 0) + passTime;
                    funcCallTime.set(funcClsName, total);

                    const alltime = (funcCallTime.get(funcClsName) * 0.001);
                    if (!funcCallTotalNum.has(funcClsName)) {
                        funcCallTotalNum.set(funcClsName, 0);
                    }
                    const donum = funcCallTotalNum.get(funcClsName) + 1;
                    funcCallTotalNum.set(funcClsName, donum);
                    const svTime = alltime / donum;
                    let color: Type.LinearColor = Type.LinearColor.red;
                    for (const [t, c] of colorLevel) {
                        if (alltime < t) {
                            color = c;
                            break;
                        }
                    }
                    let n = log(` [ ${funcClsName} ] 总时间:${alltime.toFixed(3)},平均:${svTime.toFixed(3)}`, color, funcNameBindNumber.get(funcClsName));
                    funcNameBindNumber.set(funcClsName, n);
                    return ret;
                }
            }
        })

        return clsObj;
    }

    export function attachFuncCallStaticFunc() {
        if (!openLog) { return; }
        return function (target: any, propertyRey: string, description: PropertyDescriptor) {
            const func = description.value;
            if (typeof func === "function") {
                const funcClsName = `${target.constructor.name}.${propertyRey.toString()}`
                description.value = function (...args: any[]) {
                    const beginTime = Date.now();
                    const ret = func.call(this, ...args);
                    const passTime = Date.now() - beginTime;
                    const total = (funcCallTime.get(funcClsName) ? funcCallTime.get(funcClsName) : 0) + passTime;
                    funcCallTime.set(funcClsName, total);

                    const alltime = (funcCallTime.get(funcClsName) * 0.001);
                    if (!funcCallTotalNum.has(funcClsName)) {
                        funcCallTotalNum.set(funcClsName, 0);
                    }
                    const donum = funcCallTotalNum.get(funcClsName) + 1;
                    funcCallTotalNum.set(funcClsName, donum);
                    const svTime = alltime / donum;
                    let color: Type.LinearColor = Type.LinearColor.red;
                    for (const [t, c] of colorLevel) {
                        if (alltime < t) {
                            color = c;
                            break;
                        }
                    }
                    let n = log(` [ ${funcClsName} ] 总时间:${alltime.toFixed(3)},平均:${svTime.toFixed(3)}`, color, funcNameBindNumber.get(funcClsName));
                    funcNameBindNumber.set(funcClsName, n);
                    return ret;
                }
            }
        }
    }
}
