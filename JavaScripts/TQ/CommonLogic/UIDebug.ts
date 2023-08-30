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



namespace InUIDebug {
    export let openLog: boolean = false;//是否开启此打印
    export let maxLogNum: number = -1;//最大打印数量,如果小于等于0则表示无上限，将会一直累加文本对象
    /**指令函数集 -<指令> <参数1> <参数2> ...这样的输入会调用此指令集定义的函数，类似于gm，但仅客户端有效 */
    export const cmdActions: Map<string, (ps: string[]) => void> = new Map();
    let hackLog: boolean = false;//是否已经hack过console
    /**截断原始console的输出，以此输出代替 */
    export function hackConsole() {
        if (hackLog) { return; }
        hackLog = true;
        let clog = console.log;
        console.log = function (...args: any[]) {
            if (SystemUtil.isServer()) {
                LinkServer.slog(args.join(','));
            }
            if (SystemUtil.isClient()) {
                innerLog(args.join(','));
            }
            clog(...args);
        }
        let cwarn = console.warn;
        console.warn = function (...args: any[]) {
            if (SystemUtil.isServer()) {
                LinkServer.slog(args.join(','));
            }
            if (SystemUtil.isClient()) {
                innerLog(args.join(','), Type.LinearColor.yellow);
            }
            cwarn(...args);
        }
        let cerror = console.error;
        console.error = function (...args: any[]) {
            if (SystemUtil.isServer()) {
                LinkServer.slog(args.join(','));
            }
            if (SystemUtil.isClient()) {
                innerLog(args.join(','), Type.LinearColor.red);
            }
            cerror(...args);
        }
    }
    export namespace UIObj {
        export function setZorder(zorder: number) {
            if (!Data.uiObject) { return; }
            Data.uiObject.uiObject.zOrder = zorder;
        }
        /**彻底关闭 */
        export function close() {
            if (!Data.uiObject) { return; }
            clear();
            Data.uiObject.setVisible(false);
            openLog = false;
        }
        /**文本清理 */
        export function clear() {
            if (!Data.uiObject) { return; }
            for (let i = 0; i < Data.msgTxts.length; i++) {
                Data.msgTxts[i][1].text = "";
                Data.msgTxts[i][1].size = Type.Vector.zero;
            }
            Data.lastUseIndex = -1;
            Data.nextPosY = 0;
            Data.logNumMap.clear();
            Data.uiObject.messageScroll.scrollToStart();
        }
        /**临时隐藏 */
        export function hide() {
            Data.uiObject && Data.uiObject.setVisible(false);
        }
        export function open() {
            if (!Data.uiObject) {
                Data.setUIClass();
            }
            Data.uiObject.setVisible(true);
            openLog = true;
        }
    }
    /**打印到内置控制台,返回文本ID。如果是服务器调用，则在所有客户端打印紫色文本，不会返回文本id */
    export function log(msg: string, color: Type.LinearColor = Type.LinearColor.white, key: number = null, size?: number): number {
        if (!hackLog) {
            console.log(msg);
        }
        return innerLog(msg, color, key, size);
    }
    /**注册触摸开启 */
    export function RegisterInput(...touchPoints: Type.Vector2[]) {
        if (SystemUtil.isServer()) { return; }
        const view = UI.getViewportSize();
        const center = new Type.Vector2(view.x / 2, view.y / 2);
        const checkPoints: Type.Vector2[] = touchPoints.length > 0 ? touchPoints : [
            new Type.Vector2(view.x / 2, view.y),//下
            new Type.Vector2(view.x / 2, 0),//上
            new Type.Vector2(0, view.y / 2),//左
            new Type.Vector2(view.x, view.y / 2),//右
        ];
        let checkIndex = 0;//当前需要的检查目标索引
        const checkDistance = 50;//检查距离
        const touch = new Gameplay.TouchInput();
        touch.setPlayerController();
        let checkFlag = false;//是否从正中心以及控制台在关闭状态下触发过检查
        touch.onTouchBegin.add((index, loc) => {
            if (openLog) { return; }//已经被打开了
            const dis = Type.Vector2.distance(center, loc);
            if (dis < checkDistance) {
                checkFlag = true;
            }
        })
        touch.onTouchEnd.add((index, loc) => {
            if (!checkFlag) { return; }//没有触发过检查
            checkFlag = false;
            const target = checkPoints[checkIndex];
            const dis = Type.Vector2.distance(target, loc);
            if (dis > checkDistance) {
                checkIndex = 0;
                return;
            }
            checkIndex++;
            if (checkIndex >= checkPoints.length) {
                checkIndex = 0;
                openLog = true;
                log(`开启控制台!`, Type.LinearColor.green);
            }
            else {
                console.log(`next:${checkPoints[checkIndex]}`);
            }
        });
    }

