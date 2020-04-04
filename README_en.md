# mirai-rhinojs-sdk
为[Mirai](https://github.com/mamoe/mirai)的[mirai-api-http](https://github.com/mamoe/mirai-api-http)提供封装好的适用于Mozilla Rhino的SDK。

## What is Mozilla Rhino？
Mozilla Rhino: JavaScript in Java

![Rhino](https://developer.mozilla.org/@api/deki/files/832/=Rhino.jpg)

Rhino is an implementation of JavaScript in Java.

----

## Quick Start：
①Fetch the newest Rhino runtime library.
```bash
wget https://github.com/mozilla/rhino/releases/download/Rhino1_7_12_Release/rhino-1.7.12.jar
```
②Clone this repo
```bash
git clone https://github.com/StageGuard/mirai-rhinojs-sdk
```
③Move`source`to the folder which is in the same with `rhino-1.7.12.jar`.

④Modify variable `server`，`authKey` and `qqnum` in `demo.js`
```javascript
//HTTP API server
const server = "http://localhost:8080/";
//HTTP API auth key
const authKey = "stageguard";
//qq num
const qqnum = "202746796";
```
⑤Run demo script
```bash
java -jar rhino-1.7.12.jar -f source/demo.js
```
Simple meeesage catcher script is running.

![运行成功](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/status.png)

Now try to send a poke message(SIXSIXSIX) to your bot.

![Poke消息](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/poke.png)

----

This script can also run in Android phone，Please surf [my blog](https://stageguard.top/2020/04/01/run-qqbot-on-termux-android/) for more details.

----

All functions are under testing，Please open a issue if you surface a bug。

All methods and usage can be found in [SDK Documentation](https://stageguard.top/p/mirai-rhinojs-sdk.html)

----

## To-Do
- [x] 编写SDK文档
- [ ] 支持监听EventMessage
- [ ] 将MozillaRhino整合成mirai插件