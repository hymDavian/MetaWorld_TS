import { Datacenter } from "../../Data/Datacenter";
import { NetManager, NetModuleBase } from "../../Tools/NetManager";
import { BuildingData } from "./BuildingData";

type objType = {
    ty: number,
    tempObj: Core.GameObject
}

@NetManager.netFlagClass
export class CreateModule extends NetModuleBase {
    private tempInfo: objType[] = null;
    private curSwitchID: number = -1;

    private locPlayer: Gameplay.Character = null;

    protected onStart() {
        if (this.isServer) {//如果是服务器
            console.log("服务器初始化")
        }
        else {
            console.log("客户端初始化")
            this.locPlayer = Gameplay.getCurrentPlayer().character;

            this.tempInfo = [
                { ty: 21588, tempObj: Core.GameObject.spawnGameObject("21588") },
                { ty: 21586, tempObj: Core.GameObject.spawnGameObject("21586") },
                { ty: 21592, tempObj: Core.GameObject.spawnGameObject("21592") },
            ];
            //this.switchObj(0);
        }
    }

    protected onPlayerEnter(pid: number): void {
        Datacenter.server.getPlayerData(pid, BuildingData).then(dt => {
            if (dt) {
                for (let info of dt.myData.infos) {
                    let o = Core.GameObject.spawnGameObject(info[0]);
                    o.worldLocation = new Type.Vector(...info[1]);
                    o.worldScale = new Type.Vector(...info[2]);
                    o.worldRotation = new Type.Rotation(info[3][0], info[3][1], info[3][2]);
                }
            }
        })
    }



    protected onUpdate(dt: number) {
        if (!this.isServer) {
            let info = this.tempInfo[this.curSwitchID];
            if (info && info.tempObj) {
                info.tempObj.worldLocation = this.locPlayer.worldLocation.add(this.locPlayer.forwardVector.multiply(100));
            }
        }
    }

    /**[client] 放置当前物体 */
    public setObject() {
        let info = this.tempInfo[this.curSwitchID];
        if (!info || !info.tempObj) { return; }

        let tempObject = info.tempObj;
        if (tempObject) {
            const pos = tempObject.worldLocation;
            const scale = tempObject.worldScale;
            const rot = tempObject.worldRotation;
            let guid: string = info.ty.toString();
            let posN = [pos.x, pos.y, pos.z];
            let sizeN = [scale.x, scale.y, scale.z];
            let rotN = [rot.x, rot.y, rot.z]
            NetManager.sendNet(1, [guid, posN, sizeN, rotN]);
        }

    }

    public switchObj(ty: number) {
        if (ty != this.curSwitchID && this.curSwitchID >= 0) {//切换了
            if (this.tempInfo[this.curSwitchID].tempObj) {
                this.tempInfo[this.curSwitchID].tempObj.setVisibility(Type.PropertyStatus.Off);//隐藏之前的
            }

        }
        this.curSwitchID = ty;
        if (!this.tempInfo[this.curSwitchID].tempObj) {
            this.tempInfo[this.curSwitchID].tempObj = Core.GameObject.spawnGameObject(this.tempInfo[this.curSwitchID].ty.toString());
        }
        this.tempInfo[this.curSwitchID].tempObj.setVisibility(Type.PropertyStatus.On);//显示当前的

        // (this.tempInfo[this.curSwitchID].tempObj as Gameplay.StaticMesh).setMaterial("23775");
    }

    @NetManager.netFlagFunc(1)
    private onPlayerSetObj(pid: number, guid: string, pos: number[], size: number[], rot: number[]) {
        console.log("玩家 " + pid + " 放置了一个 " + guid);
        let obj = Core.GameObject.spawnGameObject(guid);
        obj.worldLocation = new Type.Vector(...pos);
        obj.worldScale = new Type.Vector(...size);
        obj.worldRotation = new Type.Rotation(rot[0], rot[1], rot[2]);

        //存数据
        Datacenter.server.getPlayerData(pid, BuildingData).then(dt => {
            if (dt) {
                dt.addBuilding(obj);
                dt.save()
            }
        })
    }

}