# mirai-rhinojs-sdk
为[Mirai](https://github.com/mamoe/mirai)的[mirai-api-http](https://github.com/mamoe/mirai-api-http)提供封装好的适用于Mozilla Rhino的SDK。

## Mozilla Rhino是什么？
Mozilla Rhino: JavaScript in Java

![Rhino](https://developer.mozilla.org/@api/deki/files/832/=Rhino.jpg)

Rhino is an implementation of JavaScript in Java.

Rhino是一个可以在JavaScript上运行Java程序的库。

----

## 简介
此项目为`mirai-console`的插件`mirai-api-http`提供简单易用的API。
### 如何简单易用？
下面提供一个简单的例子：
```javascript
//将消息类型等静态常量注册进全局对象
Mirai.registerClasses2Object(this);
//设置http api服务器地址和验证密钥
Mirai.setServer("http://localhost:8081/");
Mirai.setAuthKey("stageguard");
//创建一个新的bot
var bot = Mirai.createNewBot(你的qq号);
//订阅bot消息
bot.subscribe({
	//订阅群组消息
	group: (group, sender, message) => {
		//检测文本消息中是否包含文字
		if(message.contain("回复测试")) {
			//回复这个群友，以下方法是等价的
			group.reply("回复你了1");
			group.reply(Plain("回复你了2"));
			sender.reply("回复你了3");
			bot.sendGroupMessage(group, [Plain("回复你了4")], sender.getSourceId());
		} else if(message.contain("at测试")) {
			//at这个群友，以下方法是等价的
			sender.at("at你了1");
			group.at(sender, "at你了2");
			group.send(At(sender) + Plain("at你了3"));
			bot.send(group, At(sender) + Plain("at你了4"));
			bot.send(group, At(sender), Plain("at你了5"));
			bot.sendGroupMessage(group, [At(sender), Plain("at你了6")]);
		} else if(message.contain("私聊我")){
			//自动判断有无好友
			sender.send("私聊你了1");
			//自动判断有无好友
			bot.send(sender, "私聊你了2");
			//手动判断
			if(bot.haveFriend(sender)) {
				bot.sendFriendMessage(sender, [Plain("私聊你了3")]);
			} else {
				bot.sendTempMessage(sender, group, [Plain("私聊你了3")]);
			}
		//自找苦吃
		} else if(message.contain("禁言我")){
			if(group.getPermission() == MEMBER || sender.getPermission == OWNER) {
				group.send("我没有权限做那个！");
			} else {
				sender.mute();
			}
		//管理员定向禁言
		} else if(message.contain("禁言")){
			//group中的permission参数表示的是bot在这个群组的权限
			//sender中的permission参数表示消息发送者在这个群组的权限
			if(group.getPermission() == MEMBER || sender.getPermission == OWNER) {
				group.send("我没有权限做那个！");
			} else {
				//若无At类型消息，get()则返回一个参数都为null的新消息对象
				if(message.get(AT).getTarget() != null) {
					//禁言60秒，以下方法都是等价的
					//获取at类型消息的target参数(被at的人的qq号)
					var target = message.get(AT).getTarget();
					bot.mute(group, target, 60);
					bot.unmute(group, target);
					group.mute(target, 60);
					group.unmute(target);
				}
			}
		}
	},
	friend: (sender, message) => {},
	//订阅其他事件
	event: (event) => {
		switch(event.type) {
			//自动拒绝好友请求
			case NEW_FRIEND_REQUEST:
				event.reject();
			break;
			//bot下线
			case BOT_OFFLINE:
			case BOT_OFFLINE_FORCE:
			case BOT_OFFLINE_DROPPED:
				bot.destroy();
			break;
		}
	},
	error: (e) => {
		Log.e(e);
	},
});
```
mirai-rhinojs-sdk提供了非常灵活的语法，允许你多种方式实现同一功能，尽量做到符合逻辑，同时提供多种消息类型构造方式：
```javascript
sender.send(At(1355416608), Plain("at你了"));
//文本消息的构造函数可以省略
sender.send(At(1355416608), "at你了");
//伪操作符重载
//伪操作符重载方式不能省略文本消息的构造函数
sender.send(At(1355416608) + Plain("at你了"));
```

mirai-rhinojs-sdk将会有两个版本，它们的用法大部分都是相同的，但略有区别：

- <span style='color:#ff0000;'>(未实现)</span>`core`: 此版本将mirai-core作为依赖使用，不需要预先部署mirai-console，这也意味着使用此版本将无法使用mirai-console插件。
- <span style='color:#00ff00;'>(可用)</span>`http`: 此版本基于mirai-console的插件mirai-api-http，该版本的通讯交互为轮询`fetchMessage`接口，处理消息并发送。

----

## 快速开始：
### 我不会JavaScript
你只需要在[W3school](https://www.w3school.com.cn/js/index.asp)简单学习基础语法就可以开始使用了。
### 我会JavaScript

现在开始使用！

<details markdown='1'><summary>core版本</summary>

core版本暂不可用，请等待发布

</details>
</br>
<details markdown='1'><summary>http版本</summary>

### 部署mirai-console

前往[mirai-console](https://github.com/mamoe/mirai-console)和[mirai-api-http](https://github.com/mamoe/mirai-api-http)的release界面下载最新版本的wrapper和mirai-api-http，按照mirai-api-http的README做好配置。

安卓用户请浏览[我的博客](https://stageguard.top/2020/04/01/run-qqbot-on-termux-android/#%E8%AF%A6%E7%BB%86%E8%BF%87%E7%A8%8B)在termux部署。

### 运行脚本

请选择你的平台查看
</br>

<details markdown='1'><summary>Android(AutoJS)</summary>

### 新建一个脚本并复制以下内容
```javascript
//导入MiraiQQBot库
eval(http.get("https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/source/wrapper.js").body.string());
//创建你的bot
Mirai.registerClasses2Object(scope);
//http api服务器地址
Mirai.setServer("http://localhost:8080/");
//验证密钥
Mirai.setAuthKey("stageguard");
//新的not
var bot = Mirai.createNewBot(你的bot qq号);

//订阅bot消息
bot.subscribe({
	//订阅群组消息
	group: (group, sender, message) => {
		group.send(message);
  },
  friend: (sender, message) => {
		if(message.get(POKE).getName() == SIXSIXSIX) {
			sender.send(Poke(LIKE));
		}
	},
 };
```
### 运行脚本

</details>

<details markdown='1'><summary>Windows/Linux/Android(Termux)</summary>

### 下载rhino运行库
前往[mozilla/rhino](https://github.com/mozilla/rhino)项目release界面下载rhino运行库(rhino-xxx.jar而不是rhino-runtime-xxx.jar)

### 新建一个js脚本，复制以下内容

```javascript
//导入MiraiQQBot库
(function(http_get) {
	eval(http_get("https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/source/wrapper.js"));
}((url) => {
	var connection = (new java.net.URL(url)).openConnection(), bufferedReader, line, result = "";
	connection.setDoInput(true);
	var bufferedReader = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
	while ((line = bufferedReader.readLine()) != null) result += (line + "\n");
	bufferedReader.close(); return result;
}));
//创建你的bot
Mirai.registerClasses2Object(scope);
//http api服务器地址
Mirai.setServer("http://localhost:8080/");
//验证密钥
Mirai.setAuthKey("stageguard");
//新的not
var bot = Mirai.createNewBot(你的bot qq号);

//订阅bot消息
bot.subscribe({
	//订阅群组消息
	group: (group, sender, message) => {
		group.send(message);
  },
  friend: (sender, message) => {
		if(message.get(POKE).getName() == SIXSIXSIX) {
			sender.send(Poke(LIKE));
		}
	},
 };
```

</details>

</details>

</details>

出现以下日志，即为运行成功
```
Bot xxxxxxxxxx created.
Verification thread started for xxxxxxxxxx.
Message subscription thread started for xxxxxxxxxx.
Session is verified: xxxx
```
现在，你的bot就是复读机了(

尝试对你的BOT发送戳一戳中的666。

![Poke消息](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/poke.png)

尽情享用吧！

----

所有功能均为测试版，少部分功能(如加群响应，移除群员等功能未测试)，若有BUG请开issue反馈。

有关SDK方法文档请参考[SDK文档](https://stageguard.top/p/mirai-rhinojs-sdk.html)

----

## To-Do
- [x] 编写SDK文档
- [x] 支持监听EventMessage
- [ ] 将MozillaRhino整合成mirai插件

## 更新日志

### 2020.05.02 → 1.6.0

<span style='color:#ff2e2e;'>BREAKING CHANGES</span>

* 完全重构MiraiBot_HTTP.js并更名为MiraiQQBot.http.js
* 简化部署方式
* 新的bug。

文档更新工作正在进行中...

### 2020.04.14 → 1.5.1

* `Session.sendTempMessage`适配http api 1.6.2版本。
* 添加`EventType.NEW_FRIEND_REQUEST`和`EventType.NEW_MEMBER_JOIN_REQUEST`以支持监听新好友请求和新加群请求事件。
* 添加`Session.handleFriendRequest`和`Session.handleMemberJoinRequest`以处理新好友请求和新加群请求。

文档已更新，新事件和方法浏览[SDK文档](https://stageguard.top/p/mirai-rhinojs-sdk.html)。


### 2020.04.12 → 1.5_alpha

* 添加`Session.sendTempMessage`以支持发送临时消息。
* 发送好友消息支持引用。
* 添加`Session.get(Friend/Group/GroupMember)List`以支持获取好友/群/群成员列表。
* 添加`Session.(un)mute(All)`以支持(全体)(解除)禁言。
* 添加`Session.kick`以支持踢出群成员。
* HTTP Post/Get 内置，不再需要NetworkUtils模块。
* 修复了bug和一些逻辑问题。

文档已更新，新用法浏览[SDK文档](https://stageguard.top/p/mirai-rhinojs-sdk.html)。

### 2020.04.07 → 1.4.1_alpha

* 为`Mirai.GroupInfo`的构造函数添加null判断
* `Mirai.connect()`中的post auth修改到`Mirai.auth()`，添加`Mirai.Session.reAuth()`用于session失效后的重认证
* 修复了小bug

文档已更新。

### 2020.04.07 → 1.4_alpha

* 修改了`Permission`的父类为`Mirai.GroupInfo`
* `GroupSenderInfo.getGroupInfo()`改为`GroupSenderInfo.getGroup()`
* 添加了`Mirai.EventType(Const)`事件类型，现在可以监听事件了。
* `Mirai.MessageListener.hookOtherMessage(JSON msg)` 改为 `Mirai.MessageListener.hookEvent(Mirai.EventType.? event)`来hook事件

文档已更新。

### 2020.04.06 → 1.3.1_alpha

* 适配`mirai-api-http` 1.5版本的接口`/fetchMessage`返回的数据格式。
* 添加`Mirai.MessageType.FlashImage`闪照消息类型，用法与`Mirai.MessageType.Image`相同。
* 为`Mirai.MessageType.Image`构造函数增加了`path`参数，表示发送本地图片的路径，该路径是相对于`plugins/MiraiAPIHTTP/images/`的。

文档未更新。

### 2020.04.06 → 1.3_alpha
* `Session.sendMessage`现在直接可以发送`Mirai.MessageType.?`消息而无需仅为了一个消息对象构建消息链。
* `Mirai.GroupInfo.getBotPermission`方法改名为`Mirai.GroupInfo.getPermission`
* 添加`Mirai.GroupInfo.Permission`群组权限常量OWNER, ADMIN和MEMBER
* 添加`Mirai.EventType`事件类型和`Mirai.EventTypeConst`事件类型常量。也就是说现在支持监听事件了。
* (`Mirai.MessageListener`中的`hookOtherMessage(JSON msg)`改成`hookEvent(Mirai.EventType.? event)`)
* demo.js更新，为了展示这次MiraiBot_HTTP.js的新特性。
* 修复了一些遗留bug。

文档未更新。

### 2020.04.05 → 1.2_alpha
* 修改`MessageChain.build`的构造方式(原来的不受影响)
* 添加`Session.getCachedMessage`方法
* 添加`MessageChain.discordMessage`方法
* 添加`MessageChain.addMessage`方法
* 添加`MessageChain.addMessageF`方法
* 添加`MessageChain.toChainArray`方法

有关这些新方法的用法请看[SDK文档](https://stageguard.top/p/mirai-rhinojs-sdk.html)

### 2020.04.05 → 1.1_alpha
* 修复运行30分钟后出现的bug.
* 添加消息撤回方法：Mirai.Session.recall().
* 修复了捕捉消息出现错误时对错误的处理错误
* 修复了不能抓取其他类型消息的bug
### 2020.04.04 → 1.0_alpha
* 首次提交

## License
```
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
```
