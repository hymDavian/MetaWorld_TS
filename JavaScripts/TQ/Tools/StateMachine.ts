/*
 * @Author: pengcheng.zhang 
 * @Date: 2022-03-09 14:35:49 
 * @Last Modified by: pengcheng.zhang
 * @Last Modified time: 2022-03-30 16:29:27
 */

/**
 * 状态实例类
 */
class StateFunc {
    enter?: (data?: unknown) => void
    update?: (dt: number) => void
    exit?: () => void
}


/**
 * 状态机
 */
export class StateMachine<T> {
    private _states: Map<T, StateFunc>
    private currentState: T

    constructor() {
        this._states = new Map<T, StateFunc>()
    }

    /**
     * 注册状态
     * @param state 状态
     * @param func 回调
     */
    public register(state: T, func: StateFunc) {
        this._states.set(state, func)
    }

    /**
     * 注册状态enter
     * @param state 状态
     * @param func enter回调
     */
    public registerEnter(state: T, enter: (data?: unknown) => void) {
        let has = this._states.has(state)
        if (has) {
            let func = this._states.get(state)
            func.enter = enter
        } else {
            let func = new StateFunc()
            func.enter = enter
            this._states.set(state, func)
        }
    }

    /**
    * 注册状态update
    * @param state 状态
    * @param func update回调
    */
    public registerUpdate(state: T, update: (dt: number) => void) {
        let has = this._states.has(state)
        if (has) {
            let func = this._states.get(state)
            func.update = update
        } else {
            let func = new StateFunc()
            func.update = update
            this._states.set(state, func)
        }
    }

    /**
    * 注册状态exit
    * @param state 状态
    * @param func exit回调
    */
    public registerExit(state: T, exit: () => void) {
        let has = this._states.has(state)
        if (has) {
            let func = this._states.get(state)
            func.exit = exit
        } else {
            let func = new StateFunc()
            func.exit = exit
            this._states.set(state, func)
        }
    }

    public update(dt): void {
        if (this.currentState) {
            let func = this._states.get(this.currentState)
            func.update && func.update(dt)
        }
    }

    /**
    * 切换状态
    * @param state 状态
    * @param data 参数
    */
    public switch(state: T, data?: unknown): void {
        if (!this._states.has(state)) {
            // Date.now()
            return
        }

        if (this.currentState) {
            let func = this._states.get(this.currentState)
            func.exit && func.exit()
        }
        this.currentState = state

        let func = this._states.get(state)
        func.enter && func.enter(data)
    }

    /**
     * 清楚状态列表
     */
    public destroy(): void {
        this._states.clear()
    }

    /**
     * 获取当前状态
     * @returns 当前状态
     */
    public getState(): T {
        return this.currentState
    }
}