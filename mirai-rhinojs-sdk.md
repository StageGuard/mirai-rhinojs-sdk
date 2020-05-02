---
title: Mirai RhinoJS SDK文档
---

# Mirai RhinoJS SDK文档

<span style='color:#ff0000;'>所有类和类型方法皆为测试阶段，未来可能会有更改。</br>若按照文档的方法调用出现问题，或文档有错字或术语性错误，请在 [StageGuard/mirai-rhinojs-sdk](https://github.com/StageGuard/mirai-rhinojs-sdk) 开issue反馈。</br>ISSUE的标题前必须加上`[SDK文档]`或者`[SDK Documentation]`，否则不予受理/更改。</br>有关文档更新，请查看[文档更新日志](https://github.com/StageGuard/mirai-rhinojs-sdk/blob/master/DOCCHANGELOG.md)</span>

> 由于`v1.6.0`版本的breaking changes，文档大幅度改动。</br>现在只提供对外使用的接口，内部实现的方法没有必要了解。

不同版本的MiraiQQBot.js在方法上略有不同，在方法前会用<span style='color:#97ff2e;font-size:10px;'>[http]</span>和<span style='color:#ff855d;font-size:10px;'>[core]</span>标记来表示http版本和core版本独有方法。

----

## 类型预览
* [Mirai](#Mirai) - Mirai RhinoJS主类
   * [Bot](#Mirai-Bot) - Bot对象
   * [MessageChain](#Mirai-MessageChain) - 消息链
   * [MessageSender](#Mirai-MessageSender) - 消息发送者(群或好友)
   * [GroupInfo](#Mirai-GroupInfo) - 群组信息
   * [MessageType](#Mirai-MessageType) - 消息类型
   * [MessageTypeConst](#Mirai-MessageTypeConst) - 消息类型常量
   * [EventType](#Mirai-EventType-Const) - 事件类型
   * [EventTypeConst](#Mirai-EventType-Const) - 事件类型常量
   * [utils.http](#Mirai-utils-http) - 网络操作类
   * [utils.file](#Mirai-utils-http) - 文件操作类
   * [Log](#Mirai-Log) - 日志输出

----

## Mirai
Mirai类是基类。

### 方法预览
| 返回类型 | 方法 |
|:----:|:----|
| <span style='color:#aaaaaa;'>VOID</span> | `static` init(`Object` globalObject) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` registerClasses2Object(`Object` object) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` <span style='color:#97ff2e;font-size:10px;'>[http]</span>setAuthKey(`String` authKey) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` <span style='color:#97ff2e;font-size:10px;'>[http]</span>setSever(`String` server) |
| `Mirai.Bot` | `static` getBot(`Number` qq) |
| `Mirai.Bot` | `static` createNewBot(`Number` qq, `String` password) |

> <span style='color:#aaaaaa;'>VOID</span>表示无返回值。

### 详细方法
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` init(`Object` globalObject)
初始化Mirai库，做平台判断和依赖下载等工作。
> 注：wrapper.js中已初始化，无需再次初始化。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` registerClasses2Object(`Object` object)
注册`MessageType`，`MessageTypeConst`，`EventTypeConst`，`Permission`和`Log`到`object`中，例如：
```javascript
var M;
Mirai.registerClasses2Object(M = {});
//可以使用M.PLAIN代替Mirai.MessageTypeConst.PLAIN
Mirai.registerClasses2Object(this);
//可以使用PLAIN代替Mirai.MessageTypeConst.PLAIN
```

### <span style='color:#ff972e;'>➢</span> <span style='color:#97ff2e;font-size:10px;'>[http]</span> <span style='color:#aaaaaa;'>VOID</span> `static` setAuthKey(`String` authKey)
设置连接http api服务器的验证密钥。

### <span style='color:#ff972e;'>➢</span> <span style='color:#97ff2e;font-size:10px;'>[http]</span> <span style='color:#aaaaaa;'>VOID</span> `static` setServer(`String` server)
设置连接http api服务器地址。

### `Mirai.Bot` `static` getBot(`Number` qq);
获取并返回bot对象，若无则返回`null`。

### `Mirai.Bot` `static` createNewBot(`Number` qq, `String` password);

创建一个新的bot，将其添加到BotManager并返回bot对象。参数`qq`和`password`指定了bot的qq号和密码。
> <span style='color:#97ff2e;font-size:10px;'>[http]</span>在http版本中不需要传入`password`。
 
若未指定服务器地址和验证密钥，将抛出`Server host or authenticate key isnt set.`异常。
若验证密钥错误，将抛出`Authenticate key is invaild.`异常。

----

## Mirai.Bot
Bot是bot对象，提供消息处理功能。

### 方法预览
| 返回类型 | 方法 |
|:----:|:----|
| PlaceHolder | PlaceHolder |
| `String` | <span style='color:#97ff2e;font-size:10px;'>[http]</span>getSessionKey() |
| `Number` | subscribe(`Object` subscriber) |
| <span style='color:#aaaaaa;'>VOID</span> | destroy() |
| `Number` | send(<span style='color:#a88bff;'>GroupOrSender</span> target, <span style='color:#a88bff;'>MessageObject</span>) |
| `Number` | sendFriendMessage(<span style='color:#a88bff;'>Sender</span> target, [<span style='color:#a88bff;'>MessageObject</span>][, `Number` quoteId]) |
| `Number` | sendGroupMessage(<span style='color:#a88bff;'>Group</span> target, [<span style='color:#a88bff;'>MessageObject</span>][, `Number` quoteId]) |
| `Number` | sendTempMessage(<span style='color:#a88bff;'>Sender</span> target, <span style='color:#a88bff;'>Group</span> from, [<span style='color:#a88bff;'>MessageObject</span>][, `Number` quoteId]) |
| `Number` | recall(`Number` target) |
| `Array` | getFriendList() |
| `Array` | getGroupList() |
| `Array` | getGroupMemberList(<span style='color:#a88bff;'>Group</span> group) |
| `Boolean` | haveFriend(<span style='color:#a88bff;'>Sender</span> target) |
| <span style='color:#aaaaaa;'>VOID</span> | mute(<span style='color:#a88bff;'>Group</span> group, <span style='color:#a88bff;'>Sender</span>[, `Number` time]) |
| <span style='color:#aaaaaa;'>VOID</span> | unmute(<span style='color:#a88bff;'>Group</span> group, <span style='color:#a88bff;'>Sender</span> target) |
| <span style='color:#aaaaaa;'>VOID</span> | muteAll(<span style='color:#a88bff;'>Group</span> group) |
| <span style='color:#aaaaaa;'>VOID</span> | unmuteAll(<span style='color:#a88bff;'>Group</span> group) |
| <span style='color:#aaaaaa;'>VOID</span> | kick(<span style='color:#a88bff;'>Group</span> group, <span style='color:#a88bff;'>Sender</span> target) |
| <span style='color:#aaaaaa;'>VOID</span> | handleFriendRequest(`JSON` iArg, `Number` isAccept, `String` msg) |
| <span style='color:#aaaaaa;'>VOID</span> | handleMemberJoinRequest(`JSON` iArg, `Number` isAccept, `String` msg) |

> <span style='color:#a88bff;'>紫色参数</span>表示聚合类型，将会在方法详细中介绍。

### 详细方法
### <span style='color:#ff972e;'>➢</span> <span style='color:#97ff2e;font-size:10px;'>[http]</span><span style='color:#aaaaaa;'>`String`</span> getSessionKey()
返回当前bot的sessionKey(由http api分配)。
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> subscribe(`Object` subscriber)
订阅当前bot接受到的消息。
`subscriber`是一个`JSON`对象，它的格式是这样的：
```javascript
bot.subscribe({
  //订阅好友消息
  friend: (sender, message) => {},
  //订阅群组消息
  group: (group, sender, message) => {},  
  //订阅临时消息(从群组来的群友)
  temp: (group, sender, message) => {},  
  //订阅各类其他事件(如新群友进群，撤回消息等)
  event: (event) => {},  
  //捕捉消息接收时的异常
  error: (error) => {}
});
```
在参数中，`sender`的数据类型为`MessageSender`，`group`的数据类型为`GroupInfo`，`message`的类型为`MessageChain`，`error`的数据类型为`Error`或`String`。
订阅什么类型消息是可选的：
```javascript
//只订阅群组消息
bot.subscribe({
  group: (group, sender, message) => {}
});
//不订阅临时消息
bot.subscribe({
  friend: (sender, message) => {},
  group: (group, sender, message) => {},  
  //temp: (group, sender, message) => {},  
  event: (event) => {},  
  error: (error) => {}
})
```
若再次调用`subscribe()`，则会覆盖之前的订阅对象。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> destroy()

将这个bot从BotManager中移除并销毁当前bot对象。

### <span style='color:#ff972e;'>➢</span> `Number` send(<span style='color:#a88bff;'>GroupOrSender</span> target, <span style='color:#a88bff;'>MessageObject</span>)

发送一条消息，<span style='color:#a88bff;'>GroupOrSender</span>表示`GroupInfo`或`MessageSender`，若为`GroupInfo`则表示发送群消息，`MessageSender`则表示发送好友消息，若无这个好友，但在同一个群，会尝试发送临时消息。
若发送成功则返回消息ID，否则返回0。

<span style='color:#a88bff;'>MessageObject</span>是聚合类消息对象，它可以为以下格式：
```javascript
//单消息对象
Plain("hello")
//纯文本，处理时转化成文本消息
"hello"
//多消息对象(多参)
At(xxx), Plain("at你了！")
//多参中纯文本也会转化成文本消息
At(xxx), "at你了！"
//多消息对象(操作符)
At(xxx) + Plain("at你了！")
//操作符中纯文本不能转化成文本消息
///以下写法将出错
At(xxx) + "at你了！"
```
不是很懂？以下例子帮助你理解：
```
send(xxx, At(xxx), Plain("at你！"));
send(xxx, Plain("hello"));
send(xxx, "hello");
send(xxx, At(xxx), Plain("at你了！"));
send(xxx, At(xxx), "at你了！");
send(xxx, At(xxx) + Plain("at你了！"));
```
> 以下所有<span style='color:#a88bff;'>MessageObject</span>的意义都与这里相同。

### <span style='color:#ff972e;'>➢</span> `Number` sendFriendMessage(<span style='color:#a88bff;'>Sender</span> target, [<span style='color:#a88bff;'>MessageObject</span>][, `Number` quoteId])

发送好友消息，<span style='color:#a88bff;'>Sender</span>表示 `Number`类型的用户qq号 或 `MessageSender`类型的消息发送者对象，`quoteId`是可选项，表示引用回复的消息ID。
若发送成功则返回消息ID，否则返回0。

注意这里的<span style='color:#a88bff;'>MessageObject</span>，它是被`[]`套起来的，换句话说这里传入的<span style='color:#a88bff;'>MessageObject</span>是单成员数组：
```javascript
sendFriendMessage(xxx, [Plain("hello")], quoteId);
```
> 以下所有<span style='color:#a88bff;'>Sender</span>的意义都与这里相同。

### <span style='color:#ff972e;'>➢</span> `Number` sendGroupMessage(<span style='color:#a88bff;'>Group</span> target, [<span style='color:#a88bff;'>MessageObject</span>][, `Number` quoteId])

发送群组消息，<span style='color:#a88bff;'>Group</span>表示 `Number`类型的群号 或 `GroupInfo`类型的群组对象，`quoteId`是可选项，表示引用回复的消息ID。
若发送成功则返回消息ID，否则返回0。

这里也需要注意<span style='color:#a88bff;'>MessageObject</span>。

> 以下所有<span style='color:#a88bff;'>Group</span>的意义都与这里相同。

### <span style='color:#ff972e;'>➢</span> `Number` sendTempMessage(<span style='color:#a88bff;'>Sender</span> target, <span style='color:#a88bff;'>Group</span> from, [<span style='color:#a88bff;'>MessageObject</span>][, `Number` quoteId])

发送临时消息，`target`表示要发送对象，`from`表示群组来源，`quoteId`是可选项，表示引用回复的消息ID。
若发送成功则返回消息ID，否则返回0。

同样需要注意<span style='color:#a88bff;'>MessageObject</span>。

### <span style='color:#ff972e;'>➢</span> `Number` recall(`Number` target)

撤回一条消息，`target`指定了要撤回的消息的ID。

### <span style='color:#ff972e;'>➢</span> `Array` getFriendList()

获取当前bot的好友列表，它的格式是这样的：
```javascript
[
  {
    "id":123456789, //QQ号
    "nickname":"", //昵称
    "remark":"" //备注
  },
  {
    "id":987654321,
    "nickname":"",
    "remark":""
  }
]
```
若出现了任何错误，会返回一个空数组。

### <span style='color:#ff972e;'>➢</span> `Array` getGroupList()

获取当前bot的群组列表，它的格式是这样的：
```javascript
[
  {
    "id":123456789, //群号
    "name":"群名1", //群名称
    "permission": "MEMBER" //bot在这个群的权限
  },
  {
    "id":987654321,
    "name":"群名2",
    "permission": "MEMBER"
  }
]
```
若出现了任何错误，会返回一个空数组。

### <span style='color:#ff972e;'>➢</span> `Array` getGroupMemberList(<span style='color:#a88bff;'>Group</span> group)

获取一个群的群员列表数组，`group`指定了要查询的群组。它的格式是这样的：
```javascript
[
  {
    "id":1234567890, //群友qq号
    "memberName":"", //群友群名片
    "permission":"MEMBER" //群友权限对应Permission.MEMBER/ADMIN/OWNER
    /*"group":{
        "id":12345,
        "name":"群名1",
        "permission": "MEMBER"
    }*/
  },
  {
    "id":9876543210,
    "memberName":"",
    "permission":"OWNER"
    /*"group":{
        "id":54321,
        "name":"群名2",
        "permission": "MEMBER"
    }*/
  }
]
```
若出现了任何错误，会返回一个空数组。

### <span style='color:#ff972e;'>➢</span> `Boolean` haveFriend(<span style='color:#a88bff;'>Sender</span> target)

判断bot是否有这个好友，`target`指定了查询的对象。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> mute(<span style='color:#a88bff;'>Group</span> group, <span style='color:#a88bff;'>Sender</span>[, `Number` time])

禁言一个群员，`group`指定要操作的群，`target`指定要禁言的成员，`time`指定禁言的时间(秒)。
注：需要bot有对应权限！

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> unmute(<span style='color:#a88bff;'>Group</span> group, <span style='color:#a88bff;'>Sender</span> target)

解除禁言一个群员，`group`指定要操作的群，`target`指定要解除禁言的成员。

注：需要bot有对应权限！
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> muteAll(<span style='color:#a88bff;'>Group</span> group)

全体禁言一个群组，`group`指定要操作的群。

注：需要bot有对应权限！
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> unmuteAll(<span style='color:#a88bff;'>Group</span> group)

解除全体禁言一个群组，`group`指定要操作的群。

注：需要bot有对应权限！
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> kick(<span style='color:#a88bff;'>Group</span> group, <span style='color:#a88bff;'>Sender</span> target)

踢出群组的某个群员，`group`指定要操作的群，`target`指定要踢出的群员。

注：需要bot有对应权限！
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> handleFriendRequest(`JSON` iArg, `Number` isAccept, `String` msg)

处理一个好友请求，`iArg`必须为新好友事件的`event.toIArg()`方法返回的JSON。
`isAccept`表示要执行的操作，`0`为同意好友请求; `1`为拒绝好友请求; `2`为拒绝添加好友并添加黑名单，不再接收该用户的好友申请。
`msg`是可选的，表示拒绝同意好友请求的理由。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> handleMemberJoinRequest(`JSON` iArg, `Number` isAccept, `String` msg)

处理一个好友请求，`iArg`必须为新成员入群事件的`event.toIArg()`方法返回的JSON。
`isAccept`表示要执行的操作，`0`为同意入群请求; `1`为拒绝入群请求; `2`为忽略入群请求; `3`为拒绝入群并添加黑名单，不再接收该用户的入群申请; `4`为忽略入群并添加黑名单，不再接收该用户的入群申请。
`msg`是可选的，表示拒绝入群请求的理由。
注：需要bot有对应权限！

----

## Mirai.MessageChain
MessageChain提供消息链构造方法。
(QQ的一个消息可能是由各种消息构成的，如"文字+图片"。Mirai对此的处理方式是：将这些复合消息转化成各种类型消息构成的消息链。)

### 方法预览
| 返回类型 | 方法 |
|:----:|:----|
| PlaceHolder | PlaceHolder |
| <span style='color:#aaaaaa;'>`Number`</span> | length()</span> |
| `MessageType.?` | get(`MessageTypeConst.?` type) |
| `Boolean` | contain(`String`/`RegExp` text) |
| `MessageChain` | <span style='color:#aaaaaa;'>discord(`MessageTypeConst.?` type)</span> |
| `MessageChain` | <span style='color:#aaaaaa;'>add(<span style='color:#a88bff;'>MessageObject</span> messages)</span> |
| `MessageChain` | <span style='color:#aaaaaa;'>addF(<span style='color:#a88bff;'>MessageObject</span> messages)</span> |
| `String` | toString() |

### 详细方法
### <span style='color:#ff972e;'>➢</span> `Number` length()

返回消息链中消息对象的数目。

### <span style='color:#ff972e;'>➢</span> `MessageType.?` get(`MessageTypeConst.?` type)

返回消息链中第一个类型为`type`的消息。
若该链中不存在`type`类型的消息，则返回一个新的参数均为`null`的`type`类型的消息。

### <span style='color:#ff972e;'>➢</span> `Boolean` contain(`String`/`RegExp` text)

判断消息链中的文本消息是否包含`text`文字或正则表达式。

### <span style='color:#ff972e;'>➢</span> `MessageChain` discord(`MessageTypeConst.?` type)

删除(丢弃)消息链中所有类型为`type`的消息，并返回自己(方便链式调用)。
若消息链无`type`类型的消息，则什么也不会做。

### <span style='color:#ff972e;'>➢</span> `MessageChain` add(<span style='color:#a88bff;'>MessageObject</span> messages)

在消息链末端追加消息对象或消息链，并返回自己(方便链式调用)。

### <span style='color:#ff972e;'>➢</span> `MessageChain` addF(<span style='color:#a88bff;'>MessageObject</span> messages)

在消息链首端追加消息对象或消息链，并返回自己(方便链式调用)。

### <span style='color:#ff972e;'>➢</span> `String` toString()

返回消息链原始JSON信息字符串。

----

## Mirai.MessageSender
MessageSender消息发送者对象。
> MessageSender只从`Bot.subscribe`返回，实例化`MessageSender`是没有任何意义的。

### 构造函数与方法预览
| 返回类型 | 方法 |
|:----:|:----|
| `Number` | getId() |
| `String` | getName() |
| `Permission` | getPermission() |
| `Number` | getSourceId() |
| `Number` | send(<span style='color:#a88bff;'>MessageObject</span> messages) |
| `Number` | reply(<span style='color:#a88bff;'>MessageObject</span> messages) |
| `Number` | at(<span style='color:#a88bff;'>MessageObject</span> messages) |
| <span style='color:#aaaaaa;'>VOID</span> | mute(`Number` time) |
| <span style='color:#aaaaaa;'>VOID</span> | unmute() |
| <span style='color:#aaaaaa;'>VOID</span> | kick(`String` msg) |
| `String` | toString() |

### 详细方法
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`Number`</span> getId()

返回该用户QQ号。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`String`</span> getName()

返回该用户名称。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`Permission`</span> getPermission()

返回在群群的权限，若为subscribe()的friend返回的MessageSender，则为`null`


### <span style='color:#ff972e;'>➢</span> `Number` getSourceId()

MessageSender都是通过订阅的消息构造的，该方法返回这条消息的ID用于引用或撤回消息。

### <span style='color:#ff972e;'>➢</span> `Number` send(<span style='color:#a88bff;'>MessageObject</span> messages)

给这个用户发送私人消息并返回消息ID，若无好友则发送临时消息。

### <span style='color:#ff972e;'>➢</span> `Number` reply(<span style='color:#a88bff;'>MessageObject</span> messages)

回复这个用户的消息并返回消息ID。

### <span style='color:#ff972e;'>➢</span> `Number` at(<span style='color:#a88bff;'>MessageObject</span> messages)

at这个用户并发送消息并返回消息ID。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> mute(`Number` time)

禁言这个用户，`time`指定了要禁言的时间(秒)，若为subscribe()的friend返回的MessageSender，则什么也不做。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> unmute()

解禁这个用户，若为subscribe()的friend返回的MessageSender，则什么也不做。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> kick(`String` msg)

将这个用户踢出群组，`msg`为踢出原因，若为subscribe()的friend返回的MessageSender，则什么也不做。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> `String` toString()

返回该用户信息。

----

## Mirai.GroupInfo
GroupInfo为群组对象。
> GroupInfo只从`Bot.subscribe`返回，实例化`GroupInfo`是没有任何意义的。

### 构造函数与方法预览
| 返回类型 | 方法 |
|:----:|:----|
| `Number` | getId() |
| `String` | getName() |
| `Permission` | getPermission() |
| `Number` | send(<span style='color:#a88bff;'>MessageObject</span> messages) |
| `Number` | reply(<span style='color:#a88bff;'>MessageObject</span> messages) |
| `Number` | at(<span style='color:#a88bff;'>Sender</span> target, <span style='color:#a88bff;'>MessageObject</span> messages) |
| <span style='color:#aaaaaa;'>VOID</span> | mute(<span style='color:#a88bff;'>Sender</span> target, `Number` time) |
| <span style='color:#aaaaaa;'>VOID</span> | unmute(<span style='color:#a88bff;'>Sender</span> target) |
| <span style='color:#aaaaaa;'>VOID</span> | muteAll() |
| <span style='color:#aaaaaa;'>VOID</span> | unmuteAll() |
| <span style='color:#aaaaaa;'>VOID</span> | kick(<span style='color:#a88bff;'>Sender</span>, `String` msg) |
| `String` | toString() |

### 详细方法
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`Number`</span> getId()

返回该QQ群的群号。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`String`</span> getName()

返回该QQ群的名称。
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`Permission`</span> getPermission()

返回成员在该群的权限(一般为bot)。

### <span style='color:#ff972e;'>➢</span> `Number` send(<span style='color:#a88bff;'>MessageObject</span> messages)

给这个群组发送消息并返回消息ID。

### <span style='color:#ff972e;'>➢</span> `Number` reply(<span style='color:#a88bff;'>MessageObject</span> messages)

GroupInfo都是通过订阅的消息构造的，该方法回复这条消息的发送者并返回消息ID。

### <span style='color:#ff972e;'>➢</span> `Number` at(<span style='color:#a88bff;'>Sender</span> target, <span style='color:#a88bff;'>MessageObject</span> messages)

at用户并发送消息并返回消息ID。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> mute(<span style='color:#a88bff;'>Sender</span> target, `Number` time)

禁言这个用户，`target`指定了要禁言的群成员，`time`指定了要禁言的时间(秒)。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> unmute(<span style='color:#a88bff;'>Sender</span> target)

解禁这个用户，`target`指定了要解禁的群成员。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> muteAll()

全体禁言。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> unmuteAll()

解除全体禁言。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> kick(<span style='color:#a88bff;'>Sender</span> target, `String` msg)

将这个用户踢出群组，`target`为踢出的群友，`msg`为踢出原因，若为subscribe()的friend返回的GroupInfo，则什么也不做。
注：需要bot有对应权限。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>`String`</span> toString()

返回该群信息。

## Mirai.GroupInfo.Permission
该常量集用于表示群组成员权限
### `Permission.OWNER` 群主
### `Permission.ADMIN` 管理员
### `Permission.MEMBER` 普通成员

----

## Mirai.MessageType
MessageType提供各种消息类型的方法，提供给sdk使用者的都是静态方法。

### 所有子类
| 类名称 | 对应消息类型 |
|:----:|:----|
| `Source` | 源消息连首 |
| `Quote` | 引用(回复) |
| `Plain` | 文字 |
| `Image` | 图片 |
| `FlashImage` | 闪照 |
| `Face` | QQ表情 |
| `At` | @某人 |
| `AtAll` | @全体成员 |
| `Xml` | XML消息 |
| `Json2` | JSON消息 |
| `App` | APP消息 |
| `Poke` | 戳一戳 |

### 详细方法

> 不需要实例化消息类型

### Source(`Number` id, `Number` time)

源消息链首，`id`为消息ID，`time`为UNIX时间。
> 构建Source类型消息毫无意义，因为Source只作为群组消息ID的标记，而发送消息不需要消息ID(除了引用)。

### Quote(`Number` id, `Number` senderId, `Number` groupId, `Mirai.MessageChain` origin)

引用消息，`id`为消息ID，`senderId`为引用原文发送者QQ号，`groupId`为该消息QQ群的群号，`origin`为引用原文消息链。
> 构建Quote类型消息毫无意义，因为发送引用消息的方法是在Bot.sendGroupMessage的第三个参数传入要引用的消息ID或GroupInfo.reply或MessageSender.reply。

### Plain(`String` text)

文字消息，`text`为文本内容。

### Image(`String` imageId, `String` url, `String` path)

图片消息，`imageId`为图片的UUID，`url`为图片的链接，`path`为图片本地链接。
三者可以任选一个参数，当同时有多个参数时，http api会按照`imageId`>`url`>`path`的优先级发送图片。
接收到的图片永远不可能会有`path`。

### FlashImage(`String` imageId, `String` url, `String` path)

闪照消息，用法和`Image`完全相同。

### Face(`Number` faceId, `String` name)

QQ表情，`faceId`为表情编号(优先级高于后面的name)，`name`为表情名称。

### At(`Number` target, `String` displayText)

@某人，`taeget`为被@的人的QQ号，`displayText`为@发送时显示的@文字。

### AtAll()

@全体成员。

### Xml(`String` xml)

XML消息，`xml`为XML消息内容。

### Json2(`String` json)

JSON消息，`json`为JSON消息内容。

### App(`String` app)

APP消息，`app`为APP消息内容。

### Poke(`PokeType.?` name)

Poke(戳一戳)消息，`name`为Poke消息内容。

</br>
所有消息类型的获取只需要对应参数前面加`get`并将参数首字母大写。
像这样：
```javascript
Mirai.MessageType.Image.getImageId();
Mirai.MessageType.App.getApp();
Mirai.MessageType.At.getTarget();
```
所有消息类型都有`toString()`方法，该方法返回原始JSON消息对象数据。 

## Mirai.MessageTypeConst
MessageTypeConst保存一些静态常量。
### `SOURCE` 源消息链首
### `QUOTE` 引用消息
### `PLAIN` 文字消息
### `IMAGE` 图片消息
### `FLASHIMAGE` 闪照消息
### `FACE` QQ表情
### `AT` @某人
### `ATALL` @全体成员
### `XML` XML消息
### `JSON2` JSON消息
### `APP` APP消息
### `POKE` 戳一戳消息
### PokeType
### `PokeType.POKE` 戳一戳
### `PokeType.SHOWLOVE` 比心
### `PokeType.LIKE` 点赞
### `PokeType.HEARTBROKEN` 心碎
### `PokeType.SIXSIXSIX` 666
### `PokeType.FANGDAZHAO` 放大招

----

## Mirai.EventType(Const)
EventType为`Bot.subscribe`中的其他事件event的参数中的`event`的类型基类
> 注：`EventType.?`只作为返回参数，构造它们是没有任何意义的。

### 所有事件类型
在`Bot.subscribe`中的`event`中，我们可以通过判断`event.type`来确定接受到的事件类型。
下面是所有事件类型常量(`EventTypeConst.?`): 
它们后面对应着event中有的属性

### <span style='color:#ff972e;'>➢</span>`BOT_ONLINE`: bot上线
`Number` id: bot的qq号

### <span style='color:#ff972e;'>➢</span>`BOT_OFFLINE`: bot下线
`Number` id: bot的qq号

### <span style='color:#ff972e;'>➢</span>`BOT_OFFLINE_FORCE`: bot被挤下线
`Number` id: bot的qq号

### <span style='color:#ff972e;'>➢</span>`BOT_OFFLINE_DROPPED`: bot异常下线
`Number` id: bot的qq号

### <span style='color:#ff972e;'>➢</span>`BOT_RELOGIN`: bot重新登录
`Number` id: bot的qq号

### <span style='color:#ff972e;'>➢</span>`GROUP_RECALL`: 群组撤回消息
`Number` senderId: 撤回者QQ号
`Number` messageId: 撤回的消息的id
`Number` time: 撤回时间
`GroupInfo` group: 事件发生所在的群组
`MessageSender` operator: 撤回者信息

### <span style='color:#ff972e;'>➢</span>`FRIEND_RECALL`: 好友撤回消息
`Number` senderId: 撤回者QQ号
`Number` messageId: 撤回的消息的id
`Number` time: 撤回时间

### <span style='color:#ff972e;'>➢</span>`BOT_GROUP_PERMISSION_CHANGE`: bot在群的权限被改变
`Permission` before: 改前权限
`Permission` after: 改后权限
`GroupInfo` group: 事件发生所在群组

### <span style='color:#ff972e;'>➢</span>`BOT_MUTE`: bot被禁言
`Number` duration: 禁言时长
`MessageSender` operator: 禁言者
(群组信息可以在`event.getOperator().group`找到)

### <span style='color:#ff972e;'>➢</span>`BOT_UNMUTE`: bot被解除禁言
`MessageSender` operator: 禁言者
(群组信息可以在`event.getOperator().group`找到)

### <span style='color:#ff972e;'>➢</span>`BOT_JOIN_GROUP`: bot新加入群组
`GroupInfo` group: 加入的群组

### <span style='color:#ff972e;'>➢</span>`GROUP_NAME_CHANGE`: 群名称改变
`String` before: 改之前名称
`String` after: 改之后名称
`GroupInfo` group: 事件发生所在群组
### <span style='color:#ff972e;'>➢</span>`GROUP_ENTRANCE_ANN_CHANGE`: 入群公告改变
`String` before: 改之前入群公告
`String` after: 改之后入群公告
`GroupInfo` group: 事件发生所在群组
`MessageSender` operator: 操作者

### <span style='color:#ff972e;'>➢</span>`GROUP_MUTE_ALL`: 群全体禁言事件
`Boolean` before: 之前是否禁言
`Boolean` after: 之后是否禁言
`GroupInfo` group: 事件发生所在群组
`MessageSender` operator: 操作者

### <span style='color:#ff972e;'>➢</span>`GROUP_ALLOW_ANONYMOUS_CHAT`: 匿名聊天
未写

### <span style='color:#ff972e;'>➢</span>`GROUP_ALLOW_CONFESS_TALK`: 坦白说
未写

### <span style='color:#ff972e;'>➢</span>`GROUP_ALLOW_MEMBER_INVITE`: 允许成员邀请其他人入群
未写

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_JOIN`: 新人入群
`MessageSender` member: 入群人信息
(群组信息可以在`event.getMember().group`找到)

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_KICK`: 群员被踢
`MessageSender` target: 被踢人信息
`MessageSender` operator: 操作者
(群组信息可以在`event.getOperator/Target().group`找到)

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_QUIT`: 群员退群
`MessageSender` member: 退群人信息
(群组信息可以在`event.getMember().group`找到)

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_NAME_CHANGE`: 群成员昵称改变 
`String` before: 改之前昵称
`String` after: 改之后昵称
`MessageSender` target: 被改昵称的人
`MessageSender` operator: 操作者(自己或者管理员)
(群组信息可以在`event.getOperator/Target().group`找到)

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_FAME_CHANHE`: 群特殊头衔改变
`String` before: 改之前头衔(空或有)
`String` after: 改之后头衔
`MessageSender` target: 被改特殊头衔的人
(群组信息可以在`event.getTarget().group`找到)

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_PERMISSION_CHANGE`: 群成员权限改变(不能是bot)
`Permission` before: 改之前权限
`Permission` after: 改之后权限
`MessageSender` target: 被改权限的人

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_MUTE`: 群员被禁言
`Number` duration: 禁言时长
`MessageSender` target: 被禁言的人
`MessageSender` operator: 操作者(自己或者管理员)

### <span style='color:#ff972e;'>➢</span>`GROUP_MEMBER_UNMUTE`: 群员被解除禁言
`MessageSender` target: 被解除禁言的人
`MessageSender` operator: 操作者(自己或者管理员)

### <span style='color:#ff972e;'>➢</span>`NEW_FRIEND_REQUEST`: 新好友请求事件
`Number` eventId: 事件ID，用于标识事件
`Number` fromId: 新好友QQ号
`Number` groupId: 新好友来自的群(`0`为不是通过群加的好友)
`String` nickname: 新好友昵称
特殊方法: 
`event.accept()` 同意好友请求。
`event.reject()` 拒绝好友请求。
`event.block()` 拒绝并拉黑，不再接收请求。
`event.toIArg()`用于获取要传入`Bot.handleFriendRequest`的一个参数。
(下面有例子)

### <span style='color:#ff972e;'>➢</span>`NEW_MEMBER_JOIN_REQUEST`: 新成员入群请求事件
`Number` eventId: 事件ID，用于标识事件
`Number` fromId: 加群人QQ号
`Number` groupId: 加群群号
`String` groupName: 加群群名称
`String` nickname: 加群人昵称
特殊方法: 
`event.accept()` 同意加群请求。
`event.reject()` 拒绝加群请求。
`event.ignore()` 忽略加群请求。
`event.ignoreAndBlock()` 忽略加群请求并不再接收请求。
`event.rejectAndBlock()` 拒绝加群请求并不再接收请求。
`event.toIArg()`用于获取要传入`Bot.handleMemberJoinRequest`的一个参数。


所有的属性都可以通过调用`event.getXxx()`(get+属性首字母大写)方法来过得。
</br>下面通过一个例子展示用法：
```javascript
  ...
  event: (event) => {
    //群组改名提示
    if(event.type == GROUP_NAME_CHANGE){
      bot.sendGroupMessage(
        event.group.id, //这是群qq号
        [Plain("Administrator changed the group mame \"" + event.getBefore() + "\" to \"" + event.getAfter() + "\"")]
      );
    }
    //自动同意新好友请求
    if(event.type == NEW_FRIEND_REQUEST){
      //以下两个方法是等价的
      bot.handleFriendRequest(event.toIArg(), 0);
      event.accept();
    }
  },
  ...
```

----

## Mirai.utils.file
file类提供简单的文件读取和写入方法。

### 方法预览
| 返回类型 | 方法 |
|:----:|:----|
| <span style='color:#aaaaaa;'>VOID</span> | `static` create(`String` path) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` remove(`String` path) |
| `?` | `static` read(`String` path, `?` mode) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` writeString(`String` path, `String` string, `Boolean` isCover) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` writeStream(`String` path, `java.io.InputStream` inputStream, `Boolean` isCover, `Boolean` isInputStreamClose) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` appendString(`String` path, `String` appendString) |

### 详细方法
### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` create(`String` path)

在`path`创建一个文件或目录。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` remove(`String` path)

删除在`path`的一个文件或目录。

### <span style='color:#ff972e;'>➢</span> `?` `static` read(`String` path, `?` mode)

读取在`path`的文件。
如果`mode`为`Mirai.utils.file.STRING`，则返回文件内容。
如果`mode`为`Mirai.utils.file.STREAM`，则返回文件输入流。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` writeString(`String` path, `String` string, `Boolean` isCover)

写入字符串到`path`的文件。
`isCover`设定是否在文件已存在的情况下覆盖文件内容。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` writeStream(`String` path, `java.io.InputStream` inputStream, `Boolean` isCover, `Boolean` isInputStreamClose)

写入字符串到`path`的文件。
`isCover`设定是否在文件已存在的情况下覆盖文件内容。
`isInputStreamClose`设定是否在写入完成后关闭并回收输入流。

### <span style='color:#ff972e;'>➢</span> <span style='color:#aaaaaa;'>VOID</span> `static` appendString(`String` path, `String` appendString)

追加字符串到`path`的文件。

----

## Mirai.utils.http
http类提供简单HTTP POST/GET方法。

### 方法预览
| 返回类型 | 方法 |
|:----:|:----|
| [`Number`, `java.io.InputStream`] | `static` getInputStream(`String` url[, `Array` headers]) |
| `String` | `static` get(`String` url[, `Array` headers, `Boolean` isLineBreak]) |
| `String` | `static` post(`String` url, `String` params[, `Array` headers]) |

### 详细方法
### <span style='color:#ff972e;'>➢</span> [`Number`, `java.io.InputStream`] `static` getInputStream(`String` url[, `Array` headers])

读取远程服务器资源并返回输入流，常用于获取图片，音乐等非文字信息。
`headers`是可选的，指定了请求头，它应该是这样的格式：
```javascript
[
  ["Content-Type", "blablabla"],
  ["Connection", "Keep-Alive"],
  ["...", "..."]
]
```
返回的Array中，第一个元素为输入流大小(文件大小)，第二个元素为输入流。

### <span style='color:#ff972e;'>➢</span> `String` `static` get(`String` url[, `Array` headers, `Boolean` isLineBreak]) |

读取远程服务器资源并返回字符串。
`isLineBreak`指定是否有换行符，若为`false`则读取后的字符串都在一行。

### <span style='color:#ff972e;'>➢</span> `String` `static` post(`String` url, `String` params[, `Array` headers])

向远程服务器发送请求。

----

## Mirai.Log
Log类向控制台输出日志，自动适配标准输出流和AutoJS控制台。

### 方法预览
| 返回类型 | 方法 |
|:----:|:----|
| <span style='color:#aaaaaa;'>VOID</span> | `static` v(`Object` object) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` i(`Object` object) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` w(`Object` object) |
| <span style='color:#aaaaaa;'>VOID</span> | `static` e(`Object` object) |

他们分别对应着verbose，info，warning和error消息，这里只是颜色不同而已。