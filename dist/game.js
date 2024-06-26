var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// JavaScripts/TQ/CommonLogic/Backpack.ts
var require_Backpack = __commonJS({
  "JavaScripts/TQ/CommonLogic/Backpack.ts"() {
  }
});

// JavaScripts/TQ/CommonLogic/BackpackModule.ts
var require_BackpackModule = __commonJS({
  "JavaScripts/TQ/CommonLogic/BackpackModule.ts"() {
  }
});

// JavaScripts/TQ/Tools/ArrayExtFunc.ts
var require_ArrayExtFunc = __commonJS({
  "JavaScripts/TQ/Tools/ArrayExtFunc.ts"() {
    if (!Array.prototype.add) {
      Object.defineProperty(Array.prototype, "add", {
        value(item) {
          this.push(item);
          return this;
        },
        enumerable: false
      });
    }
    if (!Array.prototype.remove) {
      Object.defineProperty(Array.prototype, "remove", {
        value(key, value) {
          let i = value === void 0 ? this.indexOf(key) : this.findIndex((m) => m[key] === value);
          return i === -1 ? null : this.splice(i, 1)[0];
        },
        enumerable: false
      });
    }
    if (!Array.prototype.first) {
      Object.defineProperty(Array.prototype, "first", {
        value(count) {
          if (count == void 0) {
            if (this.length > 0) {
              return this[0];
            } else
              return null;
          } else {
            var ret = [];
            for (var i = 0; i < Math.min(count, this.length); i++) {
              ret.add(this[i]);
            }
            return ret;
          }
        },
        enumerable: false
      });
    }
    if (!Array.prototype.last) {
      Object.defineProperty(Array.prototype, "last", {
        value() {
          return this[this.length - 1];
        },
        enumerable: false
      });
    }
    if (!Array.prototype.has) {
      Object.defineProperty(Array.prototype, "has", {
        value(key, value) {
          return value !== void 0 ? this.some((m) => m[key] === value) : this.indexOf(key) !== -1;
        },
        enumerable: false
      });
    }
    if (!Array.prototype.set) {
      Object.defineProperty(Array.prototype, "set", {
        value(arr) {
          this.clear();
          return this.addRange(arr);
        },
        enumerable: false
      });
    }
    if (!Array.prototype.random) {
      Object.defineProperty(Array.prototype, "random", {
        value(count, isReturnArray) {
          if (count == null || count == 1) {
            if (this.length === 0) {
              return void 0;
            }
            let randomValue = this[Math.floor(Math.random() * this.length)];
            if (isReturnArray) {
              return [randomValue];
            }
            return randomValue;
          } else if (count > this.length) {
            return this;
          } else {
            var shuffled = this.slice(0);
            var i = this.length, min = i - count, temp, index;
            while (i-- > min) {
              index = Math.floor((i + 1) * Math.random());
              temp = shuffled[index];
              shuffled[index] = shuffled[i];
              shuffled[i] = temp;
            }
            return shuffled.slice(min);
          }
        },
        enumerable: false
      });
    }
    if (!Array.prototype.randomByProp) {
      Object.defineProperty(Array.prototype, "randomByProp", {
        value(prop) {
          prop = prop ? prop : "weight";
          let count = 0;
          this.map((item) => {
            if (typeof item[prop] === "number") {
              count += item[prop];
            }
          });
          let rd = Math.floor(Math.random() * count);
          let tempCount = 0;
          for (const element of this) {
            let weight = element[prop];
            if (typeof element[prop] === "number") {
              tempCount += weight;
              if (tempCount > rd) {
                return element;
              }
            }
          }
        },
        enumerable: false
      });
    }
    if (!Array.prototype.randomIndex) {
      Object.defineProperty(Array.prototype, "randomIndex", {
        value() {
          let count = 0;
          this.map((item) => {
            if (typeof item === "number") {
              count += item;
            }
          });
          let rd = Math.floor(Math.random() * count);
          let tempCount = 0;
          for (let i = 0; i < this.length; i++) {
            const element = this[i];
            if (typeof element === "number") {
              tempCount += element;
              if (tempCount > rd) {
                return i;
              }
            }
          }
        },
        enumerable: false
      });
    }
    if (!Array.prototype.randomRemove) {
      Object.defineProperty(Array.prototype, "randomRemove", {
        value() {
          let index = this.randomIndex();
          let result = this[index];
          this.remove(index, 1);
          return result;
        },
        enumerable: false
      });
    }
  }
});

// build.ts
var build_exports = {};
__export(build_exports, {
  MWModuleMap: () => MWModuleMap
});
module.exports = __toCommonJS(build_exports);

// JavaScripts/HYMGame.ts
var HYMGame_exports = {};
__export(HYMGame_exports, {
  default: () => HYMGame
});

// JavaScripts/TQ/tqBase/Datacenter.ts
var Datacenter_exports = {};
__export(Datacenter_exports, {
  Datacenter: () => Datacenter
});
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
var Datacenter;
((Datacenter2) => {
  const EVENT_PLAYER_DATA_REQ_INIT_HYM = "EVENT_PLAYER_DATA_REQ_INIT_HYM";
  const EVENT_PLAYER_DATA_RSP_INIT_HYM = "EVENT_PLAYER_DATA_RSP_INIT_HYM";
  const EVENT_PLAYER_CLIENTSYNC_HYM = "EVENT_PLAYER_CLIENTSYNC_HYM";
  const dataClassMap = /* @__PURE__ */ new Map();
  Datacenter2.clientBeginDataFinish = false;
  async function init(saveOnline, ...dataTypes) {
    DataStorage.setTemporaryStorage(!saveOnline);
    for (let cls of dataTypes) {
      if (cls) {
        dataClassMap.set(cls.name, cls);
      }
    }
    if (Util.SystemUtil.isServer()) {
      serverInit();
    } else {
      Datacenter2.clientBeginDataFinish = false;
      await clientInit();
    }
  }
  Datacenter2.init = init;
  async function clientInit() {
    let localPlayer = await Gameplay.asyncGetCurrentPlayer();
    Events.addServerListener(EVENT_PLAYER_DATA_RSP_INIT_HYM, (pid, data, dataName) => {
      console.log("----------->dataLog:", "\u6536\u5230\u6765\u81EA\u670D\u52A1\u5668\u7684\u6570\u636E\uFF1A", dataName ? `[${dataName}]` : "[\u5168\u6570\u636E]", "\u6570\u636E\u503C\uFF1A" + JSON.stringify(data), "\u5C5E\u4E8E\uFF1A" + pid);
      client.getDataFromServer(pid, data, dataName);
    });
    Events.dispatchToServer(EVENT_PLAYER_DATA_REQ_INIT_HYM, localPlayer.getPlayerID());
    while (!Datacenter2.clientBeginDataFinish) {
      await sleep(10);
    }
  }
  function serverInit() {
    Events.addPlayerJoinedListener((p) => {
      server.loadPlayerData(p);
    });
    Events.addPlayerLeftListener((p) => {
      server.savePlayerData(p);
      playerDataSet.delete(p.getPlayerID());
    });
    Events.addClientListener(EVENT_PLAYER_DATA_REQ_INIT_HYM, async (p, getid, dataName) => {
      server.callClientData(getid, p.getPlayerID(), dataClassMap.get(dataName));
    });
    Events.addClientListener(EVENT_PLAYER_CLIENTSYNC_HYM, (p, data, clsName) => {
      server.getClientSyncData(p.getPlayerID(), data, clsName);
      console.log("----------->dataLog:", "\u6536\u5230\u6765\u81EA\u5BA2\u6237\u7AEF\u7684\u6570\u636E\u540C\u6B65", JSON.stringify(data));
    });
  }
  class PlayerSaveData {
    pid;
    constructor(pid) {
      this.pid = pid;
    }
    get className() {
      return this.constructor.name;
    }
    save() {
      if (Util.SystemUtil.isServer()) {
        Datacenter2.server.savePlayerData(Gameplay.getPlayer(this.pid));
      }
    }
    sync() {
      if (Util.SystemUtil.isServer()) {
        let myplayer = Gameplay.getPlayer(this.pid);
        if (myplayer) {
          Events.dispatchToClient(myplayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, this.pid, this.myData, this.className);
        }
      } else {
        Events.dispatchToServer(EVENT_PLAYER_CLIENTSYNC_HYM, this.myData, this.className);
      }
    }
  }
  Datacenter2.PlayerSaveData = PlayerSaveData;
  class playerAllDataSet {
    _dataSet = /* @__PURE__ */ new Map();
    pid;
    constructor(pid, data) {
      this.pid = pid;
      this.fullAllData(data);
    }
    fullAllData(_data) {
      for (let clsName in _data) {
        if (dataClassMap.has(clsName)) {
          const dataClass = dataClassMap.get(clsName);
          let obj = new dataClass(this.pid);
          obj.initData(_data[clsName]);
          this._dataSet.set(clsName, obj);
        }
      }
    }
    getDataByType(dataType) {
      let clsName = dataType.name;
      if (!this._dataSet.has(clsName)) {
        let tempData = {};
        let clsData = new dataType(this.pid);
        clsData.initData(tempData);
        this._dataSet.set(clsName, clsData);
      }
      return this._dataSet.get(clsName);
    }
    fullData(dataType, data) {
      if (!data) {
        data = {};
      }
      let clsName = dataType.name;
      if (!this._dataSet.has(clsName)) {
        let clsData = new dataType(this.pid);
        clsData.initData(data);
        this._dataSet.set(clsName, clsData);
      }
      return this._dataSet.get(clsName);
    }
    get myAllData() {
      let ret = {};
      for (const [k, v] of this._dataSet) {
        ret[k] = v.myData;
      }
      return ret;
    }
  }
  const playerDataSet = /* @__PURE__ */ new Map();
  let client;
  ((client2) => {
    async function getDataByType(dataType, getServer = false, getid = -1) {
      if (getid == -1) {
        getid = Gameplay.getCurrentPlayer().getPlayerID();
      }
      if (!getServer) {
        if (playerDataSet.has(getid)) {
          return playerDataSet.get(getid).getDataByType(dataType);
        } else {
          return null;
        }
      } else {
        Events.dispatchToServer(EVENT_PLAYER_DATA_REQ_INIT_HYM, getid, dataType.name);
        await sleep(1e3);
        if (playerDataSet.has(getid)) {
          return playerDataSet.get(getid).getDataByType(dataType);
        } else {
          return null;
        }
      }
    }
    client2.getDataByType = getDataByType;
    function getDataFromServer(pid, data, dataName) {
      if (!Datacenter2.clientBeginDataFinish) {
        if (pid == Gameplay.getCurrentPlayer().getPlayerID()) {
          Datacenter2.clientBeginDataFinish = true;
        }
      }
      if (!playerDataSet.has(pid)) {
        playerDataSet.set(pid, new playerAllDataSet(pid, {}));
      }
      let allDataObj = playerDataSet.get(pid);
      if (dataName) {
        let dataType = dataClassMap.get(dataName);
        if (dataType) {
          allDataObj.fullData(dataType, data);
        }
      } else {
        allDataObj.fullAllData(data);
      }
    }
    client2.getDataFromServer = getDataFromServer;
  })(client = Datacenter2.client || (Datacenter2.client = {}));
  let server;
  ((server2) => {
    const isloadingPlayer = [];
    function savePlayerData(player) {
      if (!player) {
        console.error("----------->dataLog:", "save playerData error,player is " + player);
        return;
      }
      let pid = player.getPlayerID();
      if (playerDataSet.has(pid)) {
        let playerMap = playerDataSet.get(pid);
        DataStorage.asyncSetPlayerData(player, playerMap.myAllData);
      }
    }
    server2.savePlayerData = savePlayerData;
    function deleteData(player, dataType) {
      if (!player) {
        console.error("----------->dataLog:", "delete playerData error,player is " + player);
        return;
      }
      let pid = player.getPlayerID();
      if (playerDataSet.has(pid)) {
        let className = dataType.name;
        let data = playerDataSet.get(pid).getDataByType(dataType);
        if (data) {
          data.clearMyData();
        }
        savePlayerData(player);
      }
    }
    server2.deleteData = deleteData;
    async function loadPlayerData(player) {
      if (!player) {
        console.error("----------->dataLog:", "load playerData error,player is " + player);
        return null;
      }
      let pid = player.getPlayerID();
      if (isloadingPlayer.indexOf(pid) >= 0) {
        while (!playerDataSet.has(pid)) {
          await sleep(10);
        }
        return playerDataSet.get(pid);
      }
      isloadingPlayer.push(pid);
      let data = null;
      let waitTime = 0;
      let getDataSuccess = false;
      let awaitDataTask = DataStorage.asyncGetPlayerData(player);
      awaitDataTask.then((val) => {
        data = val;
        getDataSuccess = true;
        console.log("----------->dataLog:", "data get sucess! pid:" + pid);
      });
      while (waitTime < 100 && !getDataSuccess) {
        console.log("----------->dataLog:", "wait get PlayerData pid:" + pid);
        await sleep(100);
        waitTime++;
      }
      if (!data) {
        awaitDataTask.finally();
        data = {};
        console.error("----------->dataLog:", "longTime not get playerData,create emptyData, pid:" + pid);
      }
      playerDataSet.set(pid, new playerAllDataSet(pid, data));
      isloadingPlayer.splice(isloadingPlayer.indexOf(pid), 1);
      return playerDataSet.get(pid);
    }
    server2.loadPlayerData = loadPlayerData;
    async function getPlayerData(p, dataType) {
      let player = null;
      let pid = -1;
      if (typeof p == "number") {
        player = Gameplay.getPlayer(p);
        pid = p;
      } else {
        player = p;
        pid = p.getPlayerID();
      }
      if (!player) {
        console.error("----------->dataLog:", "get playerData error,player is " + player);
        return null;
      }
      let allData = null;
      if (playerDataSet.has(pid)) {
        allData = playerDataSet.get(pid);
      } else {
        allData = await loadPlayerData(player);
      }
      if (!allData) {
        console.error("----------->dataLog:", "not find playerdata in server,pid:" + pid);
        return null;
      }
      return allData.getDataByType(dataType);
    }
    server2.getPlayerData = getPlayerData;
    async function callClientData(dataid, toPlayerid, dataType = null) {
      let toPlayer = Gameplay.getPlayer(toPlayerid);
      if (!toPlayer) {
        console.error("----------->dataLog:", "server have not player,pid:" + toPlayer);
        return;
      }
      let getPlayer = Gameplay.getPlayer(dataid);
      let dataName = dataType ? dataType.name : null;
      if (!getPlayer) {
        console.error("----------->dataLog:", "server have not data,pid:" + dataid);
        Events.dispatchToClient(toPlayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, dataid, null, dataName);
        return;
      }
      let allData = null;
      if (playerDataSet.has(dataid)) {
        allData = playerDataSet.get(dataid);
      } else {
        allData = await loadPlayerData(getPlayer);
      }
      if (!allData) {
        console.error("----------->dataLog:", "not find playerdata in server,pid:" + dataid);
        Events.dispatchToClient(toPlayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, dataid, null, dataName);
        return;
      }
      let toData = null;
      if (!dataName) {
        toData = allData.myAllData;
      } else {
        toData = allData.getDataByType(dataType).myData;
      }
      Events.dispatchToClient(toPlayer, EVENT_PLAYER_DATA_RSP_INIT_HYM, dataid, toData, dataName);
    }
    server2.callClientData = callClientData;
    function getClientSyncData(pid, data, clsName) {
      let syncPlayer = Gameplay.getPlayer(pid);
      if (!syncPlayer) {
        console.error("----------->dataLog:", "server have not player,pid:" + pid);
        return;
      }
      let allData = null;
      if (!playerDataSet.has(pid)) {
        console.error("----------->dataLog:", "not find playerdata in server,pid:" + pid);
        return;
      }
      allData = playerDataSet.get(pid);
      let dataType = dataClassMap.get(clsName);
      if (dataType) {
        allData.fullData(dataType, data);
        savePlayerData(syncPlayer);
      }
    }
    server2.getClientSyncData = getClientSyncData;
  })(server = Datacenter2.server || (Datacenter2.server = {}));
})(Datacenter || (Datacenter = {}));

