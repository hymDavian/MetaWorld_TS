type getarrps<T> = T extends [...infer _] ? _ : [T]
class TAction<T> {
    private readonly _callback: ((...ps: getarrps<T>) => void)[] = [];

    add(fn: (...ps: getarrps<T>) => void): void {
        this._callback.push(fn);
    }

    call(...ps: getarrps<T>) {
        for (let i = 0; i < this._callback.length; i++) {
            try {
                this._callback[i](...ps);
            } catch (error) {
                console.error(error.stack);
            }
        }
    }

    clear() {
        this._callback.length = 0;
    }

    remove(fn: (...ps: getarrps<T>) => void) {
        for (let i = 0; i < this._callback.length; i++) {
            if (this._callback[i] == fn) {
                this._callback.splice(i, 1);
                return;
            }
        }
    }

    includes(fn: (...ps: getarrps<T>) => void): boolean {
        for (let i = 0; i < this._callback.length; i++) {
            if (this._callback[i] == fn) {
                return true;
            }
        }
        return false;
    }

    get count(): number {
        return this._callback.length;
    }
}


(globalThis as any)["TAction"] = TAction;
