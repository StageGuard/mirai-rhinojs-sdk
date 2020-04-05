# English: [README_en.md](README_en.md)

# mirai-rhinojs-sdk
为[Mirai](https://github.com/mamoe/mirai)的[mirai-api-http](https://github.com/mamoe/mirai-api-http)提供封装好的适用于Mozilla Rhino的SDK。

## Mozilla Rhino是什么？
Mozilla Rhino: JavaScript in Java

![Rhino](https://developer.mozilla.org/@api/deki/files/832/=Rhino.jpg)

Rhino is an implementation of JavaScript in Java.

Rhino是一个可以在JavaScript上运行Java程序的库。

----

## 快速开始：
①获取最新版rhino运行库
```bash
wget https://github.com/mozilla/rhino/releases/download/Rhino1_7_12_Release/rhino-1.7.12.jar
```
②克隆项目
```bash
git clone https://github.com/StageGuard/mirai-rhinojs-sdk
```
③将`source`文件夹与`rhino-1.7.12.jar`移动至平级目录。

④修改`demo.js`中`server`，`authKey`和`qqnum`变量。
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