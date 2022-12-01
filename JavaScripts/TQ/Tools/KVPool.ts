/**带key的键值对象池 */
export class KVPool<K, V>{
    private readonly _ItemMap: Map<K, V[]> = new Map();
    public constructor(private create: ((k: K) => V) | ((k: K) => Promise<V>), private init?: (v: V) => void, private recycle?: (v: V) => void) { }

    /**根据key获取某种物体,异步获取 */
    public async getObject(k: K): Promise<V> {
        let ret: V = null;
        if (!this._ItemMap.has(k)) {
            this._ItemMap.set(k, []);
        }
        if (this._ItemMap.get(k).length > 0) {
            ret = this._ItemMap.get(k).shift();
        }
        else {
            ret = await this.create(k);
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