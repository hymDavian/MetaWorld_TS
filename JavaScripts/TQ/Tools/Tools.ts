export interface Class<T> extends Function {
    new(...args: any[]): T;
}
/**二叉树类型 */
export type Tree<T> = {
    value: T;
    left: Tree<T>;
    right: Tree<T>;
}

export class Tools {
    /**异步等待(ms) */
    public static sleep(time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }
    /**字符串格式化 */
    static FormatString(text: string, ...args: any[]) {
        return text.replace(/\{(\d+)\}/g, (text, index, ...parms) => {
            if (args[index] === 0) return 0;
            return args[index] || "undefined";
        });
    }
    /**将总秒数转为 [时，分，秒] 的数组 */
    static Seconds2Hour(second: number) {
        let minutes = second % 3600;
        let h = Math.floor(second / 3600);
        let m = Math.floor(minutes / 60);
        let s = minutes % 60;
        return [h, m, s];
    }
    /**限定值在范围内 */
    public static RoundNumber(value: number, min: number, max: number) {
        if (value > max) return max;
        if (value < min) return min;
        return value;
    }
    /**数字插值 */
    public static NumLerp(n1: number, n2: number, lerp: number): number {
        return n1 + (n2 - n1) * lerp;
    }
    /**向量的插值计算 */
    public static LerpVector(v1: Type.Vector, v2: Type.Vector, lerp: number): Type.Vector {
        if (lerp > 1) { lerp = 1; }
        if (lerp < 0) { lerp = 0; }

        let result = new Type.Vector(0, 0, 0);//  .ZERO;

        result.x = this.NumLerp(v1.x, v2.x, lerp);
        result.y = this.NumLerp(v1.y, v2.y, lerp);
        result.z = this.NumLerp(v1.z, v2.z, lerp);

        return result;
    }
    /**
    * 计算两点距离
    * @param from 初始坐标
    * @param to 目标坐标
    * @param isPlane 是否只计算xy的平面距离
    * @returns 距离
    */
    public static Distance(from: Type.Vector, to: Type.Vector, isPlane: boolean = false): number {
        let x1 = from.x;
        let y1 = from.y;
        let z1 = from.z;
        let x2 = to.x;
        let y2 = to.y;
        let z2 = to.z;
        let distance: number;
        let num = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
        if (!isPlane) {
            num += (z1 - z2) * (z1 - z2);
        }
        distance = Math.sqrt(num);
        if (distance < 0) {
            distance = 0;
        }
        return distance;
    }
    /**
    * 计算两点距离的平方
    * @param from 初始坐标
    * @param to 目标坐标
    * @returns 距离的平方
    */
    public static DistancePow(from: Type.Vector, to: Type.Vector, isPlane: boolean = false): number {
        let x1 = from.x;
        let y1 = from.y;
        let z1 = from.z;
        let x2 = to.x;
        let y2 = to.y;
        let z2 = to.z;
        let distance = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
        if (!isPlane) {
            distance += (z1 - z2) * (z1 - z2);
        }
        if (distance < 0) {
            distance = 0;
        }
        return distance;
    }

    /**
     * 简单两点三维是否在一定距离内
     * @param checkDis 检查距离
     * @param isPlane 是否只检查平面
     */
    public static CheckRect(p1: Type.Vector, p2: Type.Vector, checkDis: number, isPlane: boolean = false): boolean {
        if (Math.abs(p1.x - p2.x) > checkDis) { return false; }
        if (Math.abs(p1.y - p2.y) > checkDis) { return false; }
        if (!isPlane) {
            if (Math.abs(p1.z - p2.z) > checkDis) { return false; }
        }

        return true;

    }

    /**随机浮点数 [min,max) */
    public static RandomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
    /**随机整数 */
    public static RandomeInt(min: number, max: number): number {
        return Math.floor(Tools.RandomFloat(min, max));
    }
    /**
     * 一直查找某个物体，直到限定时间到
     * @param guid 对象唯一ID
     * @param wait 最大查找时间(ms)
     * @returns 
     */
    public static async asyncFind(guid: string, wait: number = 10000): Promise<Core.GameObject> {
        if (!guid) { return null; }
        let ret = Core.GameObject.find(guid);
        let t = Math.max(100, wait);
        while (!ret && t > 0) {
            t -= 100;
            await Tools.sleep(100);
            ret = Core.GameObject.find(guid);
        }
        return ret;
    }



