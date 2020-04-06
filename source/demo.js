"use strict";
////**************preload modules**********************
//Scriptable & context
const scope = this;
const context = org.mozilla.javascript.Context.getCurrentContext();
//logcat
const Log = {
	i: function(msg) {
		java.lang.System.out.println("[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime() + 28800000) + "][INFO] " + String(msg));
	},
	w: function(msg) {
		java.lang.System.out.println("\u001B[33m[" + (new java.text.SimpleDateFormat("yyyy.MM.dd hh:mm:ss")).format((new Date()).getTime() + 28800000) + "][WARNING] " + String(msg) + "\u001B[0m");
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
//global module list
var __g_modules = [];
//require module
const require = function s(related_path) {
	try {
		var p = java.lang.System.getProperty("user.dir") + "/" + related_path;
		if (! (new java.io.File(p)).isFile()) return {};
		var rd = java.io.BufferedReader(new java.io.FileReader(p));
		var s = [],
		q;
		while (q = rd.readLine()) s.push(q);
		rd.close();
		var module_object = eval("(" + s.join("\n") + ")");
		if (!module_object.module) throw "This module has no name: " + related_path;
		scope[module_object.module] = module_object;
		__g_modules.push(module_object.module);
		Log.i("Module loaded: " + related_path);
	} catch(e) {
		Log.e(e);
		java.lang.System.exit(0);
	}
}

//****************************************************
//以下为加载模块
Log.i("Initializing...");
//LinuxShell，提供执行linux shell指令的功能
require("source/LinuxShell.js");
//FileIO，提供文件简单的文件操作功能
require("source/FileIO.js");
//NetworkUtils，提供HTTP Post与Get功能
require("source/NetworkUtils.js");
//MiraiBot_HTTP，提供信息接收与发送功能                                          //当前MiraiBot_HTTP.js为非稳定版本
//必须强制每次启动脚本都从服务器下载                                             //如因旧版本MiraiBot_HTTP.js产生的问题概不解决！
Log.i("Fetching newest version of MiraiBot_HTTP.js...");
Log.i("Please ensure that your network is avaliable for raw.githubusercontent.com.");
FileIO.writeString("source/MiraiBot_HTTP.js", NetworkUtils.get("https://raw.githubusercontent.com/StageGuard/mirai-rhinojs-sdk/master/source/MiraiBot_HTTP.js", null, true), true);
Log.i("Updated MiraiBot_HTTP.js");
require("source/MiraiBot_HTTP.js");

//HTTP API服务器地址
const server = "http://localhost:8080/";
//HTTP API服务器验证密钥
const authKey = "stageguard";
//要操作的机器人qq号
const qqnum = "202746796";

var gRecalledMsgId = [];

//创建一个MiraiBot实例
var miraiInstence = new Mirai(server, authKey, qqnum);
//连接host并获得一个session
var miraiSession = miraiInstence.connect();
//每次监听到的消息数量，默认为20
//miraiSession.setHookSize(20);
//设置消息监听器
miraiSession.setMessageListener(new Mirai.MessageListener({
	//抓取到的群组消息
	hookGroupMessage: function(sender, message) {
		Log.i("\nCapturedGroupMessage: \n   SenderInfo: " + sender.toString() + "\n   MessageChain: " + message.toString());
		/*if(message.getMessage(Mirai.MessageTypeConst.PLAIN).getText() == "recall") {
			var msgid = miraiSession.sendGroupMessage(sender.getGroupInfo().getId(), Mirai.MessageChain.build(
				new Mirai.MessageType.Plain("message")
			));
			miraiSession.recall(msgid);
		}*/
	},
	//抓取到的好友消息
	hookFriendMessage: function(sender, message) {
		Log.i("\nCapturedFriendMessage: \n   SenderInfo: " + sender.toString() + "\n   MessageChain: " + message.toString());
		if(message.getMessage(Mirai.MessageTypeConst.POKE).getName() == Mirai.MessageTypeConst.PokeType.SIXSIXSIX) {
			miraiSession.sendFriendMessage(sender.getId(), Mirai.MessageChain.build(
				new Mirai.MessageType.Poke(Mirai.MessageTypeConst.PokeType.LIKE)
			));
		}/*else if(message.getMessage(Mirai.MessageTypeConst.PLAIN).getText() == "recall") {
			var msgid = miraiSession.sendFriendMessage(sender.getId(), Mirai.MessageChain.build(
				new Mirai.MessageType.Plain("message")
			));
			java.lang.Thread.sleep(1000)
			miraiSession.recall(msgid);
		}*/
	},
	//抓取到的事件
	hookEvent: function(event) {
		switch(event.type) {
			//简单防撤回
			//管理员撤回成员消息不显示撤回内容
			//成员撤回消息显示消息内容
			case Mirai.EventTypeConst.GROUP_RECALL: {
				if(gRecalledMsgId.indexOf(event.getMessageId()) != -1) return;
				if(event.getOperator().getPermission() == Mirai.GroupInfo.Permission.ADMIN || event.getOperator().getPermission() == Mirai.GroupInfo.Permission.OWNER) {
					miraiSession.sendGroupMessage(event.getGroup().getId(), new Mirai.MessageType.Plain("Administrator " + event.getOperator().getName() + " recalled a member message."));
				} else {
					var recalledMessage = miraiSession.getCachedMessage(event.getMessageId());
					miraiSession.sendGroupMessage(event.getGroup().getId(), recalledMessage
						.addMessageF(new Mirai.MessageType.Plain("Member " + event.getOperator().getName() + " recalled a message: \n"))
						.discordMessage(Mirai.MessageTypeConst.QUOTE)
					);
				}
				gRecalledMsgId.push(event.getMessageId());
				break;
			}
			//群组改名提示
			case Mirai.EventTypeConst.GROUP_NAME_CHANGE: {
				miraiSession.sendGroupMessage(event.getGroup().getId(), Mirai.MessageChain.build(
					new Mirai.MessageType.Plain("Administrator changed the group mame \"" + event.getBefore() + "\" to \"" + event.getAfter() + "\"")
				));
				break;
			}
		}
	},
	//错误消息
	hookError: function(error) {
		//验证时发生的HTTP API返回500响应码并不影响功能，只需要重新启用监听线程即可
		if ((/Server returned HTTP response code: 500/i).test(error.toString())) {
			Log.w("Server returned HTTP response code: 500. Restarting listen thread...");
			miraiSession.stopListen();
			miraiSession.startListen();
		//无有效session，经常发生在启动mirai wrapper console后首次启动脚本
		//推测原因：消息监听线程执行比验证线程快了一步
		//解决方案①：重启消息监听线程
		} else/* if ((/INVAILD_SESSION/i).test(error.toString())) */{
			/*Log.w("Invaild session. Restarting listen thread...");
			miraiSession.stopListen();
			miraiSession.startListen();*/
			Log.e(error.toString() + error.lineNumber)
		}
	}
}));
miraiSession.setVerifyThreadLoopInterval(10000)
//
//开启循环校验线程(默认每25分钟校验一次，30分钟若无检验则HTTP API自动销毁该session)
miraiSession.startVerifyThread();
//开启消息监听线程(同步启动线程可能会发生上面的INVAILD_SESSION错误)
//解决方案②：延迟启动消息监听线程(延后500毫秒)
//java.lang.Thread.sleep(500);
miraiSession.startListen();
//释放该session(其实就是同时调用stopListen和stopVerifyThread)
//miraiSession.release();



























