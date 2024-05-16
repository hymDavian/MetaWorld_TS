import { TAction } from "./TAction";


export class SecondTimer {
    private _second: number = 0;
    private _tempsec: number = 0;
    public get time(): number { return this._tempsec; }

    constructor(t: number) {
        this.reset(t);
    }

    /**秒数变更事件 */
    public readonly onSecondChange: TAction<number> = new TAction();

    /**设置到目标秒值 */
    public reset(s: number) {
        this._second = s;
        this._tempsec = s;
    }

    /**驱动 */
    public update(dt: number) {
        this._second += dt;
        const t = Math.floor(this._second);
        if (t != this._tempsec) {
            this._tempsec = t;
            this.onSecondChange.call(t);
        }
    }

    public static addTaskByCondition(task: () => void, condition: () => boolean) {
        if (condition()) {
            task();
            return;
        }
        let id = setInterval(() => {
            if (condition()) {
                task();
                clearInterval(id);
            }
        }, 100);
    }
}