// JavaScripts/NewUI.ts
var NewUI_exports = {};
__export(NewUI_exports, {
  default: () => NewUI
});

// JavaScripts/test/CreateModule/CreateModule.ts
var CreateModule_exports = {};
__export(CreateModule_exports, {
  CreateModule: () => CreateModule
});

// JavaScripts/TQ/tqBase/NetManager.ts
var NetManager_exports = {};
__export(NetManager_exports, {
  NetManager: () => NetManager,
  NetModuleBase: () => NetModuleBase
});
var NetManager;
((NetManager2) => {
  const netInstanceObj = /* @__PURE__ */ new Map();
  const EVENT_NETMGR_SEND_SERVER = "EVENT_NETMGR_SEND_SERVER";
  const EVENT_NETMGR_SEND_CLIENT = "EVENT_NETMGR_SEND_CLIENT";
  const EVENT_NETMGR_PLAYERENTER = "EVENT_NETMGR_PLAYERENTER";
  const netRegistFunc = /* @__PURE__ */ new Map();
  class sendClientPackage {
    data;
    cmdid;
    errorid;
  }
  class sendServerPackage {
    data;
    cmdid;
    pid;
  }
  const errorMap = /* @__PURE__ */ new Map();
  function setErrorTips(errorid, tips) {
    if (Util.SystemUtil.isClient()) {
      errorMap.set(errorid, { errorid, act: tips });
    }
  }
  NetManager2.setErrorTips = setErrorTips;
  function sendNet(cmd, data, pid, errorid = 0) {
    if (Util.SystemUtil.isServer()) {
      let net = {
        errorid,
        data,
        cmdid: cmd
      };
      if (pid) {
        let p = Gameplay.getPlayer(pid);
        if (p) {
          Events.dispatchToClient(p, EVENT_NETMGR_SEND_CLIENT, net);
        } else {
          console.error("not find player:" + pid);
        }
      } else {
        Events.dispatchToAllClient(EVENT_NETMGR_SEND_CLIENT, net);
      }
    }
    if (Util.SystemUtil.isClient()) {
      let locPlayer = Gameplay.getCurrentPlayer();
      if (!locPlayer) {
        console.error("current player notFind !");
        return;
      }
      let net = {
        data,
        cmdid: cmd,
        pid: locPlayer.getPlayerID()
      };
      Events.dispatchToServer(EVENT_NETMGR_SEND_SERVER, net);
    }
  }
  NetManager2.sendNet = sendNet;
  function initNetMgr() {
    const curIsServer = Util.SystemUtil.isServer();
    if (Util.SystemUtil.isServer()) {
      Events.addClientListener(EVENT_NETMGR_SEND_SERVER, (p, net) => {
        const netFunc = netRegistFunc.get(net.cmdid);
        if (netFunc) {
          for (let f of netFunc) {
            let obj = netInstanceObj.get(f.objType);
            if (!obj) {
              continue;
            }
            try {
              f.func.call(obj, net.pid, ...net.data);
            } catch (error) {
              console.error("net response error!");
              console.error(error.stack);
            }
          }
        }
      });
      Events.addClientListener(EVENT_NETMGR_PLAYERENTER, (p) => {
        for (let [k, v] of netInstanceObj) {
          v["playerEnter"](p.getPlayerID());
        }
      });
    }
    if (Util.SystemUtil.isClient()) {
      Events.addServerListener(EVENT_NETMGR_SEND_CLIENT, (net) => {
        if (errorMap.has(net.errorid)) {
          let tip = errorMap.get(net.errorid);
          if (typeof tip.act == "string") {
            console.log(tip);
          } else {
            tip.act(net.errorid);
          }
        }
        const netFunc = netRegistFunc.get(net.cmdid);
        if (netFunc) {
          for (let f of netFunc) {
            let obj = netInstanceObj.get(f.objType);
            if (!obj) {
              continue;
            }
            try {
              f.func.call(obj, ...net.data);
            } catch (error) {
              console.error("net response error!");
              console.error(error.stack);
            }
          }
        }
      });
    }
    let modArray = [];
    for (let [k, v] of netInstanceObj) {
      modArray.push(v);
    }
    modArray.sort((a, b) => {
      return b.getModuleIndex() - a.getModuleIndex();
    });
    modArray.forEach((m) => {
      m["start"]();
    });
    if (Util.SystemUtil.isClient()) {
      Events.dispatchToServer(EVENT_NETMGR_PLAYERENTER);
    }
  }
  NetManager2.initNetMgr = initNetMgr;
  let time = 0;
  function update() {
    const now = Date.now();
    if (time == 0) {
      time = now;
    }
    ;
    for (let [k, v] of netInstanceObj) {
      v["update"](now - time);
    }
    time = now;
  }
  NetManager2.update = update;
  function netFlagClass(constructor) {
    const netObj = new constructor();
    netInstanceObj.set(constructor.name, netObj);
  }
  NetManager2.netFlagClass = netFlagClass;
  function netFlagFunc(cmdid) {
    return function (target, propertyRey, description) {
      if (!description.value || typeof description.value != "function") {
        return;
      }
      const className = target.constructor.name;
      const func = description.value;
      if (!netRegistFunc.has(cmdid)) {
        netRegistFunc.set(cmdid, new Array());
      }
      let f = {
        objType: className,
        func,
        cmdid
      };
      netRegistFunc.get(cmdid).push(f);
    };
  }
  NetManager2.netFlagFunc = netFlagFunc;
  function getModule(cls) {
    if (netInstanceObj.has(cls.name)) {
      return netInstanceObj.get(cls.name);
    }
    return null;
  }
  NetManager2.getModule = getModule;
})(NetManager || (NetManager = {}));
var NetModuleBase = class {
  isServer = true;
  constructor() {
    this.isServer = Util.SystemUtil.isServer();
    this.onAwake();
  }
  getModuleIndex() {
    return 0;
  }
  onAwake() {
  }
  start() {
    this.onStart();
  }
  update(dt) {
    this.onUpdate(dt);
  }
  playerEnter(pid) {
    this.onPlayerEnter(pid);
  }
  onPlayerEnter(pid) {
  }
};

