/**同步给客户端的某个物体数据 */
export type syncInfo = {
	uuid: number,
	myInfo: {
		[typeKey: number]: any
	}
}

/**场景物体同步工具 */
export class SceneObjectSync {
	private static _ins: SceneObjectSync = null;
	public static get instance(): SceneObjectSync {
		if (!SceneObjectSync._ins) {
			SceneObjectSync._ins = new SceneObjectSync();
		}
		return SceneObjectSync._ins;
	}

	private readonly EventSyncObjects: string = "EventSyncObjects";//消息字符
	private _showTask: syncInfo[] = null;//客户端每帧需要完成的展示任务
	private _showFuncs: Map<number, (info: syncInfo) => void> = null;//如果去操作这个同步下来的信息



	private _serverObjs: Map<number, syncInfo> = null;//服务器上存的物体信息
	private _sendTask: Map<number, Map<number, syncInfo>> = null;//服务器的待发送任务组
	private _attrEqualFuncs: Map<number, (a: any, b: any) => boolean> = null;//数据比对方式
	private readonly _sendLength: number = 35;//每次同步给客户端的数据单位数量

	/**初始化 */
	public init() {
		if (Gameplay.isClient()) {
			this._showTask = [];
			this._showFuncs = new Map();
			Events.addServerListener(this.EventSyncObjects, this.onSyncObject.bind(this));
		}
		else {
			this._serverObjs = new Map();
			this._sendTask = new Map();
			this._attrEqualFuncs = new Map();
			//注册 任意玩家离开后，同步任务清空
			Events.addPlayerLeftListener(p => {
				this._sendTask.delete(p.getPlayerID());
			});
		}
	}

	/**[client] 收到服务器同步信息后如何去执行的方式 */
	public setSyncMethod(type: number, func: (info: syncInfo) => void) {
		this._showFuncs.set(type, func);
	}

	/**[client] 收到服务器发下来的同步物体信息 */
	private onSyncObject(infos: syncInfo[]) {
		this._showTask.push(...infos);
	}



	/**[C/S] 提供外部，处理物体变化任务组 */
	public update(dt: number) {
		if (Gameplay.isClient()) {
			this.clientUpdate(dt);
		}
		else {
			this.serverUpdate(dt);
		}

	}

	/**客户端的表现物体变化任务 */
	private clientUpdate(dt: number) {
		if (this._showTask.length > 0) {
			const task = this._showTask.shift();//取出一个显示任务

			for (const k in task.myInfo) {
				let doType: number = Number(k);
				if (this._showFuncs.get(doType)) {//有相关处理函数
					this._showFuncs.get(doType)(task);//执行
				}
			}
		}
	}

	/**服务器发送同步任务 */
	private serverUpdate(dt: number) {
		if (this._sendTask.size <= 0) { return; }

		for (let [pid, v] of this._sendTask) {
			if (v.size <= 0) {
				this._sendTask.delete(pid);
			}
			else {

				let netPks: syncInfo[] = [];
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

	/**
	 * [server] 同步一个服务器上的物体块属性给客户端()创建发送任务到队列
	 * @param uuid 物体服务器定义的唯一数字ID
	 * @param infos 需要被同步的信息
	 * @param pid 同步给哪个玩家ID，如果没有会同步给所有玩家
	 * @returns 
	 */
	public askClientSync(uuid: number, infos: { [typeKey: number]: any }, pid?: number) {
		if (Gameplay.isClient()) { return; }

		if (!this._serverObjs.has(uuid)) {
			let serverData: syncInfo = {
				uuid: uuid,
				myInfo: {}
			}
			this._serverObjs.set(uuid, serverData);
		}
		let netPackage = this._serverObjs.get(uuid);//拿到存储的数据信息

		let haveChange: boolean = false
		for (const k in infos) {//将不同的东西赋值给这个网络同步对象

			if (!netPackage.myInfo[k]) {//如果之前不存在
				netPackage.myInfo[k] = infos[k];
				haveChange = true;
				continue;
			}
			let kNum = Number(k);
			if (this._attrEqualFuncs.get(kNum)) {//有自定义比对方式
				if (!this._attrEqualFuncs.get(kNum)(netPackage.myInfo[k], infos[k])) {//如果不同
					netPackage.myInfo[k] = infos[k];
					haveChange = true;
				}
			}
			else {//直接默认比对
				if (netPackage.myInfo[k] != infos[k]) {
					netPackage.myInfo[k] = infos[k];
					haveChange = true;
				}
			}
		}
		if (!haveChange) { return; }//没有变化则不添加这个任务

		if (pid) {
			if (!this._sendTask.get(pid)) {
				this._sendTask.set(pid, new Map());
			}
			this._sendTask.get(pid).set(netPackage.uuid, netPackage);
		}
		else {
			let ps = Gameplay.getAllPlayers();
			for (let p of ps) {
				if (p) {
					let _pid = p.getPlayerID();
					if (!this._sendTask.get(_pid)) {
						this._sendTask.set(_pid, new Map());
					}

					this._sendTask.get(_pid).set(netPackage.uuid, netPackage);
				}
			}
		}


	}

	/**[server] 设置属性自定义比对方式 */
	public setEqualFunc(type: number, func: (a: unknown, b: unknown) => boolean) {
		this._attrEqualFuncs.set(type, func);
	}

	/**[server] 给某个玩家同步所有物体块的所有数据 */
	public async askToAllServerObj(pid: number) {
		if (Gameplay.isClient()) { return; }
		let player = Gameplay.getPlayer(pid);
		if (!player) { return; }


		if (!this._sendTask.get(pid)) {
			this._sendTask.set(pid, new Map());
		}
		for (let [k, v] of this._serverObjs) {
			this._sendTask.get(pid).set(k, v);
		}
	}




}
