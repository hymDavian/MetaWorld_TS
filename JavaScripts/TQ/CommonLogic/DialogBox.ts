
interface Class<T> extends Function {
    new(...args: any[]): T;
}
interface DialogUI {
    /**标题 */
    text_title: UI.TextBlock,
    /**信息文本 */
    text_message: UI.TextBlock,
    /**动态生成按钮的区域 */
    canvas_buttons: UI.Canvas,
    /**其他需要每次动态生成的物体的区域(可以没有) */
    canvas_other?: UI.Canvas,
    /**背景图片 */
    image_bg?: UI.Image,

    /**UI集合对象 */
    rootCanvas: UI.Canvas,
    uiObject: UI.Widget,
    /**设置显隐 */
    setVisible: (active: boolean) => void,
}
abstract class MyDialogBehavior extends UI.UIBehavior implements DialogUI {
    text_title: UI.TextBlock;
    text_message: UI.TextBlock;
    canvas_buttons: UI.Canvas;
    canvas_other?: UI.Canvas;
    image_bg: UI.Image;
}
interface otherIconUI {
    iconBg?: UI.Image,
    /**图案 */
    icon: UI.Image,
    /**描述 */
    des: UI.TextBlock,
    /**UI集合对象 */
    rootCanvas: UI.Canvas,
    /**如果是默认提供，跟rootCanvas一致。如果是外部提供，比rootCanvas高一级 */
    uiObject: UI.Widget,
    /**设置显隐 */
    setVisible: (active: boolean) => void,

}
abstract class MyIconBehavior extends UI.UIBehavior implements otherIconUI {
    icon: UI.Image;
    des: UI.TextBlock;
}

export namespace DialogBox {
    let uiObject: DialogUI = null;//对话界面UI对象
    let itemUIClass: Class<MyIconBehavior> = null;//子物体道具ui类型预制体
    type renderFunc<T> = (data: T) => { icon: string, des?: string, iconbg?: string };//获取绘制道具UI的信息的方式
    type btnCreateInfo = { txt: string, img?: string, click: () => void, size?: [number, number] };//生成按钮的信息类型
    const itemRenderFunc: Map<string, renderFunc<any>> = new Map();//各种绘制道具UI的信息方式的对应map

    /**注册使用的UI类或背景图片，如果传背景图guid,会以默认方式创建一个对话显示，如果时UI类，会依据这个UI类的样式创建
     * @param uiCls 对话UI主界面类 或 生成的画布节点
     * @param itemCls 需要生成的其他字物体UI类型(如果需要的话，比如显示奖励ICON所用的UI自定义类)
     */
    export function setUIClass<T extends MyDialogBehavior>(uiCls: Class<MyDialogBehavior> | string, itemCls?: Class<MyIconBehavior>) {
        if (typeof uiCls === "string") {
            uiObject = createRootUIObj(uiCls);
        }
        else {
            uiObject = UI.UIManager.instance.create(uiCls);//生成这个UI做备用
        }
        uiObject.uiObject.zOrder = 600000;
        uiObject.canvas_other.autoLayoutEnable = true;//开启自动布局
        uiObject.canvas_other.autoLayoutPacketRule = UI.UILayoutPacket.CenterCenter;
        uiObject.canvas_buttons.autoLayoutEnable = true;//开启自动布局
        uiObject.canvas_buttons.autoLayoutPacketRule = UI.UILayoutPacket.CenterCenter;
        UI.UIManager.instance.canvas.addChild(uiObject.uiObject);
        uiObject.setVisible(false);
        itemUIClass = itemCls;
    }
    /**注册带Icon的对话框生成icon的信息获取方式
     * @param dataType 
     * @param getIconInfo 
     */
    export function registerItemRender<T>(dataType: Class<T>, getIconInfo: renderFunc<T>) {
        const dataClsName = dataType.name;
        itemRenderFunc.set(dataClsName, getIconInfo);
    }

    /**打开对话框 会清理之前所有内容
     * @param message 对话信息
     * @param title 标题
     * @param items 要显示的道具icon信息
     */
    export function open(message: string, title: string = "", items?: any[]) {
        clear();//清理之前的显示

        // UI.UIManager.instance.showUI(uiObject as unknown as UI.UIBehavior)
        uiObject.setVisible(true);
        uiObject.text_title.text = title;
        uiObject.text_message.text = message;
        //带有额外物体信息，且对话UI具有icon显示区,有对应itemUI
        if (items && items.length > 0 && uiObject.canvas_other) {

            for (let i = 0; i < items.length; i++) {
                const itemData = items[i];//具体数据对象
                const itemClsName = itemData.constructor.name;//这个数据的类名
                if (itemClsName != 'Object' && itemRenderFunc.has(itemClsName)) {//有处理这种类型数据的方式
                    //进行动态icon生成
                    const { icon, des, iconbg } = itemRenderFunc.get(itemClsName)(itemData);
                    let iconUI: otherIconUI = null;
                    if (iconItems.length > i) {//这个索引以前创建过
                        iconUI = iconItems[i];
                    }
                    else {
                        iconUI = createIconUIObj();
                        iconItems.push(iconUI);
                    }
                    iconUI.setVisible(true);//显示出来
                    iconUI.icon.imageGuid = icon;
                    iconUI.des.text = des ? des : "";
                    if (iconbg && iconUI.iconBg) {
                        iconUI.iconBg.imageGuid = iconbg;
                    }
                }
                else {
                    console.error("这不是一个class类型 或 没有注册该类型的数据处理方式");
                }
            }
        }
    }