    /**
    * 创建游戏物体身上的触发器
    * @param gameObject 触发器游戏物体
    * @param useSelf 如果自身为触发器，是否直接使用自身
    * @param sync 如果在服务器上使用此函数，是否同步
    * @returns
    */
    public static createTriggerToGameObject(gameObject: Core.GameObject, useSelf: boolean = true, sync: boolean = false): Gameplay.Trigger {
        let trigger: Gameplay.Trigger = null;
        if (gameObject instanceof Gameplay.Trigger && useSelf) //如果本身是一个触发器,且允许使用自身作为返回
        {
            trigger = gameObject as Gameplay.Trigger;
        }
        else {
            trigger = Core.GameObject.spawnGameObject("113", sync) as Gameplay.Trigger;
            trigger.name = gameObject.name + "_Trigger";
            trigger.worldScale = gameObject.worldScale.multiply(1.2);//触发器比本体稍微大一点
            trigger.attachToGameObject(gameObject);
            trigger.setRelativeLocation(new Type.Vector(0, 0, 50));
            trigger.setRelativeRotation(Type.Rotation.zero);
        }
        return trigger;
    }

    /**
    * 获取物体的所有子级(包含子级的子级，不包含自身)
    * @param parent 父节点
    * @param deep 查找深度
    * @param property 特定查找成员名，没有则返回游戏物体本身
    * @returns 
    */
    public static getAllChild(parent: Core.GameObject, deep: number = 5, property: string = null): any[] {
        if (parent.getChildren().length <= 0 || deep <= 0) {
            return null;
        }
        else {
            let result: any[] = []
            for (let c of parent.getChildren()) {
                if (property) {
                    result.push(c[property as keyof typeof c]);
                }
                else {
                    result.push(c);
                }
                // result.push(c);//加上本身
                let cc = this.getAllChild(c, deep - 1, property);//拿到此子级的子级
                if (cc != null) {
                    result = result.concat(cc);
                }
            }
            return result;
        }
    }

    /**
     * 贝塞尔曲线
     * 给出一组点，算出的这个曲线在某个阶段的值
     * @param points 曲线点参数组
     * @param lerp 0-1的插值
     */
    public static Bezier(points: Type.Vector[], lerp: number): Type.Vector {
        lerp = this.RoundNumber(lerp, 0, 1);
        if (points.length == 2)//只有2个点时，直接返回插值点
        {
            return this.LerpVector(points[0], points[1], lerp);
        }
        let nextArray: Type.Vector[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            let pointA = points[i];
            let pointB = points[i + 1];
            let lerpPoint = this.LerpVector(pointA, pointB, lerp);
            nextArray.push(lerpPoint);
        }
        return this.Bezier(nextArray, lerp);
    }

    /**根据圆心和半径，单位角度，获取圆上的坐标点集合 */
    public static getCirclePoints(center: { x: number, y: number, z: number }, radius: number, step: number) {
        let result: { x: number, y: number, z: number }[] = [];
        let z = center.z;
        let [x0, y0] = [center.x, center.y];
        for (let angle: number = 0; angle < 360; angle += step) {
            let radian = angle * 2 * (Math.PI / 360);
            let x = x0 + radius * Math.cos(radian);
            let y = y0 + radius * Math.sin(radian);
            result.push({ x, y, z });
        }
        return result;
    }



}

/**
 * 提取一个对象所有成员转化为字符串，用于打印显示
 * @param object 被提取的对象
 * @param showFunc 是否显示函数成员
 * @param deep 递归深度，最多5层
 */
