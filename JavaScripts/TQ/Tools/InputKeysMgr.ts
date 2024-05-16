export enum EInputState {
    up = 0,
    press = 1,
    down = 2,
}
export class InputKeysMgr {


    private static readonly keystate: Map<mw.Keys, EInputState> = new Map();
    private static readonly keyEvent: Map<mw.Keys, Map<EInputState, (() => void)[]>> = new Map();
    /**添加键盘事件(叠加) */
    public static addKeyEvent(key: mw.Keys, state: EInputState, callback: () => void) {
        if (!this.keyEvent.has(key)) {
            const inputmap: Map<EInputState, (() => void)[]> = new Map([
                [EInputState.up, []],
                [EInputState.press, []],
                [EInputState.down, []],
            ]);
            this.keyEvent.set(key, inputmap);
            InputUtil.onKeyUp(key, () => {
                inputmap.get(EInputState.up).forEach(f => {
                    f();
                })
            });
            InputUtil.onKeyPress(key, () => {
                inputmap.get(EInputState.press).forEach(f => {
                    f();
                })
            });
            InputUtil.onKeyDown(key, () => {
                inputmap.get(EInputState.down).forEach(f => {
                    f();
                })
            });
        }

        this.keyEvent.get(key).get(state).push(callback);
    }
    /**监听键盘按下情况 */
    public static initLisInput(key: mw.Keys) {
        if (this.keystate.has(key)) { return; }
        this.addKeyEvent(key, EInputState.down, () => {
            this.keystate.set(key, EInputState.down);
            this.consoleKey();
        });
        this.addKeyEvent(key, EInputState.up, () => {
            this.keystate.set(key, EInputState.up);
            this.consoleKey();
        });
        this.addKeyEvent(key, EInputState.press, () => {
            this.keystate.set(key, EInputState.press);
            this.consoleKey();
        });
        this.keystate.set(key, EInputState.up);//默认是弹起的
    }
    private static consoleKey() {
        let keys: string[] = [];
        this.keystate.forEach((v, k) => {
            switch (v) {
                case EInputState.press: keys.push(`${k}_press`); break;//press
                case EInputState.down: keys.push(`${k}_down`); break;//down
                case EInputState.up:
                default: break;
            }
        });
        if (keys.length > 0) {
            console.log(...keys);
        }
    }

    /**获取按键状态(需要先监听)
     * @param key 按键
     * @returns 0up 1press 2down
     */
    public static getKeyState(key: mw.Keys) {
        const v = this.keystate.get(key);
        return v == null ? 0 : v;
    }



    /**注册多重按键组合效果
     * @param infos 按键监听 0抬起 1按住 2按下
     * @param callback 执行事务
     */
    public static addKeyEvent_Multiple(infos: { k: mw.Keys, state: EInputState }[], callback: () => void) {
        // for(const {k,state} of infos){
        //     switch(state){
        //         case 0:InputUtil.onKeyUp(k,()=>{

        //         })
        //     } 
        // }
        let conditions: (() => boolean)[] = [];
        for (let i = 0; i < infos.length; i++) {
            const { k, state } = infos[i];
            this.initLisInput(k);
            conditions.push(() => { return this.keystate.get(k) == state });
        }
        const lastinfo = infos[infos.length - 1];
        this.addKeyEvent(lastinfo.k, lastinfo.state, () => {
            if (conditions.every(v => { return v() })) {
                callback();
            }
        });

    }

}