    /**关闭对话界面并清理所有内容 */
    export function closeAll() {
        clear();
        uiObject.setVisible(false);
    }

    /**仅清理内容不关闭 */
    export function clear() {
        uiObject.text_title.text = "";
        uiObject.text_message.text = "";
        // //隐藏所有图标
        for (let i = 0; i < iconItems.length; i++) {
            iconItems[i].setVisible(false);
        }
        //隐藏所有按钮
        displayBtns.forEach(btn => {
            btn.onClicked.clear();//清理点击回调
            btn.visibility = UI.SlateVisibility.Collapsed;//隐藏
            uiObject.rootCanvas.addChild(btn);
            btnPool.push(btn);
        })
        displayBtns.length = 0;
    }

    const iconItems: otherIconUI[] = [];
    function createIconUIObj(): otherIconUI {
        let ret: otherIconUI = null;
        if (itemUIClass == null) {//不存在外部的UIprefab 逻辑内自行生成
            ret = {
                icon: null,
                des: null,
                rootCanvas: null,
                uiObject: null,
                setVisible: null
            }

            ret.rootCanvas = ret.uiObject = UI.Canvas.newObject(uiObject.canvas_other);
            ret.rootCanvas.size = new Type.Vector2(150, 200);
            ret.icon = UI.Image.newObject(ret.rootCanvas);
            ret.icon.size = new Type.Vector2(150, 150);
            ret.icon.position = new Type.Vector2(0, 0);

            ret.iconBg = UI.Image.newObject(ret.rootCanvas);
            ret.iconBg.size = new Type.Vector2(150, 150);
            ret.iconBg.position = new Type.Vector2(0, 0);
            ret.iconBg.imageGuid = "27352";

            ret.des = UI.TextBlock.newObject(ret.rootCanvas);
            ret.des.size = new Type.Vector2(150, 50);
            ret.des.position = new Type.Vector(0, 150);
            ret.des.fontSize = 20;
            ret.des.fontColor = Type.LinearColor.white;
            ret.des.textHorizontalLayout = UI.UITextHorizontalLayout.NoClipping;
            ret.des.textAlign = UI.TextJustify.Center;
            ret.des.textVerticalAlign = UI.TextVerticalJustify.Center;
            ret.des.textJustification = UI.TextJustify.Center;
            ret.des.outlineColor = Type.LinearColor.black;
            ret.des.outlineSize = 1;

            ret.setVisible = (active: boolean) => {
                ret.rootCanvas.visibility = active ? UI.SlateVisibility.SelfHitTestInvisible : UI.SlateVisibility.Collapsed;
                if (active) {
                    uiObject.canvas_other.addChild(ret.uiObject);
                }
                else {
                    uiObject.rootCanvas.addChild(ret.uiObject);
                }
            }

            // ret.rootCanvas.invalidateLayoutAndVolatility();//最后重新排版绘制
        }
        else {
            ret = UI.UIManager.instance.create(itemUIClass);//生成这个道具图标UI
            uiObject.canvas_other.addChild(ret.uiObject);//添加到画布节点
        }
        return ret;
    }
    function createRootUIObj(bgGuid: string): DialogUI {
        let ret: DialogUI = {
            uiObject: null,
            rootCanvas: null,
            image_bg: null,
            text_title: null,
            text_message: null,
            canvas_buttons: null,
            canvas_other: null,
            setVisible: null
        };
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
        //背景图
        ret.image_bg = UI.Image.newObject(ret.rootCanvas);
        ret.image_bg.imageGuid = bgGuid;
        const bgSize = new Type.Vector2(screen.x * 0.6, screen.y * 0.6);
        const bgPos = new Type.Vector2((screen.x - bgSize.x) / 2, (screen.y - bgSize.y) / 2);
        ret.image_bg.size = bgSize;
        ret.image_bg.position = bgPos
        //标题文本
        ret.text_title = UI.TextBlock.newObject(ret.rootCanvas);
        const titleSize = new Type.Vector2(bgSize.x / 2, 100);
        ret.text_title.size = titleSize;
        ret.text_title.position = new Type.Vector2(bgPos.x + titleSize.x / 2, bgPos.y + 50);
        ret.text_title.fontColor = Type.LinearColor.white;
        ret.text_title.fontSize = 35;
        ret.text_title.outlineColor = Type.LinearColor.black;
        ret.text_title.outlineSize = 1;
        ret.text_title.textHorizontalLayout = UI.UITextHorizontalLayout.NoClipping;
        ret.text_title.textAlign = UI.TextJustify.Center;
        ret.text_title.textVerticalAlign = UI.TextVerticalJustify.Center;
        ret.text_title.textJustification = UI.TextJustify.Center;
        //内容文本
        ret.text_message = UI.TextBlock.newObject(ret.rootCanvas);
        const msgSize = new Type.Vector2(bgSize.x * 0.75, bgSize.y * 0.5);
        ret.text_message.size = msgSize;
        ret.text_message.position = new Type.Vector2(bgPos.x + (bgSize.x - msgSize.x) / 2, ret.text_title.position.y + 110)
        ret.text_message.fontColor = Type.LinearColor.white;
        ret.text_message.fontSize = 25;
        ret.text_message.outlineColor = Type.LinearColor.black;
        ret.text_message.outlineSize = 1;
        ret.text_message.textHorizontalLayout = UI.UITextHorizontalLayout.AutoWarpText;
        ret.text_message.textAlign = UI.TextJustify.Left;
        ret.text_message.textVerticalAlign = UI.TextVerticalJustify.Top;
        ret.text_message.textJustification = UI.TextJustify.Left;
        //按钮集
        ret.canvas_buttons = UI.Canvas.newObject(ret.rootCanvas);
        const btnsSize = new Type.Vector2(bgSize.x * 0.75, 100);
        ret.canvas_buttons.size = btnsSize;
        ret.canvas_buttons.position = new Type.Vector2(bgPos.x + (bgSize.x - btnsSize.x) / 2, ret.text_message.position.y + msgSize.y + 10);
        // ret.canvas_buttons.autoLayoutEnable = true;//开启自动布局
        // ret.canvas_buttons.autoLayoutPacketRule = UI.UILayoutPacket.CenterCenter;
        //icon集
        ret.canvas_other = UI.Canvas.newObject(ret.rootCanvas);
        const otherSize = new Type.Vector2(msgSize.x, 200);
        ret.canvas_other.size = otherSize;
        ret.canvas_other.position = new Type.Vector2(ret.text_message.position.x, ret.text_message.position.y + (msgSize.y - 200));
        // ret.canvas_other.autoLayoutEnable = true;//开启自动布局
        // ret.canvas_other.autoLayoutPacketRule = UI.UILayoutPacket.CenterCenter;

        ret.setVisible = (active: boolean) => {
            ret.rootCanvas.visibility = active ? UI.SlateVisibility.SelfHitTestInvisible : UI.SlateVisibility.Collapsed;
        }

        return ret;


    }


