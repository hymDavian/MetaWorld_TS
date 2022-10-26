/**事件装饰器 */
export namespace EventTools {

	export enum ECallerLoc {
		/**本地(不会受其他端通知过来的调用) */
		local = 0,
		/**仅客户端调服务器触发 */
		server = 1,
		/**仅服务器调客户端触发 */
		client = 2,
	}

	/**执行者,事件函数，是否为服务器函数 */
	type fty = [getThisArg, (...arg: any[]) => any, ECallerLoc]
	type getThisArg = any
	const locEvemtMap: Map<string, fty[]> = new Map();
	const serverEvemtMap: Map<string, fty[]> = new Map();
	const clientEvemtMap: Map<string, fty[]> = new Map();
	const noThisObj: Map<string, any> = new Map();//没有传入使用者时使用的默认对象

	/**
	 * 附加成员函数上，自动注册一个本地事件
	 * @param eventName 事件名
	 * @param space 作用域:0本地  1服务器  2客户端
	 * @param thisObj 调用者,如果在类里面传this不是某个实例，而是类原型对象，需要传单例获取方式,例如 ()=>{return xxx.instance} 
	 * 也可以什么也不传，然后在运行时逻辑调用 setNoTargetEvent 设置同名事件的调用者
	 * @returns 
	 */
	export function setEvent(eventName: string, space: ECallerLoc = ECallerLoc.local, thisObj?: getThisArg) {
		return function (target: any, propertyRey: string, description: PropertyDescriptor) {
			if (description.value && typeof description.value === "function") {//是一个函数
				let m: Map<string, fty[]> = null;
				switch (space) {
					case ECallerLoc.local: m = locEvemtMap; break;
					case ECallerLoc.server: m = serverEvemtMap; break;
					case ECallerLoc.client: m = clientEvemtMap; break;
				}

				if (!m.has(eventName)) {
					m.set(eventName, []);
				}
				let info: fty = [thisObj, description.value, space];
				m.get(eventName).push(info);
			}
		}
	}
	/**
	 * 设置没有写执行者时使用的默认执行者
	 * @param eventName 
	 * @param target 
	 */
	export function setNoTargetEvent(eventName: string, target: any) {
		noThisObj.set(eventName, target ? target : {});
	}
	/**
	 * 执行事件
	 * @param eventName 事件名
	 * @param thisObj 执行者
	 * @param args 参数
	 */
	export function callEvent(eventName: string, ...args: any[]) {
		callEvents(locEvemtMap.get(eventName), eventName, ...args);

		let csMap = Gameplay.isServer() ? serverEvemtMap.get(eventName) : clientEvemtMap.get(eventName)
		callEvents(csMap, eventName, ...args)


		if (Gameplay.isServer()) {//本地算服务器
			if (clientEvemtMap.has(eventName)) {//客户端有需要执行的
				Events.dispatchToAllClient(EVENT_CALLCLIENT, eventName, ...args);
			}
		}
		if (Gameplay.isClient()) {
			if (serverEvemtMap.has(eventName)) {
				Events.dispatchToServer(EVENT_CALLSERVER, eventName, ...args);
			}
		}


	}

	function callEvents(eInfo: fty[], eventName: string, ...args: any[]) {
		if (eInfo) {
			for (const eventAvt of eInfo) {
				try {
					if (!eventAvt[0]) {//没有值，使用空对象执行
						let nullObj = noThisObj.has(eventName) ? noThisObj.get(eventName) : {};
						eventAvt[1].call(nullObj, ...args);
					}
					else {
						if (typeof eventAvt[0] === "function") {
							eventAvt[1].call(eventAvt[0](), ...args);
						}
						else {
							eventAvt[1].call(eventAvt[0], ...args);
						}
					}
				} catch (error) {
					console.error("eventTool error:", error.stack)
				}

			}
		}
	}



	const EVENT_CALLSERVER: string = "SUPER_EVENTTOOL_CALLSERVER";
	const EVENT_CALLCLIENT: string = "SUPER_EVENTTOOL_CALLCLIENT";
	export function initEventRPC() {
		if (Gameplay.isServer()) {//服务器监听客户端事件
			Events.addClientListener(EVENT_CALLSERVER, clientToServerCallEvent)
		}
		if (Gameplay.isClient()) {
			Events.addServerListener(EVENT_CALLCLIENT, serverToClientCallEvent)
		}

	}

	function clientToServerCallEvent(player, ...args: any[]) {
		const [eventName, params] = [args[0], args.slice(1)];
		callEvents(serverEvemtMap.get(eventName), eventName, ...params);

	}
	function serverToClientCallEvent(...args: any) {
		const [eventName, params] = [args[0], args.slice(1)];
		callEvents(clientEvemtMap.get(eventName), eventName, ...params);
	}
}
