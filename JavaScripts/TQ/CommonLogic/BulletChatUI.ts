
export namespace BulletChatUI {
    const Event_serverCallClientBullet: string = "Event_serverCallClientBullet";
    let bindNet: boolean = false
    let rootCanvas: mw.Canvas = null;//弹幕使用的画布UI对象
    const msgTexts: BulletChat[] = [];//弹幕列表
    let axisMin: number = 0;
    let axisMax: number = 500;

    /**初始化弹幕的相关设定
     * 
     * @param min 高度最小值
     * @param max 高度最大值
     * @param canvas 出现的画布
     * 
     */
    export function init(min: number, max: number, canvas: mw.Canvas) {
        if (!min || Number.isNaN(min)) {
            axisMin = 0;
        }
        else {
            axisMin = Math.min(min, max);
        }

        if (!max || Number.isNaN(max)) {
            axisMax = 500;
        }
        else {
            axisMax = Math.max(min, max);
        }
        rootCanvas = canvas;

        if (SystemUtil.isClient() && !bindNet) {
            bindNet = true;
            mw.Event.addServerListener(Event_serverCallClientBullet, (msg: string, time: number, color: mw.LinearColor) => {
                createBulletChat(msg, time, color);
            })
        }
    }

    export function createBulletChat(msg: string, time: number = 10000, color: mw.LinearColor = mw.LinearColor.white, lockY: number = -1) {

        if (SystemUtil.isServer()) {
            mw.Event.dispatchToAllClient(Event_serverCallClientBullet, msg, time, color);
            return;
        }

        if (!rootCanvas || !msg || !msg["toString"]) {//没有画布，没有文字，文字为空，不需要创建弹幕
            return;
        }
        msg = msg.toString()
        if (msg.length <= 0) {
            return;
        }

        try {
            time = Number.isNaN(time) ? 2000 : time;
            let bc = getNewBc(msg, lockY);
            bc.txt.fontColor = (color);
            bc.txt.outlineColor = (mw.LinearColor.black);
            bc.txt.outlineSize = (1)
            let endpos = { x: bc.size.x * -1, y: bc.pos.y };//获取结束点
            const slot = bc.txt;
            const changePos = new mw.Vector(0, 0);

            new TweenClass.Tween(bc.pos).to(endpos, time).onUpdate(pos => {
                changePos.x = pos.x;
                changePos.y = pos.y;
                slot.position = (changePos);
            }).onComplete(() => {
                bc.run = false;
            }).start();
        } catch (error) {
            console.error("弹幕错误：" + error.stack);
        }

    }

    function getNewBc(msg: string, lockY: number): BulletChat {
        msg = msg.toString();
        let bc = msgTexts.find(v => { return !v.run });
        if (!bc) {//没找到没使用的旧弹幕对象
            let ui = mw.TextBlock.newObject(rootCanvas, "msgUIObject");
            rootCanvas.addChild(ui)
            bc = {
                txt: ui,
                run: true,
                pos: { x: 1920, y: 0 },
                size: { x: 35, y: 100 }
            }//构建一个新弹幕对象
            msgTexts.push(bc);
            console.log("新建弹幕，目前总弹幕数：" + msgTexts.length);

            // Type.Vector p1;
            // p1.add( p1  )
        }
        else {
            bc.run = true;//置为正在使用中
        }
        bc.pos.x = rootCanvas.size.x;//放到屏幕右边
        bc.pos.y = lockY < 0 ? Math.random() * (axisMax - axisMin) + axisMin : lockY;//随机Y轴
        bc.size.x = 40 * msg.length;//字符对象长度
        bc.txt.text = (msg);
        bc.txt.size = (new mw.Vector2(bc.size.x, bc.size.y))

        return bc;
    }

    export function update() {
        TweenClass.update();
    }


    /**弹幕使用的信息类 */
    type BulletChat = {
        txt: mw.TextBlock,
        run: boolean,
        pos: { x: number, y: number },
        size: { x: number, y: number }
    }


    namespace TweenClass {

        export type EasingFunction = (amount: number) => number

