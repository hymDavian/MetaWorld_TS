//纯数学函数库拓展实现，不要引用其他任何文件
type vector = { x: number, y: number, z: number };
interface Math {
    clamp(value: number, min: number, max: number): number;
    Bezier(points: mw.Vector[], lerp: number): mw.Vector;
    /**根据一组权重，随机返回这组权重的某个索引 */
    randomByWeight(ranges: number[]): number;
    /**判断点是否在扇形内
     * @param center 中心
     * @param point 目标点
     * @param faceNormal 扇形中线面朝向量
     * @param radius 半径
     * @param sectorAngleInDegrees 扇形角度
     */
    isPointInSector(center: vector, point: vector, faceNormal: vector, radius: number, sectorAngleInDegrees: number): boolean;
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
Math.isPointInSector = function (center: vector, point: vector, faceNormal: vector, radius: number, sectorAngleInDegrees: number) {
    const xyCenter = { x: center.x, y: center.y };
    const xyPoint = { x: point.x, y: point.y };
    //目标点与中心距离
    const distanceToCenter = Math.sqrt(Math.pow(xyPoint.x - xyCenter.x, 2) + Math.pow(xyPoint.y - xyCenter.y, 2));
    if (distanceToCenter > radius) { return false; }//距离不够
    const facelength = Math.sqrt(faceNormal.x ** 2 + faceNormal.y ** 2);//面朝模长
    const normalizedFaceNormal = {
        x: faceNormal.x / facelength,
        y: faceNormal.y / facelength
    };
    //点到扇形中心的向量
    const vectorToCenter = {
        x: xyPoint.x - xyCenter.x,
        y: xyPoint.y - xyCenter.y
    };
    // 计算该向量与扇形面朝向量的点积  
    const dotProduct = vectorToCenter.x * normalizedFaceNormal.x + vectorToCenter.y * normalizedFaceNormal.y;
    // 计算夹角（注意：arccos的范围是[0, π]，但我们可能需要负值来表示反方向的角度）  
    const angleWithFaceNormal = Math.acos(dotProduct / distanceToCenter);
    // 根据faceNormal的方向决定夹角是否需要取反  
    const sectorAngleInRadians = Math.PI * sectorAngleInDegrees / 180; // 将角度转换为弧度  
    let angleInRange = angleWithFaceNormal <= sectorAngleInRadians / 2;
    // 如果faceNormal指向与常规方向相反，则调整angleInRange的判断  
    if (normalizedFaceNormal.x < 0 && normalizedFaceNormal.y < 0) {
        angleInRange = angleWithFaceNormal >= -sectorAngleInRadians / 2;
    } else if (normalizedFaceNormal.x < 0 && normalizedFaceNormal.y >= 0) {
        angleInRange = angleWithFaceNormal <= -sectorAngleInRadians / 2 || angleWithFaceNormal >= sectorAngleInRadians / 2;
    } else if (normalizedFaceNormal.x >= 0 && normalizedFaceNormal.y < 0) {
        angleInRange = angleWithFaceNormal >= -sectorAngleInRadians / 2 || angleWithFaceNormal <= sectorAngleInRadians / 2;
    }
    return angleInRange;



}