    //实际的打印逻辑实现,避免调用截断console函数后的递归调用
    function innerLog(msg: string, color: Type.LinearColor = Type.LinearColor.white, key: number = null, size?: number) {
        if (SystemUtil.isServer()) {
            LinkServer.slog(msg);
            return;
        }
        if (!openLog) {
            return;
        }
        if (!msg || msg.length <= 0) {
            return;
        }
        UIObj.open();
        if (maxLogNum > 0 && Data.lastUseIndex >= maxLogNum) {
            UIObj.clear();
        }
        try {
            const date = new Date();
            const nowHour = date.getHours();
            const nowMin = date.getMinutes();
            const nowSec = date.getSeconds();
            msg = `[${nowHour}:${nowMin}:${nowSec}] ${msg}`;
            if (key == null) {//没有指定key
                return Data.getTxtBlock(msg, color, size ? size : Data.txtSize);
            }
            else {
                if (Data.logNumMap.has(key) && Data.msgTxts[Data.logNumMap.get(key).index]) {//指定了key 且实际存在
                    const val = Data.logNumMap.get(key);
                    val.num += 1;
                    Data.msgTxts[val.index][1].text = `<${key}>:${msg}(${val.num})`;
                    Data.msgTxts[val.index][1].fontColor = color;
                    Data.logNumMap.set(key, val);
                    return key;
                }
                else {
                    return Data.getTxtBlock(msg, color, size ? size : Data.txtSize, key);
                }
            }
        } catch (error) {
            return null;
        }
    }

