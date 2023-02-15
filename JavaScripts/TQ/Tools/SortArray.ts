
interface numObj {
    getArrKeyByLV: (lv: number) => number,
    maxLv: () => number
}
class SortTool {
    public static LSDSort(LSD: numObj[], maxLv: number) {
        const bucket = {};
        for (let lv = 0; lv < maxLv; lv++) {
            for (let i = 0; i < LSD.length; i++) {
                let k = null;
                k = (LSD[i] as numObj).getArrKeyByLV(lv);
                if (!bucket[k]) {
                    bucket[k] = [];
                }
                bucket[k].push(LSD[i]);
            }
            LSD.length = 0;
            for (const k in bucket) {
                while (bucket[k].length > 0) {
                    LSD.push(bucket[k].shift());
                }
            }
        }
        return LSD;
    }
}


class testObj implements numObj {
    getArrKeyByLV(lv: number): number {
        return this.k[lv - 1] ? this.k[lv - 1] : 0
    }
    maxLv(): number {
        return this.k.length;
    }
    k: number[];
    constructor(keys: number[]) {
        this.k = keys;
    }

    toString(): string {

        return this.k.toString();
    }
}
const testLV = 1;
const testNum = 100000;
const arr1: numObj[] = [];
for (let i = 0; i < testNum; i++) {
    const kL = Math.floor(Math.random() * testLV + 1);//[0,1,2]
    const ks: number[] = [];
    for (let i = 0; i < kL; i++) {
        ks.push(Math.ceil(Math.random() * testLV));
    }
    arr1.push(new testObj(ks));
}
const arr2 = arr1.slice();

let t = Date.now();
arr1.sort((a, b) => {
    if (a.maxLv() === b.maxLv()) {
        return a.getArrKeyByLV(a.maxLv()) - b.getArrKeyByLV(b.maxLv());
    }
    else {
        return a.maxLv() - b.maxLv();
    }
});
console.log(arr1.slice(0, 10), '用时：' + (Date.now() - t));

t = Date.now();
SortTool.LSDSort(arr2, testLV + 1);
console.log(arr2.slice(0, 10), '用时：' + (Date.now() - t));

// let a = [];
// a.push(1);
// a.push(2);
// a.push(3);
// a.push(4);

// while (a.length > 0) {
//     console.log(a.shift())
// }
// console.log((4 / 1) % 10)