// JavaScripts/test/CreateModule/BuildingData.ts
var BuildingData_exports = {};
__export(BuildingData_exports, {
  BuildingData: () => BuildingData
});
var BuildingData = class extends Datacenter.PlayerSaveData {
  building = {
    infos: []
  };
  initData(dataSet) {
    if (!dataSet.infos) {
      this.building = {
        infos: []
      };
    } else {
      this.building = dataSet;
    }
  }
  clearMyData() {
    this.building = {
      infos: []
    };
  }
  get myData() {
    this.building.infos.forEach((info) => {
      info[1].forEach((v, index, array) => {
        array[index] = Math.floor(v);
      });
      info[2].forEach((v, index, array) => {
        array[index] = Math.floor(v);
      });
      info[3].forEach((v, index, array) => {
        array[index] = Math.floor(v);
      });
    });
    return this.building;
  }
  addBuilding(obj) {
    let sv = [
      obj.getSourceAssetGuid(),
      [obj.worldLocation.x, obj.worldLocation.y, obj.worldLocation.z],
      [obj.worldScale.x, obj.worldScale.y, obj.worldScale.z],
      [obj.worldRotation.x, obj.worldRotation.y, obj.worldRotation.z]
    ];
    this.building.infos.push(sv);
  }
};

// JavaScripts/test/CreateModule/CreateModule.ts
var CreateModule = class extends NetModuleBase {
  tempInfo = null;
  curSwitchID = -1;
  locPlayer = null;
  onStart() {
    if (this.isServer) {
      console.log("\u670D\u52A1\u5668\u521D\u59CB\u5316");
    } else {
      console.log("\u5BA2\u6237\u7AEF\u521D\u59CB\u5316");
      this.locPlayer = Gameplay.getCurrentPlayer().character;
      this.tempInfo = [
        { ty: 21588, tempObj: Core.GameObject.spawnGameObject("21588") },
        { ty: 21586, tempObj: Core.GameObject.spawnGameObject("21586") },
        { ty: 21592, tempObj: Core.GameObject.spawnGameObject("21592") }
      ];
    }
  }
  onPlayerEnter(pid) {
    Datacenter.server.getPlayerData(pid, BuildingData).then((dt) => {
      if (dt) {
        for (let info of dt.myData.infos) {
          let o = Core.GameObject.spawnGameObject(info[0]);
          o.worldLocation = new Type.Vector(...info[1]);
          o.worldScale = new Type.Vector(...info[2]);
          o.worldRotation = new Type.Rotation(info[3][0], info[3][1], info[3][2]);
        }
      }
    });
  }
  onUpdate(dt) {
    if (!this.isServer) {
      let info = this.tempInfo[this.curSwitchID];
      if (info && info.tempObj) {
        info.tempObj.worldLocation = this.locPlayer.worldLocation.add(this.locPlayer.forwardVector.multiply(100));
      }
    }
  }
  setObject() {
    let info = this.tempInfo[this.curSwitchID];
    if (!info || !info.tempObj) {
      return;
    }
    let tempObject = info.tempObj;
    if (tempObject) {
      const pos = tempObject.worldLocation;
      const scale = tempObject.worldScale;
      const rot = tempObject.worldRotation;
      let guid = info.ty.toString();
      let posN = [pos.x, pos.y, pos.z];
      let sizeN = [scale.x, scale.y, scale.z];
      let rotN = [rot.x, rot.y, rot.z];
      NetManager.sendNet(1, [guid, posN, sizeN, rotN]);
    }
  }
  switchObj(ty) {
    if (ty != this.curSwitchID && this.curSwitchID >= 0) {
      if (this.tempInfo[this.curSwitchID].tempObj) {
        this.tempInfo[this.curSwitchID].tempObj.setVisibility(Type.PropertyStatus.Off);
      }
    }
    this.curSwitchID = ty;
    if (!this.tempInfo[this.curSwitchID].tempObj) {
      this.tempInfo[this.curSwitchID].tempObj = Core.GameObject.spawnGameObject(this.tempInfo[this.curSwitchID].ty.toString());
    }
    this.tempInfo[this.curSwitchID].tempObj.setVisibility(Type.PropertyStatus.On);
  }
  onPlayerSetObj(pid, guid, pos, size, rot) {
    console.log("\u73A9\u5BB6 " + pid + " \u653E\u7F6E\u4E86\u4E00\u4E2A " + guid);
    let obj = Core.GameObject.spawnGameObject(guid);
    obj.worldLocation = new Type.Vector(...pos);
    obj.worldScale = new Type.Vector(...size);
    obj.worldRotation = new Type.Rotation(rot[0], rot[1], rot[2]);
    Datacenter.server.getPlayerData(pid, BuildingData).then((dt) => {
      if (dt) {
        dt.addBuilding(obj);
        dt.save();
      }
    });
  }
};
__decorateClass([
  NetManager.netFlagFunc(1)
], CreateModule.prototype, "onPlayerSetObj", 1);
CreateModule = __decorateClass([
  NetManager.netFlagClass
], CreateModule);

// JavaScripts/ui-generate/NewUI_generate.ts
var NewUI_generate_exports = {};
__export(NewUI_generate_exports, {
  default: () => NewUI_Generate
});
var NewUI_Generate = class extends UI.UIBehaviour {
  btn_cube = void 0;
  btn_cone = void 0;
  btn_sphere = void 0;
  btn_Set = void 0;
  btn_jump = void 0;
  onAwake() {
    this.btn_cube.onClicked.add(() => {
    });
    this.btn_cone.onClicked.add(() => {
    });
    this.btn_sphere.onClicked.add(() => {
    });
    this.btn_Set.onClicked.add(() => {
    });
  }
};
__decorateClass([
  UI.UIMarkPath("RootCanvas/btn_cube")
], NewUI_Generate.prototype, "btn_cube", 2);
__decorateClass([
  UI.UIMarkPath("RootCanvas/btn_cone")
], NewUI_Generate.prototype, "btn_cone", 2);
__decorateClass([
  UI.UIMarkPath("RootCanvas/btn_sphere")
], NewUI_Generate.prototype, "btn_sphere", 2);
__decorateClass([
  UI.UIMarkPath("RootCanvas/btn_Set")
], NewUI_Generate.prototype, "btn_Set", 2);
__decorateClass([
  UI.UIMarkPath("RootCanvas/btn_jump")
], NewUI_Generate.prototype, "btn_jump", 2);
NewUI_Generate = __decorateClass([
  UI.UICallOnly("UI/NewUI.ui")
], NewUI_Generate);

// JavaScripts/NewUI.ts
var NewUI = class extends NewUI_Generate {
  onStart() {
    this.canUpdate = false;
    this.layer = Extension.UILayerMiddle;
    this.btn_Set.onClicked.add(() => {
      NetManager.getModule(CreateModule).setObject();
    });
    this.btn_cube.onClicked.add(() => {
      NetManager.getModule(CreateModule).switchObj(0);
    });
    this.btn_cone.onClicked.add(() => {
      NetManager.getModule(CreateModule).switchObj(1);
    });
    this.btn_sphere.onClicked.add(() => {
      NetManager.getModule(CreateModule).switchObj(2);
    });
    this.btn_jump.onClicked.add(() => {
      Gameplay.getCurrentPlayer().character.jump();
    });
  }
  onAdded() {
  }
  onRemoved() {
  }
  onDestroy() {
  }
};

// JavaScripts/HYMGame.ts
var HYMGame = class extends Core.Script {
  preloadAssets = "21586,21588,21592,23775";
  async onStart() {
    await Datacenter.init(false, BuildingData);
    NetManager.initNetMgr();
    this.UIinit();
    this.useUpdate = true;
  }
  onUpdate(dt) {
    NetManager.update();
  }
  onDestroy() {
  }
  UIinit() {
    if (Util.SystemUtil.isClient()) {
      Extension.UIManager.getInstance(Extension.UIManager);
      Extension.UIManager.instance.show(NewUI);
    }
  }
};
__decorateClass([
  Core.Property()
], HYMGame.prototype, "preloadAssets", 2);
HYMGame = __decorateClass([
  Core.Class
], HYMGame);

// JavaScripts/NewScript.ts
var NewScript_exports = {};
__export(NewScript_exports, {
  default: () => NewScript
});
var NewScript = class extends Core.Script {
  onStart() {
  }
  onUpdate(dt) {
  }
  onDestroy() {
  }
};
NewScript = __decorateClass([
  Core.Class
], NewScript);

// JavaScripts/test/test.ts
var test_exports = {};
__export(test_exports, {
  default: () => test
});
var test = class extends Core.Script {
  preloadAssets = "21586,21588,21592,23775";
  onStart() {
    Core.GameObject.spawnGameObject("21586");
  }
  onUpdate(dt) {
  }
  onDestroy() {
  }
};
__decorateClass([
  Core.Property()
], test.prototype, "preloadAssets", 2);
test = __decorateClass([
  Core.Class
], test);

// build.ts
var foreign7 = __toESM(require_Backpack());
var foreign8 = __toESM(require_BackpackModule());

