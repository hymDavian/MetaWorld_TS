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

        if (!Util.AssetUtil.isAssetLoaded(guid)) {
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
type keyType = string | numObj
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