export class TweenLink {
    private readonly _tweens: TweenUtil.Tween<any>[] = []
    private readonly _exCompelete: (() => void)[] = [];
    private readonly _exStart: (() => void)[] = [];
    private readonly _waitTime: number[] = [];
    private _isFinsh: boolean = true;
    public get IsFinsh() {
        return this._isFinsh;
    }
    public get TweenLink() {
        return this._tweens;
    }

    public add(tween: TweenUtil.Tween<any>, waitNext: number = 0, onComplete: () => void = null, start: () => void = null) {
        this._tweens.push(tween);
        this._exCompelete.push(onComplete);
        this._exStart.push(start);
        this._waitTime.push(waitNext);
    }

    public start() {
        for (let i = 0; i < this._tweens.length; i++) {
            if (i < this._tweens.length - 1) {
                this._tweens[i].onComplete(() => {
                    if (this._exCompelete[i] != null) {
                        this._exCompelete[i]();
                    }
                    if (this._waitTime[i] != null && this._waitTime[i] > 0) {
                        TimeUtil.delaySecond(this._waitTime[i]).then(() => {
                            if (this._exStart[i + 1] != null) {
                                this._exStart[i + 1]();
                            }
                            this._tweens[i + 1].start();
                        });
                    }
                    else {
                        if (this._exStart[i + 1] != null) {
                            this._exStart[i + 1]();
                        }
                        this._tweens[i + 1].start();
                    }

                });
            }
            else {
                this._tweens[i].onComplete(() => {
                    if (this._exCompelete[i] != null) {
                        this._exCompelete[i]();
                    }
                    this._isFinsh = true;
                });
            }
        }
        if (this._exStart[0] != null) {
            this._exStart[0]();
        }
        this._tweens[0].start();
        this._isFinsh = false;
    }

    public stop() {
        for (let i = 0; i < this._tweens.length; i++) {
            this._tweens[i].stop();
        }
        this._isFinsh = true;
    }

    public clear() {
        if (this._tweens.length > 0) {
            this.stop();
        }
        this._tweens.length = 0;
        this._exCompelete.length = 0;
        this._exStart.length = 0;
        this._waitTime.length = 0;
        this._isFinsh = true;
    }
}