// JavaScripts/TQ/CommonLogic/RankLogic.ts
var RankLogic_exports = {};
__export(RankLogic_exports, {
  RankLogic: () => RankLogic
});
var EVENT_RANK_REP = "EVENT_RANK_REP";
var EVENT_RANK_REQ = "EVENT_RANK_REQ";
var RankLogic = class {
  C2S = true;
  infoTypeName = null;
  sortBasis = [];
  constructor(infoName, isC2S = true) {
    this.infoTypeName = infoName.name;
    this.C2S = isC2S;
    this.clientInit();
    this.serverInit();
  }
  uiAct = null;
  dataAct = null;
  clientInit() {
    let eventFunc = this.C2S ? Events.addServerListener : Events.addLocalListener;
    eventFunc(`${EVENT_RANK_REP}_${this.infoTypeName}`, (infos) => {
      if (this.uiAct) {
        if (this.sortBasis.length > 0) {
          infos.sort((a, b) => {
            for (let i = 0; i < this.sortBasis.length; i++) {
              const isUp = this.sortBasis[i][2];
              const ka = this.sortBasis[i][0];
              const kb = this.sortBasis[i][0];
              if (a[ka] == null || a[ka] == void 0 || b[kb] == null || b[kb] == void 0) {
                continue;
              }
              if (a[ka] == b[kb]) {
                continue;
              }
              let [na, nb] = [Number(a[ka]), Number(b[kb])];
              if (Number.isNaN(na) || Number.isNaN(nb)) {
                continue;
              }
              return isUp ? nb - na : na - nb;
            }
            return 0;
          });
        }
        this.uiAct(infos);
      }
    });
  }
  serverInit() {
    if (this.C2S) {
      Events.addClientListener(`${EVENT_RANK_REQ}_${this.infoTypeName}`, (player) => {
        this.sendRank(player);
      });
    } else {
      Events.addLocalListener(`${EVENT_RANK_REQ}_${this.infoTypeName}`, () => {
        let data = this.dataAct ? this.dataAct() : [];
        Events.dispatchLocal(`${EVENT_RANK_REP}_${this.infoTypeName}`, data);
      });
    }
  }
  requestRank() {
    if (Util.SystemUtil.isClient()) {
      if (this.C2S) {
        Events.dispatchToServer(`${EVENT_RANK_REQ}_${this.infoTypeName}`);
      } else {
        Events.dispatchLocal(`${EVENT_RANK_REQ}_${this.infoTypeName}`);
      }
    }
  }
  sendRank(pid, data) {
    if (!data) {
      data = this.dataAct ? this.dataAct() : [];
    }
    if (data.length <= 0) {
      return;
    }
    if (this.C2S && Util.SystemUtil.isServer()) {
      let p = pid instanceof Gameplay.Player ? pid : Gameplay.getPlayer(pid);
      Events.dispatchToClient(p, `${EVENT_RANK_REP}_${this.infoTypeName}`, data);
    } else {
      Events.dispatchLocal(`${EVENT_RANK_REP}_${this.infoTypeName}`, data);
    }
  }
  sendAllRank(data) {
    if (!this.C2S || Util.SystemUtil.isClient()) {
      return;
    }
    if (!data) {
      data = this.dataAct ? this.dataAct() : [];
    }
    Gameplay.getAllPlayers().forEach((p) => {
      Events.dispatchToClient(p, `${EVENT_RANK_REP}_${this.infoTypeName}`, data);
    });
  }
  setClientAction(action) {
    this.uiAct = action;
  }
  setCreateData(action) {
    this.dataAct = action;
  }
  setSortBasis(...basis) {
    this.sortBasis.length = 0;
    basis.sort((a, b) => {
      return b[1] - a[1];
    });
    this.sortBasis.push(...basis);
  }
};

// JavaScripts/TQ/CommonLogic/RewardModule.ts
var RewardModule_exports = {};
__export(RewardModule_exports, {
  rewardLogic: () => rewardLogic
});
var rewardLogic;
((rewardLogic2) => {
  const EVENT_RECEIVE_REWARD = "EVENT_RECEIVE_REWARD";
  let getLog = false;
  let actions_C = /* @__PURE__ */ new Map();
  let actions_S = /* @__PURE__ */ new Map();
  function setReceiveFunc(cmd, act) {
    let map = Util.SystemUtil.isClient() ? actions_C : actions_S;
    if (!map.has(cmd)) {
      map.set(cmd, []);
    }
    map.get(cmd).push(act);
  }
  rewardLogic2.setReceiveFunc = setReceiveFunc;
  function initRewardAct(log = false) {
    if (Util.SystemUtil.isClient()) {
      Events.addServerListener(EVENT_RECEIVE_REWARD, doRewardAction);
    }
    getLog = log;
  }
  rewardLogic2.initRewardAct = initRewardAct;
  function sendReward(pid, cmd, ...items) {
    if (Util.SystemUtil.isClient()) {
      return;
    }
    doRewardAction(pid, cmd, items);
    Events.dispatchToClient(Gameplay.getPlayer(pid), EVENT_RECEIVE_REWARD, pid, cmd, items);
  }
  rewardLogic2.sendReward = sendReward;
  function doRewardAction(pid, ty, rws) {
    if (getLog) {
      console.log(`
${pid} \u6536\u5230\u5956\u52B1\u7C7B\u578B ${ty} :
 ${JSON.stringify(rws)}`);
    }
    let map = Util.SystemUtil.isClient() ? actions_C : actions_S;
    if (map.has(ty)) {
      map.get(ty).forEach((act) => {
        act(pid, rws);
      });
    }
  }
})(rewardLogic || (rewardLogic = {}));

// build.ts
var foreign11 = __toESM(require_ArrayExtFunc());

// JavaScripts/TQ/Tools/EventTools.ts
var EventTools_exports = {};
__export(EventTools_exports, {
  EventTools: () => EventTools
});
var EventTools;
((EventTools2) => {
  let ECallerLoc;
  ((ECallerLoc2) => {
    ECallerLoc2[ECallerLoc2["local"] = 0] = "local";
    ECallerLoc2[ECallerLoc2["server"] = 1] = "server";
    ECallerLoc2[ECallerLoc2["client"] = 2] = "client";
  })(ECallerLoc = EventTools2.ECallerLoc || (EventTools2.ECallerLoc = {}));
  const locEvemtMap = /* @__PURE__ */ new Map();
  const serverEvemtMap = /* @__PURE__ */ new Map();
  const clientEvemtMap = /* @__PURE__ */ new Map();
  const noThisObj = /* @__PURE__ */ new Map();
  function setEvent(eventName, space = 0 /* local */, thisObj) {
    return function (target, propertyRey, description) {
      if (description.value && typeof description.value === "function") {
        let m = null;
        switch (space) {
          case 0 /* local */:
            m = locEvemtMap;
            break;
          case 1 /* server */:
            m = serverEvemtMap;
            break;
          case 2 /* client */:
            m = clientEvemtMap;
            break;
        }
        if (!m.has(eventName)) {
          m.set(eventName, []);
        }
        let info = [thisObj, description.value, space];
        m.get(eventName).push(info);
      }
    };
  }
  EventTools2.setEvent = setEvent;
  function setNoTargetEvent(eventName, target) {
    noThisObj.set(eventName, target ? target : {});
  }
  EventTools2.setNoTargetEvent = setNoTargetEvent;
  function callEvent(eventName, ...args) {
    callEvents(locEvemtMap.get(eventName), eventName, ...args);
    let csMap = Util.SystemUtil.isServer() ? serverEvemtMap.get(eventName) : clientEvemtMap.get(eventName);
    callEvents(csMap, eventName, ...args);
    if (Util.SystemUtil.isServer()) {
      if (clientEvemtMap.has(eventName)) {
        Events.dispatchToAllClient(EVENT_CALLCLIENT, eventName, ...args);
      }
    }
    if (Util.SystemUtil.isClient()) {
      if (serverEvemtMap.has(eventName)) {
        Events.dispatchToServer(EVENT_CALLSERVER, eventName, ...args);
      }
    }
  }
  EventTools2.callEvent = callEvent;
  function callEvents(eInfo, eventName, ...args) {
    if (eInfo) {
      for (const eventAvt of eInfo) {
        try {
          if (!eventAvt[0]) {
            let nullObj = noThisObj.has(eventName) ? noThisObj.get(eventName) : {};
            eventAvt[1].call(nullObj, ...args);
          } else {
            if (typeof eventAvt[0] === "function") {
              eventAvt[1].call(eventAvt[0](), ...args);
            } else {
              eventAvt[1].call(eventAvt[0], ...args);
            }
          }
        } catch (error) {
          console.error("eventTool error:", error.stack);
        }
      }
    }
  }
  const EVENT_CALLSERVER = "SUPER_EVENTTOOL_CALLSERVER";
  const EVENT_CALLCLIENT = "SUPER_EVENTTOOL_CALLCLIENT";
  function initEventRPC() {
    if (Util.SystemUtil.isServer()) {
      Events.addClientListener(EVENT_CALLSERVER, clientToServerCallEvent);
    }
    if (Util.SystemUtil.isClient()) {
      Events.addServerListener(EVENT_CALLCLIENT, serverToClientCallEvent);
    }
  }
  EventTools2.initEventRPC = initEventRPC;
  function clientToServerCallEvent(player, ...args) {
    const [eventName, params] = [args[0], args.slice(1)];
    callEvents(serverEvemtMap.get(eventName), eventName, ...params);
  }
  function serverToClientCallEvent(...args) {
    const [eventName, params] = [args[0], args.slice(1)];
    callEvents(clientEvemtMap.get(eventName), eventName, ...params);
  }
})(EventTools || (EventTools = {}));

// JavaScripts/TQ/Tools/ExtensionType.ts
var ExtensionType_exports = {};
__export(ExtensionType_exports, {
  Action: () => Action,
  Action1: () => Action1,
  Action2: () => Action2,
  Action3: () => Action3,
  StringUtil: () => StringUtil,
  TabGroup: () => TabGroup,
  UICreate: () => UICreate,
  UIHide: () => UIHide,
  UIIsShow: () => UIIsShow,
  UIMgr: () => UIMgr,
  UIMiddleShow: () => UIMiddleShow,
  UITopShow: () => UITopShow,
  findChildByPath: () => findChildByPath,
  getCanvasChildren: () => getCanvasChildren,
  widgetToUIElement: () => widgetToUIElement
});
var Action = class extends Extension.FunctionUtil.Action {
};
var Action1 = class extends Extension.FunctionUtil.Action1 {
};
var Action2 = class extends Extension.FunctionUtil.Action2 {
};
var Action3 = class extends Extension.FunctionUtil.Action3 {
};
var StringUtil = class extends Extension.StringUtil {
};
var UIMgr = Extension.UIManager.instance;
function UIMiddleShow(UIObj, ...params) {
  console.log("\u6253\u5F00UI\u5230\u4E2D\u5C42:" + UIObj.constructor.name);
  return UIMgr.showUI(UIObj, Extension.UILayerMiddle, ...params);
}
function UITopShow(UIObj, ...params) {
  console.log("\u6253\u5F00UI\u5230\u9876\u5C42:" + UIObj.constructor.name);
  return UIMgr.showUI(UIObj, Extension.UILayerTop, ...params);
}
function UICreate(PanelClass, parent) {
  let ui = UIMgr.create(PanelClass);
  if (parent) {
    parent.addChild(ui.uiObject);
  }
  return ui;
}
function UIIsShow(UIObj) {
  return UIMgr.isShow(UIObj);
}
function UIHide(UIObj) {
  UIMgr.hideUI(UIObj);
}
var TabGroup = class {
  tabArr;
  selectCallBack;
  selectChecker;
  tabStyleHandle;
  _currentIndex = -1;
  constructor(tabArr) {
    this.tabArr = tabArr;
  }
  init(tabStyleHandle, selectCallBack, thisArg, defaultIndex = 0) {
    this.tabStyleHandle = tabStyleHandle.bind(thisArg);
    this.selectCallBack = selectCallBack.bind(thisArg);
    for (let i = 0; i < this.tabArr.length; i++) {
      this.tabArr[i].onClicked.add(() => {
        this.select(i);
      });
    }
    this.select(defaultIndex);
  }
  setSelectChecker(selectChecker, thisArg) {
    this.selectChecker = selectChecker.bind(thisArg);
  }
  select(index, ignoreSame = true) {
    if (ignoreSame && this._currentIndex == index)
      return;
    if (this.selectChecker != null && !this.selectChecker(index)) {
      return false;
    }
    this._currentIndex = index;
    this.refreshTabs();
    this.selectCallBack(index);
    return true;
  }
  get currentIndex() {
    return this._currentIndex;
  }
  refreshTabs() {
    for (let i = 0; i < this.tabArr.length; i++) {
      this.tabStyleHandle(this.tabArr[i], i == this.currentIndex);
    }
  }
};
function findChildByPath(canvas, ChildType, path) {
  let child = canvas.findChildByPath(path);
  if (child == null) {
    console.error("CanvasController: The child was not found!  path=" + path);
    return null;
  }
  let widget = child;
  if (ChildType.name == UI.Button.name || ChildType.name == UI.Button.name) {
    widget.setFocusable(false);
    widget.setTouchMethod(UI.ButtonTouchMethod.PreciseTap);
  }
  return widget;
}
function getCanvasChildren(canvas, ObjClass) {
  let arr = [];
  if (canvas == null)
    return arr;
  let childNum = canvas.getChildrenCount();
  for (let i = 0; i < childNum; i++) {
    let child = canvas.getChildAt(i);
    let obj = widgetToUIElement(ObjClass, child);
    if (obj != null) {
      arr.push(obj);
    }
  }
  return arr;
}
function widgetToUIElement(EleClass, widget) {
  if (!(widget instanceof EleClass)) {
    return null;
  }
  let element = widget;
  if (element == null || !(widget instanceof EleClass))
    return null;
  if (element instanceof UI.Button) {
    let btn = element;
    btn.focusable = false;
    btn.touchMethod = UI.ButtonTouchMethod.PreciseTap;
    if (btn.visibility == UI.SlateVisibility.HitTestInvisible || btn.visibility == UI.SlateVisibility.SelfHitTestInvisible) {
      btn.visibility = UI.SlateVisibility.Visible;
    }
  }
  return element;
}

