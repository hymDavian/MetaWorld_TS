/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/naming-convention */
import { NetErrorLog, ErrorDes } from "./NetErrorLog";

type ErrorCallback = [(...args: baseSerializeType[]) => void, Object];
const ClientErrorCallback: Map<NetErrorLog, ErrorCallback[]> = new Map();

/**注册服务器的报错反馈 */
function registerNetErrorDebug(event: NetErrorLog, callback: (...args: baseSerializeType[]) => void, thisObj?: Object) {
    if (!ClientErrorCallback.has(event)) {
        ClientErrorCallback.set(event, []);
    }
    ClientErrorCallback.get(event).push([callback, thisObj]);
}

class NetworkModuleClient extends ModuleC<NetworkModuleServer, null>{

    public net_Error(error: NetErrorLog, args: baseSerializeType[]) {
        args = args ? args : [];
        console.log(ErrorDes.get(error));//目前只是简单打印
        if (ClientErrorCallback.has(error)) {
            const arr = ClientErrorCallback.get(error);
            for (let i = 0; i < arr.length; i++) {
                const [act, obj] = arr[i];
                try {
                    if (obj) {
                        act.call(obj, ...args);
                    }
                    else {
                        act(...args);
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    /**处理某个网络消息 */
    public net_doProcess(cmd: string, ...data: baseSerializeType[]) {
        if (netProcessClient.has(cmd)) {
            const [cls, act, thisClsName] = netProcessClient.get(cmd);
            let desObj: NetPackage | baseSerializeType = null;
            if (cls) {
                desObj = new cls(cmd);
                desObj.deserialization(data);
            }
            else {
                desObj = data[0];
            }
            const thisObj = thisClsName ? netClassObjectClient.get(thisClsName) : null;
            try {
                act.call(thisObj, desObj);
            } catch (error) {
                console.error(error);
            }

        }
    }

    /**客户端请求 */
    public send(cmd: string, pack?: NetPackage | baseSerializeType) {
        const datas = pack ? ((pack instanceof NetPackage) ? pack.serialize : [pack]) : [];
        this.server.net_doProcess(cmd, ...datas);
    }
}

class NetworkModuleServer extends ModuleS<NetworkModuleClient, null>{
    /**服务器通知客户端业务逻辑错误 */
    public callClientError(error: NetErrorLog, errorArgs: baseSerializeType[], pid?: number) {
        if (pid) {
            this.getClient(pid).net_Error(error, errorArgs);
        }
        else {
            this.getAllClient().net_Error(error, errorArgs);
        }
    }

    /**处理某个网络消息 */
    public net_doProcess(cmd: string, ...data: baseSerializeType[]) {
        if (netProcessServer.has(cmd)) {
            const [cls, act, thisClsName] = netProcessServer.get(cmd);
            let desObj: NetPackage | baseSerializeType = null;
            if (cls) {
                desObj = new cls(cmd);
                desObj.deserialization(data);
            }
            else {
                desObj = data[0];
            }
            const thisObj = thisClsName ? netClassObjectServer.get(thisClsName) : null
            try {
                act.call(thisObj, desObj);
            } catch (error) {
                console.error(error);
            }
        }
    }

    public send(cmd: string, pack?: NetPackage | baseSerializeType, pid?: number) {
        const datas = pack ? ((pack instanceof NetPackage) ? pack.serialize : [pack]) : [];
        if (pid) {
            this.getClient(pid).net_doProcess(cmd, ...datas);
        }
        else {
            this.getAllClient().net_doProcess(cmd, ...datas);
        }
    }
}
/**网络初始化 */
function initNetWork() {
    ModuleManager.getInstance().registerModule(NetworkModuleServer, NetworkModuleClient, null);
}
/**客户端发送信息给服务器
 * @param cmd 操作id
 * @param pack 网络消息对象
 */
function clientSend(cmd: string, pack?: NetPackage | baseSerializeType) {
    if (SystemUtil.isClient()) {
        ModuleManager.getInstance().getModule(NetworkModuleClient).send(cmd, pack);
    }
}
/**服务器发送信息给客户端
 * @param cmd 操作id
 * @param pack 网络消息对象
 * @param pid 要发送给谁，如果无值则发给全体客户端
 */
function serverSend(cmd: string, pack?: NetPackage | baseSerializeType, pid?: number) {
    if (SystemUtil.isServer()) {
        ModuleManager.getInstance().getModule(NetworkModuleServer).send(cmd, pack, pid);
    }
}
/**服务器提示一个订立的额外消息给客户端,一般用于逻辑错误提示
 * @param error 消息类型枚举
 * @param pid 发给谁，如果没有则发给全体
 */
function serverError(error: NetErrorLog, errorArgs?: baseSerializeType[], pid?: number) {
    if (SystemUtil.isServer()) {
        ModuleManager.getInstance().getModule(NetworkModuleServer).callClientError(error, errorArgs ? errorArgs : [], pid);
    }
}



type netPackageClass = { new(cmd: string, ...other: any[]): NetPackage }

type netProcessAct = (netpack?: NetPackage | baseSerializeType) => void;//处理网络协议的函数

/**网络报信息基类 */
abstract class NetPackage {
    /**自身被接收后要求的网络处理协议号 */
    private readonly cmd: string;

    public constructor(cmd: string) {
        this.cmd = cmd;
    }

    /**自身各成员序列化后可以被网络传输的值 */
    public get serialize(): baseSerializeType[] {
        const ret: baseSerializeType[] = [];
        const clsName = this.constructor.name;
        if (classDesMap.has(clsName)) {
            const attrs = classDesMap.get(clsName);
            for (let i = 0; i < attrs.length; i++) {
                const [attrName, Type] = attrs[i];
                const data = this[attrName];
                const netData = serializeFunc.get(Type)(data);
                ret.push(netData);
            }
        }
        return ret;
    }

    /**将一些网络数据反序列化到自身友好的数据类型 */
    public deserialization(outData: baseSerializeType[]) {
        const clsName = this.constructor.name;
        if (classDesMap.has(clsName)) {
            const attrs = classDesMap.get(clsName);
            for (let i = 0; i < attrs.length; i++) {//根据注册的成员名，依次将外部数据放进去
                const data = outData[i];
                const [attrName, Type] = attrs[i];
                this[attrName] = deserializeFunc.get(Type)(data);
            }
        }
    }

    /**发送自己给对方端
     * @param pid 如果是服务器发送，这里为需要被发送的客户端id,如果不填，发给所有玩家
     */
    public sendMe(pid?: number) {
        if (SystemUtil.isServer()) {
            serverSend(this.cmd, this, pid);
        }
        if (SystemUtil.isClient()) {
            clientSend(this.cmd, this);
        }
    }
}
const classDesMap: Map<string, [string, ENetType][]> = new Map();//序列化数据Map
/**注册可以被序列化的成员 */
function serializationIndex(type: ENetType) {
    return function (target: NetPackage, psName: string) {
        const clsName = target.constructor.name;
        if (!classDesMap.has(clsName)) {
            classDesMap.set(clsName, []);
        }
        classDesMap.get(clsName).push([psName, type]);
    }
}

const netClassObjectClient: Map<string, any> = new Map();//网络对象
const netClassObjectServer: Map<string, any> = new Map();//网络对象
const netProcessClient: Map<string, [netPackageClass, netProcessAct, string]> = new Map();
const netProcessServer: Map<string, [netPackageClass, netProcessAct, string]> = new Map();
/**注册如何去处理某个网络消息(装饰器) */
function RegisterResponseTAG(cmd: string, netClass?: netPackageClass) {
    return function (target: any, propertyRey: string, description: PropertyDescriptor) {
        const clsName = target.constructor.name;
        if (description.value && typeof description.value === "function") {
            RegisterResponse(cmd, description.value, clsName, netClass);
        }

    }
}
/**注册如何去处理某个网络消息 */
function RegisterResponse(cmd: string, callback: netProcessAct, thisArg: string, netClass?: netPackageClass) {
    const map = SystemUtil.isServer() ? netProcessServer : netProcessClient;

    if (!map.has(cmd)) {
        map.set(cmd, [netClass, callback, thisArg]);
    }
}

/**如果是包含处理网络消息函数的类，需要使用这个函数去注册一下 */
function registerNetClass(obj: Object, isserver: boolean) {
    if (!obj) { return; }
    const clsName = obj.constructor.name;//类名
    if (SystemUtil.isServer() && isserver) {
        netClassObjectServer.set(clsName, obj);
    }
    if (SystemUtil.isClient() && !isserver) {
        netClassObjectClient.set(clsName, obj);
    }

}

enum ENetType {
    String, Number, Boolean, Vec2, Vec3, Vec4, Color, Rotation, Transform,
    StringArr, NumberArr, BooleanArr, Vec2Arr, Vec3Arr, Vec4Arr, ColorArr, RotationArr, TransformArr,
    NumberDoubleArr
}

type baseSerializeType = number | string | boolean | Type.Vector | Type.Vector2 | Type.Vector4 | Type.LinearColor | Type.Rotation | Type.Transform |
    number[] | string[] | boolean[] | Type.Vector[] | Type.Vector2[] | Type.Vector4[] | Type.LinearColor[] | Type.Rotation[] | Type.Transform[];
//如何将一个对象的某个成员序列化成可以被网络传输的类型
const serializeFunc: Map<ENetType, (data: any) => baseSerializeType> = new Map([
    [ENetType.String, data => { return data }],
    [ENetType.Number, data => { return data }],
    [ENetType.Boolean, data => { return data }],
    [ENetType.Vec2, data => { return data }],
    [ENetType.Vec3, data => { return data }],
    [ENetType.Vec4, data => { return data }],
    [ENetType.Color, data => { return data }],
    [ENetType.Rotation, data => { return data }],
    [ENetType.Transform, data => { return data }],
    [ENetType.StringArr, data => { return data }],
    [ENetType.NumberArr, data => { return data }],
    [ENetType.BooleanArr, data => { return data }],
    [ENetType.Vec2Arr, data => { return data }],
    [ENetType.Vec3Arr, data => { return data }],
    [ENetType.Vec4Arr, data => { return data }],
    [ENetType.ColorArr, data => { return data }],
    [ENetType.RotationArr, data => { return data }],
    [ENetType.TransformArr, data => { return data }]
]);
serializeFunc.set(ENetType.NumberDoubleArr, (val: number[][]) => {
    const ret: string[] = [];
    for (let i = 0; i < val.length; i++) {
        const inStr: string = val[i].join(',');
        ret.push(inStr);
    }
    return ret;
})

//如果将一个网络传输过来的数据反序列化成可读友好类型
const deserializeFunc: Map<ENetType, (data: baseSerializeType) => any> = new Map([
    [ENetType.String, data => { return data }],
    [ENetType.Number, data => { return data }],
    [ENetType.Boolean, data => { return data }],
    [ENetType.Vec2, data => { return data }],
    [ENetType.Vec3, data => { return data }],
    [ENetType.Vec4, data => { return data }],
    [ENetType.Color, data => { return data }],
    [ENetType.Rotation, data => { return data }],
    [ENetType.Transform, data => { return data }],
    [ENetType.StringArr, data => { return data ? data : [] }],
    [ENetType.NumberArr, data => { return data ? data : [] }],
    [ENetType.BooleanArr, data => { return data ? data : [] }],
    [ENetType.Vec2Arr, data => { return data ? data : [] }],
    [ENetType.Vec3Arr, data => { return data ? data : [] }],
    [ENetType.Vec4Arr, data => { return data ? data : [] }],
    [ENetType.ColorArr, data => { return data ? data : [] }],
    [ENetType.RotationArr, data => { return data ? data : [] }],
    [ENetType.TransformArr, data => { return data ? data : [] }]
]);
deserializeFunc.set(ENetType.NumberDoubleArr, (data: string[]) => {
    data = data ? data : [];
    const ret: number[][] = [];
    for (let i = 0; i < data.length; i++) {
        const inRet: number[] = [];
        const arr = data[i].split(',');
        for (let j = 0; j < arr.length; j++) {
            const n = Number(arr[j]);
            inRet.push(n);
        }
        ret.push(inRet);
    }
    return ret;
})

/**定义某种数据的序列化方式和反序列化方式
 * @param typeid 这种数据需要被自定义一个类型Key 不能是 0-17间(闭区间)的任意数字
 * @param ser 序列化方式(将自己处理为可被网络传输的数据)
 * @param deser 反序列化方式(将一个网络传输过来的数据变为自己的可读类型)
 */
function setCustomNetType(typeid: number, ser: (data: any) => baseSerializeType, deser: (data: baseSerializeType) => any) {
    serializeFunc.set(typeid, ser);
    deserializeFunc.set(typeid, deser);
}

//这里写自己想的自定义序列化和反序列化方式
//setCustomNetType(18, data => { return data }, data => { return data });




export {
    NetPackage, ENetType, netProcessAct, baseSerializeType,
    RegisterResponseTAG, RegisterResponse, registerNetErrorDebug, registerNetClass,
    serializationIndex, initNetWork, serverError, clientSend, serverSend
}