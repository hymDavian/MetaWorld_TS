//纯数学函数库拓展实现，不要引用其他任何文件
interface Math {
    clamp(value: number, min: number, max: number): number;
    Bezier(points: mw.Vector[], lerp: number): mw.Vector;
    /**根据一组权重，随机返回这组权重的某个索引 */
    randomByWeight(ranges: number[]): number;
}
Math.clamp = function (value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
Math.Bezier = function (points: mw.Vector[], lerp: number): mw.Vector {
    lerp = Math.clamp(lerp, 0, 1);
    if (points.length == 2)//只有2个点时，直接返回插值点
    {
        return mw.Vector.lerp(points[0], points[1], lerp);
    }
    let nextArray: mw.Vector[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        let pointA = points[i];
        let pointB = points[i + 1];
        let lerpPoint = mw.Vector.lerp(pointA, pointB, lerp);
        nextArray.push(lerpPoint);
    }
    return Math.Bezier(nextArray, lerp);
}
Math.randomByWeight = function (ranges: number[]): number {
    let sum = ranges.reduce((pr, current) => {
        return pr + current;
    }, 0);
    let ran = MathUtil.randomInt(0, sum);
    for (let i = 0; i < ranges.length; i++) {
        if (ranges[i] > ran) {
            return i;
        }
        ran -= ranges[i];
    }
    return ranges.length - 1;
}