// JavaScripts/TQ/Tools/ObjectMaterial.ts
var ObjectMaterial_exports = {};
__export(ObjectMaterial_exports, {
  SceneObjectSync: () => SceneObjectSync
});
var _SceneObjectSync = class {
  static get instance() {
    if (!_SceneObjectSync._ins) {
      _SceneObjectSync._ins = new _SceneObjectSync();
    }
    return _SceneObjectSync._ins;
  }
  EventSyncObjects = "EventSyncObjects";
  _showTask = null;
  _showFuncs = null;
  _serverObjs = null;
  _sendTask = null;
  _attrEqualFuncs = null;
  _sendLength = 35;
  init() {
    if (Util.SystemUtil.isClient()) {
      this._showTask = [];
      this._showFuncs = /* @__PURE__ */ new Map();
      Events.addServerListener(this.EventSyncObjects, this.onSyncObject.bind(this));
    } else {
      this._serverObjs = /* @__PURE__ */ new Map();
      this._sendTask = /* @__PURE__ */ new Map();
      this._attrEqualFuncs = /* @__PURE__ */ new Map();
      Events.addPlayerLeftListener((p) => {
        this._sendTask.delete(p.getPlayerID());
      });
    }
  }
  setSyncMethod(type, func) {
    this._showFuncs.set(type, func);
  }
  onSyncObject(infos) {
    this._showTask.push(...infos);
  }
  update(dt) {
    if (Util.SystemUtil.isClient()) {
      this.clientUpdate(dt);
    } else {
      this.serverUpdate(dt);
    }
  }
  clientUpdate(dt) {
    if (this._showTask.length > 0) {
      const task = this._showTask.shift();
      for (const k in task.myInfo) {
        let doType = Number(k);
        if (this._showFuncs.get(doType)) {
          this._showFuncs.get(doType)(task);
        }
      }
    }
  }
  serverUpdate(dt) {
    if (this._sendTask.size <= 0) {
      return;
    }
    for (let [pid, v] of this._sendTask) {
      if (v.size <= 0) {
        this._sendTask.delete(pid);
      } else {
        let netPks = [];
        for (let [uuid, info] of this._sendTask.get(pid)) {
          if (netPks.length >= this._sendLength) {
            break;
          }
          netPks.push(info);
          this._sendTask.get(pid).delete(uuid);
        }
        let player = Gameplay.getPlayer(pid);
        if (player) {
          Events.dispatchToClient(player, this.EventSyncObjects, netPks);
        }
      }
    }
  }
  askClientSync(uuid, infos, pid) {
    if (Util.SystemUtil.isClient()) {
      return;
    }
    if (!this._serverObjs.has(uuid)) {
      let serverData = {
        uuid,
        myInfo: {}
      };
      this._serverObjs.set(uuid, serverData);
    }
    let netPackage = this._serverObjs.get(uuid);
    let haveChange = false;
    for (const k in infos) {
      if (!netPackage.myInfo[k]) {
        netPackage.myInfo[k] = infos[k];
        haveChange = true;
        continue;
      }
      let kNum = Number(k);
      if (this._attrEqualFuncs.get(kNum)) {
        if (!this._attrEqualFuncs.get(kNum)(netPackage.myInfo[k], infos[k])) {
          netPackage.myInfo[k] = infos[k];
          haveChange = true;
        }
      } else {
        if (netPackage.myInfo[k] != infos[k]) {
          netPackage.myInfo[k] = infos[k];
          haveChange = true;
        }
      }
    }
    if (!haveChange) {
      return;
    }
    if (pid) {
      if (!this._sendTask.get(pid)) {
        this._sendTask.set(pid, /* @__PURE__ */ new Map());
      }
      this._sendTask.get(pid).set(netPackage.uuid, netPackage);
    } else {
      let ps = Gameplay.getAllPlayers();
      for (let p of ps) {
        if (p) {
          let _pid = p.getPlayerID();
          if (!this._sendTask.get(_pid)) {
            this._sendTask.set(_pid, /* @__PURE__ */ new Map());
          }
          this._sendTask.get(_pid).set(netPackage.uuid, netPackage);
        }
      }
    }
  }
  setEqualFunc(type, func) {
    this._attrEqualFuncs.set(type, func);
  }
  async askToAllServerObj(pid) {
    if (Util.SystemUtil.isClient()) {
      return;
    }
    let player = Gameplay.getPlayer(pid);
    if (!player) {
      return;
    }
    if (!this._sendTask.get(pid)) {
      this._sendTask.set(pid, /* @__PURE__ */ new Map());
    }
    for (let [k, v] of this._serverObjs) {
      this._sendTask.get(pid).set(k, v);
    }
  }
};
var SceneObjectSync = _SceneObjectSync;
__publicField(SceneObjectSync, "_ins", null);

// JavaScripts/TQ/Tools/StateMachine.ts
var StateMachine_exports = {};
__export(StateMachine_exports, {
  StateMachine: () => StateMachine
});
var StateFunc = class {
  enter;
  update;
  exit;
};
var StateMachine = class {
  _states;
  currentState;
  constructor() {
    this._states = /* @__PURE__ */ new Map();
  }
  register(state, func) {
    this._states.set(state, func);
  }
  registerEnter(state, enter) {
    let has = this._states.has(state);
    if (has) {
      let func = this._states.get(state);
      func.enter = enter;
    } else {
      let func = new StateFunc();
      func.enter = enter;
      this._states.set(state, func);
    }
  }
  registerUpdate(state, update) {
    let has = this._states.has(state);
    if (has) {
      let func = this._states.get(state);
      func.update = update;
    } else {
      let func = new StateFunc();
      func.update = update;
      this._states.set(state, func);
    }
  }
  registerExit(state, exit) {
    let has = this._states.has(state);
    if (has) {
      let func = this._states.get(state);
      func.exit = exit;
    } else {
      let func = new StateFunc();
      func.exit = exit;
      this._states.set(state, func);
    }
  }
  update(dt) {
    if (this.currentState) {
      let func = this._states.get(this.currentState);
      func.update && func.update(dt);
    }
  }
  switch(state, data) {
    if (!this._states.has(state)) {
      return;
    }
    if (this.currentState) {
      let func2 = this._states.get(this.currentState);
      func2.exit && func2.exit();
    }
    this.currentState = state;
    let func = this._states.get(state);
    func.enter && func.enter(data);
  }
  destroy() {
    this._states.clear();
  }
  getState() {
    return this.currentState;
  }
};

