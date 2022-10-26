import { Datacenter } from "../../Data/Datacenter";

type buildingInfo = [
    string,
    number[],
    number[],
    number[]
]
type allBuilding = {
    infos: buildingInfo[]
}

export class BuildingData extends Datacenter.PlayerSaveData {

    private building: allBuilding = {
        infos: []
    }
    //从数据库初始数据为运行时数据形态
    public initData(dataSet: allBuilding) {
        if (!dataSet.infos) {
            this.building = {
                infos: []
            }
        }
        else {
            this.building = dataSet;
        }


    }
    public clearMyData() {
        this.building = {
            infos: []
        }
    }

    //获取保存到数据库的形态
    public get myData(): allBuilding {
        this.building.infos.forEach(info => {
            info[1].forEach((v, index, array) => {
                array[index] = Math.floor(v);
            })
            info[2].forEach((v, index, array) => {
                array[index] = Math.floor(v);
            })
            info[3].forEach((v, index, array) => {
                array[index] = Math.floor(v);
            })
        })

        return this.building;
    }

    public addBuilding(obj: Core.GameObject) {
        let sv: buildingInfo = [
            obj.getSourceAssetGuid(),
            [obj.worldLocation.x, obj.worldLocation.y, obj.worldLocation.z],
            [obj.worldScale.x, obj.worldScale.y, obj.worldScale.z],
            [obj.worldRotation.x, obj.worldRotation.y, obj.worldRotation.z]
        ]
        this.building.infos.push(sv);
    }

}