
interface errorMessageUI {
    messageScroll: UI.ScrollBox

    /**UI集合对象 */
    rootCanvas: UI.Canvas,
    uiObject: UI.Widget,
    /**设置显隐 */
    setVisible: (active: boolean) => void,
}

export namespace UIDebug {
    let uiObject: errorMessageUI = null;
    let txtSize: number = 30
    const msgTxts: UI.TextBlock[] = [];
    let TxtWidth: number = 960
    /**初始化 */
    function setUIClass() {
        uiObject = createMsgUI();
        // uiObject.uiObject.zOrder = 0;
        UI.UIManager.instance.canvas.addChild(uiObject.uiObject);
        uiObject.setVisible(false);
    }

    function createMsgUI(): errorMessageUI {
        let ret: errorMessageUI = {
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
        root.addToViewport(UI.UILayerSystem);
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

    const logNumMap: Map<number, number> = new Map();

    /**添加新文本并显示,返回文本对象 */
    export function log(msg: string, color: Type.LinearColor = Type.LinearColor.white, key: number = -1, size?: number): number {
        if (!msg || msg.length <= 0) {
            return;
        }
        if (!uiObject) {
            setUIClass();
        }
        uiObject.setVisible(true);


        if (key < 0 || key == undefined || key == null) {//第一次创建
            return getTxtBlock(msg, color, size ? size : txtSize);
        }
        else {
            if (msgTxts[key]) {//重复访问
                let t = 1;
                if (logNumMap.has(key)) {
                    t = logNumMap.get(key) + 1;
                    logNumMap.set(key, t);
                }
                msgTxts[key].text = `[${t}]` + msg;
                msgTxts[key].fontColor = color;
                return key;
            }
            else {
                return getTxtBlock(msg, color, size ? size : txtSize);
            }
        }

        // uiObject.messageScroll.scrollToEnd();
    }

    let lastUseIndex: number = -1;
    let nextPosY: number = 0;

    export function getShowItemNum() {
        return lastUseIndex + 1;
    }
    function getTxtBlock(txt: string, color: Type.LinearColor, size: number): number {
        let ret: number = 0;
        let txtObj: UI.TextBlock = null;
        if (lastUseIndex >= (msgTxts.length - 1)) {//需要新建文本对象

            txtObj = UI.TextBlock.newObject(uiObject.rootCanvas);
            uiObject.messageScroll.addChild(txtObj);
            txtObj.textHorizontalLayout = UI.UITextHorizontalLayout.AutoWarpText;
            txtObj.size = new Type.Vector(TxtWidth, 1);
            // ret.position = new Type.Vector(0, nextPosY);
            txtObj.lineHeightPercentage = 0.6
            txtObj.fontSize = txtSize;

            msgTxts.push(txtObj);
            lastUseIndex = msgTxts.length - 1;
            ret = lastUseIndex;
        }
        else {
            lastUseIndex++;
            txtObj = msgTxts[lastUseIndex];
            ret = lastUseIndex;
        }
        txtObj.fontSize = size;
        txtObj.text = txt;

        txtObj.size = new Type.Vector(TxtWidth, txtObj.textHeight + 10);
        txtObj.position = new Type.Vector(0, nextPosY);
        nextPosY = txtObj.size.y + nextPosY;
        // lastPosY += ret.size.y;
        txtObj.fontColor = color;
        if (!logNumMap.has(ret)) {
            logNumMap.set(ret, 1);
        }
        return ret;
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
        return function (target: any, propertyRey: string, description: PropertyDescriptor) {
            if (description.value && typeof description.value === "function") {
                let oldFunc = description.value;
                description.value = function (...args: any[]) {
                    try {
                        oldFunc(...args);
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

}