// JavaScripts/TQ/Tools/Tools.ts
var Tools_exports = {};
__export(Tools_exports, {
  Tools: () => Tools
});
var Tools = class {
  static sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  static FormatString(text, ...args) {
    return text.replace(/\{(\d+)\}/g, (text2, index, ...parms) => {
      if (args[index] === 0)
        return 0;
      return args[index] || "undefined";
    });
  }
  static Seconds2Hour(second) {
    let minutes = second % 3600;
    let h = Math.floor(second / 3600);
    let m = Math.floor(minutes / 60);
    let s = minutes % 60;
    return [h, m, s];
  }
  static RoundNumber(value, min, max) {
    if (value > max)
      return max;
    if (value < min)
      return min;
    return value;
  }
  static NumLerp(n1, n2, lerp) {
    return n1 + (n2 - n1) * lerp;
  }
  static LerpVector(v1, v2, lerp) {
    if (lerp > 1) {
      lerp = 1;
    }
    if (lerp < 0) {
      lerp = 0;
    }
    let result = new Type.Vector(0, 0, 0);
    result.x = this.NumLerp(v1.x, v2.x, lerp);
    result.y = this.NumLerp(v1.y, v2.y, lerp);
    result.z = this.NumLerp(v1.z, v2.z, lerp);
    return result;
  }
  static Distance(from, to, isPlane = false) {
    let x1 = from.x;
    let y1 = from.y;
    let z1 = from.z;
    let x2 = to.x;
    let y2 = to.y;
    let z2 = to.z;
    let distance;
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
  static DistancePow(from, to, isPlane = false) {
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
  static CheckRect(p1, p2, checkDis, isPlane = false) {
    if (Math.abs(p1.x - p2.x) > checkDis) {
      return false;
    }
    if (Math.abs(p1.y - p2.y) > checkDis) {
      return false;
    }
    if (!isPlane) {
      if (Math.abs(p1.z - p2.z) > checkDis) {
        return false;
      }
    }
    return true;
  }
  static RandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  static RandomeInt(min, max) {
    return Math.floor(Tools.RandomFloat(min, max));
  }
  static async asyncFind(guid, wait = 1e4) {
    if (!guid) {
      return null;
    }
    let ret = Core.GameObject.find(guid);
    let t = Math.max(100, wait);
    while (!ret && t > 0) {
      t -= 100;
      await Tools.sleep(100);
      ret = Core.GameObject.find(guid);
    }
    return ret;
  }
  static DumpObject(object, showFunc = false, deep = 5) {
    if (object == null || object == void 0) {
      if (typeof object == "object") {
        return "null";
      }
      return String(object);
    }
    if (typeof object != "object") {
      return String(object);
    }
    deep = Math.min(5, deep);
    let spaceLength = Math.abs(deep - 5) * 2;
    let space = "";
    for (let i = 0; i < spaceLength; i++) {
      space += " ";
    }
    let result = "\n" + space + "{";
    if (object instanceof Map) {
      result += "\n" + space;
      if (deep <= 0) {
        result += `(Map):${object}`;
      } else {
        result += "(Map):";
        for (let key of object.keys()) {
          result += "\n" + space + ` [${key}]:${Tools.DumpObject(object.get(key), showFunc, deep - 1)}`;
        }
      }
    } else {
      for (let k in object) {
        if (object[k] instanceof Map) {
          result += "\n" + space;
          if (deep <= 0) {
            result += `${k}(Map):${object[k]}`;
          } else {
            result += k + "(Map):";
            for (let key of object[k].keys()) {
              result += "\n" + space + ` [${key}]:${Tools.DumpObject(object[k].get(key), showFunc, deep - 1)}`;
            }
          }
        } else if (typeof object[k] == "object") {
          result += "\n" + space;
          if (deep <= 0) {
            result += `${k}:${object[k]}`;
          } else {
            result += `${k}:${Tools.DumpObject(object[k], showFunc, deep - 1)}`;
          }
        } else if (typeof object[k] == "function") {
          if (showFunc) {
            result += "\n" + space;
            result += `${k}:function`;
          } else {
            continue;
          }
        } else {
          result += "\n" + space;
          result += `${k}:${object[k]}`;
        }
      }
    }
    result += "\n" + space + "}";
    return result;
  }
  static createTriggerToGameObject(gameObject, useSelf = true, sync = false) {
    let trigger = null;
    if (gameObject instanceof Gameplay.Trigger && useSelf) {
      trigger = gameObject;
    } else {
      trigger = Core.GameObject.spawnGameObject("113", sync);
      trigger.name = gameObject.name + "_Trigger";
      trigger.worldScale = gameObject.worldScale.multiply(1.2);
      trigger.attachToGameObject(gameObject);
      trigger.setRelativeLocation(new Type.Vector(0, 0, 50));
      trigger.setRelativeRotation(Type.Rotation.zero);
    }
    return trigger;
  }
  static getAllChild(parent, deep = 5, property = null) {
    if (parent.getChildren().length <= 0 || deep <= 0) {
      return null;
    } else {
      let result = [];
      for (let c of parent.getChildren()) {
        if (property) {
          result.push(c[property]);
        } else {
          result.push(c);
        }
        let cc = this.getAllChild(c, deep - 1, property);
        if (cc != null) {
          result = result.concat(cc);
        }
      }
      return result;
    }
  }
  static Bezier(points, lerp) {
    lerp = this.RoundNumber(lerp, 0, 1);
    if (points.length == 2) {
      return this.LerpVector(points[0], points[1], lerp);
    }
    let nextArray = [];
    for (let i = 0; i < points.length - 1; i++) {
      let pointA = points[i];
      let pointB = points[i + 1];
      let lerpPoint = this.LerpVector(pointA, pointB, lerp);
      nextArray.push(lerpPoint);
    }
    return this.Bezier(nextArray, lerp);
  }
  static getCirclePoints(center, radius, step) {
    let result = [];
    let z = center.z;
    let [x0, y0] = [center.x, center.y];
    for (let angle = 0; angle < 360; angle += step) {
      let radian = angle * 2 * (Math.PI / 360);
      let x = x0 + radius * Math.cos(radian);
      let y = y0 + radius * Math.sin(radian);
      result.push(new Type.Vector(x, y, z));
    }
    return result;
  }
};

// JavaScripts/TQ/TQGameStart.ts
var TQGameStart_exports = {};
__export(TQGameStart_exports, {
  TQGameStart: () => TQGameStart
});
var _TQGameStart = class extends Core.Script {
  static get instance() {
    return _TQGameStart._instance;
  }
  preloadAssets = "";
  _isOnline = false;
  _customUpdateAct = new Action1();
  async onStart() {
    if (!_TQGameStart._instance) {
      _TQGameStart._instance = this;
    }
    this.UIinit();
    await Datacenter.init(this._isOnline, ...this.getDataClass());
    NetManager.initNetMgr();
    this.useUpdate = true;
  }
  onUpdate(dt) {
    NetManager.update();
    this._customUpdateAct.call(dt);
  }
  onDestroy() {
  }
  UIinit() {
    if (Util.SystemUtil.isClient()) {
      Extension.UIManager.getInstance(Extension.UIManager);
      if (this.firstUI) {
        Extension.UIManager.instance.show(this.firstUI);
      }
    }
  }
  addCustomAct(act, thisArg) {
    this._customUpdateAct.add(act, thisArg);
  }
  removeCustomAct(act, thisArg) {
    this._customUpdateAct.remove(act, thisArg);
  }
};
var TQGameStart = _TQGameStart;
__publicField(TQGameStart, "_instance", null);
__decorateClass([
  Core.Property()
], TQGameStart.prototype, "preloadAssets", 2);
__decorateClass([
  Core.Property()
], TQGameStart.prototype, "_isOnline", 2);

// JavaScripts/TQ/ui/BulletChatUI.ts
var BulletChatUI_exports = {};
__export(BulletChatUI_exports, {
  BulletChatUI: () => BulletChatUI
});
var BulletChatUI;
((BulletChatUI2) => {
  const Event_serverCallClientBullet = "Event_serverCallClientBullet";
  let bindNet = false;
  let rootCanvas = null;
  const msgTexts = [];
  let axisMin = 0;
  let axisMax = 500;
  function init(min, max, canvas) {
    if (!min || Number.isNaN(min)) {
      axisMin = 0;
    } else {
      axisMin = Math.min(min, max);
    }
    if (!max || Number.isNaN(max)) {
      axisMax = 500;
    } else {
      axisMax = Math.max(min, max);
    }
    rootCanvas = canvas;
    if (Util.SystemUtil.isClient() && !bindNet) {
      bindNet = true;
      Events.addServerListener(Event_serverCallClientBullet, (msg, time, color) => {
        createBulletChat(msg, time, color);
      });
    }
  }
  BulletChatUI2.init = init;
  function createBulletChat(msg, time = 1e4, color = Type.LinearColor.white) {
    if (Util.SystemUtil.isServer()) {
      Events.dispatchToAllClient(Event_serverCallClientBullet, msg, time, color);
      return;
    }
    if (!rootCanvas || !msg || !msg["toString"]) {
      return;
    }
    msg = msg.toString();
    if (msg.length <= 0) {
      return;
    }
    time = Number.isNaN(time) ? 2e3 : time;
    let bc = getNewBc(msg);
    bc.txt.fontColor = color;
    bc.txt.outlineColor = Type.LinearColor.black;
    bc.txt.outlineSize = 1;
    let endpos = { x: bc.size.x * -1, y: bc.pos.y };
    const slot = bc.txt.slot;
    const changePos = new Type.Vector(0, 0);
    new TweenClass.Tween(bc.pos).to(endpos, time).onUpdate((pos) => {
      changePos.x = pos.x;
      changePos.y = pos.y;
      slot.position = changePos;
    }).onComplete(() => {
      bc.run = false;
    }).start();
  }
  BulletChatUI2.createBulletChat = createBulletChat;
  function getNewBc(msg) {
    msg = msg.toString();
    let bc = msgTexts.find((v) => {
      return !v.run;
    });
    if (!bc) {
      let ui = UI.TextBlock.newObject(rootCanvas, "msgUIObject");
      bc = {
        txt: ui,
        run: true,
        pos: { x: 1920, y: 0 },
        size: { x: 35, y: 100 }
      };
      msgTexts.push(bc);
      console.log("\u65B0\u5EFA\u5F39\u5E55\uFF0C\u76EE\u524D\u603B\u5F39\u5E55\u6570\uFF1A" + msgTexts.length);
    } else {
      bc.run = true;
    }
    bc.pos.x = rootCanvas.slot.size.x;
    bc.pos.y = Math.random() * (axisMax - axisMin) + axisMin;
    bc.size.x = 40 * msg.length;
    bc.txt.text = msg;
    bc.txt.slot.size = new Type.Vector2(bc.size.x, bc.size.y);
    return bc;
  }
  function update() {
    TweenClass.update();
  }
  BulletChatUI2.update = update;
  let TweenClass;
  ((TweenClass2) => {
    const Easing = {
      Linear: {
        None: function (amount) {
          return amount;
        }
      },
      Quadratic: {
        In: function (amount) {
          return amount * amount;
        },
        Out: function (amount) {
          return amount * (2 - amount);
        },
        InOut: function (amount) {
          if ((amount *= 2) < 1) {
            return 0.5 * amount * amount;
          }
          return -0.5 * (--amount * (amount - 2) - 1);
        }
      },
      Cubic: {
        In: function (amount) {
          return amount * amount * amount;
        },
        Out: function (amount) {
          return --amount * amount * amount + 1;
        },
        InOut: function (amount) {
          if ((amount *= 2) < 1) {
            return 0.5 * amount * amount * amount;
          }
          return 0.5 * ((amount -= 2) * amount * amount + 2);
        }
      },
      Quartic: {
        In: function (amount) {
          return amount * amount * amount * amount;
        },
        Out: function (amount) {
          return 1 - --amount * amount * amount * amount;
        },
        InOut: function (amount) {
          if ((amount *= 2) < 1) {
            return 0.5 * amount * amount * amount * amount;
          }
          return -0.5 * ((amount -= 2) * amount * amount * amount - 2);
        }
      },
      Quintic: {
        In: function (amount) {
          return amount * amount * amount * amount * amount;
        },
        Out: function (amount) {
          return --amount * amount * amount * amount * amount + 1;
        },
        InOut: function (amount) {
          if ((amount *= 2) < 1) {
            return 0.5 * amount * amount * amount * amount * amount;
          }
          return 0.5 * ((amount -= 2) * amount * amount * amount * amount + 2);
        }
      },
      Sinusoidal: {
        In: function (amount) {
          return 1 - Math.sin((1 - amount) * Math.PI / 2);
        },
        Out: function (amount) {
          return Math.sin(amount * Math.PI / 2);
        },
        InOut: function (amount) {
          return 0.5 * (1 - Math.sin(Math.PI * (0.5 - amount)));
        }
      },
      Exponential: {
        In: function (amount) {
          return amount === 0 ? 0 : Math.pow(1024, amount - 1);
        },
        Out: function (amount) {
          return amount === 1 ? 1 : 1 - Math.pow(2, -10 * amount);
        },
        InOut: function (amount) {
          if (amount === 0) {
            return 0;
          }
          if (amount === 1) {
            return 1;
          }
          if ((amount *= 2) < 1) {
            return 0.5 * Math.pow(1024, amount - 1);
          }
          return 0.5 * (-Math.pow(2, -10 * (amount - 1)) + 2);
        }
      },
      Circular: {
        In: function (amount) {
          return 1 - Math.sqrt(1 - amount * amount);
        },
        Out: function (amount) {
          return Math.sqrt(1 - --amount * amount);
        },
        InOut: function (amount) {
          if ((amount *= 2) < 1) {
            return -0.5 * (Math.sqrt(1 - amount * amount) - 1);
          }
          return 0.5 * (Math.sqrt(1 - (amount -= 2) * amount) + 1);
        }
      },
      Elastic: {
        In: function (amount) {
          if (amount === 0) {
            return 0;
          }
          if (amount === 1) {
            return 1;
          }
          return -Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
        },
        Out: function (amount) {
          if (amount === 0) {
            return 0;
          }
          if (amount === 1) {
            return 1;
          }
          return Math.pow(2, -10 * amount) * Math.sin((amount - 0.1) * 5 * Math.PI) + 1;
        },
        InOut: function (amount) {
          if (amount === 0) {
            return 0;
          }
          if (amount === 1) {
            return 1;
          }
          amount *= 2;
          if (amount < 1) {
            return -0.5 * Math.pow(2, 10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI);
          }
          return 0.5 * Math.pow(2, -10 * (amount - 1)) * Math.sin((amount - 1.1) * 5 * Math.PI) + 1;
        }
      },
      Back: {
        In: function (amount) {
          const s = 1.70158;
          return amount === 1 ? 1 : amount * amount * ((s + 1) * amount - s);
        },
        Out: function (amount) {
          const s = 1.70158;
          return amount === 0 ? 0 : --amount * amount * ((s + 1) * amount + s) + 1;
        },
        InOut: function (amount) {
          const s = 1.70158 * 1.525;
          if ((amount *= 2) < 1) {
            return 0.5 * (amount * amount * ((s + 1) * amount - s));
          }
          return 0.5 * ((amount -= 2) * amount * ((s + 1) * amount + s) + 2);
        }
      },
      Bounce: {
        In: function (amount) {
          return 1 - Easing.Bounce.Out(1 - amount);
        },
        Out: function (amount) {
          if (amount < 1 / 2.75) {
            return 7.5625 * amount * amount;
          } else if (amount < 2 / 2.75) {
            return 7.5625 * (amount -= 1.5 / 2.75) * amount + 0.75;
          } else if (amount < 2.5 / 2.75) {
            return 7.5625 * (amount -= 2.25 / 2.75) * amount + 0.9375;
          } else {
            return 7.5625 * (amount -= 2.625 / 2.75) * amount + 0.984375;
          }
        },
        InOut: function (amount) {
          if (amount < 0.5) {
            return Easing.Bounce.In(amount * 2) * 0.5;
          }
          return Easing.Bounce.Out(amount * 2 - 1) * 0.5 + 0.5;
        }
      },
      generatePow: function (power = 4) {
        power = power < Number.EPSILON ? Number.EPSILON : power;
        power = power > 1e4 ? 1e4 : power;
        return {
          In: function (amount) {
            return amount ** power;
          },
          Out: function (amount) {
            return 1 - (1 - amount) ** power;
          },
          InOut: function (amount) {
            if (amount < 0.5) {
              return (amount * 2) ** power / 2;
            }
            return (1 - (2 - amount * 2) ** power) / 2 + 0.5;
          }
        };
      }
    };
    const Interpolation = {
      Linear: function (v, k) {
        const m = v.length - 1;
        const f = m * k;
        const i = Math.floor(f);
        const fn = Interpolation.Utils.Linear;
        if (k < 0) {
          return fn(v[0], v[1], f);
        }
        if (k > 1) {
          return fn(v[m], v[m - 1], m - f);
        }
        return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);
      },
      Bezier: function (v, k) {
        let b = 0;
        const n = v.length - 1;
        const pw = Math.pow;
        const bn = Interpolation.Utils.Bernstein;
        for (let i = 0; i <= n; i++) {
          b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
        }
        return b;
      },
      CatmullRom: function (v, k) {
        const m = v.length - 1;
        let f = m * k;
        let i = Math.floor(f);
        const fn = Interpolation.Utils.CatmullRom;
        if (v[0] === v[m]) {
          if (k < 0) {
            i = Math.floor(f = m * (1 + k));
          }
          return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);
        } else {
          if (k < 0) {
            return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
          }
          if (k > 1) {
            return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
          }
          return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);
        }
      },
      Utils: {
        Linear: function (p0, p1, t) {
          return (p1 - p0) * t + p0;
        },
        Bernstein: function (n, i) {
          const fc = Interpolation.Utils.Factorial;
          return fc(n) / fc(i) / fc(n - i);
        },
        Factorial: function () {
          const a = [1];
          return function (n) {
            let s = 1;
            if (a[n]) {
              return a[n];
            }
            for (let i = n; i > 1; i--) {
              s *= i;
            }
            a[n] = s;
            return s;
          };
        }(),
        CatmullRom: function (p0, p1, p2, p3, t) {
          const v0 = (p2 - p0) * 0.5;
          const v1 = (p3 - p1) * 0.5;
          const t2 = t * t;
          const t3 = t * t2;
          return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
        }
      }
    };
    class Sequence {
      static _nextId = 0;
      static nextId() {
        return Sequence._nextId++;
      }
    }
    class Group {
      _tweens = {};
      _tweensAddedDuringUpdate = {};
      getAll() {
        return Object.keys(this._tweens).map((tweenId) => {
          return this._tweens[tweenId];
        });
      }
      removeAll() {
        this._tweens = {};
      }
      add(tween) {
        this._tweens[tween.getId()] = tween;
        this._tweensAddedDuringUpdate[tween.getId()] = tween;
      }
      remove(tween) {
        delete this._tweens[tween.getId()];
        delete this._tweensAddedDuringUpdate[tween.getId()];
      }
      update(time = now(), preserve = false) {
        let tweenIds = Object.keys(this._tweens);
        if (tweenIds.length === 0) {
          return false;
        }
        while (tweenIds.length > 0) {
          this._tweensAddedDuringUpdate = {};
          for (let i = 0; i < tweenIds.length; i++) {
            const tween = this._tweens[tweenIds[i]];
            const autoStart = !preserve;
            if (tween && tween.update(time, autoStart) === false && !preserve) {
              delete this._tweens[tweenIds[i]];
            }
          }
          tweenIds = Object.keys(this._tweensAddedDuringUpdate);
        }
        return true;
      }
    }
    const mainGroup = new Group();
    const now = function () {
      return Date.now();
    };
    class Tween {
      constructor(_object, _group = mainGroup) {
        this._object = _object;
        this._group = _group;
      }
      _isPaused = false;
      _pauseStart = 0;
      _valuesStart = {};
      _valuesEnd = {};
      _valuesStartRepeat = {};
      _duration = 1e3;
      _initialRepeat = 0;
      _repeat = 0;
      _repeatDelayTime;
      _yoyo = false;
      _isPlaying = false;
      _reversed = false;
      _delayTime = 0;
      _startTime = 0;
      _easingFunction = Easing.Linear.None;
      _interpolationFunction = Interpolation.Linear;
      _chainedTweens = [];
      _onStartCallback;
      _onStartCallbackFired = false;
      _onUpdateCallback;
      _onRepeatCallback;
      _onCompleteCallback;
      _onStopCallback;
      _id = Sequence.nextId();
      _isChainStopped = false;
      getId() {
        return this._id;
      }
      isPlaying() {
        return this._isPlaying;
      }
      isPaused() {
        return this._isPaused;
      }
      to(properties, duration) {
        this._valuesEnd = Object.create(properties);
        if (duration !== void 0) {
          this._duration = duration;
        }
        return this;
      }
      duration(d = 1e3) {
        this._duration = d;
        return this;
      }
      get object() {
        return this._object;
      }
      start(time = now()) {
        if (this._isPlaying) {
          return this;
        }
        this._group && this._group.add(this);
        this._repeat = this._initialRepeat;
        if (this._reversed) {
          this._reversed = false;
          for (const property in this._valuesStartRepeat) {
            this._swapEndStartRepeatValues(property);
            this._valuesStart[property] = this._valuesStartRepeat[property];
          }
        }
        this._isPlaying = true;
        this._isPaused = false;
        this._onStartCallbackFired = false;
        this._isChainStopped = false;
        this._startTime = time;
        this._startTime += this._delayTime;
        this._setupProperties(this._object, this._valuesStart, this._valuesEnd, this._valuesStartRepeat);
        return this;
      }
      _setupProperties(_object, _valuesStart, _valuesEnd, _valuesStartRepeat) {
        for (const property in _valuesEnd) {
          const startValue = _object[property];
          const startValueIsArray = Array.isArray(startValue);
          const propType = startValueIsArray ? "array" : typeof startValue;
          const isInterpolationList = !startValueIsArray && Array.isArray(_valuesEnd[property]);
          if (propType === "undefined" || propType === "function") {
            continue;
          }
          if (isInterpolationList) {
            let endValues = _valuesEnd[property];
            if (endValues.length === 0) {
              continue;
            }
            endValues = endValues.map(this._handleRelativeValue.bind(this, startValue));
            _valuesEnd[property] = [startValue].concat(endValues);
          }
          if ((propType === "object" || startValueIsArray) && startValue && !isInterpolationList) {
            _valuesStart[property] = startValueIsArray ? [] : {};
            for (const prop in startValue) {
              _valuesStart[property][prop] = startValue[prop];
            }
            _valuesStartRepeat[property] = startValueIsArray ? [] : {};
            this._setupProperties(startValue, _valuesStart[property], _valuesEnd[property], _valuesStartRepeat[property]);
          } else {
            if (typeof _valuesStart[property] === "undefined") {
              _valuesStart[property] = startValue;
            }
            if (!startValueIsArray) {
              _valuesStart[property] *= 1;
            }
            if (isInterpolationList) {
              _valuesStartRepeat[property] = _valuesEnd[property].slice().reverse();
            } else {
              _valuesStartRepeat[property] = _valuesStart[property] || 0;
            }
          }
        }
      }
      stop() {
        if (!this._isChainStopped) {
          this._isChainStopped = true;
          this.stopChainedTweens();
        }
        if (!this._isPlaying) {
          return this;
        }
        this._group && this._group.remove(this);
        this._isPlaying = false;
        this._isPaused = false;
        if (this._onStopCallback) {
          this._onStopCallback(this._object);
        }
        return this;
      }
      clear() {
        this.stop();
        this._valuesEnd = {};
        return this;
      }
      end() {
        this._goToEnd = true;
        this.update(Infinity);
        return this;
      }
      pause(time = now()) {
        if (this._isPaused || !this._isPlaying) {
          return this;
        }
        this._isPaused = true;
        this._pauseStart = time;
        this._group && this._group.remove(this);
        return this;
      }
      resume(time = now()) {
        if (!this._isPaused || !this._isPlaying) {
          return this;
        }
        this._isPaused = false;
        this._startTime += time - this._pauseStart;
        this._pauseStart = 0;
        this._group && this._group.add(this);
        return this;
      }
      stopChainedTweens() {
        for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
          this._chainedTweens[i].stop();
        }
        return this;
      }
      group(group = mainGroup) {
        this._group = group;
        return this;
      }
      delay(amount = 0) {
        this._delayTime = amount;
        return this;
      }
      repeat(times = 0) {
        this._initialRepeat = times;
        this._repeat = times;
        return this;
      }
      repeatDelay(amount) {
        this._repeatDelayTime = amount;
        return this;
      }
      yoyo(yoyo = false) {
        this._yoyo = yoyo;
        return this;
      }
      easing(easingFunction = Easing.Linear.None) {
        this._easingFunction = easingFunction;
        return this;
      }
      interpolation(interpolationFunction = Interpolation.Linear) {
        this._interpolationFunction = interpolationFunction;
        return this;
      }
      chain(...tweens) {
        this._chainedTweens = tweens;
        return this;
      }
      onStart(callback) {
        this._onStartCallback = callback;
        return this;
      }
      onUpdate(callback) {
        this._onUpdateCallback = callback;
        return this;
      }
      onRepeat(callback) {
        this._onRepeatCallback = callback;
        return this;
      }
      onComplete(callback) {
        this._onCompleteCallback = callback;
        return this;
      }
      onStop(callback) {
        this._onStopCallback = callback;
        return this;
      }
      _goToEnd = false;
      update(time = now(), autoStart = true) {
        if (this._isPaused)
          return true;
        let property;
        let elapsed;
        const endTime = this._startTime + this._duration;
        if (!this._goToEnd && !this._isPlaying) {
          if (time > endTime)
            return false;
          if (autoStart)
            this.start(time);
        }
        this._goToEnd = false;
        if (time < this._startTime) {
          return true;
        }
        if (this._onStartCallbackFired === false) {
          if (this._onStartCallback) {
            this._onStartCallback(this._object);
          }
          this._onStartCallbackFired = true;
        }
        elapsed = (time - this._startTime) / this._duration;
        elapsed = this._duration === 0 || elapsed > 1 ? 1 : elapsed;
        const value = this._easingFunction(elapsed);
        this._updateProperties(this._object, this._valuesStart, this._valuesEnd, value);
        if (this._onUpdateCallback) {
          this._onUpdateCallback(this._object, elapsed);
        }
        if (elapsed === 1) {
          if (this._repeat > 0) {
            if (isFinite(this._repeat)) {
              this._repeat--;
            }
            for (property in this._valuesStartRepeat) {
              if (!this._yoyo) {
                this._repeatStartRepeatValues(property);
              } else {
                this._swapEndStartRepeatValues(property);
              }
              this._valuesStart[property] = this._valuesStartRepeat[property];
            }
            if (this._yoyo) {
              this._reversed = !this._reversed;
            }
            if (this._repeatDelayTime !== void 0) {
              this._startTime = time + this._repeatDelayTime;
            } else {
              this._startTime = time + this._delayTime;
            }
            if (this._onRepeatCallback) {
              this._onRepeatCallback(this._object);
            }
            return true;
          } else {
            if (this._onCompleteCallback) {
              this._onCompleteCallback(this._object);
            }
            for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
              this._chainedTweens[i].start(this._startTime + this._duration);
            }
            this._isPlaying = false;
            return false;
          }
        }
        return true;
      }
      _updateProperties(_object, _valuesStart, _valuesEnd, value) {
        for (const property in _valuesEnd) {
          if (_valuesStart[property] === void 0) {
            continue;
          }
          const start = _valuesStart[property] || 0;
          let end = _valuesEnd[property];
          const startIsArray = Array.isArray(_object[property]);
          const endIsArray = Array.isArray(end);
          const isInterpolationList = !startIsArray && endIsArray;
          if (isInterpolationList) {
            _object[property] = this._interpolationFunction(end, value);
          } else if (typeof end === "object" && end) {
            this._updateProperties(_object[property], start, end, value);
          } else {
            end = this._handleRelativeValue(start, end);
            if (typeof end === "number") {
              _object[property] = start + (end - start) * value;
            }
          }
        }
      }
      _handleRelativeValue(start, end) {
        if (typeof end !== "string") {
          return end;
        }
        if (end.charAt(0) === "+" || end.charAt(0) === "-") {
          return start + parseFloat(end);
        } else {
          return parseFloat(end);
        }
      }
      _repeatStartRepeatValues(property) {
        if (typeof this._valuesEnd[property] === "string") {
          this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
        }
      }
      _swapEndStartRepeatValues(property) {
        const tmp = this._valuesStartRepeat[property];
        const endValue = this._valuesEnd[property];
        if (typeof endValue === "string") {
          this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(endValue);
        } else {
          this._valuesStartRepeat[property] = this._valuesEnd[property];
        }
        this._valuesEnd[property] = tmp;
      }
    }
    TweenClass2.Tween = Tween;
    const nextId = Sequence.nextId;
    const TWEEN = mainGroup;
    const getAll = TWEEN.getAll.bind(TWEEN);
    const removeAll = TWEEN.removeAll.bind(TWEEN);
    const add = TWEEN.add.bind(TWEEN);
    const remove = TWEEN.remove.bind(TWEEN);
    TweenClass2.update = TWEEN.update.bind(TWEEN);
  })(TweenClass || (TweenClass = {}));
})(BulletChatUI || (BulletChatUI = {}));

