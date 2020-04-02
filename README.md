# mirai-rhinojs-sdk
为Mirai API Http提供封装好的适用于Mozilla Rhino的SDK。

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

⑤运行脚本
```bash
java -jar rhino-1.7.12.jar -f source/demo.js
```
简单的消息捕捉功能脚本就运行起来了。

![运行成功](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/status.png)

----

所有功能均为测试版，若有BUG请开issue反馈。

有关SDK方法文档请参考[SDK文档](SDK.md)

----

## To-Do
- [ ] 编写SDK文档
- [ ] 支持监听EventMessage
- [ ] 将MozillaRhino整合成mirai插件