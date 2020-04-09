# mirai-rhinojs-sdk
为[Mirai](https://github.com/mamoe/mirai)的[mirai-api-http](https://github.com/mamoe/mirai-api-http)提供封装好的适用于Mozilla Rhino的SDK。

## Mozilla Rhino是什么？
Mozilla Rhino: JavaScript in Java

![Rhino](https://developer.mozilla.org/@api/deki/files/832/=Rhino.jpg)

Rhino is an implementation of JavaScript in Java.

Rhino是一个可以在JavaScript上运行Java程序的库。

----

## 快速开始：
```bash
#克隆项目
git clone https://github.com/StageGuard/mirai-rhinojs-sdk
#获取最新版rhino运行库
wget https://github.com/mozilla/rhino/releases/download/Rhino1_7_12_Release/rhino-1.7.12
.jar
```

之后你需要修改`demo.js`中`server`，`authKey`和`qqnum`变量。
```javascript
//HTTP API服务器地址
const server = "http://localhost:8080/";
//HTTP API服务器验证密钥
const authKey = "stageguard";
//要操作的机器人qq号
const qqnum = "202746796";
```
⑤运行脚本
```bash
java -jar rhino-1.7.12.jar -f source/demo.js
```
简单的消息捕捉功能脚本就运行起来了。

![运行成功](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/status.png)

现在尝试对你的BOT发送戳一戳中的666。

![Poke消息](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/poke.png)

----

该项目同样可以在Android手机上运行，详细请浏览[我的博客](https://stageguard.top/2020/04/01/run-qqbot-on-termux-android/)

----

所有功能均为测试版，若有BUG请开issue反馈。

有关SDK方法文档请参考[SDK文档](https://stageguard.top/p/mirai-rhinojs-sdk.html)

----

## To-Do
- [x] 编写SDK文档
- [ ] 支持监听EventMessage
- [ ] 将MozillaRhino整合成mirai插件

## 更新日志

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
