interface IInputCanvasUI {
    rootCanvas: mw.Canvas;
    uiObject: mw.Widget;
    setVisible(active: boolean): void;
}
type uiContent = { ui: mw.Widget, root: mw.Canvas, drag: mw.Button, input: mw.InputBox, ok: mw.StaleButton, tips: mw.TextBlock };
export class RuntimeInputEditUI implements IInputCanvasUI {
    public readonly rootCanvas: mw.Canvas;
    public readonly uiObject: mw.Widget;
    public setVisible(active: boolean) {
        this.rootCanvas.visibility = active ? mw.SlateVisibility.SelfHitTestInvisible : mw.SlateVisibility.Collapsed;
    }
    private static idSeed: number = 0;
    private readonly id: number;
    private readonly dragBtn: mw.Button;
    private readonly input: mw.InputBox;
    private readonly okBtn: mw.StaleButton;
    private readonly tipsTxt: mw.TextBlock;
    private _dragID: number = null;
    private constructor(uiObj: mw.Widget, root: mw.Canvas, drag: mw.Button, input: mw.InputBox, ok: mw.StaleButton, tips: mw.TextBlock) {

        this.id = ++RuntimeInputEditUI.idSeed;
        this.uiObject = uiObj;
        this.rootCanvas = root;
        this.dragBtn = drag;
        this.input = input;
        this.okBtn = ok;
        this.tipsTxt = tips;
        this.onStart();
    }

    private onStart() {
        this.dragBtn.onPressed.add(() => {
            let beforeCursorPos = mw.getMousePositionOnViewport();//鼠标位置
            let offset = mw.Vector2.subtract(this.uiObject.position, beforeCursorPos);//偏移量
            this._dragID = setInterval(() => {
                let cursorPos = mw.getMousePositionOnViewport();//鼠标位置
                this.uiObject.position = mw.Vector2.add(offset, cursorPos);
            }, 1);
        })
        this.dragBtn.onReleased.add(() => {
            this._dragID && clearInterval(this._dragID);
        })
        this.okBtn.onClicked.add(() => {
            this.onConfirmClick.call(this.input.text);
        })
    }
    public readonly onConfirmClick: mw.Action1<string> = new Action1();
    public get title(): string { return this.tipsTxt.text; }
    public set title(v: string) { this.tipsTxt.text = `[${this.id}]${v}`; }

    public static show(title: string, clickCallback?: (s: string) => void) {
        let ret: RuntimeInputEditUI = null;
        const create = RuntimeInputEditUI.createUIObj();
        ret = new RuntimeInputEditUI(create.ui, create.root, create.drag, create.input, create.ok, create.tips);
        ret.onConfirmClick.clear();
        const randomSeed = 100;
        const viewCenter = mw.getViewportSize().clone().divide(2);//视口中心坐标
        ret.uiObject.position = new mw.Vector2(viewCenter.x + MathUtil.randomInt(-randomSeed, randomSeed), viewCenter.y + MathUtil.randomInt(-randomSeed, randomSeed));
        ret.title = title;
        if (clickCallback != null) {
            ret.onConfirmClick.add(clickCallback);
        }
        ret.setVisible(true);
        return ret;
    }
    private static createUIObj(): uiContent {
        const width = 300;
        const height = 100;
        const fontsize = 15;
        const LRRatio = { L: 4, R: 1 };//左右内容占比
        const LRTT = LRRatio.L + LRRatio.R;
        const UDRatio = { U: 1, D: 2 };//上下内容占比
        const UDTT = UDRatio.U + UDRatio.D;
        const space = 3;//内容UI间隔

        const size = new mw.Vector2(width, height);
        const root = mw.UserWidgetPrefab.newObject();
        root.size = size;
        root.rootContent = mw.Canvas.newObject();
        root.rootContent.size = size;
        root.rootContent.position = mw.Vector2.zero;
        root.addToViewport(mw.UILayerSystem);

        const valueCanvas = mw.Canvas.newObject(root.rootContent);
        valueCanvas.size = size;
        valueCanvas.position = mw.Vector2.zero;

        //关闭按钮 与内容画布同级
        const closeBtn: mw.Button = mw.Button.newObject(root.rootContent);
        closeBtn.size = new mw.Vector2(50, 50);
        closeBtn.position = new mw.Vector2(-50, 50);
        closeBtn.normalImageColor = mw.LinearColor.red;
        let visible = true;
        closeBtn.onClicked.add(() => {
            visible = !visible;
            valueCanvas.visibility = visible ? mw.SlateVisibility.SelfHitTestInvisible : mw.SlateVisibility.Collapsed;
        })

        //拖拽区
        const dragBtn: mw.Button = mw.Button.newObject(valueCanvas);
        dragBtn.size = size;
        dragBtn.position = mw.Vector2.zero;
        dragBtn.normalImageColor = mw.LinearColor.yellow;
        //输入盒
        const inputBox: mw.InputBox = mw.InputBox.newObject(valueCanvas);
        inputBox.size = new mw.Vector2(width * LRRatio.L / LRTT - space * 2, height * UDRatio.D / UDTT);
        inputBox.position = new mw.Vector2(space, height * UDRatio.U / UDTT - space);
        inputBox.textLengthLimit = 9999;
        inputBox.textAlign = mw.TextJustify.Left;
        inputBox.textVerticalAlign = mw.TextVerticalJustify.Top;
        inputBox.autoWrap = true;
        inputBox.fontSize = fontsize;
        //确定按钮
        const okBtn: mw.StaleButton = mw.StaleButton.newObject(valueCanvas);
        okBtn.size = new mw.Vector2(width * LRRatio.R / LRTT - space, height * UDRatio.D / UDTT);
        okBtn.text = "确认";
        okBtn.position = new mw.Vector2(width - space - okBtn.size.x, height * UDRatio.U / UDTT - space);
        okBtn.normalImageColor = mw.LinearColor.green;
        okBtn.fontSize = fontsize;
        //title
        const titleTxt: mw.TextBlock = mw.TextBlock.newObject(valueCanvas);
        titleTxt.size = new mw.Vector2(inputBox.size.x, height * UDRatio.U / UDTT - space);
        titleTxt.position = new mw.Vector2(space, space);
        titleTxt.fontColor = mw.LinearColor.black;
        titleTxt.fontSize = fontsize;


        const ret: uiContent = {
            ui: root,
            root: root.rootContent,
            drag: dragBtn,
            input: inputBox,
            ok: okBtn,
            tips: titleTxt
        }
        return ret;
    }
}

// namespace RuntimeInputEditUI{
//     function createUI()
// }


