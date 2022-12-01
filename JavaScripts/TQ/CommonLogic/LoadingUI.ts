/**基于不与其他任何脚本耦合，实现自我逻辑自洽的虚Loading基类 */
abstract class LodPanelClass extends UI.UIBehaviour {
    img_bg: UI.Image;
    txt_des: UI.TextBlock;
    slider_progress: UI.ProgressBar;
}
/**Loading虚基类承载的类型参数 */
type LoadingType = {
    new(...args: any[]): LodPanelClass
}
/**通用的loadingUI纯逻辑脚本 */
export class LoadingUI {

    private constructor() { }
    /**初始化，注册要使用的UI类类型 */
    public init(cls: LoadingType) {
        this.uiClass = cls;
    }

    private static _ins: LoadingUI = null;
    public static get instance(): LoadingUI {
        if (LoadingUI._ins == null) {
            LoadingUI._ins = new LoadingUI();
        }
        return LoadingUI._ins;
    }

    private uiClass: LoadingType = null;
    private loadingUI: LodPanelClass = null;
    public get isShow(): boolean {
        return this.loadingUI ? this.loadingUI.visible : false;
    }

    public open(): LoadingUI {
        if (this.loadingUI && this.loadingUI.visible) { return; }
        if (!this.uiClass) {
            console.error("没有提供loadingUI类型！");
        }
        if (this.loadingUI == null) {
            this.loadingUI = Extension.UIManager.instance.create(this.uiClass);// this.uiClass.creat();
            this.loadingUI.canUpdate = true;
            let UIupdate: (dt: number) => void = this.loadingUI["onUpdate"];
            this.loadingUI["onUpdate"] = function (dt: number) {
                if (UIupdate) {
                    UIupdate(dt);
                }
                LoadingUI._ins.update(dt);
            }
            this.loadingUI.slider_progress.sliderMinValue = 0;//.setSliderMinValue(0);
            this.loadingUI.slider_progress.sliderMaxValue = 1;//.setSliderMaxValue(1);
            this.targetPercent = 0;
            // GameGlobal.customUpdateAct.add(this.update, this);
        }
        else if (!this.loadingUI.visible) {
            Extension.UIManager.instance.showUI(this.loadingUI, Extension.UILayerTop);
        }
        return this;
    }

    /**显示并设置进度值 */
    public setProgress(val: number, max: number = 1, min: number = 0): LoadingUI {
        this.open();
        this.loadingUI.slider_progress.sliderMinValue = (Math.min(min, max));
        this.loadingUI.slider_progress.sliderMaxValue = (Math.max(min, max));
        this.targetPercent = val;
        if (this.targetPercent <= this.loadingUI.slider_progress.currentValue) {
            this.loadingUI.slider_progress.currentValue = (this.targetPercent);
        }
        return this;
    }

    /**显示并设置进度文字 */
    public setText(txt: string): LoadingUI {
        this.open();
        this.loadingUI.txt_des.text = (txt);
        return this;
    }

    /**显示并设置进度条背景图 */
    public setBgImg(guid: string): LoadingUI {
        this.open();
        this.loadingUI.img_bg.imageGuid = (guid);
        return this
    }

    private lastSetCompAction: () => void = null;
    /**设置进度条走完后要干的事情 */
    public setCompeleteAct(callback: () => void): LoadingUI {
        this.lastSetCompAction = callback;
        return this
    }

    /**开启一个虚假的固定时间进度条 */
    public setForgeProgress(time: number): LoadingUI {
        this.forge = true;
        this.setProgress(0, time);
        return this;
    }

    /**清理所有参数 */
    public clearAll(): LoadingUI {
        this.lastSetCompAction = null;
        this.forge = false;
        this.targetPercent = 0;
        this.tickStep = -1;
        if (this.loadingUI) {
            this.loadingUI.txt_des.text = ("");
            this.loadingUI.img_bg.imageGuid = ("");
            this.loadingUI.slider_progress.currentValue = (0);
        }
        return this;
    }

    /**每帧进发的距离 */
    public setTickStep(sp: number): LoadingUI {
        this.tickStep = sp;
        return this;
    }

    private forge: boolean = false;
    private targetPercent: number = 0;
    private tickStep: number = -1;
    private update(dt: number) {
        if (this.isShow) {
            let [cur, max] = [this.loadingUI.slider_progress.currentValue, this.loadingUI.slider_progress.sliderMaxValue];
            cur += this.tickStep > 0 ? dt * this.tickStep : dt;
            if (this.forge) {//如果是虚假进度
                this.setProgress(cur + dt, max);
            }
            else {
                cur = this.RoundNumber(cur, this.loadingUI.slider_progress.sliderMinValue, this.targetPercent);
            }
            this.loadingUI.slider_progress.currentValue = (cur);

            if (cur >= max) {
                if (this.lastSetCompAction != null) {
                    try {
                        this.lastSetCompAction();
                    } catch (error) {
                        console.log("loading error:" + error);
                    }
                    this.lastSetCompAction = null;
                }
                Extension.UIManager.instance.hideUI(this.loadingUI);
                this.clearAll();
            }

        }
    }

    private RoundNumber(value: number, min: number, max: number) {
        if (value > max) return max;
        if (value < min) return min;
        return value;
    }
}