// JavaScripts/TQ/ui/LoadingUI.ts
var LoadingUI_exports = {};
__export(LoadingUI_exports, {
  LoadingUI: () => LoadingUI
});
var LodPanelClass = class extends UI.UIBehaviour {
  img_bg;
  txt_des;
  slider_progress;
  btn_Enter;
};
var _LoadingUI = class {
  constructor() {
  }
  init(cls) {
    this.uiClass = cls;
  }
  static get instance() {
    if (_LoadingUI._ins == null) {
      _LoadingUI._ins = new _LoadingUI();
    }
    return _LoadingUI._ins;
  }
  uiClass = null;
  loadingUI = null;
  get isShow() {
    return this.loadingUI ? this.loadingUI.visible : false;
  }
  open() {
    if (this.loadingUI && this.loadingUI.visible) {
      return;
    }
    if (this.loadingUI == null) {
      this.loadingUI = Extension.UIManager.instance.create(this.uiClass);
      let UIupdate = this.loadingUI["onUpdate"];
      this.loadingUI["onUpdate"] = function (dt) {
        UIupdate(dt);
        _LoadingUI._ins.update(dt);
      };
      this.loadingUI.slider_progress.sliderMinValue = 0;
      this.loadingUI.slider_progress.sliderMaxValue = 1;
      this.targetPercent = 0;
    } else if (!this.loadingUI.visible) {
      Extension.UIManager.instance.showUI(this.loadingUI, Extension.UILayerTop);
    }
    return this;
  }
  setProgress(val, max = 1, min = 0) {
    this.open();
    this.loadingUI.slider_progress.sliderMinValue = Math.min(min, max);
    this.loadingUI.slider_progress.sliderMaxValue = Math.max(min, max);
    this.targetPercent = val;
    if (this.targetPercent <= this.loadingUI.slider_progress.currentValue) {
      this.loadingUI.slider_progress.currentValue = this.targetPercent;
    }
    return this;
  }
  setText(txt) {
    this.open();
    this.loadingUI.txt_des.text = txt;
    return this;
  }
  setBgImg(guid) {
    this.open();
    this.loadingUI.img_bg.imageGuid = guid;
    return this;
  }
  lastSetCompAction = null;
  setCompeleteAct(callback) {
    this.lastSetCompAction = callback;
    return this;
  }
  setForgeProgress(time) {
    this.forge = true;
    this.setProgress(0, time);
    return this;
  }
  clearAll() {
    this.lastSetCompAction = null;
    this.forge = false;
    this.targetPercent = 0;
    this.tickStep = -1;
    if (this.loadingUI) {
      this.loadingUI.txt_des.text = "";
      this.loadingUI.img_bg.imageGuid = "";
      this.loadingUI.slider_progress.currentValue = 0;
    }
    return this;
  }
  setTickStep(sp) {
    this.tickStep = sp;
    return this;
  }
  forge = false;
  targetPercent = 0;
  tickStep = -1;
  update(dt) {
    if (this.isShow) {
      let [cur, max] = [this.loadingUI.slider_progress.currentValue, this.loadingUI.slider_progress.sliderMaxValue];
      cur += this.tickStep > 0 ? dt * this.tickStep : dt;
      if (this.forge) {
        this.setProgress(cur + dt, max);
      } else {
        cur = this.RoundNumber(cur, this.loadingUI.slider_progress.sliderMinValue, this.targetPercent);
      }
      this.loadingUI.slider_progress.currentValue = cur;
      if (cur >= max) {
        if (this.lastSetCompAction != null) {
          try {
            this.lastSetCompAction();
          } catch (error) {
            console.log("loading error:" + error);
          }
          this.lastSetCompAction = null;
        }
        Extension.UIManager.instance.hideUI(this.loadingUI);
        this.clearAll();
      }
    }
  }
  RoundNumber(value, min, max) {
    if (value > max)
      return max;
    if (value < min)
      return min;
    return value;
  }
};
var LoadingUI = _LoadingUI;
__publicField(LoadingUI, "_ins", null);

