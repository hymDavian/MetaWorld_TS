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

function onPropertyChangeDo<T extends Core.Script>(path: string[], funcName: string) {
    const arr = (path as unknown as string).split('.');
    const [clsName, guid, ...members] = arr;
    Core.ScriptManager.asyncFindScript(guid).then(val => {
        if (val) {
            const obj = val as T;
            const f = obj[funcName] as Function;
            try {
                f.call(obj);
            } catch (error) {
                console.error(`replicated error,script:${guid},function:${funcName},errorMsg:\n${error.stack}`)
            }
        }
    })
}

