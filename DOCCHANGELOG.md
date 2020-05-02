# [Mirai RhinoJS SDK 文档](https://stageguard.top/p/mirai-rhinojs-sdk.html)更新日志

## 注：在新功能上文档更新日志与api更新日志基本一致，这里主要记录要修改的已存在的方法或者数据。

### 2020.05.02
BREAKING CHANGES
* 文档大幅度修改
* 修复文档头类型预览中超链接无法跳转的问题和一些错字([#2](https://github.com/StageGuard/mirai-rhinojs-sdk/issues/2))。

### 2020.04.07
* 修改了`Permission`的父类为`Mirai.GroupInfo`
* `GroupSenderInfo.getGroupInfo()`改为`GroupSenderInfo.getGroup()`
* 添加了`Mirai.EventType(Const)`的用法
* 添加了闪照`Mirai.MessageType.FlashImage`的用法，修改了`Mirai.MessageType.Image`参数。

### 2020.04.05
* 修改`MessageChain.build`的构造方式
* 添加`Session.getCachedMessage`调用方法
* 添加`MessageChain.discordMessage`调用方法
* 添加`MessageChain.addMessage`调用方法
* 添加`MessageChain.addMessageF`调用方法
* 添加`MessageChain.toChainArray`解释
* 修改了几个错别字。

### 2020.04之前
* 修改了关于`require`函数相对路径的解释
* 修改了几个错别字