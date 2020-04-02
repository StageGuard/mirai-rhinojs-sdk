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
	r.__version = "v1.0_alpha";
	Log.i(r.__moduleInfo);
	r.prototype = {
		setAuthKey: function(k) {
			if (key && typeof(key) == "string") this.key = k;
		},
		setSeverhost: function(s) {
			if (s && typeof(s) == "string") this.server = s;
		},
		connect: function() {
			if (this.server == null || this.auth == null) throw "Server host or authenticate key isnt set";
			var p = NetworkUtils.post(this.server + "auth", JSON.stringify({
				authKey: this.auth
			}));
			var result = JSON.parse(p);
			if (result.code != 0) {
				throw "Authenticate key is invaild.";
			} else {
				this.sessions.push(result.session);
				var session = new r.Session(result.session);
				session.setAttributes({
					server: this.server,
					qqnum: this.qqnum
				});
				return session;
			}
		}
	}

	r.Session = function(id) {
		this.sessionid = id;
		this.qqnum = null;
		this.server = null;

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
								Log.i("Session is verified: " + sessionid);
								break;
							}
							java.lang.Thread.sleep(interval);
						}
						return;
					} catch(e) {
						if (! (/InterruptedException/i).test(e.toString())) {
							Log.e(e);
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
							var p = NetworkUtils.get(server + "fetchMessage?sessionKey=" + sessionid + "&count=" + hooksize);
							if((/^\{/).test(p)) throw "INVAILD_SESSION";
							if (p != "[]") {
								p = eval(p)[0];
								switch (p.type) {
									case "GroupMessage": listener.listenerobj.hookGroupMessage(new r.GroupSenderInfo(p.sender.id, p.sender.memberName, p.sender.permission, p.sender.group), r.MessageChain._build(p.messageChain)); break;
									case "FriendMessage": listener.listenerobj.hookFriendMessage(new r.FriendSenderInfo(p.sender.id, p.sender.nickname), r.MessageChain._build(p.messageChain)); break;
									case "OtherMessage": listener.listenerobj.hookOtherMessage(p); break;
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
				Log.i("Session \"" + this.sessionid + "\" is released.");
			} else {
				Log.i("Session \"" + this.sessionid + "\" is not released.");
			}
		},
		sendGroupMessage: function(target, messageChain, quoteId) {
			try {
				var params = {
					sessionKey: this.sessionid,
					target: Number(target),
					messageChain: messageChain.toSource()
				};
				if (quoteId != null) params.quote = Number(quoteId);
				var p = NetworkUtils.post(server + "sendGroupMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				if(p.length == 0) p = "{}";
				var result = JSON.parse(p);
				if (result.code == 0) {
					Log.i("Message have sent(group=" + target + ")");
				} else {
					Log.e(p);
				}
			} catch(e) {
				this.sendGroupMessage(target, [{
					type: "Plain",
					text: "执行已完成，但消息发送失败:\n" + e.toString()
				}], quoteId);
				Log.e("Target=" + target + ", MessageChain=" + _toSource(messageChain) + "\n" + e);
			}
		},
		sendFriendMessage: function(target, messageChain) {
			try {
				var params = {
					sessionKey: this.sessionid,
					target: Number(target),
					messageChain: messageChain.toSource()
				};
				var p = NetworkUtils.post(server + "sendFriendMessage", JSON.stringify(params), [["Content-Type", "text/plain; charset=UTF-8"]]);
				if(p.length == 0) p = "{}";
				var result = JSON.parse(p);
				if (result.code == 0) {
					Log.i("Message have sent(group=" + target + ")");
				} else {
					Log.e(p);
				}
			} catch(e) {
				Log.e(e);
			}
		}
	}
	r.MessageListener = function(hooks) {
		this.listenerobj = hooks;
	};
	
	r.GroupSenderInfo = (function(){
		var obj = function(id, name, permission, group) {
			this.id = id;
			this.name = name;
			this.permission = permission;
			this.group = new obj.GroupInfo(group);
		}
		obj.GroupInfo = function(group) {
			this.id = group.id;
			this.name = group.name;
			this.botPermission = group.permission;
		}
		obj.GroupInfo.prototype = {
			getId: function() {
				return this.id;
			},
			getName: function() {
				return this.name;
			},
			getBotPermission: function() {
				return this.botPermission;
			},
			toString: function() {
				return {
					id: this.id,
					name: this.name,
					botPermission: this.botPermission
				}
			}
		}
		obj.prototype = {
			getId: function() {
				return this.id;
			},
			getName: function() {
				return this.name;
			},
			getPermission: function() {
				return this.permission;
			},
			getGroupInfo: function() {
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
		return obj;
	}());
	r.FriendSenderInfo = (function(){
		var obj = function(id, name) {
			this.id = id;
			this.name = name;
		}
		obj.prototype = {
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
		return obj;
	}());
	r.MessageChain = function(messageChain) {
		this.msg = messageChain;
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
				case r.MessageTypeConst.XML: chains.push(new r.MessageType.Xml(msg[i].xml)); break;
				case r.MessageTypeConst.JSON: chains.push(new r.MessageType.Json(msg[i].json)); break;
				case r.MessageTypeConst.APP: chains.push(new r.MessageType.App(msg[i].content)); break;
				case r.MessageTypeConst.POKE: chains.push(new r.MessageType.Poke(msg[i].name)); break;
				
			}
		}
		return new r.MessageChain(chains);
	};
	r.MessageChain.build = function() {
		return new r.MessageChain(arguments);
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
		toSource: function() {
			var chain = [];
			for(var i in this.msg) {
				chain.push(this.msg[i].toSource());
			}
			return chain;
		},
		toString: function() {
			var chain = [];
			for(var i in this.msg) {
				chain.push(JSON.stringify(this.msg[i].toSource()));
			}
			return chain;
		}
		
	};
	r.MessageTypeConst = {SOURCE:"Source", QUOTE: "Quote", AT: "At", ATALL: "AtAll", FACE: "Face", PLAIN: "Plain", IMAGE: "Image", XML: "Xml", JSON: "Json", APP: "App", POKE: "Poke", PokeType: {}};
	r.MessageTypeConst.PokeType = {
		POKE: "Poke",
		SHOWLOVE: "ShowLove",
		LIKE: "Like",
		HEARTBROKEN: "Heartbroken",
		SIXSIXSIX: "SixSixSix",
		FANGDAZHAO: "FangDaZhao"
	};
	r.MessageType = {
		Source: (function(){
			var obj = function(id, time) {
				this.id = id ? id : null;
				this.time = time ? time : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		Quote: (function(){
			var obj = function(id, senderId, groupId, origin) {
				this.id = id ? id : null;
				this.groupId = groupId ? groupId : null;
				this.senderId = senderId ? senderId : null;
				this.origin = origin ? origin : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		At: (function(){
			var obj = function(target, display) {
				this.target = target ? target : null;
				this.display = display ? display : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		AtAll: (function(){
			var obj = function() {}
			obj.type = r.MessageTypeConst.ATALL,
			obj.prototype = {
				toSource: function() {
					return {type: r.MessageTypeConst.ATALL};
				},
			}
			return obj;
		}()),
		Face: (function(){
			var obj = function(faceId, name) {
				this.faceId = faceId ? faceId : null;
				this.name = name ? name : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		Plain: (function(){
			var obj = function(text) {
				this.text = text ? String(text) : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		Image: (function(){
			var obj = function(imageId, url) {
				this.imageId = imageId ? imageId : null;
				this.url = url ? url : null;
			}
			obj.prototype = {
				type: r.MessageTypeConst.IMAGE,
				getImageId: function(){
					return this.imageId;
				},
				getUrl: function(){
					return this.url;
				},
				toSource: function() {
					return {
						type: r.MessageTypeConst.IMAGE,
						imageId: this.imageId,
						url: this.url
					};m
				},
			}
			return obj;
		}()),
		Xml: (function(){
			var obj = function(xml) {
				this.xml = xml ? xml : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		Json: (function(){
			var obj = function(json) {
				this.json = json ? json : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		App: (function(){
			var obj = function(app) {
				this.app = app ? app : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
		Poke: (function(){
			var obj = function(name) {
				this.name = name ? name : null;
			}
			obj.prototype = {
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
			return obj;
		}()),
	}
	Log.i("MiraiBot_HTTP.js版本： " + r.__version);
	Log.w("当前为不稳定版本，请保持该脚本的强制更新。");
	Log.w("因取消强制更新而导致MiraiBot_HTTP.js出现bug，恕不解决！");
	return r;
} ()