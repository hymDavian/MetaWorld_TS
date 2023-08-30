import { ComponentBase, Entity } from "../componentBase";

type rect = { x: number, y: number }
namespace GlobalPartition {
    const mapCenter: Type.Vector2 = new Type.Vector2(-832, 2133);//地图中心
    const mapSize: Type.Vector2 = new Type.Vector2(10000, 10000);//地图大小
    const rectSize: Type.Vector2 = new Type.Vector(300, 300);//单位区块大小
    let rectNum: Type.Vector2;
    const rectList: rect[][] = [];//单位区块列表
    // const rectMap: Map<Entity, rect> = new Map();//单位区块映射
    export const Partitions: PartitionComponent[] = [];//所有分区组件

    let zeroRectPos: Type.Vector2;
    export function init() {
        rectNum = new Type.Vector2();
        rectNum.x = Math.ceil(mapSize.x / rectSize.x);
        rectNum.y = Math.ceil(mapSize.y / rectSize.y);
        for (let i = 0; i < rectNum.x; i++) {
            rectList[i] = [];
            for (let j = 0; j < rectNum.y; j++) {
                rectList[i][j] = { x: i, y: j };
            }
        }
        const zeroX = mapCenter.x - mapSize.x / 2;
        const zeroY = mapCenter.y - mapSize.y / 2;
        zeroRectPos = new Type.Vector2(zeroX, zeroY);
    }

    function getRect(pos: Type.Vector): rect {
        if (pos.x < zeroRectPos.x || pos.y < zeroRectPos.y) {
            return { x: 0, y: 0 };
        }
        let x = Math.floor(Math.abs(pos.x - zeroRectPos.x) / rectSize.x);
        let y = Math.floor(Math.abs(pos.y - zeroRectPos.y) / rectSize.y);
        x = Math.clamp(x, 0, rectNum.x - 1);
        y = Math.clamp(y, 0, rectNum.y - 1);
        return rectList[x][y];
    }

    function getRectList(pos: Type.Vector, radius: number): rect[] {
        const rect = getRect(pos);
        const x = rect.x;
        const y = rect.y;
        const list: rect[] = [];
        const xStep = Math.floor(radius / rectSize.x);
        const YStep = Math.floor(radius / rectSize.y);
        for (let i = x - xStep; i <= x + xStep; i++) {
            for (let j = y - YStep; j <= y + YStep; j++) {
                if (i >= 0 && i < rectNum.x && j >= 0 && j < rectNum.y) {
                    list.push(rectList[i][j]);
                }
            }
        }
        // for (let i = x - radius; i <= x + radius; i ++) {
        //     for (let j = y - radius; j <= y + radius; j++) {
        //         if (i >= 0 && i < rectNum.x && j >= 0 && j < rectNum.y) {
        //             list.push(rectList[i][j]);
        //         }
        //     }
        // }
        return list;
    }

    function getEntityList(rect: rect): Entity[] {
        const list: Entity[] = [];
        for (const comp of Partitions) {
            const entity = comp.owner;
            const entityRect = getRect(entity.transform.location);
            if (entityRect.x == rect.x && entityRect.y == rect.y) {
                list.push(entity);
            }
        }
        return list;
    }

    export function getNearEntityList(pos: Type.Vector, radius: number): Entity[] {
        const rectList = getRectList(pos, radius);
        const list: Entity[] = [];
        for (const rect of rectList) {
            const entityList = getEntityList(rect);
            for (const entity of entityList) {
                // const distance = Type.Vector.distance(pos, entity.transform.location);
                // if (distance <= radius) {
                //     list.push(entity);
                // }
                list.push(entity);
            }
        }
        return list;
    }
}

export class PartitionComponent extends ComponentBase {
    protected onUpdate(dt: number): void {
    }
    private static isInited: boolean = false;
    protected onAdd(): void {
        if (!PartitionComponent.isInited) {
            PartitionComponent.isInited = true;
            GlobalPartition.init();
        }
        GlobalPartition.Partitions.push(this);
    }
    protected onRemove(): void {
        const index = GlobalPartition.Partitions.indexOf(this);
        if (index >= 0) {
            GlobalPartition.Partitions.splice(index, 1);
        }
    }
    /** 获取附近的实体列表(只会查找带有分区组件的实体) */
    public getNearEntityList(radius: number): Entity[] {
        return GlobalPartition.getNearEntityList(this.owner.transform.location, radius);
    }



}