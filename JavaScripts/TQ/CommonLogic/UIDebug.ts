
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
        uiObject.uiObject.zOrder = 600000;
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
        lastUseIndex = 0;
        lastPosY = 0;
    }
    /**添加新文本并显示 */
    export function log(msg: string, color: Type.LinearColor = Type.LinearColor.white, size?: number) {
        if (!msg || msg.length <= 0) {
            return;
        }
        if (!uiObject) {
            setUIClass();
        }
        uiObject.setVisible(true);
        getTxtBlock(msg, color, size ? size : txtSize);
        uiObject.messageScroll.scrollToEnd();
    }

    let lastUseIndex: number = -1;
    let lastPosY: number = 0;
    function getTxtBlock(txt: string, color: Type.LinearColor, size: number) {
        let ret: UI.TextBlock = null;
        if (lastUseIndex < 0) {//需要新建文本对象
            ret = UI.TextBlock.newObject(uiObject.rootCanvas);
            uiObject.messageScroll.addChild(ret);
            ret.textHorizontalLayout = UI.UITextHorizontalLayout.AutoWarpText;
            ret.size = new Type.Vector(TxtWidth, 1);
            ret.position = new Type.Vector(0, lastPosY);
            ret.lineHeightPercentage = 0.6
            ret.fontSize = txtSize;

            msgTxts.push(ret);
        }
        else {
            ret = msgTxts[lastUseIndex];
            lastUseIndex++;
            if (lastUseIndex >= msgTxts.length) {
                lastUseIndex = -1;
            }
        }
        ret.fontSize = size;
        ret.text = txt;

        ret.size = new Type.Vector(TxtWidth, ret.textHeight + 10);
        lastPosY += ret.size.y;
        ret.fontColor = color;
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