export function HelpDumpObject(object: any, showFunc: boolean = false, deep: number = 5) {
    if (object == null || object == undefined) {
        if (typeof (object) == "object") {
            return "null";
        }
        return String(object);
    }
    if (typeof (object) != "object") {
        return String(object);
    }
    deep = Math.min(5, deep);//最多递归5层
    let spaceLength = Math.abs(deep - 5) * 2;//空格数量
    let space = "";
    for (let i = 0; i < spaceLength; i++) {
        space += " ";
    }
    let result = "\n" + space + "{";
    if (object instanceof Map)//本身是Map对象
    {
        result += "\n" + space;
        if (deep <= 0) {
            result += `(Map):${object}`;
        }
        else {
            result += "(Map):";
            for (let key of object.keys()) {
                result += "\n" + space + ` [${key}]:${HelpDumpObject(object.get(key), showFunc, deep - 1)}`;
            }
        }
    }
    else {
        for (let k in object) {

            if (object[k] instanceof Map)//是一个map对象
            {
                result += "\n" + space;
                //递归深度到底
                if (deep <= 0) {
                    result += `${k}(Map):${object[k]}`;
                }
                else {
                    result += k + "(Map):";
                    // result += "\n{";
                    for (let key of object[k].keys()) {
                        result += "\n" + space + ` [${key}]:${HelpDumpObject(object[k].get(key), showFunc, deep - 1)}`;
                    }
                    // result += "\n}"
                }
            }
            //是一个对象成员，再次递归
            else if (typeof (object[k]) == "object") {
                result += "\n" + space;
                //递归深度到底
                if (deep <= 0) {
                    result += `${k}:${object[k]}`;
                }
                else {
                    result += `${k}:${HelpDumpObject(object[k], showFunc, deep - 1)}`;
                }
            }
            else if (typeof (object[k]) == "function") {
                if (showFunc) {
                    result += "\n" + space;
                    result += `${k}:function`;
                }
                else {
                    continue;
                }
            }
            else {
                result += "\n" + space;
                result += `${k}:${object[k]}`;
            }
            // result += "\n" + space;
        }
    }

    result += "\n" + space + "}";
    return result;
}
/**下载并加载所有用到的资源
 * 
 * @param assets 需要下载的资源ID
 * @param step 每单步次下载的最大资源数
 * @param callback 下载进度回调 (进度值，接下来下载的资源组)
 * @returns 
 */
export async function downLoadAllAsset(assets: string[], step: number = 10, callback: (progress: number, nextasset?: string) => void = null) {
    if (!assets || assets.length <= 0) {
        callback && callback(1, "");
        return;
    }
    let pro = 0;//进度值
    let arr = [];
    let count = 0;
    for (let i = 0; i < assets.length; i++) {
        const guid = assets[i];

        if (!Util.AssetUtil.assetLoaded(guid)) {
            arr.push(Util.AssetUtil.asyncDownloadAsset(guid));
            count++;
        }
        if (count >= step || i >= assets.length - 1) {
            await Promise.all(arr);
            arr.length = 0;
            count = 0;
        }
        pro = (i + 1) / assets.length;
        callback && callback(pro, (i < assets.length - 1) ? assets.slice(i + 1, i + 11).toString() : "");
    }
    assets.forEach(val => {
        Util.AssetUtil.loadAsset(val);
    })
}
/**通过一组权重值组，随机获取这组权重值对应的索引，权重值越高，取到几率越高 */
export function randomItemRange(ranges: number[]): number {
    let sum = ranges.reduce((pr, current) => {
        return pr + current;
    }, 0);
    let ran = Util.MathUtil.randomInt(0, sum);
    for (let i = 0; i < ranges.length; i++) {
        if (ranges[i] > ran) {
            return i;
        }
        ran -= ranges[i];
    }
    return ranges.length - 1;
}
/**带键值对的对象池 */
export class KVPool<K, V>{
    private readonly _ItemMap: Map<K, V[]> = new Map();
    public constructor(private create: (k: K) => V, private init?: (v: V) => void, private recycle?: (v: V) => void) { }

    /**根据key获取某种物体,异步获取 */
    public getObject(k: K): V {
        let ret: V = null;
        if (!this._ItemMap.has(k)) {
            this._ItemMap.set(k, []);
        }
        if (this._ItemMap.get(k).length > 0) {
            ret = this._ItemMap.get(k).shift();
        }
        else {
            ret = this.create(k);
        }
        this.init && this.init(ret);
        return ret;
    }

    /**移除回收物体 */
    public remove(k: K, v: V) {
        if (!this._ItemMap.has(k)) {
            this._ItemMap.set(k, []);
        }
        this.recycle && this.recycle(v);
        this._ItemMap.get(k).push(v);
    }
}
