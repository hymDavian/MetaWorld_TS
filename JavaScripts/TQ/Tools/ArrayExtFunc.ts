if (!Array.prototype.add) {
    Object.defineProperty(Array.prototype, 'add', {
        value(item) {
            this.push(item);
            return this;
        },
        enumerable: false
    });
}

if (!Array.prototype.remove) {
    Object.defineProperty(Array.prototype, 'remove', {
        value(key, value) {
            let i = value === undefined ? this.indexOf(key) : this.findIndex(m => m[key] === value);
            return i === -1 ? null : this.splice(i, 1)[0];
        },
        enumerable: false
    });
}

if (!Array.prototype.first) {
    Object.defineProperty(Array.prototype, 'first', {
        value(count) {
            if (count == undefined) {
                if (this.length > 0) {
                    return this[0];
                }
                else return null;
            }
            else {
                var ret = [];
                for (var i = 0; i < Math.min(count, this.length); i++) {
                    ret.add(this[i]);
                }
                return ret;
            }
        },
        enumerable: false
    });
}

if (!Array.prototype.last) {
    Object.defineProperty(Array.prototype, 'last', {
        value() {
            return this[this.length - 1];
        },
        enumerable: false
    });
}

if (!Array.prototype.has) {
    Object.defineProperty(Array.prototype, 'has', {
        value(key, value) {
            return value !== undefined
                ? this.some(m => m[key] === value)
                : this.indexOf(key) !== -1;
        },
        enumerable: false
    });
}

if (!Array.prototype.set) {
    Object.defineProperty(Array.prototype, 'set', {
        value(arr) {
            this.clear();
            return this.addRange(arr);
        },
        enumerable: false
    });
}

if (!Array.prototype.random) {
    Object.defineProperty(Array.prototype, 'random', {
        value(count, isReturnArray) {
            if (count == null || count == 1) {
                if (this.length === 0) {
                    return undefined;
                }

                let randomValue = this[Math.floor(Math.random() * this.length)];
                if (isReturnArray) {
                    return [randomValue];
                }
                return randomValue;
            }
            else if (count > this.length) {
                return this
            }
            else {
                var shuffled = this.slice(0);
                var i = this.length, min = i - count, temp, index;
                while (i-- > min) {
                    index = Math.floor((i + 1) * Math.random());
                    temp = shuffled[index];
                    shuffled[index] = shuffled[i];
                    shuffled[i] = temp;
                }
                return shuffled.slice(min);
            }
        },
        enumerable: false
    });
}


if (!Array.prototype.randomByProp) {
    Object.defineProperty(Array.prototype, 'randomByProp', {
        value(prop) {
            prop = prop ? prop : "weight"

            let count = 0;
            this.map(item => {
                if (typeof item[prop] === "number") {
                    count += item[prop];
                }
            })

            let rd = Math.floor(Math.random() * count);
            let tempCount = 0;
            for (const element of this) {
                let weight = element[prop];
                if (typeof element[prop] === "number") {
                    tempCount += weight;
                    if (tempCount > rd) {
                        return element
                    }
                }
            }
        },
        enumerable: false
    });
}


if (!Array.prototype.randomIndex) {
    Object.defineProperty(Array.prototype, 'randomIndex', {
        value() {
            let count = 0;
            this.map(item => {
                if (typeof item === "number") {
                    count += item;
                }
            })

            let rd = Math.floor(Math.random() * count);
            let tempCount = 0;

            for (let i = 0; i < this.length; i++) {
                const element = this[i];
                if (typeof element === "number") {
                    tempCount += element;
                    if (tempCount > rd) {
                        return i
                    }
                }
            }
        },
        enumerable: false
    });
}

if (!Array.prototype.randomRemove) {
    Object.defineProperty(Array.prototype, 'randomRemove', {
        value() {
            let index = this.randomIndex();
            let result = this[index];
            this.remove(index, 1);
            return result;
        },
        enumerable: false
    });
}

interface Array<T> {
    /**
     * 删除数组一个元素并返回这个元素
     */
    remove(value: T): T;
    remove(key: string, value?: any): T;

    /**
     * 返回一个随机元素
     */
    random(): T;

    randomByProp(prop: string): T;

    randomIndex(): number;

    randomRemove(): T;

    /**
     * 随机删除一个元素 并返还这个元素
     */
    randomRemove(): T

    /**
     * 是否有这个元素
     */
    has(key: any, value?: any): boolean

    /**
     * 添加一个元素并返回这个元素
     */
    add(val: T): T

    /**
     * 返回第一个元素
     */
    first(): T;

    /**
     * 返回前 count 个元素
     */
    first(count: number): T;

    /**
     * 返回最后一个元素
     */
    last(): T;

    /**
     * 重新设置这个数组
     */
    set(arr: T[]): T[];
}

