/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable mwts-rules/no-chinese-character */
/* eslint-disable prefer-const */

interface ErrorMessageUI {
    messageScroll: mw.ScrollBox

    /**UI集合对象 */
    rootCanvas: mw.Canvas,
    uiObject: mw.Widget,
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
                innerLog(args.join(','), mw.LinearColor.yellow);
            }
            cwarn(...args);
        }
        let cerror = console.error;
        console.error = function (...args: any[]) {
            if (SystemUtil.isServer()) {
                LinkServer.slog(args.join(','));
            }
            if (SystemUtil.isClient()) {
                innerLog(args.join(','), mw.LinearColor.red);
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
                Data.msgTxts[i][1].size = mw.Vector.zero;
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
            if (SystemUtil.isServer()) {
                return;
            }
            if (!Data.uiObject) {
                Data.setUIClass();
            }
            Data.uiObject.setVisible(true);
            openLog = true;
        }
    }
    /**打印到内置控制台,返回文本ID。如果是服务器调用，则在所有客户端打印紫色文本，不会返回文本id */
    export function log(msg: string, color: mw.LinearColor = mw.LinearColor.white, key: number = null, size?: number): number {

        if (!hackLog) {
            console.log(msg);
        }
        return innerLog(msg, color, key, size);
    }
    /**注册触摸开启 */
    export function RegisterInput(...touchPoints: mw.Vector2[]) {
        if (SystemUtil.isServer()) { return; }
        const view = mw.getViewportSize();
        const center = new mw.Vector2(view.x / 2, view.y / 2);
        const checkPoints: mw.Vector2[] = touchPoints.length > 0 ? touchPoints : [
            new mw.Vector2(view.x / 2, view.y),//下
            new mw.Vector2(view.x / 2, 0),//上
            new mw.Vector2(0, view.y / 2),//左
            new mw.Vector2(view.x, view.y / 2),//右
        ];
        let checkIndex = 0;//当前需要的检查目标索引
        const checkDistance = 50;//检查距离
        const touch = new mw.TouchInputUtil;
        // touch.setPlayerController();
        let checkFlag = false;//是否从正中心以及控制台在关闭状态下触发过检查
        touch.onTouchBegin.add((index, loc) => {
            if (openLog) { return; }//已经被打开了
            const dis = mw.Vector2.distance(center, loc);
            if (dis < checkDistance) {
                checkFlag = true;
            }
        })
        touch.onTouchEnd.add((index, loc) => {
            if (!checkFlag) { return; }//没有触发过检查
            checkFlag = false;
            const target = checkPoints[checkIndex];
            const dis = mw.Vector2.distance(target, loc);
            if (dis > checkDistance) {
                checkIndex = 0;
                return;
            }
            checkIndex++;
            if (checkIndex >= checkPoints.length) {
                checkIndex = 0;
                openLog = true;
                log(`开启控制台!`, mw.LinearColor.green);
            }
            else {
                console.log(`next:${checkPoints[checkIndex]}`);
            }
        });
    }

    //实际的打印逻辑实现,避免调用截断console函数后的递归调用
    function innerLog(msg: string, color: mw.LinearColor = mw.LinearColor.white, key: number = null, size?: number) {
        if (!msg || msg.length <= 0) {
            return;
        }
        if (ignore.find(v => { return msg.includes(v) }) != null) {//There is a TextField where its content is out of the area
            return;//含有忽略内容
        }


        if (SystemUtil.isServer()) {
            LinkServer.slog(msg);
            return;
        }

        if (!openLog) {
            return;
        }
        if (msg.includes("TypeError")) {
            color = mw.LinearColor.red;
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
            log(strtitle, mw.LinearColor.red);

            arr.forEach(s => {
                const begin = s.indexOf('at') + 2;
                const end = s.indexOf('(');
                const stackStr = s.slice(begin, end);
                log(stackStr, mw.LinearColor.red, 25);
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
                            log("-------", mw.LinearColor.red);
                            logError(error.stack);
                            log("-------", mw.LinearColor.red);
                        }

                    }
                }
            }
        }
        // const funcCallNum: Map<string | symbol, number> = new Map();
        const colorLevel: [number, mw.LinearColor][] = [
            [0.1, mw.LinearColor.green],
            [1, mw.LinearColor.white],
            [10, mw.LinearColor.blue]
        ];
        const funcCallTime: Map<string, number> = new Map();
        const funcNameBindNumber: Map<string, number> = new Map();
        const funcCallTotalNum: Map<string, number> = new Map();
        const checkUpdate = false;
        export function attachFuncCallNum<T extends { new(...args: any[]): {} }>(clsObj: T) {
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
                        let color: mw.LinearColor = mw.LinearColor.red;
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
                        let color: mw.LinearColor = mw.LinearColor.red;
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

        export function simpleCallQueue<T extends { new(...args: any[]): {} }>(clsObj: T) {
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
                    console.error(`hym!!! ${clsObj.name}.${funcName.toString()} isget:${isGet} | isset:${isSet}`);
                    return;
                }
                let func: any;
                try {

                    func = clsObj.prototype[funcName];
                } catch (error) {
                    console.error(`hym!!! ${clsObj.prototype}.${funcName}`)
                    return;
                }
                if (typeof func === "function") {
                    const funcClsName = `${clsObj.name}.${funcName.toString()}`

                    clsObj.prototype[funcName] = function (...args: any[]) {
                        // const beginTime = Date.now();
                        const ret = func.call(this, ...args);
                        // const passTime = Date.now() - beginTime;
                        // const total = (funcCallTime.get(funcClsName) ? funcCallTime.get(funcClsName) : 0) + passTime;
                        // funcCallTime.set(funcClsName, total);

                        // const alltime = (funcCallTime.get(funcClsName) * 0.001);
                        // if (!funcCallTotalNum.has(funcClsName)) {
                        //     funcCallTotalNum.set(funcClsName, 0);
                        // }
                        // const donum = funcCallTotalNum.get(funcClsName) + 1;
                        // funcCallTotalNum.set(funcClsName, donum);
                        // const svTime = alltime / donum;
                        let color: mw.LinearColor = mw.LinearColor.black;
                        // for (const [t, c] of colorLevel) {
                        //     if (alltime < t) {
                        //         color = c;
                        //         break;
                        //     }
                        // }
                        let n = log(`call>> ${funcClsName} `);
                        // funcNameBindNumber.set(funcClsName, n);
                        return ret;
                    }
                }
            })

            return clsObj;
        }
    }

    /**服务器调用的打印 */
    export namespace LinkServer {
        const EVENTRPC = "EVENT_UIDEBUG_SERVERCALLCLIENT";
        export const EVENTSERVERHACKCONSOLE = "EVENT_EVENTSERVERHACKCONSOLE";
        const serverlogColor = new mw.LinearColor(1, 0, 1, 1);
        let inited = false
        /**初始化 */
        export function serverinit() {
            if (inited) { return; }
            inited = true;
            if (SystemUtil.isClient()) {
                mw.Event.addServerListener(EVENTRPC, (msg: string) => {
                    log(msg, serverlogColor);
                });
            }
            if (SystemUtil.isServer()) {
                mw.Event.addClientListener(EVENTSERVERHACKCONSOLE, () => {
                    hackConsole();
                })
            }
        }

        export function slog(msg: string, player?: mw.Player) {
            if (SystemUtil.isServer()) {
                if (!hackLog) {
                    console.log(msg);
                }
                if (player != null) {
                    mw.Event.dispatchToClient(player, EVENTRPC, msg);
                }
                else {
                    mw.Player.getAllPlayers().forEach(p => {
                        mw.Event.dispatchToClient(p, EVENTRPC, msg);
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
        export const msgTxts: [number, mw.TextBlock][] = [];
        let TxtWidth: number = 960
        let alwaysScrollEnd: boolean = true;
        /**生成控制台UI对象 */
        export function setUIClass() {
            uiObject = createMsgUI();
            uiObject.uiObject.zOrder = 999999;
            mw.UIService.canvas.addChild(uiObject.uiObject);
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
            const screen = mw.WindowUtil.getViewportSize();
            const root = mw.UserWidgetPrefab.newObject();
            const height = screen.y / 3;
            const width = screen.x / 2;
            const size = new mw.Vector(width, height);
            const pos = new mw.Vector(screen.x / 2 - width / 2, screen.y - height);
            const dragHeight = 40;
            const enterwidth = 100;
            const inputheight = 60;
            const inputwidth = size.x - enterwidth;

            TxtWidth = width - 10;

            root.size = screen
            root.rootContent = mw.Canvas.newObject();
            root.rootContent.size = size;
            root.rootContent.position = pos;
            root.addToViewport(mw.UILayerScene);
            ret.uiObject = root;
            ret.rootCanvas = root.rootContent;

            const innerCanvas = mw.Canvas.newObject(ret.rootCanvas);
            innerCanvas.size = ret.rootCanvas.size;
            innerCanvas.position = mw.Vector2.zero;

            //切换显隐按钮
            const togBtn = mw.Button.newObject(ret.rootCanvas);
            togBtn.size = new mw.Vector2(50, 50);
            togBtn.position = new mw.Vector2(-50, dragHeight);
            togBtn.normalImageColor = mw.LinearColor.red;
            let tohide: boolean = false;
            togBtn.onClicked.add(() => {
                tohide = !tohide
                innerCanvas.visibility = tohide ? SlateVisibility.Collapsed : SlateVisibility.SelfHitTestInvisible;
            })

            //滚动区背景
            const scrollBg = mw.Image.newObject(innerCanvas);
            scrollBg.size = new mw.Vector2(size.x, size.y - dragHeight - inputheight);
            scrollBg.position = new mw.Vector(0, dragHeight);
            scrollBg.imageColor = new mw.LinearColor(0, 0, 0, 0.5);


            //滚动区
            ret.messageScroll = mw.ScrollBox.newObject(innerCanvas);
            ret.messageScroll.position = new mw.Vector(0, dragHeight);
            ret.messageScroll.size = new mw.Vector2(size.x, size.y - dragHeight - inputheight);
            ret.setVisible = (active: boolean) => {
                ret.rootCanvas.visibility = active ? mw.SlateVisibility.SelfHitTestInvisible : mw.SlateVisibility.Collapsed;
            }
            ret.messageScroll.scrollBarVisibility = mw.SlateVisibility.Collapsed;


            //拖拽条
            const dragBtn = mw.Button.newObject(innerCanvas);
            dragBtn.size = new mw.Vector(size.x - dragHeight * 2, dragHeight);
            dragBtn.position = new mw.Vector(0, 0);
            let dragID = null;
            dragBtn.onPressed.add(() => {
                let beforeCursorPos = mw.getMousePositionOnViewport();//鼠标位置
                let offset = mw.Vector2.subtract(ret.rootCanvas.position, beforeCursorPos);//偏移量
                dragID = setInterval(() => {
                    let cursorPos = mw.getMousePositionOnViewport();//鼠标位置
                    ret.rootCanvas.position = mw.Vector2.add(offset, cursorPos);
                }, 1);
            })
            dragBtn.onReleased.add(() => {
                dragID && clearInterval(dragID);
            })
            //新打印文本时滚动到最后
            {
                const imgbg = mw.Image.newObject(innerCanvas);
                imgbg.size = new mw.Vector(dragHeight, dragHeight);
                imgbg.position = new mw.Vector2(size.x - dragHeight - 150, 0 - dragHeight);
                imgbg.imageGuid = "157550";
                const toggle = mw.Button.newObject(innerCanvas);
                toggle.size = new mw.Vector(dragHeight, dragHeight);
                toggle.position = new mw.Vector2(imgbg.position.x, imgbg.position.y);
                toggle.normalImageGuid = "88559";
                const noSelectColor = new mw.LinearColor(1, 1, 1, 0);
                const selectColor = new mw.LinearColor(1, 1, 1, 1);
                toggle.normalImageColor = selectColor;
                toggle.onClicked.add(() => {
                    alwaysScrollEnd = !alwaysScrollEnd;
                    toggle.normalImageColor = alwaysScrollEnd ? selectColor : noSelectColor;
                });
                //文本提示
                const txt = mw.TextBlock.newObject(innerCanvas);
                txt.text = "始终滚动到最后";
                txt.fontColor = mw.LinearColor.black;
                txt.outlineColor = mw.LinearColor.white;
                txt.outlineSize = 1;
                txt.fontSize = 15;
                txt.position = new mw.Vector2(imgbg.position.x - 150, imgbg.position.y + 5);
            }

            //搜索框
            const findInput = mw.InputBox.newObject(innerCanvas);
            findInput.size = new mw.Vector(dragBtn.size.x / 4, dragBtn.size.y - 5);
            findInput.position = new mw.Vector(dragBtn.size.x - dragBtn.size.x / 4 - dragHeight, 2.5);
            findInput.contentColor = mw.LinearColor.black;
            findInput.fontColor = mw.LinearColor.white;
            findInput.textLengthLimit = 99;
            findInput.hintString = "输入关键字";
            findInput.fontSize = 15;
            //搜索按钮
            const findBtn = mw.StaleButton.newObject(innerCanvas);
            findBtn.size = new mw.Vector(dragHeight, dragHeight);
            findBtn.position = new mw.Vector(dragBtn.size.x - dragHeight, 0);
            findBtn.text = "";
            findBtn.normalImageGuid = "132756";
            findBtn.normalImageColor = mw.LinearColor.black;
            findBtn.fontSize = 15;
            findBtn.fontColor = mw.LinearColor.black;
            let scrollTween: mw.Tween<{ y: number }> = null;
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
                scrollTween = new mw.Tween({ y: ret.messageScroll.scrollOffset }).to({ y: findpos }, 500).onUpdate((obj) => {
                    ret.messageScroll.scrollOffset = obj.y;
                }).onComplete(() => { scrollTween = null }).start();
            });

            //清除按钮
            const clearBtn = mw.StaleButton.newObject(innerCanvas);
            clearBtn.size = new mw.Vector(dragHeight, dragHeight);
            clearBtn.position = new mw.Vector(size.x - dragHeight * 2, 0);
            clearBtn.text = "C";
            clearBtn.fontSize = 15;
            clearBtn.fontColor = mw.LinearColor.black;
            clearBtn.onClicked.add(() => {
                UIObj.clear();
            })

            //关闭按钮
            const closeBtn = mw.StaleButton.newObject(innerCanvas);
            closeBtn.size = new mw.Vector(dragHeight, dragHeight);
            closeBtn.position = new mw.Vector(size.x - dragHeight, 0);
            closeBtn.text = "X";
            closeBtn.fontSize = 15;
            closeBtn.fontColor = mw.LinearColor.red;
            closeBtn.onClicked.add(() => {
                UIObj.close();
            })
            //输入框

            const input = mw.InputBox.newObject(innerCanvas);
            input.size = new mw.Vector(inputwidth, inputheight);
            input.position = new mw.Vector(0, size.y - inputheight);
            input.fontSize = 20;
            input.textLengthLimit = 100;
            input.hintString = "输入指令";
            //指令确认按钮
            const inputBtn = mw.StaleButton.newObject(innerCanvas);
            inputBtn.size = new mw.Vector(enterwidth, inputheight);
            inputBtn.position = new mw.Vector(inputwidth, size.y - inputheight);
            inputBtn.text = "确认";
            inputBtn.fontSize = 20;
            inputBtn.onClicked.add(() => {
                const ps = input.text.split(" ");
                const iscmd = ps.length > 0 && ps[0].startsWith('-') && ps[0].length >= 2;
                log(input.text, iscmd ? mw.LinearColor.green : mw.LinearColor.white);
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
        export function getTxtBlock(txt: string, color: mw.LinearColor, size: number, useKey: number = -1): number {
            let index: number = 0;
            let txtObj: mw.TextBlock = null;
            if (lastUseIndex >= (msgTxts.length - 1)) {//需要新建文本对象

                txtObj = mw.TextBlock.newObject(uiObject.rootCanvas);
                uiObject.messageScroll.addChild(txtObj);
                txtObj.textHorizontalLayout = mw.UITextHorizontalLayout.AutoWarpText;
                txtObj.size = new mw.Vector(TxtWidth, 1);
                // ret.position = new mw.Vector(0, nextPosY);
                txtObj.lineHeightPercentage = 0.7
                txtObj.fontSize = txtSize;
                txtObj.outlineColor = mw.LinearColor.black;
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

            txtObj.size = new mw.Vector(TxtWidth, txtObj.textHeight + 10);
            txtObj.position = new mw.Vector(0, nextPosY);
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

    export function openAll() {
        openLog = true;
        LinkServer.serverinit();
        hackConsole();
        if (SystemUtil.isClient()) {

            RegisterInput();
            UIObj.open()
        }
    }

    /**忽略列表 */
    let ignore: string[] = [];
    export function addIgnore(...names: string[]) {
        ignore = ignore || [];
        ignore.push(...names);
    }
}


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
    log: (msg: string, color?: mw.LinearColor, key?: number, size?: number) => number,
    /**注册手势打开控制台,以中心为起始,参数为结束滑到的点位,如果不加参数,默认依次是相对屏幕正中的:下,上,左,右 */
    RegisterInput: (...touchPoints: mw.Vector2[]) => void,
    /**装饰器 */
    Decorator: {
        /**装饰到函数上，可以检查函数执行报错并打印出来 */
        attachError: () => void,
        /**装饰到类，可以查看这个类的实例函数执行次数 */
        attachFuncCallNum: <T extends { new(...args: any[]): {} }>(clsObj: T) => T,
        /**装饰到静态函数，可以查看此静态函数执行次数 */
        attachFuncCallStaticFunc: () => void,
        /**简单函数调用打印 */
        simpleCallQueue: <T extends { new(...args: any[]): {} }>(clsObj: T) => T,
    },
    /**服务器相关操作 */
    LinkServer: {
        /**如果要让服务器也能使用此打印，需要执行 */
        serverinit: () => void,
        /**服务器上的打印调用，如果没有player参数，则会让所有玩家打印 */
        slog: (msg: string, player?: mw.Player) => void,
    }
    /**初始化调用，开启所有 */
    openAll: () => void,

    /**忽略带有匹配字符内容的打印 */
    addIgnore: (...names: string[]) => void
};
globalThis.UIDebug = InUIDebug;