    /**可用的按钮池 */
    const btnPool: UI.StaleButton[] = [];
    /**正在显示的按钮 */
    const displayBtns: UI.StaleButton[] = [];
    /**增加按钮到对话
     * @param btns 按钮生成信息
     * @param space 间隔距离
     * @param checkScreen 是否自动适配(传入的大小会依据在1920*1080的情况下对目前屏幕大小为准做更改)
     */
    export function addBtns(btns: btnCreateInfo[], space: number = 500, checkScreen: boolean = false) {
        for (let i = 0; i < btns.length; i++) {
            const { txt, img, click: clickCallback, size } = btns[i];
            console.log("可用按钮：" + btnPool.length);
            let uiBtn = btnPool.length > 0 ? btnPool.pop() : UI.StaleButton.newObject(uiObject.canvas_buttons);
            uiObject.canvas_buttons.addChild(uiBtn);
            uiBtn.text = txt;
            uiBtn.normalImageGuid = img ? img : "27260";

            let size2 = size ? size : [156, 73];
            if (checkScreen) {
                const screen = Util.WindowUtil.getViewportSize();
                const ratioX = screen.x / 1920;
                const ratioY = screen.y / 1080;
                size2[0] = size2[0] * ratioX;
                size2[1] = size2[1] * ratioY;
            }
            uiBtn.size = new Type.Vector2(...size2);
            uiBtn.onClicked.add(clickCallback);
            uiBtn.visibility = UI.SlateVisibility.Visible;
            displayBtns.push(uiBtn);
        }
        uiObject.canvas_buttons.autoLayoutSpacing = space;

        uiObject.canvas_buttons.invalidateLayoutAndVolatility();
    }

    /**关闭所有按钮，然后出现一个默认的关闭按钮 */
    export function defaultButton(closeStr?: string) {
        displayBtns.forEach(btn => {
            btn.onClicked.clear();//清理点击回调
            btn.visibility = UI.SlateVisibility.Collapsed;//隐藏
            uiObject.rootCanvas.addChild(btn);
            btnPool.push(btn);
        })
        displayBtns.length = 0;

        addBtns([
            {
                txt: closeStr ? closeStr : "关闭",
                click: () => { closeAll() }
            }
        ])
    }

}