// JavaScripts/UIDefault.ts
var UIDefault_exports = {};
__export(UIDefault_exports, {
  default: () => UIDefault
});
Extension.UIManager.getInstance(Extension.UIManager);
var UIDefault = class extends UI.UIBehaviour {
  onStart() {
    const JumpBtn = this.rootcanvas.getChildByName("MWButton_Jump");
    JumpBtn.onClicked.add(() => {
      Gameplay.asyncGetCurrentPlayer().then((player) => {
        player.character.jump();
      });
    });
  }
  onConstruct() {
  }
  onDestruct() {
  }
};
UIDefault = __decorateClass([
  UI.UICallOnly("UI/UIDefault.ui")
], UIDefault);

// build.ts
var MWModuleMap = {
  "build": build_exports,
  "JavaScripts/HYMGame": HYMGame_exports,
  "JavaScripts/NewScript": NewScript_exports,
  "JavaScripts/NewUI": NewUI_exports,
  "JavaScripts/test/CreateModule/BuildingData": BuildingData_exports,
  "JavaScripts/test/CreateModule/CreateModule": CreateModule_exports,
  "JavaScripts/test/test": test_exports,
  "JavaScripts/TQ/CommonLogic/Backpack": foreign7,
  "JavaScripts/TQ/CommonLogic/BackpackModule": foreign8,
  "JavaScripts/TQ/CommonLogic/RankLogic": RankLogic_exports,
  "JavaScripts/TQ/CommonLogic/RewardModule": RewardModule_exports,
  "JavaScripts/TQ/Tools/ArrayExtFunc": foreign11,
  "JavaScripts/TQ/Tools/EventTools": EventTools_exports,
  "JavaScripts/TQ/Tools/ExtensionType": ExtensionType_exports,
  "JavaScripts/TQ/Tools/ObjectMaterial": ObjectMaterial_exports,
  "JavaScripts/TQ/Tools/StateMachine": StateMachine_exports,
  "JavaScripts/TQ/Tools/Tools": Tools_exports,
  "JavaScripts/TQ/tqBase/Datacenter": Datacenter_exports,
  "JavaScripts/TQ/tqBase/NetManager": NetManager_exports,
  "JavaScripts/TQ/TQGameStart": TQGameStart_exports,
  "JavaScripts/TQ/ui/BulletChatUI": BulletChatUI_exports,
  "JavaScripts/TQ/ui/LoadingUI": LoadingUI_exports,
  "JavaScripts/ui-generate/NewUI_generate": NewUI_generate_exports,
  "JavaScripts/UIDefault": UIDefault_exports
};
//# sourceMappingURL=game.js.map
