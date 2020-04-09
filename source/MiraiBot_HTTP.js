/*
	mirai-rhinojs-sdk
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
	if (__g_modules.indexOf("NetworkUtils") == -1) {
		throw "Couldn't find module \"NetworkUtils\" in module list.";
	}
	var r = function(server, authKey, qqnum) {
		this.server = server;
		this.auth = authKey;
		this.qqnum = qqnum;
		this.sessions = [];
	}
	r.module = "Mirai";
	r.__version = "v1.4.1_alpha";
	r.prototype = {
		setAuthKey: function(k) {
			if (key && typeof(key) == "string") this.key = k;
		},
		setSeverhost: function(s) {
			if (s && typeof(s) == "string") this.server = s;
		},
		connect: function() {
			if (this.server == null || this.auth == null) throw "Server host or authenticate key isnt set";
			var result = r.auth(this.server, this.auth);
			if (result.code != 0) {
				throw "Authenticate key is invaild.";
			} else {
				this.sessions.push(result.session);
				var session = new r.Session(result.session);
				session.setAttributes({
					server: this.server,
					qqnum: this.qqnum,
					authKey: this.auth
				});
				return session;
			}
		}
	}
	r.auth = function(server, key) {
		return JSON.parse(NetworkUtils.post(server + "auth", JSON.stringify({
			authKey: key
		})));
	}

	r.Session = function(id) {
		this.sessionid = id;
		this.qqnum = null;
		this.server = null;
		this.authKey = null;

		this.hooksize = 10;

		this.verifyThreadStatus = 0;
		this.verifyThreadLoopInterval = 1500000;
		this.verifyLoopThread = null;

		this.listenThreadStatus = 0;
		this.listenThreadLoopInterval = 200;
		this.listenLoopThread = null;

		this.listener = null;
	}
	r.Session.prototype = {
		getSessionId: function() {
			return this.sessionid;
		},
		setSessionId: function(id) {
			this.sessionid = id;
			if (this.verifyThreadStatus == 1) this.startVerifyThread();
			if (this.listenThreadStatus == 1) this.startListen();
		},
		setAttributes: function(attributeList) {
			this.qqnum = attributeList.qqnum ? attributeList.qqnum: null;
			this.server = attributeList.server ? attributeList.server: null;
			this.authKey = attributeList.authKey ? attributeList.authKey: null;
		},
		getQQNumber: function(id) {
			return this.qqnum;
		},
		setMessageListener: function(listener) {
			this.listener = listener;
		},
		setVerifyThreadLoopInterval: function(ms) {
			this.verifyThreadLoopInterval = ms;
			if (this.verifyThreadStatus == 1) this.startVerifyThread();
		},
		setListenThreadLoopInterval: function(ms) {
			this.listenThreadLoopInterval = ms;
			if (this.listenThreadStatus == 1) this.startListen();
		},
		setHookSize: function(size) {
			this.hooksize = size;
		},
		reAuth: function() {
			var result = r.auth(this.server, this.authKey);
			if (result.code != 0) {
				throw "Failed to reauthenticate.";
			} else {
				this.setSessionId(result.session);
			}
		},
		startVerifyThread: function() {
			if (this.verifyLoopThread != null && this.verifyThreadStatus == 1) {
				this.verifyLoopThread.interrupt();
				this.verifyLoopThread = null;
			}
			var interval = this.verifyThreadLoopInterval;
			var sessionid = this.sessionid;
			var qqnum = this.qqnum;
			var server = this.server;

			this.verifyLoopThread = new java.lang.Thread(new java.lang.Runnable({
				run: function() {
					try {
						while (!java.lang.Thread.interrupted()) {
							var p = NetworkUtils.post(server + "verify", JSON.stringify({
								sessionKey: sessionid,
								qq: qqnum
							}));
							var result = JSON.parse(p);
							switch (result.code) {
							case 1:
								throw "Authenticate key is invaild";
								break;
							case 2:
								throw "Bot " + qqnum + " is not existed.";
								break;
							case 3:
								throw "Session is invaild or not existed.";
								break;
							case 4:
								throw "Session is unauthenticated.";
								break;
							case 10:
								throw "Permission denied for bot" + qqnum;
								break;
							case 0:
								r.Log.i("Session is verified: " + sessionid);
								break;
							}
							java.lang.Thread.sleep(interval);
						}
						return;
					} catch(e) {
						if (! (/InterruptedException/i).test(e.toString())) {
							r.Log.e(e);
						}
					}
				},
			}));
			this.verifyThreadStatus = 1;
			this.verifyLoopThread.start();

		},
		stopVerifyThread: function() {
			this.verifyThreadStatus = 0;
			if (this.verifyLoopThread) this.verifyLoopThread.interrupt();
			this.verifyLoopThread = null;
		},

		startListen: function() {
			if (this.listenLoopThread != null && this.listenThreadStatus == 1) {
				this.listenLoopThread.interrupt();
				this.listenLoopThread = null;
			}
			var server = this.server;
			var sessionid = this.sessionid;
			var qqnum = this.qqnum;
			var interval = this.listenThreadLoopInterval;
			var listener = this.listener;
			var hooksize = this.hooksize;

			this.listenLoopThread = new java.lang.Thread(new java.lang.Runnable({
				run: function() {
					try {
						while (!java.lang.Thread.interrupted()) {
							var p = JSON.parse(NetworkUtils.get(server + "fetchMessage?sessionKey=" + sessionid + "&count=" + hooksize));
							if(p.code != 0) {
								listener.listenerobj.hookError(String("Error while hooking messages: {$msg}({$code})").replace("{$code}", p.code).replace("{$msg}", p.msg));
							} else if(p.data.length != 0){
								p = p.data[0];
								switch (p.type) {
									case "GroupMessage": listener.listenerobj.hookGroupMessage(new r.GroupSenderInfo(p.sender), r.MessageChain._build(p.messageChain)); break;
									case "FriendMessage": listener.listenerobj.hookFriendMessage(new r.FriendSenderInfo(p.sender), r.MessageChain._build(p.messageChain)); break;
									default: listener.listenerobj.hookEvent(new r.EventType[p.type](p)); break;
								}
							}
							java.lang.Thread.sleep(interval);
						}
						return;
					} catch(error) {
						if (! (/InterruptedException/i).test(error.toString())) {
							listener.listenerobj.hookError(error);
						}
					}
				},
			}));
			this.listenThreadStatus = 1;
			this.listenLoopThread.start();
		},

		stopListen: function() {
			this.listenThreadStatus = 0;
			if (this.listenLoopThread) this.listenLoopThread.interrupt();
			this.listenLoopThread = null;
		},

		release: function() {
			var p = NetworkUtils.post(server + "release", JSON.stringify({
				sessionKey: this.sessionid,
				qq: this.qqnum
			}));
			var result = JSON.parse(p);
			if (result.code == 0) {
				this.stopVerifyThread();
				this.stopListen();
				r.Log.i("Session \"" + this.sessionid + "\" is released.");
			} else {
				r.Log.i("Session \"" + this.sessionid + "\" is not released.");
			}
		},
		sendGroupMessage: function(target, messageChain, quoteId) {
			try {
				var params = {
					sessionKey: this.sessionid,
					target: Number(target),
					messageChain: (messageChain instanceof r.MessageChain) ? messageChain.toSource() : [messageChain.toSource()]
				};
				if (quoteId != null) params.quote = Number(quoteId);
				var p = NetworkUtils.post(server + "sendGroupMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				if(p.length == 0) p = "{}";
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.v("Message have sent(group=" + target + ", messageId=" + result.messageId + ")");
					return result.messageId;
				} else {
					r.Log.e("Error while sending group message. Target=" + target + ", MessageChain=" + messageChain + "\n" + result.msg);
					return 0;
				}
			} catch(e) {
				r.Log.e("Error while sending group message. Target=" + target + ", MessageChain=" + messageChain + "\n" + e);
				return 0;
			}
		},
		sendFriendMessage: function(target, messageChain) {
			try {
				var params = {
					sessionKey: this.sessionid,
					target: Number(target),
					messageChain: (messageChain instanceof r.MessageChain) ? messageChain.toSource() : [messageChain.toSource()]
				};
				var p = NetworkUtils.post(server + "sendFriendMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				if(p.length == 0) p = "{}";
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.v("Message have sent(friend=" + target + ", messageId=" + result.messageId + ")");
					return result.messageId;
				} else {
					r.Log.e("Error while sending friend message. Target=" + target + ", MessageChain=" + messageChain + "\n" + result.msg);
					return 0;
				}
			} catch(e) {
				r.Log.e("Error while sending friend message. Target=" + target + ", MessageChain=" + messageChain + "\n" + e);
				return 0;
			}
		},
		recall: function(target) {
			try {
				var params = {
					sessionKey: this.sessionid,
					target: Number(target)
				};
				var p = NetworkUtils.post(server + "recall", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				if(p.length == 0) p = "{}";
				var result = JSON.parse(p);
				if (result.code == 0) {
					r.Log.v("Message have recalled(messageId=" + target + ")");
					return target;
				} else {
					r.Log.e("Error while recalling a message. MessageId=" + target + "\n" + result.msg);
					return 0;
				}
			} catch(e) {
				r.Log.e("Error while recalling a message. MessageId=" + target + "\n" + e);
				return 0;
			}
		},
		getCachedMessage: function(messageId) {
			try {
				var p = NetworkUtils.get(server + "messageFromId?sessionKey=" + this.sessionid + "&id=" + messageId);
				var result = JSON.parse(p);
				if (result.code == 5) {
					r.Log.e("Message is not cached or messageid is invaild. " + result.msg + "(messageId=" + messageId + ")");
					return new r.MessageChain();
				} else {
					return r.MessageChain._build(result.messageChain);
				}
			} catch(e) {
				r.Log.e("Error while fetching a cached message. MessageId=" + messageId + "\n" + e);
				return new r.MessageChain();
			}
		}
	}
	r.MessageListener = function(hooks) {
		this.listenerobj = hooks;
	};
	
	r.GroupSenderInfo = (function self(){
		self.r = function(json) {
			this.id = (json == null) ? null : json.id;
			this.name = (json == null) ? null : json.memberName;
			this.permission = (json == null) ? null : json.permission;
			this.group = (json == null) ? null : new r.GroupInfo(json.group);
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
			getGroup: function() {
				return this.group;
			},
			toString: function() {
				return JSON.stringify({
					id: this.id,
					name: this.name,
					permission: this.permission,
					groupInfo: this.group.toString()
				});
			}
		}
		return self.r;
	}());
	r.FriendSenderInfo = (function self(){
		self.r = function(json) {
			this.id = (json == null) ? null : json.id;
			this.name = (json == null) ? null : json.nickname;
		}
		self.r.prototype = {
			getId: function() {
				return this.id;
			},
			getName: function() {
				return this.name;
			},
			toString: function() {
				return JSON.stringify({
					id: this.id,
					name: this.name,
				});
			}
		}
		return self.r;
	}());
	r.GroupInfo = (function self(){
		self.r = function(group) {
			this.id = group.id;
			this.name = group.name;
			this.permission = group.permission;
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
			toString: function() {
				return {
					id: this.id,
					name: this.name,
					permission: this.permission
				}
			}
		}
		return self.r;
	}());
	r.GroupInfo.Permission = {
		OWNER: "OWNER",
		ADMIN: "ADMINISTRATOR",
		MEMBER: "MEMBER",
	}
	r.MessageChain = function(messageChain) {
		this.msg = messageChain ? messageChain : [];
	}
	r.MessageChain._build = function(msg) {
		var chains = [];
		for(var i in msg) {
			switch (msg[i].type) {
				case r.MessageTypeConst.SOURCE: chains.push(new r.MessageType.Source(msg[i].id, msg[i].time)); break;
				case r.MessageTypeConst.QUOTE: chains.push(new r.MessageType.Quote(msg[i].id, msg[i].senderId, msg[i].groupId, r.MessageChain._build(msg[i].origin))); break;
				case r.MessageTypeConst.AT: chains.push(new r.MessageType.At(msg[i].target, msg[i].display)); break;
				case r.MessageTypeConst.ATALL: chains.push(new r.MessageType.AtAll()); break;
				case r.MessageTypeConst.PLAIN: chains.push(new r.MessageType.Plain(msg[i].text)); break;
				case r.MessageTypeConst.FACE: chains.push(new r.MessageType.Face(msg[i].faceId, msg[i].name)); break;
				case r.MessageTypeConst.IMAGE: chains.push(new r.MessageType.Image(msg[i].imageId, msg[i].url)); break;
				case r.MessageTypeConst.FLASHIMAGE: chains.push(new r.MessageType.FlashImage(msg[i].imageId, msg[i].url)); break;
				case r.MessageTypeConst.XML: chains.push(new r.MessageType.Xml(msg[i].xml)); break;
				case r.MessageTypeConst.JSON: chains.push(new r.MessageType.Json(msg[i].json)); break;
				case r.MessageTypeConst.APP: chains.push(new r.MessageType.App(msg[i].content)); break;
				case r.MessageTypeConst.POKE: chains.push(new r.MessageType.Poke(msg[i].name)); break;
				
			}
		}
		return new r.MessageChain(chains);
	};
	r.MessageChain.build = function self() {
		self.chain = [];
		for(var i in arguments) {
			if(arguments[i] instanceof r.MessageChain) {
				for(var i in self.ca = arguments[i].toChainArray()) {
					self.chain.push(self.ca[i]);
				}
			} else {
				self.chain.push(arguments[i]);
			}
		}
		return new r.MessageChain(self.chain);
	};
	r.MessageChain.prototype = {
		length: function() {
			return this.msg.length;
		},
		getMessage: function(type) {
			for(var i in this.msg) {
				if(this.msg[i].type == type) {
					return this.msg[i];
				}
			}
			return new r.MessageType[type]();
		},
		discordMessage: function(type) {
			for(var i in this.msg) {
				if(this.msg[i].type == type) {
					this.msg.splice(i, 1);
				}
			}
			return this;
		},
		addMessage: function self() {
			for(var i in arguments) {
				if(arguments[i] instanceof r.MessageChain) {
					for(var i in self.ca = arguments[i].toChainArray()) {
						this.msg.push(self.ca[i]);
					}
				} else {
					this.msg.push(arguments[i]);
				}
			}
			return this;
		},
		addMessageF: function self() {
			for(var i in arguments) {
				if(arguments[i] instanceof r.MessageChain) {
					for(var i in self.ca = arguments[i].toChainArray()) {
						this.msg.unshift(self.ca[i]);
					}
				} else {
					this.msg.unshift(arguments[i]);
				}
			}
			return this;
		},
		toSource: function self() {
			self.chain = [];
			for(var i in this.msg) {
				self.chain.push(this.msg[i].toSource());
			}
			return self.chain;
		},
		toChainArray: function() {
			return this.msg;
		},
		toString: function self() {
			self.chain = [];
			for(var i in this.msg) {
				self.chain.push(JSON.stringify(this.msg[i].toSource()));
			}
			return self.chain;
		},
		
	};
	r.MessageTypeConst = {SOURCE:"Source", QUOTE: "Quote", AT: "At", ATALL: "AtAll", FACE: "Face", PLAIN: "Plain", IMAGE: "Image", FLASHIMAGE: "FlashImage", XML: "Xml", JSON: "Json", APP: "App", POKE: "Poke", PokeType: {}};
	r.MessageTypeConst.PokeType = {
		POKE: "Poke",
		SHOWLOVE: "ShowLove",
		LIKE: "Like",
		HEARTBROKEN: "Heartbroken",
		SIXSIXSIX: "SixSixSix",
		FANGDAZHAO: "FangDaZhao"
	};
	r.MessageType = {
		Source: (function self(){
			self.r = function(id, time) {
				this.id = id ? id : null;
				this.time = time ? time : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.SOURCE,
				getId: function(){
					return this.id;
				},
				getTime: function(){
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
		}()),
		Quote: (function self(){
			self.r = function(id, senderId, groupId, origin) {
				this.id = id ? id : null;
				this.groupId = groupId ? groupId : null;
				this.senderId = senderId ? senderId : null;
				this.origin = origin ? origin : null;
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
		}()),
		At: (function self(){
			self.r = function(target, display) {
				this.target = target ? target : null;
				this.display = display ? display : null;
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
		}()),
		AtAll: (function self(){
			self.r = function() {}
			self.r.prototype = {
				type: r.MessageTypeConst.ATALL,
				toSource: function() {
					return {type: r.MessageTypeConst.ATALL};
				},
			}
			return self.r;
		}()),
		Face: (function self(){
			self.r = function(faceId, name) {
				this.faceId = faceId ? faceId : null;
				this.name = name ? name : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.FACE,
				getFaceId: function() {
					return this.faceId;
				},
				getName: function() {
					return this.name ? this.name : null;
				},
				toSource: function() {
					var s = {
						type: r.MessageTypeConst.FACE,
						faceId: this.faceId,
					}
					if(this.name) s.name = this.name;
					return s;
				},
			}
			return self.r;
		}()),
		Plain: (function self(){
			self.r = function(text) {
				this.text = text ? String(text) : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.PLAIN,
				getText: function(){
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
		}()),
		Image: (function self(){
			self.r = function(imageId, url, path) {
				this.imageId = imageId ? imageId : null;
				this.url = url ? url : null;
				this.path = path ? path : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.IMAGE,
				getImageId: function(){
					return this.imageId;
				},
				getUrl: function(){
					return this.url;
				},
				toSource: function () {
					var rt = { type: r.MessageTypeConst.IMAGE };
					if(this.imageId) rt.imageId = this.imageId;
					if(this.url) rt.url = this.url;
					if(this.path) rt.path = this.path;
					return rt;
				},
			}
			return self.r;
		}()),
		FlashImage: (function self(){
			self.r = function(imageId, url, path) {
				this.imageId = imageId ? imageId : null;
				this.url = url ? url : null;
				this.path = path ? path : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.FLASHIMAGE,
				getImageId: function(){
					return this.imageId;
				},
				getUrl: function(){
					return this.url;
				},
				toSource: function() {
					var rt = { type: r.MessageTypeConst.FLASHIMAGE };
					if(this.imageId) rt.imageId = this.imageId;
					if(this.url) rt.url = this.url;
					if(this.path) rt.path = this.path;
					return rt;
				},
			}
			return self.r;
		}()),
		Xml: (function self(){
			self.r = function(xml) {
				this.xml = xml ? xml : null;
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
		}()),
		Json: (function self(){
			self.r = function(json) {
				this.json = json ? json : null;
			}
			self.r.prototype = {
				type: r.MessageTypeConst.JSON,
				getJson: function() {
					return this.json;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.JSON,
						json: this.json
					};
				},
			}
			return self.r;
		}()),
		App: (function self(){
			self.r = function(app) {
				this.app = app ? app : null;
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
		}()),
		Poke: (function self(){
			self.r = function(name) {
				this.name = name ? name : null;
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
		}()),
	},
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
		GROUP_MEMBER_UNMUTE: "MemberUnmuteEvent"
	},
	r.EventType = {
		BotOnlineEvent: (function self(){
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
		}()),
		BotOfflineEvent: (function self(){
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
		}()),
		BotOfflineEventForce: (function self(){
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
		}()),
		BotOfflineEventDropped: (function self(){
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
		}()),
		BotReloginEvent: (function self(){
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
		}()),
		GroupRecallEvent: (function self(){
			self.r = function(json) {
				this.senderId = json.authorId;
				this.messageId = json.messageId;
				this.time = json.time;
				this.group = new r.GroupInfo(json.group);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		FriendRecallEvent: (function self(){
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
		}()),
		BotGroupPermissionChangeEvent: (function self(){
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
		}()),
		BotMuteEvent: (function self(){
			self.r = function(json) {
				this.duration = json.durationSeconds;
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		BotUnmuteEvent: (function self(){
			self.r = function(json) {
				this.operator = new r.GroupSenderInfo(json.operator);
			}
			self.r.prototype = {
				type: r.EventTypeConst.BOT_UNMUTE,
				getOperator: function() {
					return this.operator;
				},
			}
			return self.r;
		}()),
		BotJoinGroupEvent: (function self(){
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
		}()),
		GroupNameChangeEvent: (function self(){
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
		}()),
		GroupEntranceAnnouncementChangeEvent: (function self(){
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.group = new r.GroupInfo(json.group);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		GroupMuteAllEvent: (function self(){
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.group = new r.GroupInfo(json.group);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		MemberJoinEvent: (function self(){
			self.r = function(json) {
				this.member = new r.GroupSenderInfo(json.member);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_JOIN,
				getMember: function() {
					return this.member;
				},
			}
			return self.r;
		}()),
		MemberLeaveEventKick: (function self(){
			self.r = function(json) {
				this.member = new r.GroupSenderInfo(json.member);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		MemberLeaveEventQuit: (function self(){
			self.r = function(json) {
				this.member = new r.GroupSenderInfo(json.member);
			}
			self.r.prototype = {
				type: r.EventTypeConst.GROUP_MEMBER_QUIT,
				getMember: function() {
					return this.member;
				},
			}
			return self.r;
		}()),
		MemberCardChangeEvent: (function self(){
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.member = new r.GroupSenderInfo(json.member);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		MemberSpecialTitleChangeEvent: (function self(){
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.member = new r.GroupSenderInfo(json.member);
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
		}()),
		MemberPermissionChangeEvent: (function self(){
			self.r = function(json) {
				this.before = json.origin;
				this.after = json.current;
				this.member = new r.GroupSenderInfo(json.member);
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
		}()),
		MemberMuteEvent: (function self(){
			self.r = function(json) {
				this.duration = json.durationSeconds;
				this.member = new r.GroupSenderInfo(json.member);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		MemberUnmuteEvent: (function self(){
			self.r = function(json) {
				this.member = new r.GroupSenderInfo(json.member);
				this.operator = new r.GroupSenderInfo(json.operator);
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
		}()),
		//匿名，坦白说和允许群组成员邀请事件没啥用，就不写了
		//放在这的原因是防止hookEvent时出现找不到对象的错误。
		GroupAllowAnonymousChatEvent: function(){},
		GroupAllowConfessTalkEvent: function(){},
		GroupAllowMemberInviteEvent: function(){},
	},
	r.Log = {
		i: function(msg) {
			java.lang.System.out.println("[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime() + 28800000) + "][INFO] " + String(msg));
		},
		w: function(msg) {
			java.lang.System.out.println("\u001B[33m[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime() + 28800000) + "][WARNING] " + String(msg) + "\u001B[0m");
		},
		v: function(msg) {
			java.lang.System.out.println("\u001B[32m[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime() + 28800000) + "][V] " + String(msg) + "\u001B[0m");
		},
		e: function(msg) {
			java.lang.System.out.println("\u001B[31m[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime() + 28800000) + "][ERROR] " + (function() {
				if (msg instanceof Error) {
					return "Error: " + msg.toString() + "(" + msg.lineNumber + ")";
				} else {
					return msg;
				}
			} ()) + "\u001B[0m");
		},
	}
	r.Log.w("* MiraiBot_HTTP.js版本： " + r.__version);
	r.Log.w("* 当前为不稳定版本，请保持该脚本的强制更新。");
	r.Log.w("* 若你发现版本更新了，请及时查看更新日志，以免错过重要新特性。");
	r.Log.w("* 因取消强制更新而导致MiraiBot_HTTP.js出现bug，恕不解决！");
	r.Log.w("* 如果你的demo.js突然不能运行，请查看demo.js是否有更新");
	r.Log.e("* 重要：demo.js更新解决运行30分钟后报Session不存在的问题，请浏览仓库demo.js查看解决方案");
	r.Log.i("* 更新日志：https://github.com/StageGuard/mirai-rhinojs-sdk");
	r.Log.i("* SDK文档：https://stageguard.top/p/mirai-rhinojs-sdk.html");
	return r;
} ()