        /**
         * The Ease class provides a collection of easing functions for use with tween.js.
         */
        const Easing = {
            Linear: {
                None: function (amount: number): number {
                    return amount
                },
            },
            Quadratic: {
                In: function (amount: number): number {
                    return amount * amount
                },
                Out: function (amount: number): number {
                    return amount * (2 - amount)
                },
                InOut: function (amount: number): number {
                    if ((amount *= 2) < 1) {
                        return 0.5 * amount * amount
                    }

                    return -0.5 * (--amount * (amount - 2) - 1)
                },
            },
            Cubic: {
                In: function (amount: number): number {
                    return amount * amount * amount
                },
                Out: function (amount: number): number {
                    return --amount * amount * amount + 1
                },
                InOut: function (amount: number): number {
                    if ((amount *= 2) < 1) {
                        return 0.5 * amount * amount * amount
                    }
                    return 0.5 * ((amount -= 2) * amount * amount + 2)
                },
            },
            Quartic: {
                In: function (amount: number): number {
                    return amount * amount * amount * amount
                },
                Out: function (amount: number): number {
                    return 1 - --amount * amount * amount * amount
                },
                InOut: function (amount: number): number {
                    if ((amount *= 2) < 1) {
                        return 0.5 * amount * amount * amount * amount
                    }

                    return -0.5 * ((amount -= 2) * amount * amount * amount - 2)
                },
            },
            Quintic: {
                In: function (amount: number): number {
                    return amount * amount * amount * amount * amount
                },
                Out: function (amount: number): number {
                    return --amount * amount * amount * amount * amount + 1
                },
                InOut: function (amount: number): number {
                    if ((amount *= 2) < 1) {
                        return 0.5 * amount * amount * amount * amount * amount
                    }

                    return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2)
                },
            },
            Sinusoidal: {
                In: function (amount: number): number {
                    return 1 - Math.sin(((1.0 - amount) * Math.PI) / 2)
                },
                Out: function (amount: number): number {
                    return Math.sin((amount * Math.PI) / 2)
                },
                InOut: function (amount: number): number {
                    return 0.5 * (1 - Math.sin(Math.PI * (0.5 - amount)))
                },
            },
            Exponential: {
                In: function (amount: number): number {
                    return amount === 0 ? 0 : Math.pow(1024, amount - 1)
                },
                Out: function (amount: number): number {
                    return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount)
                },
                InOut: function (amount: number): number {
                    if (amount === 0) {
                        return 0
                    }

                    if (amount === 1) {
                        return 1
                    }

                    if ((amount *= 2) < 1) {
                        return 0.5 * Math.pow(1024, amount - 1)
                    }

                    return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2)
                },
            },
            Circular: {
                In: function (amount: number): number {
                    return 1 - Math.sqrt(1 - amount * amount)
                },
                Out: function (amount: number): number {
                    return Math.sqrt(1 - --amount * amount)
                },
                InOut: function (amount: number): number {
                    if ((amount *= 2) < 1) {
                        return -0.5 * (Math.sqrt(1 - amount * amount) - 1)
                    }
                    return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1)
                },
            },
            Elastic: {
                In: function (amount: number): number {
                    if (amount === 0) {
                        return 0
                    }

                    if (amount === 1) {
                        return 1
                    }

                    return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI)
                },
                Out: function (amount: number): number {
                    if (amount === 0) {
                        return 0
                    }

                    if (amount === 1) {
                        return 1
                    }
                    return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1
                },
                InOut: function (amount: number): number {
                    if (amount === 0) {
                        return 0
                    }

                    if (amount === 1) {
                        return 1
                    }

                    amount *= 2

                    if (amount < 1) {
                        return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI)
                    }

                    return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1
                },
            },
            Back: {
                In: function (amount: number): number {
                    const s = 1.70158
                    return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s)
                },
                Out: function (amount: number): number {
                    const s = 1.70158
                    return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1
                },
                InOut: function (amount: number): number {
                    const s = 1.70158 * 1.525
                    if ((amount *= 2) < 1) {
                        return 0.5 * (amount * amount * ((s + 1) * amount - s))
                    }
                    return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2)
                },
            },
            Bounce: {
                In: function (amount: number): number {
                    return 1 - Easing.Bounce.Out(1 - amount)
                },
                Out: function (amount: number): number {
                    if (amount < 1 / 2.75) {
                        return 7.5625 * amount * amount
                    } else if (amount < 2 / 2.75) {
                        return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75
                    } else if (amount < 2.5 / 2.75) {
                        return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375
                    } else {
                        return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375
                    }
                },
                InOut: function (amount: number): number {
                    if (amount < 0.5) {
                        return Easing.Bounce.In(amount * 2) * 0.5
                    }
                    return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5
                },
            },
            generatePow: function (
                power = 4,
            ): {
                In(amount: number): number
                Out(amount: number): number
                InOut(amount: number): number
            } {
                power = power < Number.EPSILON ? Number.EPSILON : power
                power = power > 10000 ? 10000 : power
                return {
                    In: function (amount: number): number {
                        return amount ** power
                    },
                    Out: function (amount: number): number {
                        return 1 - (1 - amount) ** power
                    },
                    InOut: function (amount: number): number {
                        if (amount < 0.5) {
                            return (amount * 2) ** power / 2
                        }
                        return (1 - (2 - amount * 2) ** power) / 2 + 0.5
                    },
                }
            },
        }

        /**
         *
         */
        type InterpolationFunction = (v: number[], k: number) => number

        /**
         *
         */
        const Interpolation = {
            Linear: function (v: number[], k: number): number {
                const m = v.length - 1
                const f = m * k
                const i = Math.floor(f)
                const fn = Interpolation.Utils.Linear

                if (k < 0) {
                    return fn(v[0], v[1], f)
                }

                if (k > 1) {
                    return fn(v[m], v[m - 1], m - f)
                }

                return fn(v[i], v[i + 1 > m ? m : i + 1], f - i)
            },

            Bezier: function (v: number[], k: number): number {
                let b = 0
                const n = v.length - 1
                const pw = Math.pow
                const bn = Interpolation.Utils.Bernstein

                for (let i = 0; i <= n; i++) {
                    b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i)
                }

                return b
            },

            CatmullRom: function (v: number[], k: number): number {
                const m = v.length - 1
                let f = m * k
                let i = Math.floor(f)
                const fn = Interpolation.Utils.CatmullRom

                if (v[0] === v[m]) {
                    if (k < 0) {
                        i = Math.floor((f = m * (1 + k)))
                    }

                    return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i)
                } else {
                    if (k < 0) {
                        return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0])
                    }

                    if (k > 1) {
                        return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m])
                    }

                    return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i)
                }
            },

            Utils: {
                Linear: function (p0: number, p1: number, t: number): number {
                    return (p1 - p0) * t + p0
                },
                Bernstein: function (n: number, i: number): number {
                    const fc = Interpolation.Utils.Factorial

                    return fc(n) / fc(i) / fc(n - i)
                },
                Factorial: (function () {
                    const a = [1]

                    return function (n: number): number {
                        let s = 1

                        if (a[n]) {
                            return a[n]
                        }

                        for (let i = n; i > 1; i--) {
                            s *= i
                        }

                        a[n] = s
                        return s
                    }
                })(),

                CatmullRom: function (p0: number, p1: number, p2: number, p3: number, t: number): number {
                    const v0 = (p2 - p0) * 0.5
                    const v1 = (p3 - p1) * 0.5
                    const t2 = t * t
                    const t3 = t * t2

                    return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1
                },
            },
        }

        class Sequence {
            private static _nextId = 0

            static nextId(): number {
                return Sequence._nextId++
            }
        }
        class Group {
            private _tweens: {
                [key: string]: Tween<UnknownProps>
            } = {}

            private _tweensAddedDuringUpdate: {
                [key: string]: Tween<UnknownProps>
            } = {}

            getAll(): Array<Tween<UnknownProps>> {
                return Object.keys(this._tweens).map(tweenId => {
                    return this._tweens[tweenId]
                })
            }

            removeAll(): void {
                this._tweens = {}
            }

            add(tween: Tween<UnknownProps>): void {
                this._tweens[tween.getId()] = tween
                this._tweensAddedDuringUpdate[tween.getId()] = tween
            }

            remove(tween: Tween<UnknownProps>): void {
                delete this._tweens[tween.getId()]
                delete this._tweensAddedDuringUpdate[tween.getId()]
            }

            update(time: number = now(), preserve = false): boolean {
                let tweenIds = Object.keys(this._tweens)

                if (tweenIds.length === 0) {
                    return false
                }

                // Tweens are updated in "batches". If you add a new tween during an
                // update, then the new tween will be updated in the next batch.
                // If you remove a tween during an update, it may or may not be updated.
                // However, if the removed tween was added during the current batch,
                // then it will not be updated.
                while (tweenIds.length > 0) {
                    this._tweensAddedDuringUpdate = {}

                    for (let i = 0; i < tweenIds.length; i++) {
                        const tween = this._tweens[tweenIds[i]]
                        const autoStart = !preserve

                        if (tween && tween.update(time, autoStart) === false && !preserve) {
                            delete this._tweens[tweenIds[i]]
                        }
                    }

                    tweenIds = Object.keys(this._tweensAddedDuringUpdate)
                }

                return true
            }
        }
        const mainGroup = new Group()
        const now = function () {
            return Date.now();
        }

        // eslint-disable-next-line
        export type UnknownProps = Record<string, any>
        export class Tween<T extends UnknownProps> {
            private _isPaused = false
            private _pauseStart = 0
            private _valuesStart: UnknownProps = {}
            protected _valuesEnd: Record<string, any> = {}
            protected _valuesStartRepeat: UnknownProps = {}
            private _duration = 1000
            private _initialRepeat = 0
            private _repeat = 0
            private _repeatDelayTime?: number
            private _yoyo = false
            private _isPlaying = false
            private _reversed = false
            private _delayTime = 0
            private _startTime = 0
            private _easingFunction: EasingFunction = Easing.Linear.None
            private _interpolationFunction: InterpolationFunction = Interpolation.Linear
            // eslint-disable-next-line
            private _chainedTweens: Array<Tween<any>> = []
            private _onStartCallback?: (object: T) => void
            private _onStartCallbackFired = false
            private _onUpdateCallback?: (object: T, elapsed: number) => void
            private _onRepeatCallback?: (object: T) => void
            private _onCompleteCallback?: (object: T) => void
            private _onStopCallback?: (object: T) => void
            private _id = Sequence.nextId()
            private _isChainStopped = false

            constructor(private _object: T, private _group: Group | false = mainGroup) { }

            getId(): number {
                return this._id
            }

            isPlaying(): boolean {
                return this._isPlaying
            }

            isPaused(): boolean {
                return this._isPaused
            }

            to(properties: UnknownProps, duration?: number): this {
                // TODO? restore this, then update the 07_dynamic_to example to set fox
                // tween's to on each update. That way the behavior is opt-in (there's
                // currently no opt-out).
                // for (const prop in properties) this._valuesEnd[prop] = properties[prop]
                this._valuesEnd = Object.create(properties)

                if (duration !== undefined) {
                    this._duration = duration
                }

                return this
            }

            duration(d = 1000): this {
                this._duration = d
                return this
            }
            get object(): T {
                return this._object;
            }
            start(time: number = now()): this {
                if (this._isPlaying) {
                    return this
                }

                // eslint-disable-next-line
                this._group && this._group.add(this as any)

                this._repeat = this._initialRepeat

                if (this._reversed) {
                    // If we were reversed (f.e. using the yoyo feature) then we need to
                    // flip the tween direction back to forward.

                    this._reversed = false

                    for (const property in this._valuesStartRepeat) {
                        this._swapEndStartRepeatValues(property)
                        this._valuesStart[property] = this._valuesStartRepeat[property]
                    }
                }

                this._isPlaying = true

                this._isPaused = false

                this._onStartCallbackFired = false

                this._isChainStopped = false

                this._startTime = time
                this._startTime += this._delayTime

                this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat)

                return this
            }

            protected _setupProperties(
                _object: UnknownProps,
                _valuesStart: UnknownProps,
                _valuesEnd: UnknownProps,
                _valuesStartRepeat: UnknownProps,
            ): void {
                for (const property in _valuesEnd) {
                    const startValue = _object[property]
                    const startValueIsArray = Array.isArray(startValue)
                    const propType = startValueIsArray ? 'array' : typeof startValue
                    const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property])
                    // If `to()` specifies a property that doesn't exist in the source object,
                    // we should not set that property in the object
                    if (propType === 'undefined' || propType === 'function') {
                        continue
                    }

                    // Check if an Array was provided as property value
                    if (isInterpolationList) {
                        let endValues = _valuesEnd[property] as Array<number | string>

                        if (endValues.length === 0) {
                            continue
                        }

                        // handle an array of relative values
                        endValues = endValues.map(this._handleRelativeValue.bind(this, startValue as number))

                        // Create a local copy of the Array with the start value at the front
                        _valuesEnd[property] = [startValue].concat(endValues)
                    }

                    // handle the deepness of the values
                    if ((propType === 'object' || startValueIsArray) && startValue && !isInterpolationList) {
                        _valuesStart[property] = startValueIsArray ? [] : {}

                        // eslint-disable-next-line
                        for (const prop in startValue as object) {
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            _valuesStart[property][prop] = startValue[prop]
                        }

                        _valuesStartRepeat[property] = startValueIsArray ? [] : {} // TODO? repeat nested values? And yoyo? And array values?

                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property])
                    } else {
                        // Save the starting value, but only once.
                        if (typeof _valuesStart[property] === 'undefined') {
                            _valuesStart[property] = startValue
                        }

                        if (!startValueIsArray) {
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            _valuesStart[property] *= 1.0 // Ensures we're using numbers, not strings
                        }

                        if (isInterpolationList) {
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse()
                        } else {
                            _valuesStartRepeat[property] = _valuesStart[property] || 0
                        }
                    }
                }
            }

            stop(): this {
                if (!this._isChainStopped) {
                    this._isChainStopped = true
                    this.stopChainedTweens()
                }

                if (!this._isPlaying) {
                    return this
                }

                // eslint-disable-next-line
                this._group && this._group.remove(this as any)

                this._isPlaying = false

                this._isPaused = false

                if (this._onStopCallback) {
                    this._onStopCallback(this._object)
                }

                return this
            }
            clear(): this {
                this.stop();
                this._valuesEnd = {};
                return this;
            }
            end(): this {
                this._goToEnd = true
                this.update(Infinity)
                return this
            }

            pause(time: number = now()): this {
                if (this._isPaused || !this._isPlaying) {
                    return this
                }

                this._isPaused = true

                this._pauseStart = time

                // eslint-disable-next-line
                this._group && this._group.remove(this as any)

                return this
            }

            resume(time: number = now()): this {
                if (!this._isPaused || !this._isPlaying) {
                    return this
                }

                this._isPaused = false

                this._startTime += time - this._pauseStart

                this._pauseStart = 0

                // eslint-disable-next-line
                this._group && this._group.add(this as any)

                return this
            }

            stopChainedTweens(): this {
                for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                    this._chainedTweens[i].stop()
                }
                return this
            }

            group(group = mainGroup): this {
                this._group = group
                return this
            }

            delay(amount = 0): this {
                this._delayTime = amount
                return this
            }

            repeat(times = 0): this {
                this._initialRepeat = times
                this._repeat = times
                return this
            }

            repeatDelay(amount?: number): this {
                this._repeatDelayTime = amount
                return this
            }

            yoyo(yoyo = false): this {
                this._yoyo = yoyo
                return this
            }

            easing(easingFunction: EasingFunction = Easing.Linear.None): this {
                this._easingFunction = easingFunction
                return this
            }

            interpolation(interpolationFunction: InterpolationFunction = Interpolation.Linear): this {
                this._interpolationFunction = interpolationFunction
                return this
            }

            // eslint-disable-next-line
            chain(...tweens: Array<Tween<any>>): this {
                this._chainedTweens = tweens
                return this
            }

            onStart(callback?: (object: T) => void): this {
                this._onStartCallback = callback
                return this
            }

            onUpdate(callback?: (object: T, elapsed: number) => void): this {
                this._onUpdateCallback = callback
                return this
            }

            onRepeat(callback?: (object: T) => void): this {
                this._onRepeatCallback = callback
                return this
            }

            onComplete(callback?: (object: T) => void): this {
                this._onCompleteCallback = callback
                return this
            }

            onStop(callback?: (object: T) => void): this {
                this._onStopCallback = callback
                return this
            }

            private _goToEnd = false

            /**
             * @returns true if the tween is still playing after the update, false
             * otherwise (calling update on a paused tween still returns true because
             * it is still playing, just paused).
             */
            update(time = now(), autoStart = true): boolean {
                if (this._isPaused) return true

                let property
                let elapsed

                const endTime = this._startTime + this._duration

                if (!this._goToEnd && !this._isPlaying) {
                    if (time > endTime) return false
                    if (autoStart) this.start(time)
                }

                this._goToEnd = false

                if (time < this._startTime) {
                    return true
                }

                if (this._onStartCallbackFired === false) {
                    if (this._onStartCallback) {
                        this._onStartCallback(this._object)
                    }

                    this._onStartCallbackFired = true
                }

                elapsed = (time - this._startTime) / this._duration
                elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed

                const value = this._easingFunction(elapsed)

                // properties transformations
                this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value)

                if (this._onUpdateCallback) {
                    this._onUpdateCallback(this._object, elapsed)
                }
                if (elapsed === 1) {
                    if (this._repeat > 0) {
                        if (isFinite(this._repeat)) {
                            this._repeat--
                        }

                        // Reassign starting values, restart by making startTime = now
                        for (property in this._valuesStartRepeat) {
                            if (!this._yoyo) {
                                this._repeatStartRepeatValues(property);
                            } else {
                                this._swapEndStartRepeatValues(property)
                            }
                            this._valuesStart[property] = this._valuesStartRepeat[property]
                        }

                        if (this._yoyo) {
                            this._reversed = !this._reversed
                        }

                        if (this._repeatDelayTime !== undefined) {
                            this._startTime = time + this._repeatDelayTime
                        } else {
                            this._startTime = time + this._delayTime
                        }

                        if (this._onRepeatCallback) {
                            this._onRepeatCallback(this._object)
                        }

                        return true
                    } else {
                        if (this._onCompleteCallback) {
                            this._onCompleteCallback(this._object)
                        }

                        for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
                            // Make the chained tweens start exactly at the time they should,
                            // even if the `update()` method was called way past the duration of the tween
                            this._chainedTweens[i].start(this._startTime + this._duration)
                        }

                        this._isPlaying = false

                        return false
                    }
                }

                return true
            }

            protected _updateProperties(
                _object: UnknownProps,
                _valuesStart: UnknownProps,
                _valuesEnd: UnknownProps,
                value: number,
            ): void {
                for (const property in _valuesEnd) {
                    // Don't update properties that do not exist in the source object
                    if (_valuesStart[property] === undefined) {
                        continue
                    }

                    const start = _valuesStart[property] || 0
                    let end = _valuesEnd[property]
                    const startIsArray = Array.isArray(_object[property])
                    const endIsArray = Array.isArray(end)
                    const isInterpolationList = !startIsArray && endIsArray

                    if (isInterpolationList) {
                        _object[property] = this._interpolationFunction(end as Array<number>, value)
                    } else if (typeof end === 'object' && end) {
                        // eslint-disable-next-line
                        // @ts-ignore FIXME?
                        this._updateProperties(_object[property], start, end, value)
                    } else {
                        // Parses relative end values with start as base (e.g.: +10, -3)
                        end = this._handleRelativeValue(start as number, end as number | string)

                        // Protect against non numeric properties.
                        if (typeof end === 'number') {
                            // eslint-disable-next-line
                            // @ts-ignore FIXME?
                            _object[property] = start + (end - start) * value
                        }
                    }
                }
            }

            private _handleRelativeValue(start: number, end: number | string): number {
                if (typeof end !== 'string') {
                    return end
                }

                if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                    return start + parseFloat(end)
                } else {
                    return parseFloat(end)
                }
            }

            protected _repeatStartRepeatValues(property: string): void {
                if (typeof this._valuesEnd[property] === 'string') {
                    this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property])
                }
            }
            protected _swapEndStartRepeatValues(property: string): void {
                const tmp = this._valuesStartRepeat[property]
                const endValue = this._valuesEnd[property]

                if (typeof endValue === 'string') {
                    this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue)
                } else {
                    this._valuesStartRepeat[property] = this._valuesEnd[property]
                }

                this._valuesEnd[property] = tmp
            }
        }

        const nextId = Sequence.nextId

        /**
         * Controlling groups of tweens
         *
         * Using the TWEEN singleton to manage your tweens can cause issues in large apps with many components.
         * In these cases, you may want to create your own smaller groups of tweens.
         */
        const TWEEN = mainGroup

        // This is the best way to export things in a way that's compatible with both ES
        // Modules and CommonJS, without build hacks, and so as not to break the
        // existing API.
        // https://github.com/rollup/rollup/issues/1961#issuecomment-423037881
        const getAll = TWEEN.getAll.bind(TWEEN)
        const removeAll = TWEEN.removeAll.bind(TWEEN)
        const add = TWEEN.add.bind(TWEEN)
        const remove = TWEEN.remove.bind(TWEEN)
        export const update = TWEEN.update.bind(TWEEN)

        // NOTE! Make sure both lists of exports below are kept in sync:

        // export { Easing, Group, Interpolation, now, Sequence, nextId, Tween, getAll, removeAll, add, remove, update }


    }
}