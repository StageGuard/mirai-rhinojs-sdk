/*
	mirai-rhinojs-sdk: MiraiQQBot.http.js
	Copyright (C) 2020  StageGuard

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published
	by the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

function() {
	var r = {
		__version: "v1.6.1_http",

		WINDOWS: "Windows",
		LINUX: "Linux",
		ANDROID_AUTOJS: "Android_AutoJs",

		host: "",

		authKey: "",
		server: "",

		setAuthKey: function(k) {
			if (k && typeof(k) == "string") this.authKey = k;
		},
		setServer: function(s) {
			if (s && typeof(s) == "string") this.server = s;
		},
		__auth: function() {
			return JSON.parse(this.utils.http.post(this.server + "auth", JSON.stringify({
				authKey: this.authKey
			})));
		},
		//在http版本中，password没有作用
		createNewBot: function(qq, password) {
			if (this.authkey == "" || this.server == "") throw "Authenticate key or server is not set.";
			if (this.__BotManager.has(qq)) {
				return this.__BotManager.get(qq);
			} else {
				r.Log.i("Bot " + qq + " created.");
				return this.__BotManager.add(qq, this.__generateSessionKey());
			}
		},
		__generateSessionKey: function() {
			var result = this.__auth();
			if (result.code != 0) {
				throw "Authenticate key is invaild.";
			} else {
				return result.session;
			}
		},
		getBot: function(qq) {
			return this.__BotManager.get(qq);
		},
		loadExternalObject: function(object, filep, name) {
			try {
				object[name] = eval("(" + (/^htt(p|ps):\/\//.test(filep) ? r.utils.http.get(filep) : r.utils.file.read(filep, r.utils.file.STRING)) + ")");
				r.Log.i("External object(source=" + filep + ") is loaded.");
			} catch(e) {
				r.Log.e(e);
			}
		},

	};

	r.init = function(globalObject) {
		this.host = java.lang.System.getProperty("os.name");
		if ("context" in globalObject) this.host = r.ANDROID_AUTOJS;
		
		r.Log.w("* MiraiQQBot.js版本： " + r.__version);
		r.Log.w("* 当前为不稳定版本，请保持该脚本的强制更新。");
		r.Log.w("* 若你发现版本更新了，请及时查看更新日志，以免错过重要新特性。");
		r.Log.w("* 因取消强制更新而导致MiraiQQBot.js出现bug，恕不解决！");
		r.Log.i("* 更新日志：https://github.com/StageGuard/mirai-rhinojs-sdk");
		r.Log.i("* SDK文档：https://stageguard.top/p/mirai-rhinojs-sdk.html");

	};
	r.registerClasses2Object = function(obj) {
		if (! (obj instanceof Object)) r.Log.e(obj + " is not an object.");
		var reg = function(source) {
			for (var i in source) {
				if (source[i] instanceof Object && !(source[i] instanceof Function)) {
					reg(source[i]);
				} else {
					obj[i] = source[i];
				}
			}
		};
		reg(r.MessageType);
		reg(r.MessageTypeConst);
		reg(r.EventTypeConst);
		reg(r.GroupInfo.Permission);
		obj["Log"] = r.Log;
	};

	r.__BotManager = {
		/*{
			qq: 1355416608,
			instance: a Mirai.Bot object
		}*/
		bots: [],
		add: function(qq, sessionKey) {
			this.bots.push({
				qq: qq,
				instance: new r.Bot(qq, sessionKey)
			});
			this.VerifyManager.add(qq);
			this.VerifyManager.start(qq);
			this.MessageSubscriberManager.start(qq);
			return this.get(qq);
		},
		get: function(qq) {
			for (var i in this.bots) {
				if (this.bots[i].qq == qq) {
					return this.bots[i].instance;
				}
			}
			return null;
		},
		has: function(qq) {
			for (var i in this.bots) {
				if (this.bots[i].qq == qq) {
					return true;
				}
			}
			return false;
		},
		remove: function(qq) {
			for (var i in this.bots) {
				if (this.bots[i].qq == qq) {
					this.bots.splice(i, 1);
					this.VerifyManager.remove(qq);
					this.MessageSubscriberManager.remove(qq);
				}
			}
		},
		VerifyManager: {
			//[qq, thread]
			queue: [],
			add: function(qq) {
				this.queue.push([qq, this.newThread(qq)]);
			},
			remove: function(qq) {
				for (var i in this.queue) {
					if (this.queue[i][0] == qq) {
						this.queue[i][1].interrupt();
						this.queue.splice(i, 1);
					}
				}
			},
			newThread: function(qq) {
				return new java.lang.Thread(new java.lang.Runnable({
					run: function() {
						try {
							while (!java.lang.Thread.interrupted()) {
								var result = JSON.parse(r.utils.http.post(r.server + "verify", JSON.stringify({
									sessionKey: r.__BotManager.get(qq).getSessionKey(),
									qq: qq
								})));
								switch (result.code) {
								case 1:
									throw "Authenticate key is invaild";
									break;
								case 2:
									throw "Bot " + qq + " is not existed.";
									break;
								case 3:
									r.__BotManager.get(qq).setSessionKey(r.__generateSessionKey());
									// "Session is invaild or not existed.";
									break;
								case 4:
									throw "Session is unauthenticated.";
									break;
								case 10:
									throw "Permission denied for bot " + qq;
									break;
								case 0:
									r.Log.i("Session is verified: " + r.__BotManager.get(qq).getSessionKey());
									break;
								}
								//10分钟
								java.lang.Thread.sleep(600000);
							}
							return;
						} catch(error) {
							if (! (/InterruptedException/i).test(error.toString())) {
								throw error;
							}
						}
					},
				}));
			},
			start: function(qq) {
				for (var i in this.queue) {
					if (this.queue[i][0] == qq) {
						if (this.queue[i][1].getState() == java.lang.Thread.State.NEW) {
							this.queue[i][1].start();
						} else {
							this.queue[i][1].interrupt();
							this.queue[i][1] = this.newThread(qq);
							this.queue[i][1].start();
						}
						r.Log.i("Verification thread started for " + qq + ".");
					}
				}
			},
			stop: function(qq) {
				for (var i in this.queue) {
					if (this.queue[i][0] == qq) {
						this.queue[i][1].interrupt();
					}
				}
			}
		},
		MessageSubscriberManager: {
			//正在订阅消息的qq号
			//[qq, thread]
			subscriber: [],

			add: function(qq) {
				this.subscriber.push([qq, this.newThread(qq)]);
			},

			start: function(qq) {
				for (var i in this.subscriber) {
					if (this.subscriber[i][0] == qq) {
						if (this.subscriber[i][1].getState() == java.lang.Thread.State.NEW) {
							this.subscriber[i][1].start();
						} else {
							this.subscriber[i][1].interrupt();
							this.subscriber[i][1] = this.newThread(qq);
							this.subscriber[i][1].start();
						}
						r.Log.i("Message subscription thread started for " + qq + ".");
						return;
					}
				}
				this.add(qq);
				this.start(qq);
			},
			stop: function(qq) {
				for (var i in this.subscriber) {
					if (this.subscriber[i][0] == qq) {
						this.subscriber[i][1].interrupt();
					}
				}
			},
			remove: function(qq) {
				for (var i in this.subscriber) {
					if (this.subscriber[i][0] == qq) {
						this.subscriber[i][1].interrupt();
						this.subscriber.splice(i, 1);
					}
				}
			},
			newThread: function(qq) {
				return new java.lang.Thread(new java.lang.Runnable({
					run: function() {
						try {
							while (!java.lang.Thread.interrupted()) {
								java.lang.Thread.sleep(150);
								var subscriber = r.__BotManager.get(qq).getSubscriber();
								if (subscriber != null) {
									var p = JSON.parse(r.utils.http.get(r.server + "fetchMessage?sessionKey=" + r.__BotManager.get(qq).getSessionKey() + "&count=10"));
									if (p.code != 0) {
										if (p.code == 3) {
											r.__BotManager.get(qq).setSessionKey(r.__generateSessionKey());
											r.__BotManager.VerifyManager.start(qq);
										} else {
											if (subscriber.error) subscriber.error(new Error(String("Error while hooking messages: {$msg}({$code})").replace("{$code}", p.code).replace("{$msg}", p.msg)));
										}

									} else if (p.data.length != 0) {
										var sessionKey = r.__BotManager.get(qq).getSessionKey();
										for (var i in p.data) {
											switch (p.data[i].type) {
											case "GroupMessage":
												if (subscriber.group) subscriber.group(new r.GroupInfo(sessionKey, p.data[i].messageChain[0].id, p.data[i].sender.group), new r.MessageSender(sessionKey, p.data[i].messageChain[0].id, p.data[i].sender), r.MessageChain.build([p.data[i].messageChain]));
												break;
											case "TempMessage":
												if (subscriber.temp) subscriber.temp(new r.GroupInfo(sessionKey, p.data[i].messageChain[0].id, p.data[i].sender.group), new r.MessageSender(sessionKey, p.data[i].messageChain[0].id, p.data[i].sender), r.MessageChain.build([p.data[i].messageChain]));
												break;
											case "FriendMessage":
												if (subscriber.friend) subscriber.friend(new r.MessageSender(sessionKey, p.data[i].messageChain[0].id, p.data[i].sender), r.MessageChain.build([p.data[i].messageChain]));
												break;
											default:
												if (subscriber.event) subscriber.event(new r.EventType[p.data[i].type](p.data[i], sessionKey));
												break;
											}
										}
									}
								}
							}
							return;
						} catch(error) {
							if (! (/InterruptedException/i).test(error.toString())) {
								var subscriber = r.__BotManager.get(qq).getSubscriber();
								if (subscriber != null && subscriber.error) subscriber.error(error);
							}
						}
					},
				}));
			}
		}
	};
	//qq号与session不是一一对应的关系
	//为了方便管理这里就设置为一一对应的关系
	r.Bot = function(qq, sessionKey) {
		this.sessionKey = sessionKey;
		this.qq = qq;
		this.subscriber = null;
	};
	r.Bot.prototype = {
		getSessionKey: function() {
			return this.sessionKey;
		},
		setSessionKey: function(s) {
			this.sessionKey = s;
		},
		subscribe: function(obj) {
			this.subscriber = obj;
		},
		getSubscriber: function() {
			return this.subscriber;
		},

		//自动判断并发送消息
		send: function(target) {
			var msg = new Array();
			for (var i = 1; i < arguments.length; i++) msg.push(arguments[i]);
			//如果target是群组，直接发送群组消息
			if (target instanceof r.GroupInfo) {
				return r.__protocol.sendGroupMessage(this.sessionKey, target.getId(), r.MessageChain.build(msg).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
			} else if (target instanceof r.MessageSender) {
				//如果是发送者，判断是否有好友，有则直接发好友消息
				var friends = r.__protocol.getFriendList(this.sessionKey);
				for (var i in friends) {
					if (friends[i].id == target.getId()) {
						return r.__protocol.sendFriendMessage(this.sessionKey, target.getId(), r.MessageChain.build(msg).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
					}
				}
				//若无，则判断发送者是否与bot在同一个群，有则发送临时消息
				if (target.getPermission() != null) {
					return r.__protocol.sendTempMessage(this.sessionKey, target.getId(), target.group.id, r.MessageChain.build(msg).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
				} else {
					r.Log.e("Cannot send message(target=" + target + ")");
					return 0;
				}
			}
		},
		//发送群组消息
		sendGroupMessage: function(target, msg, quote) {
			return r.__protocol.sendGroupMessage(this.sessionKey, (target instanceof r.GroupInfo) ? target.getId() : target, r.MessageChain.build(msg).toSource(), quote);
		},
		//发送好友消息
		sendFriendMessage: function(target, msg, quote) {
			return r.__protocol.sendFriendMessage(this.sessionKey, (target instanceof r.MessageSender) ? target.getId() : target, r.MessageChain.build(msg).toSource(), quote);
		},
		//发送临时消息
		sendTempMessage: function(target, from, msg, quote) {
			return r.__protocol.sendTempMessage(this.sessionKey, (target instanceof r.MessageSender) ? target.getId() : target, (from instanceof r.GroupInfo) ? from.getId() : from, r.MessageChain.build(msg).toSource(), quote);
		},
		//撤回消息
		recall: function(target) {
			r.__protocol.recall(this.sessionKey, target);
		},
		//获取好友，群组，群成员列表数组
		getFriendList: function() {
			return r.__protocol.getFriendList(this.sessionKey);
		},
		getGroupList: function() {
			return r.__protocol.getGroupList(this.sessionKey);
		},
		getGroupMemberList: function(group) {
			return r.__protocol.getGroupMemberList(this.sessionKey, (group instanceof r.GroupInfo) ? group.getId() : group);
		},
		//好友判断
		haveFriend: function(friend) {
			var id = (friend instanceof r.MessageSender) ? friend.getId() : friend;
			var list = this.getFriendList();
			for (var i in list) {
				if (list[i].id == id) {
					return true;
				}
			}
			return false;
		},
		//群组判断
		haveGroup: function(group) {
			var id = (group instanceof r.GroupInfo) ? group.etId() : group;
			var list = this.getGroupList();
			for (var i in list) {
				if (list[i].id == id) {
					return true;
				}
			}
			return false;
		},
		//管理员操作
		mute: function(group, target, time) {
			r.__protocol.mute(this.sessionKey, (group instanceof r.GroupInfo) ? group.getId() : group, (target instanceof r.MessageSender) ? target.getId() : target, Number(Math.min(Math.max(0, time == null ? 60 : time), 2591999)));
		},
		unmute: function(group, target) {
			r.__protocol.unmute(this.sessionKey, (group instanceof r.GroupInfo) ? group.getId() : group, (target instanceof r.MessageSender) ? target.getId() : target);
		},
		muteAll: function(group) {
			r.__protocol.muteAll(this.sessionKey, (group instanceof r.GroupInfo) ? group.getId() : group);
		},
		unmuteAll: function(group) {
			r.__protocol.unmuteAll(this.sessionKey, (group instanceof r.GroupInfo) ? group.getId() : group);
		},
		kick: function(group, target, msg) {
			r.__protocol.kick(this.sessionKey, (group instanceof r.GroupInfo) ? group.getId() : group, (target instanceof r.MessageSender) ? target.getId() : target, msg);
		},
		handleFriendRequest: function(iArg, accept, msg) {
			r.__protocol.handleFriendRequest(this.sessionKey, iArg.eventId, iArg.fromId, iArg.groupId, accept, msg);
		},
		handleMemberJoinRequest: function(iArg, accept, msg) {
			r.__protocol.handleMemberJoinRequest(this.sessionKey, iArg.eventId, iArg.fromId, iArg.groupId, accept, msg);
		},

		destroy: function() {
			r.__BotManager.remove(this.qq);
			delete this;
		},

	};

	r.MessageSender = (function self() {
		self.r = function(session, sourceId, json) {
			this.session = session;
			this.sourceId = sourceId;
			this.id = (json == null) ? null: json.id;
			this.name = (json == null) ? null: (json.memberName ? json.memberName: json.nickname);
			this.permission = null;
			this.group = (json == null) ? null: (json.group ? json.group: null);
			if (this.group != null) {
				this.permission = (json == null) ? null: json.permission;
			}
		}
		self.r.prototype = {
			getId: function() {
				return this.id;
			},
			getName: function() {
				return this.name;
			},
			getPermission: function() {
				return this.permission;
			},

			getSourceId: function() {
				return this.sourceId;
			},

			send: function() {
				var friends = r.__protocol.getFriendList(this.session);
				for (var i in friends) {
					if (friends[i].id == this.getId()) {
						return r.__protocol.sendFriendMessage(this.session, this.getId(), r.MessageChain.build(arguments).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
					}
				}
				return r.__protocol.sendTempMessage(this.session, this.getId(), this.group.id, r.MessageChain.build(arguments).toSource());
			},
			reply: function() {
				return r.__protocol.sendGroupMessage(this.session, this.group.id, r.MessageChain.build(arguments).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource(), this.sourceId);
			},
			at: function() {
				return r.__protocol.sendGroupMessage(this.session, this.group.id, r.MessageChain.build(arguments).addF(r.MessageType.At(this)).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
			},

			mute: function(time) {
				if (this.group != null) r.__protocol.mute(this.session, this.group.id, this.id, Number(Math.min(Math.max(0, time == null ? 60 : time), 2591999)));
			},
			unmute: function() {
				if (this.group != null) r.__protocol.unmute(this.session, this.group.id, this.id);
			},
			kick: function(msg) {
				if (this.group != null) r.__protocol.kick(this.session, this.group.id, this.id, msg);
			},

			toString: function() {
				return (this.permission == null ? "Friend": "GroupMember") + "(id=" + this.id + ", name=" + this.name + (this.permission == null ? "": (", permission=" + this.permission)) + ")";
			}
		}
		return self.r;
	} ());
	r.GroupInfo = (function self() {
		self.r = function(session, sourceId, json) {
			this.session = session;
			this.sourceId = sourceId;
			this.id = (json == null) ? null: json.id;
			this.name = (json == null) ? null: json.name;
			this.permission = (json == null) ? null: json.permission;
		}
		self.r.prototype = {
			getId: function() {
				return this.id;
			},
			getName: function() {
				return this.name;
			},
			getPermission: function() {
				return this.permission;
			},
			send: function() {
				return r.__protocol.sendGroupMessage(this.session, this.id, r.MessageChain.build(arguments).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
			},
			reply: function() {
				return r.__protocol.sendGroupMessage(this.session, this.id, r.MessageChain.build(arguments).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource(), this.sourceId);
			},
			at: function(sender) {
				var msg = new Array();
				for (var i = 1; i < arguments.length; i++) msg.push(arguments[i]);
				return r.__protocol.sendGroupMessage(this.session, this.id, r.MessageChain.build(msg).addF(r.MessageType.At(sender)).discord(r.MessageTypeConst.QUOUE).discord(r.MessageTypeConst.SOURCE).toSource());
			},
			mute: function(target, time) {
				r.__protocol.mute(this.session, this.id, (target instanceof r.MessageSender) ? target.getId() : target, Number(Math.min(Math.max(0, time == null ? 60 : time), 2591999)));
			},
			unmute: function(target) {
				r.__protocol.unmute(this.session, this.id, (target instanceof r.MessageSender) ? target.getId() : target);
			},
			muteAll: function() {
				r.__protocol.muteAll(this.session, this.id);
			},
			unmuteAll: function() {
				r.__protocol.unmuteAll(this.session, this.id);
			},
			kick: function(target, msg) {
				r.__protocol.kick(this.session, this.id, (target instanceof r.MessageSender) ? target.getId() : target, msg);
			},
			toString: function() {
				return "Group(id=" + this.id + ", name=" + this.name + ", permission=" + this.permission + ")";
			}
		}
		return self.r;
	} ());
	r.GroupInfo.Permission = {
		OWNER: "OWNER",
		ADMIN: "ADMINISTRATOR",
		MEMBER: "MEMBER",
	}

	r.MessageChain = function(messageChain) {
		this.msg = messageChain;
	}
	r.MessageChain.__json2MessageArray = function(msg) {
		var chains = [];
		for (var i in msg) {
			if (msg[i] instanceof r.MessageChain) {
				var cc;
				for (var i in cc = msg[i].toChainArray()) {
					chains.push(cc[i]);
				}
			} else {
				switch (msg[i].type) {
				case r.MessageTypeConst.SOURCE:
					chains.push(new r.MessageType.Source(msg[i].id, msg[i].time, true));
					break;
				case r.MessageTypeConst.QUOTE:
					chains.push(new r.MessageType.Quote(msg[i].id, msg[i].senderId, msg[i].groupId, msg[i].origin, true));
					break;
				case r.MessageTypeConst.AT:
					chains.push(new r.MessageType.At(msg[i].target, msg[i].display, true));
					break;
				case r.MessageTypeConst.ATALL:
					chains.push(new r.MessageType.AtAll(true));
					break;
				case r.MessageTypeConst.PLAIN:
					chains.push(new r.MessageType.Plain(msg[i].text, true));
					break;
				case r.MessageTypeConst.FACE:
					chains.push(new r.MessageType.Face(msg[i].faceId, msg[i].name, true));
					break;
				case r.MessageTypeConst.IMAGE:
					chains.push(new r.MessageType.Image(msg[i].imageId, msg[i].url, null, true));
					break;
				case r.MessageTypeConst.FLASHIMAGE:
					chains.push(new r.MessageType.FlashImage(msg[i].imageId, msg[i].url, null, true));
					break;
				case r.MessageTypeConst.XML:
					chains.push(new r.MessageType.Xml(msg[i].xml, true));
					break;
				case r.MessageTypeConst.JSON2:
					chains.push(new r.MessageType.Json2(msg[i].json, true));
					break;
				case r.MessageTypeConst.APP:
					chains.push(new r.MessageType.App(msg[i].content, true));
					break;
				case r.MessageTypeConst.POKE:
					chains.push(new r.MessageType.Poke(msg[i].name, true));
					break;
				}
			}
		}
		return chains;
	};
	//把各种构造方法构造的消息链转成json后再转成消息数组
	r.MessageChain.__convert = function(raw) {
		//通过伪操作符重载的方法构造
		if (raw.length == 1 && typeof(raw[0]) == "string") {
			var msgs = /\}\{"type":/gi.test(raw[0]) ? raw[0].replace(/\}\{"type":/gi, "}<_*split*flag_&@2>{\"type\":").split("<_*split*flag_&@2>") : [(raw[0].slice(0, 1) == "{") ? raw[0] : r.MessageType.Plain(raw[0])];
			var chains = [];
			for (var i in msgs) chains.push(JSON.parse(msgs[i]));
			return this.__json2MessageArray(chains);
			//通过MessageChain的方式构造
		} else if (raw.length == 1 && (raw[0] instanceof r.MessageChain)) {
			return raw[0];
			//通过JSON Array的方式构造
		} else if (raw.length == 1 && (raw[0] instanceof Array)) {
			return this.__json2MessageArray(raw[0]);
			//通过多参方法构造
		} else if (raw.length > 1) {
			var chains = [];
			for (var i in raw) chains.push((raw[i] instanceof r.MessageChain) ? raw[i] : JSON.parse((raw[i].slice(0, 1) == "{") ? raw[i] : r.MessageType.Plain(raw[i])));
			return this.__json2MessageArray(chains);
		} else {
			r.Log.e("Unknown type of MessageChain constructor.");
			return [];
		}
	}

	r.MessageChain.build = function(raw) {
		var chain = this.__convert(raw);
		if (chain instanceof r.MessageChain) {
			return chain;
		} else {
			return new this(chain);
		}
	}
	r.MessageChain.prototype = {
		length: function() {
			return this.msg.length;
		},
		get: function(type) {
			for (var i in this.msg) {
				if (this.msg[i].type == type) {
					return this.msg[i];
				}
			}
			return new r.MessageType[type]();
		},
		discord: function(type) {
			for (var i in this.msg) {
				if (this.msg[i].type == type) {
					this.msg.splice(i, 1);
				}
			}
			return this;
		},
		contain: function(text) {
			for (var i in this.msg) {
				if (this.msg[i].type == r.MessageTypeConst.PLAIN) {
					if (this.msg[i].getText().search(text) != -1) return true;
				}
			}
			return false;
		},
		add: function self() {
			var chain = r.MessageChain.__convert(arguments);
			for (var i in chain) this.msg.push(chain[i]);
			return this;
		},
		addF: function self() {
			var chain = r.MessageChain.__convert(arguments);
			for (var i in chain) this.msg.unshift(chain[i]);
			return this;
		},
		toSource: function self() {
			self.chain = [];
			for (var i in this.msg) {
				self.chain.push(this.msg[i].toSource());
			}
			return self.chain;
		},
		toChainArray: function() {
			return this.msg;
		},
		toString: function self() {
			self.str = "[";
			for (var i in this.msg) {
				self.str += JSON.stringify(this.msg[i].toSource());
			}
			return self.str.replace(/\}\{/gi, "}, {") + "]";
		},

	};

	r.MessageTypeConst = {
		SOURCE: "Source",
		QUOTE: "Quote",
		AT: "At",
		ATALL: "AtAll",
		FACE: "Face",
		PLAIN: "Plain",
		IMAGE: "Image",
		FLASHIMAGE: "FlashImage",
		XML: "Xml",
		JSON2: "Json",
		APP: "App",
		POKE: "Poke",
		PokeType: {
			POKE: "Poke",
			SHOWLOVE: "ShowLove",
			LIKE: "Like",
			HEARTBROKEN: "Heartbroken",
			SIXSIXSIX: "SixSixSix",
			FANGDAZHAO: "FangDaZhao"
		}
	};

	r.MessageType = {
		Source: (function self() {
			self.r = function(id, time) {
				this.id = id ? id: null;
				this.time = time ? time: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.SOURCE,
				getId: function() {
					return this.id;
				},
				getTime: function() {
					return this.time;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.SOURCE,
						id: this.id,
						time: this.time
					};
				},
			}
			return self.r;
		} ()),
		Quote: (function self() {
			self.r = function(id, senderId, groupId, origin) {
				this.id = id ? id: null;
				this.groupId = groupId ? groupId: null;
				this.senderId = senderId ? senderId: null;
				this.origin = origin ? r.MessageChain.build([origin]) : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.QUOTE,
				getId: function() {
					return this.id;
				},
				getSenderId: function() {
					return this.senderId;
				},
				getGroupId: function() {
					return this.groupId;
				},
				getOrigin: function() {
					return this.origin;
				},
				toSource: function() {
					return {
						id: r.MessageTypeConst.QUOTE,
						senderId: this.senderId,
						groupId: this.groupId,
						origin: this.origin.toSource()
					};
				},
			}
			return self.r;
		} ()),
		At: (function self() {
			self.r = function(target, display, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.AT,
					target: (target instanceof r.MessageSender) ? target.getId() : Number(target),
					display: display
				});
				this.target = target ? target: null;
				this.display = display ? display: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.AT,
				getTarget: function() {
					return this.target;
				},
				getDisplayText: function() {
					return this.display;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.AT,
						target: this.target,
						display: this.display
					};
				},
			}
			return self.r;
		} ()),
		AtAll: (function self() {
			self.r = function(flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.ATALL
				})
			}
			self.r.prototype = {
				type: r.MessageTypeConst.ATALL,
				toSource: function() {
					return {
						type: r.MessageTypeConst.ATALL
					};
				},
			}
			return self.r;
		} ()),
		Face: (function self() {
			self.r = function(faceId, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.FACE,
					faceId: faceId
				});
				this.faceId = faceId ? faceId: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.FACE,
				getFaceId: function() {
					return this.faceId;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.FACE,
						faceId: this.faceId,
					}
				},
			}
			return self.r;
		} ()),
		Plain: (function self() {
			self.r = function(text, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.PLAIN,
					text: text,
				});
				this.text = text ? String(text) : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.PLAIN,
				getText: function() {
					return this.text;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.PLAIN,
						text: this.text,
					};
				},
			}
			return self.r;
		} ()),
		Image: (function self() {
			self.r = function(imageId, url, path, flag) {
				if (!flag && arguments.length) return (function() {
					return JSON.stringify({
						type: r.MessageTypeConst.IMAGE,
						imageId: imageId,
						url: url,
						path: path == null ? null: path
					});
				} ());
				this.imageId = imageId ? imageId: null;
				this.url = url ? url: null;
				this.path = path ? path: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.IMAGE,
				getImageId: function() {
					return this.imageId;
				},
				getUrl: function() {
					return this.url;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.IMAGE,
						imageId: this.imageId,
						url: this.url,
						path: this.path == null ? null: this.path
					};
				},
			}
			return self.r;
		} ()),
		FlashImage: (function self() {
			self.r = function(imageId, url, path, flag) {
				if (!flag && arguments.length) return (function() {
					return JSON.stringify({
						type: r.MessageTypeConst.IMAGE,
						imageId: imageId == null ? null: imageId,
						url: url == null ? null: url,
						path: path == null ? null: path
					});
				} ());
				this.imageId = imageId ? imageId: null;
				this.url = url ? url: null;
				this.path = path ? path: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.FLASHIMAGE,
				getImageId: function() {
					return this.imageId;
				},
				getUrl: function() {
					return this.url;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.IMAGE,
						imageId: this.imageId == null ? null: this.imageId,
						url: this.url == null ? null: this.url,
						path: this.path == null ? null: this.path
					};
				},
			}
			return self.r;
		} ()),
		Xml: (function self() {
			self.r = function(xml, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.XML,
					xml: xml
				});
				this.xml = xml ? xml: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.XML,
				getXml: function() {
					return this.xml;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.XML,
						xml: this.xml
					};
				},
			}
			return self.r;
		} ()),
		Json2: (function self() {
			self.r = function(json, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.JSON2,
					json: json
				});
				this.json = json ? json: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.JSON2,
				getJson: function() {
					return j;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.JSON2,
						json: this.json
					};
				},
			}
			return self.r;
		} ()),
		App: (function self() {
			self.r = function(app, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.APP,
					content: app
				});
				this.app = app ? app: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.APP,
				getApp: function() {
					return this.app;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.APP,
						content: this.app
					};
				},
			}
			return self.r;
		} ()),
		Poke: (function self() {
			self.r = function(name, flag) {
				if (!flag && arguments.length) return JSON.stringify({
					type: r.MessageTypeConst.POKE,
					name: name
				});
				this.name = name ? name: null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.POKE,
				getName: function() {
					return this.name;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.POKE,
						name: this.name
					};
				},
			}
			return self.r;
		} ()),
	};
	r.EventTypeConst = {
		BOT_ONLINE: "BotOnlineEvent",
		BOT_OFFLINE: "BotOfflineEventActive",
		BOT_OFFLINE_FORCE: "BotOfflineEventForce",
		BOT_OFFLINE_DROPPED: "BotOfflineEventDropped",
		BOT_RELOGIN: "BotReloginEvent",
		GROUP_RECALL: "GroupRecallEvent",
		FRIEND_RECALL: "FriendRecallEvent",
		BOT_GROUP_PERMISSION_CHANGE: "BotGroupPermissionChangeEvent",
		BOT_MUTE: "BotMuteEvent",
		BOT_UNMUTE: "BotUnmuteEvent",
		BOT_JOIN_GROUP: "BotJoinGroupEvent",
		GROUP_NAME_CHANGE: "GroupNameChangeEvent",
		GROUP_ENTRANCE_ANN_CHANGE: "GroupEntranceAnnouncementChangeEvent",
		GROUP_MUTE_ALL: "GroupMuteAllEvent",
		GROUP_ALLOW_ANONYMOUS_CHAT: "GroupAllowAnonymousChatEvent",
		GROUP_ALLOW_CONFESS_TALK: "GroupAllowConfessTalkEvent",
		GROUP_ALLOW_MEMBER_INVITE: "GroupAllowMemberInviteEvent",
		GROUP_MEMBER_JOIN: "MemberJoinEvent",
		GROUP_MEMBER_KICK: "MemberLeaveEventKick",
		GROUP_MEMBER_QUIT: "MemberLeaveEventQuit",
		GROUP_MEMBER_NAME_CHANGE: "MemberCardChangeEvent",
		GROUP_MEMBER_FAME_CHANHE: "MemberSpecialTitleChangeEvent",
		GROUP_MEMBER_PERMISSION_CHANGE: "MemberPermissionChangeEvent",
		GROUP_MEMBER_MUTE: "MemberMuteEvent",
		GROUP_MEMBER_UNMUTE: "MemberUnmuteEvent",
		NEW_FRIEND_REQUEST: "NewFriendRequestEvent",
		NEW_MEMBER_JOIN_REQUEST: "MemberJoinRequestEvent",
	},
	r.EventType = {
		BotOnlineEvent: (function self() {
			self.r = function(json) {
				this.id = json.qq;
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_ONLINE,
				getId: function() {
					return this.id;
				}
			}
			return self.r;
		} ()),
		BotOfflineEvent: (function self() {
			self.r = function(json) {
				this.id = json.qq;
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_OFFLINE,
				getId: function() {
					return this.id;
				}
			}
			return self.r;
		} ()),
		BotOfflineEventForce: (function self() {
			self.r = function(json) {
				this.id = json.qq;
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_OFFLINE_FORCE,
				getId: function() {
					return this.id;
				}
			}
			return self.r;
		} ()),
		BotOfflineEventDropped: (function self() {
			self.r = function(json) {
				this.id = json.qq;
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_OFFLINE_DROPPED,
				getId: function() {
					return this.id;
				}
			}
			return self.r;
		} ()),
		BotReloginEvent: (function self() {
			self.r = function(json) {
				this.id = json.qq;
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_RELOGIN,
				getId: function() {
					return this.id;
				}
			}
			return self.r;
		} ()),
		GroupRecallEvent: (function self() {
			self.r = function(json) {
				this.senderId = json.authorId;
				this.messageId = json.messageId;
				this.time = json.time;
				this.group = new r.GroupInfo(json.group);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_RECALL,
				getSenderId: function() {
					return this.senderId;
				},
				getMessageId: function() {
					return this.messageId;
				},
				getTime: function() {
					return this.time;
				},
				getGroup: function() {
					return this.group;
				},
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		FriendRecallEvent: (function self() {
			self.r = function(json) {
				this.senderId = json.authorId;
				this.messageId = json.messageId;
				this.time = json.time;
			}
			self.r.prototype = {
				type: r.EventTypeConst.FRIEND_RECALL,
				getSenderId: function() {
					return this.senderId;
				},
				getMessageId: function() {
					return this.messageId;
				},
				getTime: function() {
					return this.time;
				},
			}
			return self.r;
		} ()),
		BotGroupPermissionChangeEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.group = new r.GroupInfo(json.group);
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_GROUP_PERMISSION_CHANGE,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getGroup: function() {
					return this.group;
				},
			}
			return self.r;
		} ()),
		BotMuteEvent: (function self() {
			self.r = function(json) {
				this.duration = json.durationSeconds;
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_MUTE,
				getDuration: function() {
					return this.duration;
				},
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		BotUnmuteEvent: (function self() {
			self.r = function(json) {
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_UNMUTE,
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		BotJoinGroupEvent: (function self() {
			self.r = function(json) {
				this.group = new r.GroupInfo(json.group);
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_JOIN_GROUP,
				getGroup: function() {
					return this.group;
				},
			}
			return self.r;
		} ()),
		GroupNameChangeEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.group = new r.GroupInfo(json.group);
				this.isByBot = json.isByBot;
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_NAME_CHANGE,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getGroup: function() {
					return this.group;
				},
				isChangedByBot: function() {
					return this.isByBot;
				}
			}
			return self.r;
		} ()),
		GroupEntranceAnnouncementChangeEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.group = new r.GroupInfo(json.group);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_ENTRANCE_ANN_CHANGE,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getGroup: function() {
					return this.group;
				},
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		GroupMuteAllEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.group = new r.GroupInfo(json.group);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MUTE_ALL,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getGroup: function() {
					return this.group;
				},
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		MemberJoinEvent: (function self() {
			self.r = function(json) {
				this.member = new r.MessageSender(json.member);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_JOIN,
				getMember: function() {
					return this.member;
				},
			}
			return self.r;
		} ()),
		MemberLeaveEventKick: (function self() {
			self.r = function(json) {
				this.member = new r.MessageSender(json.member);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_KICK,
				getTarget: function() {
					return this.member;
				},
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		MemberLeaveEventQuit: (function self() {
			self.r = function(json) {
				this.member = new r.MessageSender(json.member);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_QUIT,
				getMember: function() {
					return this.member;
				},
			}
			return self.r;
		} ()),
		MemberCardChangeEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.member = new r.MessageSender(json.member);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_NAME_CHANGE,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getTarget: function() {
					return this.member;
				},
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		} ()),
		MemberSpecialTitleChangeEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.member = new r.MessageSender(json.member);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_FAME_CHANHE,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getTarget: function() {
					return this.member;
				},
			}
			return self.r;
		} ()),
		MemberPermissionChangeEvent: (function self() {
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.member = new r.MessageSender(json.member);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_PERMISSION_CHANGE,
				getBefore: function() {
					return this.before;
				},
				getAfter: function() {
					return this.after;
				},
				getTarget: function() {
					return this.member;
				},
			}
			return self.r;
		} ()),
		MemberMuteEvent: (function self() {
			self.r = function(json) {
				this.duration = json.durationSeconds;
				this.member = new r.MessageSender(json.member);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_MUTE,
				getDuration: function() {
					return this.duration;
				},
				getOperator: function() {
					return this.operator;
				},
				getTarget: function() {
					return this.member;
				},
			}
			return self.r;
		} ()),
		MemberUnmuteEvent: (function self() {
			self.r = function(json) {
				this.member = new r.MessageSender(json.member);
				this.operator = new r.MessageSender(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_UNMUTE,
				getOperator: function() {
					return this.operator;
				},
				getTarget: function() {
					return this.member;
				},
			}
			return self.r;
		} ()),
		//匿名，坦白说和允许群组成员邀请事件没啥用，就不写了
		//放在这的原因是防止hookEvent时出现找不到对象的错误。
		GroupAllowAnonymousChatEvent: function() {},
		GroupAllowConfessTalkEvent: function() {},
		GroupAllowMemberInviteEvent: function() {},
		NewFriendRequestEvent: (function self() {
			self.r = function(json, sessionKey) {
				this.sessionKey = sessionKey;
				this.eventId = json.eventId;
				this.fromId = json.fromId;
				this.groupId = json.groupId;
				this.nickname = json.nick;
			}
			self.r.prototype = {
				type: r.EventTypeConst.NEW_FRIEND_REQUEST,
				getEventId: function() {
					return this.eventId;
				},
				getFromId: function() {
					return this.fromId;
				},
				getGroupId: function() {
					return this.groupId;
				},
				getNickname: function() {
					return this.nickname;
				},
				toIArg: function() {
					return {
						eventId: this.eventId,
						fromId: this.fromId,
						groupId: this.groupId
					}
				},
				accept: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 0);
				},
				reject: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 1);
				},
				block: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 2);
				},
			}
			return self.r;
		} ()),
		MemberJoinRequestEvent: (function self() {
			self.r = function(json, sessionKey) {
				this.sessionKey = sessionKey;
				this.eventId = json.eventId;
				this.fromId = json.fromId;
				this.groupId = json.groupId;
				this.groupName = json.groupName;
				this.nickname = json.nick;
			}
			self.r.prototype = {
				type: r.EventTypeConst.NEW_MEMBER_JOIN_REQUEST,
				getEventId: function() {
					return this.eventId;
				},
				getFromId: function() {
					return this.fromId;
				},
				getGroupId: function() {
					return this.groupId;
				},
				getGroupName: function() {
					return this.groupName;
				},
				getNickname: function() {
					return this.nickname;
				},
				toIArg: function() {
					return {
						eventId: this.eventId,
						fromId: this.fromId,
						groupId: this.groupId
					}
				},
				accept: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 0);
				},
				reject: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 1);
				},
				ignore: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 2);
				},
				ignoreAndBlock: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 3);
				},
				rejectAndBlock: function() {
					r.__protocol.handleFriendRequest(this.sessionKey, this.eventId, this.fromId, this.groupId, 4);
				},
			}
			return self.r;
		} ()),
	};
	//通讯接口，不应包含任何消息处理
	r.__protocol = {
		//发送群组消息，成功返回消息id，失败返回0
		sendGroupMessage: function(sessionKey, target, messageChain, quoteId) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(target),
					messageChain: messageChain
				};
				if (quoteId != null) params.quote = Number(quoteId);
				var result = JSON.parse(r.utils.http.post(r.server + "sendGroupMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]));
				if (result.code == 0) {
					r.Log.i("Message have sent(groupId=" + target + ", messageId=" + result.messageId + ")");
					return result.messageId;
				} else {
					r.Log.e("Error while sending group message. (groupId=" + target + ", messageChain=" + messageChain.toString() + ")\n" + result.msg);
					return 0;
				}
			} catch(error) {
				throw error;
			}
		},
		//发送好友消息，成功返回消息id，失败返回0
		sendFriendMessage: function(sessionKey, target, messageChain, quoteId) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(target),
					messageChain: messageChain
				};
				if (quoteId != null) params.quote = Number(quoteId);
				var result = JSON.parse(r.utils.http.post(r.server + "sendFriendMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]));
				if (result.code == 0) {
					r.Log.i("Message have sent(friendId=" + target + ", messageId=" + result.messageId + ")");
					return result.messageId;
				} else {
					r.Log.e("Error while sending group message. (groupId=" + target + ", messageChain=" + messageChain.toString() + ")\n" + result.msg);
					return 0;
				}
			} catch(error) {
				throw error;
			}
		},
		//发送临时消息，成功返回消息id，失败返回0
		sendTempMessage: function(sessionKey, target, from, messageChain, quoteId) {
			try {
				var params = {
					sessionKey: sessionKey,
					qq: target,
					group: from,
					messageChain: messageChain
				};
				if (quoteId != null) params.quote = Number(quoteId);
				var p = r.utils.http.post(r.server + "sendTempMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Message have sent(target=" + target + ", messageId=" + result.messageId + ")");
					return result.messageId;
				} else {
					r.Log.e("Error while sending temp message. (target=" + target + ", messageChain=" + messageChain.toString() + ")\n" + result.msg);
					return 0;
				}
			} catch(e) {
				r.Log.e("Error while sending temp message. (target=" + target + ", messageChain=" + messageChain.toString() + ")\n" + e);
				return 0;
			}
		},
		//撤回，成功返回消息id，失败返回0
		recall: function(sessionKey, target) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(target)
				};
				var p = r.utils.http.post(r.server + "recall", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Message have recalled(messageId=" + target + ")");
					return target;
				} else {
					r.Log.e("Error while recalling a message. (messageId=" + target + ")\n" + result.msg);
					return 0;
				}
			} catch(e) {
				r.Log.e("Error while recalling a message. (messageId=" + target + ")\n" + e);
				return 0;
			}
		},
		//发送好友消息，成功返回消息id，失败返回0
		/*getCachedMessage: function(sessionKey, messageId) {
			try {
				var p = r.utils.http.get(r.server + "messageFromId?sessionKey=" + sessionKey + "&id=" + messageId);
				var result = JSON.parse(p);
				if (result.code == 5) {
					r.Log.e("Message is not cached or messageid is invaild. " + result.msg + "(messageId=" + messageId + ")");
					return new r.MessageChain();
				} else {
					return r.MessageChain._build(result.messageChain);
				}
			} catch(e) {
				r.Log.e("Error while fetching a cached message.(messageId=" + messageId + ")\n" + e);
				return new r.MessageChain();
			}
		},*/
		//获取好友列表，失败返回空Array
		getFriendList: function(sessionKey) {
			try {
				var p = r.utils.http.get(r.server + "friendList?sessionKey=" + sessionKey);
				if (p.substr(0, 1) != "[") {
					r.Log.e("Error while fetching friend list: " + JSON.parse(p).msg);
					return [];
				} else {
					return eval("(" + p + ")");
				}
			} catch(e) {
				r.Log.e("Error while fetching friend list: " + e);
			}
		},
		//获取群组列表，失败返回空Array
		getGroupList: function(sessionKey) {
			try {
				var p = r.utils.http.get(r.server + "groupList?sessionKey=" + sessionKey);
				if (p.substr(0, 1) != "[") {
					return [];
					r.Log.e("Error while fetching group list: " + JSON.parse(p).msg);
				} else {
					return eval("(" + p + ")");
				}
			} catch(e) {
				r.Log.e("Error while fetching group list: " + e);
			}
		},
		//获取群成员列表，失败返回空Array
		getGroupMemberList: function(sessionKey, id) {
			try {
				var p = r.utils.http.get(r.server + "memberList?sessionKey=" + sessionKey + "&target=" + id);
				if (p.substr(0, 1) != "[") {
					return [];
					r.Log.e("Error while fetching group member list(groupId=" + id + "): " + JSON.parse(p).msg);
				} else {
					return eval("(" + p + ")");
				}
			} catch(e) {
				r.Log.e("Error while fetching group member list: " + e);
			}
		},
		mute: function(sessionKey, group, target, time) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(group),
					memberId: Number(target),
					time: Number(Math.min(Math.max(0, time), 2591999))
				};
				var p = r.utils.http.post(r.server + "mute", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Group mute member(groupId=" + group + ", target=" + target + ", time=" + time + "s)");
				} else {
					r.Log.e("Error while calling mute group member(groupId=" + group + ", target=" + target + ", time=" + time + "s)\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while calling mute group member(groupId=" + group + ", target=" + target + ", time=" + time + "s)\n" + e);
			}
		},
		unmute: function(sessionKey, group, target) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(group),
					memberId: Number(target)
				};
				var p = r.utils.http.post(r.server + "unmute", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Group unmute member(groupId=" + group + ", target=" + target + ")");
				} else {
					r.Log.e("Error while calling unmute group member(groupId=" + group + ", target=" + target + ")\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while calling unmute group member(groupId=" + group + ", target=" + target + ")\n" + e);
			}
		},
		muteAll: function(sessionKey, group) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(group)
				};
				var p = r.utils.http.post(r.server + "muteAll", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Group mute all(groupId=" + group + ")");
				} else {
					r.Log.e("Error while calling mute group all(groupId=" + group + ")\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while calling mute group all(groupId=" + group + ")\n" + e);
			}
		},
		unmuteAll: function(sessionKey, group) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(group)
				};
				var p = r.utils.http.post(r.server + "unmuteAll", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Group unmute all(groupId=" + group + ")");
				} else {
					r.Log.e("Error while calling unmute group all(groupId)=" + group + ")\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while calling unmute group all(groupId=" + group + ")\n" + e);
			}
		},
		kick: function(sessionKey, group, target, msg) {
			try {
				var params = {
					sessionKey: sessionKey,
					target: Number(group),
					memberId: Number(target),
					msg: msg == null ? "您已被移除群聊": String(msg)
				};
				var p = r.utils.http.post(r.server + "kick", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i("Group kick member(groupId=" + group + ", target=" + target + ")");
				} else {
					r.Log.e("Error while calling kicl group member(groupId=" + group + ", target=" + target + ")\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while calling kick group member(groupId=" + group + ", target=" + target + ")\n" + e);
			}
		},
		handleFriendRequest: function(sessionKey, eventId, fromId, groupId, isAccept, msg) {
			try {
				var params = {
					sessionKey: sessionKey,
					eventId: eventId,
					fromId: fromId,
					groupId: groupId,
					operate: isAccept,
					message: (msg == null ? "": msg)
				}
				var p = r.utils.http.post(r.server + "/resp/newFriendRequestEvent", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i(((isAccept == 0) ? "Accepted": "Rejected") + "a new friend request.(qq=" + fromId + ((groupId == 0) ? "": (", from=" + groupId)) + ")");
				} else {
					r.Log.e("Error while handling new friend request(qq=" + fromId + ((groupId == 0) ? "": (", from=" + groupId)) + ")\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while handling new friend request(qq=" + fromId + ((groupId == 0) ? "": (", from=" + groupId)) + ")\n" + e);
			}
		},
		handleMemberJoinRequest: function(sessionKey, eventId, fromId, groupId, isAccept, msg) {
			try {
				var params = {
					sessionKey: sessionKey,
					eventId: eventId,
					fromId: fromId,
					groupId: groupId,
					operate: isAccept,
					message: (msg == null ? "": msg)
				};
				var p = r.utils.http.post(r.server + "/resp/memberJoinRequestEvent", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.i(((isAccept == 0) ? "Accepted": "Rejected") + "a member join request.(qq=" + fromId + ", group=" + groupId + ")");
				} else {
					r.Log.e("Error while handling member join request(qq=" + fromId + ", group=" + groupId + ")\n" + result.msg);
				}
			} catch(e) {
				r.Log.e("Error while handling member join request(qq=" + fromId + ", group=" + groupId + ")\n" + e);
			}
		},
	};
	r.utils = {
		http: {
			getInputStream: function(url, headers) {
				try {
					var urlConnect = new java.net.URL(url);
					var connection = urlConnect.openConnection();
					if (headers != null) {
						for (var i in headers) {
							connection.setRequestProperty(headers[i][0], headers[i][1]);
						}
					}
					connection.setDoInput(true);
					connection.connect();
					return [connection.getContentLength(), connection.getInputStream()];
				} catch(e) {
					throw e;
					return [0, 0];
				}
			},
			post: function(url, param, headers) {
				//r.Log.i("POST: " + url + "\nparams: " + _toSource(param));
				var result = "";
				var bufferedReader = null;
				var printWriter = null;
				try {
					var urlConnect = new java.net.URL(url);
					var connection = urlConnect.openConnection();
					for (var i in headers) {
						connection.setRequestProperty(headers[i][0], headers[i][1]);
					}
					connection.setConnectTimeout(12000);
					connection.setDoOutput(true);
					connection.setDoInput(true);
					printWriter = new java.io.PrintWriter(connection.getOutputStream());
					printWriter.print(param);
					printWriter.flush();
					bufferedReader = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
					var line;
					while ((line = bufferedReader.readLine()) != null) {
						result += line;
					}
					if (bufferedReader != null) bufferedReader.close();
					if (printWriter != null) printWriter.close();
				} catch(error) {
					if (bufferedReader != null) bufferedReader.close();
					if (printWriter != null) printWriter.close();
					throw error;
				}
				return result;
			},
			get: function(url, headers) {
				var result = "";
				var bufferedReader = null;
				try {
					var urlConnect = new java.net.URL(url);
					var connection = urlConnect.openConnection();
					for (var i in headers) {
						connection.setRequestProperty(headers[i][0], headers[i][1]);
					}
					connection.setConnectTimeout(12000);
					connection.setDoInput(true);
					bufferedReader = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
					var line;
					while ((line = bufferedReader.readLine()) != null) {
						result += (line + "\n");
					}
					if (bufferedReader != null) bufferedReader.close();
				} catch(error) {
					throw error;
					if (bufferedReader != null) bufferedReader.close();
				}
				return result;
			},
		},
		file: {
			STRING: 1,
			STREAM: 2,
			create: function(storage) {
				storage = storage.split(java.io.File.separator);
				if ((/\./i).test(storage[storage.length - 1]) && !(/^\./i).test(storage[storage.length - 1])) {
					var path = "";
					for (var i in storage) path += ((i == storage.length - 1) ? ("") : (storage[i]) + ((i == storage.length - 1) ? ("") : (java.io.File.separator)));
					var file = path + storage[storage.length - 1];
					var pathF = new java.io.File(path);
					if (!pathF.isDirectory() || !pathF.exists()) pathF.mkdirs();
					var fileF = new java.io.File(file);
					if (!fileF.isFile() || !fileF.exists()) fileF.createNewFile();
				} else {
					var path = "";
					for (var i in storage) path += ((storage[i]) + ((i == storage.length - 1) ? ("") : (java.io.File.separator)));
					var file = new java.io.File(path);
					if (!file.isDirectory() || !file.exists()) file.mkdirs();
				}
			},
			remove: function(storage) {
				var path = new java.io.File(storage);
				if (path.exists()) path.delete();
			},
			read: function(path, mode) {
				var file = new java.io.File(path);
				if (file.exists()) {
					try {
						var inputStream = new java.io.FileInputStream(file);
						if (mode == this.STREAM) {
							return inputStream;
							return new java.io.ByteArrayInputStream(byteArray);
						} else {
							var inputStreamReader = new java.io.InputStreamReader(inputStream);
							var bufferedReader = new java.io.BufferedReader(inputStreamReader);
							var stringBuffer = new java.lang.StringBuffer();
							var line = null;
							while ((line = bufferedReader.readLine()) != null) {
								stringBuffer.append(line);
								stringBuffer.append("\n");
							}
							inputStreamReader.close();
							return stringBuffer.toString();
						}
					} catch(error) {
						throw error;
						return "";
					}
				} else {
					throw ("File not exist: " + path);
					return "";
				}
			},
			writeString: function(path, string, isCover) {
				try {
					var file = new java.io.File(path);
					if (!file.exists()) {
						file.createNewFile();
						isCover = true;
					}
					if (isCover == false) {
						return;
					}
					var fileWriter = new java.io.FileWriter(file);
					fileWriter.write(string);
					fileWriter.close();
				} catch(error) {
					throw error;
				}
			},
			writeStream: function(path, inputStream, isCover, isInputStreamClose) {
				try {
					var file = new java.io.File(path);
					if (!file.exists()) {
						file.createNewFile();
						isCover = true;
					}
					if (isCover == false) {
						if (isInputStreamClose) inputStream.close();
						return;
					}
					var buffer = new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096);
					var outputStream = new java.io.FileOutputStream(file);
					var len = -1;
					while ((len = inputStream.read(buffer)) != -1) {
						outputStream.write(buffer, 0, len);
					}
					if (isInputStreamClose) inputStream.close();
					outputStream.flush();
					outputStream.close();
				} catch(error) {
					throw error;
				}
			},
			append: function(path, appendString) {
				try {
					var randomAccessFile = new java.io.RandomAccessFile(path, "rw");
					randomAccessFile.seek(randomAccessFile.length());
					randomAccessFile.write(java.lang.String(appendString).getBytes());
					randomAccessFile.close();
				} catch(error) {
					throw error;
				}
			}
		}

	};
	r.Log = {
		v: function(msg) {
			if (r.host == r.ANDROID_AUTOJS) {
				console.verbose(msg);
			} else {
				java.lang.System.out.println("[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime()) + "][V] " + String(msg));
			}

		},
		w: function(msg) {
			if (r.host == r.ANDROID_AUTOJS) {
				console.warn(msg);
			} else {
				java.lang.System.out.println("[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime()) + "][\u001B[33mW\u001B[0m] " + String(msg));
			}

		},
		i: function(msg) {
			if (r.host == r.ANDROID_AUTOJS) {
				console.info(msg);
			} else {
				java.lang.System.out.println("[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime()) + "][\u001B[32mI\u001B[0m] " + String(msg));
			}

		},
		e: function(msg) {
			if (r.host == r.ANDROID_AUTOJS) {
				console.error(msg);
			} else {
				java.lang.System.out.println("[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime()) + "][\u001B[31mE\u001B[0m] " + (function() {
					if (msg instanceof Error) {
						return "Error: " + msg.toString() + "(" + msg.lineNumber + ")";
					} else {
						return msg;
					}
				} ()) + "\u001B[0m");
			}

		},
	};
	
	return r;
} ()
