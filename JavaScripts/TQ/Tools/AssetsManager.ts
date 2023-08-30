/* eslint-disable lines-between-class-members */
/**
 * 下载的最大尝试次数
 */
const maxRetryDownLoadTime = 1;


interface RecoverableGO extends Core.GameObject {

    assetId?: string;
}

/**
 * 游戏中唯一的资源管理器
 * 所有游戏使用到的资源都应该在这里创建和释放
 */
export class AssetsManager {
    private static _ins: AssetsManager;
    private _downLoadSheet: Set<string> = new Set();
    private readonly _pool: Map<string, Core.GameObject[]> = new Map();
    public static get ins() {
        if (!this._ins) {
            this._ins = new AssetsManager();
        }
        return this._ins;
    }
    async spawn<T extends Core.GameObject>(guid: string): Promise<T> {
        if (!guid) { return null; }
        if (!this.isAssetExits(guid)) {
            const downRet = await this.downLoad(guid);
            if (!downRet) {
                console.error("无法加载模型资源" + guid + "使用方块代替！");
                guid = "7669";
            }
        }
        const go = this.innerSpawn(guid);
        if (!go) {
            console.error("没有生成模型：" + guid);
            return null;
        }
        go["assetId"] = guid;
        go.setVisibility(Type.PropertyStatus.On);
        return go as T;
    }
    private innerSpawn(guid: string) {
        if (!this._pool.has(guid)) {
            this._pool.set(guid, []);
        }
        const pool = this._pool.get(guid);

        let go: Core.GameObject = pool.length > 0 ? pool.pop() : null;
        if (!go) {
            go = Core.GameObject.spawn({ guid, replicates: false });
        }
        if (!go) {
            const find = Core.GameObject.find(guid);
            go = find.clone();
        }
        // if (this._guidSpawnNum.has(guid)) {
        //     this._guidSpawnNum.set(guid, this._guidSpawnNum.get(guid) + 1);
        // }
        return go;
    }
    recover(assetInfo: RecoverableGO) {
        if (!assetInfo) { return; }
        if (!assetInfo.worldLocation) {
            console.error(`${assetInfo.name}不存在坐标属性`);
            return;
        }
        assetInfo.detachFromGameObject();
        if (assetInfo.worldLocation == undefined) {
            return;
        }
        assetInfo.worldLocation = assetInfo.worldLocation.set(9999, 9999, 9999);
        if (!assetInfo["assetId"]) {
            assetInfo["assetId"] = assetInfo.getSourceAssetGuid();
        }
        if (this._pool.has(assetInfo["assetId"])) {
            this._pool.get(assetInfo["assetId"]).push(assetInfo);
        }
        else {
            this._pool.set(assetInfo["assetId"], [assetInfo]);
        }
    }
    /**下载资源 */
    public async downLoad(guid: string) {
        return this.innerLoad(guid);
    }
    private async innerLoad(guid: string, retryTime: number = 0) {
        if (this.isAssetExits(guid)) {

            return true;
        }

        const ret = await Util.AssetUtil.asyncDownloadAsset(guid)
        if (ret) {
            this._downLoadSheet.add(guid);
        } else {
            if (retryTime >= maxRetryDownLoadTime) {//最大尝试下载次数
                return false;
            }
            return this.innerLoad(guid, ++retryTime);
        }
        return ret;
    }
    /**检查资源是否加载过 */
    private isAssetExits(guid: string) {
        if (!this._downLoadSheet.has(guid) && Core.GameObject.find(guid)) {//场景上有这个物体
            this._downLoadSheet.add(guid);
        }
        return this._downLoadSheet.has(guid);
    }
}