export namespace UIHelp {
    type longPressData = {
        callback: () => void,
        ReleasedCallback: () => void,
        timer: number,
        isReleased: boolean,
    }
    //描述 按下时的计时器 是否已释放
    const btnDesMap: Map<string, longPressData> = new Map();


    /**让一个按钮长按显示详情 */
    export function setBtnDes(btn: mw.Button | mw.StaleButton, callback: () => void, Released: () => void, check: number = 500) {
        const guid = btn.guid;
        if (!btnDesMap.has(guid)) {
            btnDesMap.set(guid, {
                callback: callback,
                ReleasedCallback: Released,
                timer: null,
                isReleased: true,
            });
            btn.onPressed.add(() => {//按下时
                const data = btnDesMap.get(guid);
                data.isReleased = false;//标记为没有释放
                data.timer = setTimeout(() => {
                    if (!data.isReleased) {//1秒后还没释放此按钮
                        data.callback();//调用长按逻辑
                    }
                    clearTimeout(data[1])
                    data.timer = null;
                }, check);

            });
            btn.onReleased.add(() => {//释放
                const data = btnDesMap.get(guid);
                if (data.timer != null) {
                    clearTimeout(data.timer);
                }
                data.isReleased = true;
                if (data.ReleasedCallback) {
                    data.ReleasedCallback();
                }
            });
        }
        else {
            const data = btnDesMap.get(guid);
            data.callback = callback;
            data.ReleasedCallback = Released;
        }
    }

    const btnDoubleTimeMap: Map<string, [number, () => void]> = new Map();
    /**设置按钮的双击事件 */
    export function doubleClick(btn: mw.Button | mw.StaleButton, f: () => void, check: number = 500) {
        const guid = btn.guid;
        if (!btnDoubleTimeMap.has(guid)) {
            btnDoubleTimeMap.set(guid, [0, f]);
            btn.onClicked.add(() => {
                let clickTime = Date.now();
                const [beforeTime, func] = btnDoubleTimeMap.get(guid);
                if ((clickTime - beforeTime) < 500) {
                    func();
                    btnDoubleTimeMap.get(guid)[0] = 0;//下一次不再触发双击事件
                }
                else {
                    btnDoubleTimeMap.get(guid)[0] = clickTime;
                }
            });
        }
        else {
            btnDoubleTimeMap.get(guid)[1] = f;
        }
    }

    export function setBtnDrag(btn: mw.Button | mw.StaleButton, f: (x: number, y: number) => void, clearOldAction: boolean = true) {
        let dragID = null;
        if (clearOldAction) {
            btn.onPressed.clear();
            btn.onReleased.clear();
        }
        btn.onPressed.add(() => {
            let beforeCursorPos = mw.getMousePositionOnViewport();//鼠标位置
            let offset = mw.Vector2.zero
            dragID = setInterval(() => {
                let cursorPos = mw.getMousePositionOnViewport();//鼠标位置
                offset = mw.Vector2.subtract(cursorPos, beforeCursorPos);
                btn.position = mw.Vector2.add(offset, btn.position);
                beforeCursorPos = cursorPos;
            }, 1);
        })
        btn.onReleased.add(() => {
            dragID && clearInterval(dragID);
            dragID = null;
            f(btn.position.x, btn.position.y);
        })
    }
}