    /**装饰器 */
    export namespace Decorator {
        /**输出红色的ERROR堆栈字符串 */
        function logError(error: string) {
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

    /**服务器调用的打印 */
    export namespace LinkServer {
        const EVENTRPC = "EVENT_UIDEBUG_SERVERCALLCLIENT";
        export const EVENTSERVERHACKCONSOLE = "EVENT_EVENTSERVERHACKCONSOLE";
        const serverlogColor = new Type.LinearColor(1, 0, 1, 1);
        let inited = false
        /**初始化 */
        export function serverinit() {
            if (inited) { return; }
            inited = true;
            if (SystemUtil.isClient()) {
                Events.addServerListener(EVENTRPC, (msg: string) => {
                    log(msg, serverlogColor);
                });
            }
            if (SystemUtil.isServer()) {
                Events.addClientListener(EVENTSERVERHACKCONSOLE, () => {
                    hackConsole();
                })
            }
        }

        export function slog(msg: string, player?: Gameplay.Player) {
            if (SystemUtil.isServer()) {
                if (!hackLog) {
                    console.log(msg);
                }
                if (player != null) {
                    Events.dispatchToClient(player, EVENTRPC, msg);
                }
                else {
                    Gameplay.getAllPlayers().forEach(p => {
                        Events.dispatchToClient(p, EVENTRPC, msg);
                    }
                    )
                }
            }
        }
    }

    //核心实现
    namespace Data {
        export let uiObject: ErrorMessageUI = null;
        export let txtSize: number = 15
        export const msgTxts: [number, UI.TextBlock][] = [];
        let TxtWidth: number = 960
        let alwaysScrollEnd: boolean = true;
        /**生成控制台UI对象 */
        export function setUIClass() {
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
            const height = screen.y / 3;
            const width = screen.x / 2;
            const size = new Type.Vector(width, height);
            const pos = new Type.Vector(screen.x / 2 - width / 2, screen.y - height);
            const dragHeight = 40;
            const enterwidth = 100;
            const inputheight = 60;
            const inputwidth = size.x - enterwidth;

            TxtWidth = width - 10;

            root.size = screen
            root.rootContent = UI.Canvas.newObject();
            root.rootContent.size = size;
            root.rootContent.position = pos;
            root.addToViewport(UI.UILayerScene);
            ret.uiObject = root;
            ret.rootCanvas = root.rootContent;
            //滚动区背景
            const scrollBg = UI.Image.newObject(ret.rootCanvas);
            scrollBg.size = new Type.Vector2(size.x, size.y - dragHeight - inputheight);
            scrollBg.position = new Type.Vector(0, dragHeight);
            scrollBg.imageColor = new Type.LinearColor(0, 0, 0, 0.5);
            //滚动区
            ret.messageScroll = UI.ScrollBox.newObject(ret.rootCanvas);
            ret.messageScroll.position = new Type.Vector(0, dragHeight);
            ret.messageScroll.size = new Type.Vector2(size.x, size.y - dragHeight - inputheight);
            ret.setVisible = (active: boolean) => {
                ret.rootCanvas.visibility = active ? UI.SlateVisibility.SelfHitTestInvisible : UI.SlateVisibility.Collapsed;
            }
            ret.messageScroll.scrollBarVisibility = UI.SlateVisibility.Collapsed;


            //拖拽条
            const dragBtn = UI.Button.newObject(ret.rootCanvas);
            dragBtn.size = new Type.Vector(size.x - dragHeight * 2, dragHeight);
            dragBtn.position = new Type.Vector(0, 0);
            let dragID = null;
            dragBtn.onPressed.add(() => {
                let beforeCursorPos = UI.getMousePositionOnViewport();//鼠标位置
                let offset = Type.Vector2.subtract(ret.rootCanvas.position, beforeCursorPos);//偏移量
                dragID = setInterval(() => {
                    let cursorPos = UI.getMousePositionOnViewport();//鼠标位置
                    ret.rootCanvas.position = Type.Vector2.add(offset, cursorPos);
                }, 1);
            })
            dragBtn.onReleased.add(() => {
                dragID && clearInterval(dragID);
            })
            //新打印文本时滚动到最后
            {
                const imgbg = UI.Image.newObject(ret.rootCanvas);
                imgbg.size = new Type.Vector(dragHeight, dragHeight);
                imgbg.position = new Type.Vector2(size.x - dragHeight - 150, 0 - dragHeight);
                imgbg.imageGuid = "157550";
                const toggle = UI.Button.newObject(ret.rootCanvas);
                toggle.size = new Type.Vector(dragHeight, dragHeight);
                toggle.position = new Type.Vector2(imgbg.position.x, imgbg.position.y);
                toggle.normalImageGuid = "88559";
                const noSelectColor = new Type.LinearColor(1, 1, 1, 0);
                const selectColor = new Type.LinearColor(1, 1, 1, 1);
                toggle.normalImageColor = selectColor;
                toggle.onClicked.add(() => {
                    alwaysScrollEnd = !alwaysScrollEnd;
                    toggle.normalImageColor = alwaysScrollEnd ? selectColor : noSelectColor;
                });
                //文本提示
                const txt = UI.TextBlock.newObject(ret.rootCanvas);
                txt.text = "始终滚动到最后";
                txt.fontColor = Type.LinearColor.black;
                txt.outlineColor = Type.LinearColor.white;
                txt.outlineSize = 1;
                txt.fontSize = 15;
                txt.position = new Type.Vector2(imgbg.position.x - 150, imgbg.position.y + 5);
            }

            //搜索框
            const findInput = UI.InputBox.newObject(ret.rootCanvas);
            findInput.size = new Type.Vector(dragBtn.size.x / 4, dragBtn.size.y - 5);
            findInput.position = new Type.Vector(dragBtn.size.x - dragBtn.size.x / 4 - dragHeight, 2.5);
            findInput.contentColor = Type.LinearColor.black;
            findInput.fontColor = Type.LinearColor.white;
            findInput.textLengthLimit = 99;
            findInput.hintString = "输入关键字";
            findInput.fontSize = 15;
            //搜索按钮
            const findBtn = UI.StaleButton.newObject(ret.rootCanvas);
            findBtn.size = new Type.Vector(dragHeight, dragHeight);
            findBtn.position = new Type.Vector(dragBtn.size.x - dragHeight, 0);
            findBtn.text = "";
            findBtn.normalImageGuid = "132756";
            findBtn.normalImageColor = Type.LinearColor.black;
            findBtn.fontSize = 15;
            findBtn.fontColor = Type.LinearColor.black;
            let scrollTween: TweenUtil.Tween<{ y: number }> = null;
            let beforeFindInfo: { txt: string, index: number } = { txt: null, index: -1 }
            findBtn.onClicked.add(() => {
                if (scrollTween) { scrollTween.stop(); }
                if (beforeFindInfo.txt != findInput.text) {
                    beforeFindInfo.txt = findInput.text;
                    beforeFindInfo.index = -1;
                }
                const findArr = msgTxts.filter(ele => ele[1].text.includes(findInput.text));
                if (findArr.length <= 0) { return; }//没找到任何东西
                let findindex = beforeFindInfo.index + 1;
                if (findindex >= findArr.length) {
                    findindex = 0;
                }
                beforeFindInfo.index = findindex;
                const findpos = findArr[findindex][0];
                scrollTween = new TweenUtil.Tween({ y: ret.messageScroll.scrollOffset }).to({ y: findpos }, 500).onUpdate((obj) => {
                    ret.messageScroll.scrollOffset = obj.y;
                }).onComplete(() => { scrollTween = null }).start();
            });

            //清除按钮
            const clearBtn = UI.StaleButton.newObject(ret.rootCanvas);
            clearBtn.size = new Type.Vector(dragHeight, dragHeight);
            clearBtn.position = new Type.Vector(size.x - dragHeight * 2, 0);
            clearBtn.text = "C";
            clearBtn.fontSize = 15;
            clearBtn.fontColor = Type.LinearColor.black;
            clearBtn.onClicked.add(() => {
                UIObj.clear();
            })

            //关闭按钮
            const closeBtn = UI.StaleButton.newObject(ret.rootCanvas);
            closeBtn.size = new Type.Vector(dragHeight, dragHeight);
            closeBtn.position = new Type.Vector(size.x - dragHeight, 0);
            closeBtn.text = "X";
            closeBtn.fontSize = 15;
            closeBtn.fontColor = Type.LinearColor.red;
            closeBtn.onClicked.add(() => {
                UIObj.close();
            })
            //输入框

            const input = UI.InputBox.newObject(ret.rootCanvas);
            input.size = new Type.Vector(inputwidth, inputheight);
            input.position = new Type.Vector(0, size.y - inputheight);
            input.fontSize = 20;
            input.textLengthLimit = 100;
            input.hintString = "输入指令";
            //指令确认按钮
            const inputBtn = UI.StaleButton.newObject(ret.rootCanvas);
            inputBtn.size = new Type.Vector(enterwidth, inputheight);
            inputBtn.position = new Type.Vector(inputwidth, size.y - inputheight);
            inputBtn.text = "确认";
            inputBtn.fontSize = 20;
            inputBtn.onClicked.add(() => {
                const ps = input.text.split(" ");
                const iscmd = ps.length > 0 && ps[0].startsWith('-') && ps[0].length >= 2;
                log(input.text, iscmd ? Type.LinearColor.green : Type.LinearColor.white);
                if (iscmd) {
                    const action = cmdActions.get(ps[0].substring(1));
                    if (action) {
                        action(ps.slice(1));
                    }
                }
                input.text = "";
            });
            return ret;
        }
        export const logNumMap: Map<number, { num: number, index: number }> = new Map();
        const usedKeys: number[] = [];
        export let lastUseIndex: number = -1;
        export let nextPosY: number = 0;
        export function getTxtBlock(txt: string, color: Type.LinearColor, size: number, useKey: number = -1): number {
            let index: number = 0;
            let txtObj: UI.TextBlock = null;
            if (lastUseIndex >= (msgTxts.length - 1)) {//需要新建文本对象

                txtObj = UI.TextBlock.newObject(uiObject.rootCanvas);
                uiObject.messageScroll.addChild(txtObj);
                txtObj.textHorizontalLayout = UI.UITextHorizontalLayout.AutoWarpText;
                txtObj.size = new Type.Vector(TxtWidth, 1);
                // ret.position = new Type.Vector(0, nextPosY);
                txtObj.lineHeightPercentage = 0.7
                txtObj.fontSize = txtSize;
                txtObj.outlineColor = Type.LinearColor.black;
                txtObj.outlineSize = 1;
                msgTxts.push([0, txtObj]);
                lastUseIndex = msgTxts.length - 1;
                index = lastUseIndex;
            }
            else {
                lastUseIndex++;
                txtObj = msgTxts[lastUseIndex][1];
                index = lastUseIndex;
            }
            txtObj.fontSize = size;
            txtObj.text = txt;

            txtObj.size = new Type.Vector(TxtWidth, txtObj.textHeight + 10);
            txtObj.position = new Type.Vector(0, nextPosY);
            msgTxts[index][0] = nextPosY;
            nextPosY = txtObj.size.y + nextPosY;
            // lastPosY += ret.size.y;
            txtObj.fontColor = color;

            const key = useKey ? useKey : Math.max(...usedKeys) + 1;
            const val = { num: 1, index: index };
            logNumMap.set(key, val);
            usedKeys.push(key);
            alwaysScrollEnd && (uiObject.messageScroll.scrollOffset = Math.max(0, msgTxts[index][0] - uiObject.messageScroll.size.y + txtObj.size.y));
            return key;
        }
    }
}
//默认实现一个截断console的打印指令
InUIDebug.cmdActions.set("hackConsole", (ss) => {
    if (ss[0] == "s") {
        Events.dispatchToServer(InUIDebug.LinkServer.EVENTSERVERHACKCONSOLE);
    }
    InUIDebug.hackConsole();
});


declare var UIDebug: {
    /**内置控制台总开关 */
    openLog: boolean,
    /**最大文本对象数量,低于1表述无上限会一直增加 */
    maxLogNum: number,
    /**指令定义集,仅客户端有效 */
    cmdActions: Map<string, (ps: string[]) => void>,
    /**将console的打印行为附加到这个可视化控制台内 */
    hackConsole: () => void,
    /**关于控制台显示UI的相关操作 */
    UIObj: {
        /**设置控制台的深度值 */
        setZorder: (zorder: number) => void,
        /**彻底关闭控制台 */
        close: () => void,
        /**清理空所有打印文本 */
        clear: () => void,
        /**临时隐藏 */
        hide: () => void,
        /**打开控制台 */
        open: () => void,
    }
    /**进行一行打印,如果是服务器调用，会让所有玩家打印 */
    log: (msg: string, color?: Type.LinearColor, key?: number, size?: number) => number,
    /**注册手势打开控制台,以中心为起始,参数为结束滑到的点位,如果不加参数,默认依次是相对屏幕正中的:下,上,左,右 */
    RegisterInput: (...touchPoints: Type.Vector2[]) => void,
    /**装饰器 */
    Decorator: {
        /**装饰到函数上，可以检查函数执行报错并打印出来 */
        attachError: () => void,
        /**装饰到类，可以查看这个类的实例函数执行次数 */
        attachFuncCallNum: <T extends { new(...args: any[]): {} }>(clsObj: T) => T,
        /**装饰到静态函数，可以查看此静态函数执行次数 */
        attachFuncCallStaticFunc: () => void,
    },
    /**服务器相关操作 */
    LinkServer: {
        /**如果要让服务器也能使用此打印，需要执行 */
        serverinit: () => void,
        /**服务器上的打印调用，如果没有player参数，则会让所有玩家打印 */
        slog: (msg: string, player?: Gameplay.Player) => void,
    }
};
globalThis.UIDebug = InUIDebug;