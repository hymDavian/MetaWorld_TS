
type StateFunc<T> = {
    stateFlag: T, passtime: number,
    enter?: () => void, update?: (dt: number) => void, exit?: () => void
}
/**极简状态机 */
export class SimpleStateMachine<T> {
    private _enable: boolean = true;

    private readonly stateInfo: Map<T, StateFunc<T>> = new Map();
    private _state: StateFunc<T>;
    public get state(): T { return this._state ? this._state.stateFlag : null; }
    public set state(v: T) {
        if (this.state === v) { return; }
        if (!this.stateInfo.has(v)) {
            this.stateInfo.set(v, { stateFlag: v, passtime: 0 });
        }
        let befstate = this._state;
        if (befstate) {

            befstate.exit && befstate.exit();
            befstate.passtime = 0;
        }

        this._state = this.stateInfo.get(v);
        this._state.passtime = 0;
        this._state.enter && this._state.enter();
    }
    public get statePassTime(): number {
        if (!this._state) { return 0; }
        return this._state.passtime;
    }


    public setOnEnter(state: T, enter: () => void) {
        if (!this.stateInfo.has(state)) {
            this.stateInfo.set(state, { stateFlag: state, passtime: 0 });
        }
        this.stateInfo.get(state).enter = enter;
    }

    public setOnUpdate(state: T, update: (dt: number) => void) {
        if (!this.stateInfo.has(state)) {
            this.stateInfo.set(state, { stateFlag: state, passtime: 0 });
        }
        this.stateInfo.get(state).update = update;
    }

    public setOnExit(state: T, exit: () => void) {
        if (!this.stateInfo.has(state)) {
            this.stateInfo.set(state, { stateFlag: state, passtime: 0 });
        }
        this.stateInfo.get(state).exit = exit;
    }

    update(dt: number) {
        if (!this._enable) { return; }
        if (this._state && this._state.update) {
            this._state.passtime += dt;
            this._state.update(dt);
        }
    }

    clear() {
        if (this._state) {
            this._state.exit && this._state.exit();
        }
        this._enable = false;
        this._state = null;
    }
}
