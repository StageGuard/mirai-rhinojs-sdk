# mirai-rhinojs-sdk
Provide Mozilla Rhino JS SDK for plugin [mirai-api-http](https://github.com/mamoe/mirai-api-http) of [Mirai](https://github.com/mamoe/mirai)

## What is Mozilla Rhino？
Mozilla Rhino: JavaScript in Java

![Rhino](https://developer.mozilla.org/@api/deki/files/832/=Rhino.jpg)

Rhino is an implementation of JavaScript in Java.

----

## Quick Start：
```bash
#clone mirai-rhiojs
git clone https://github.com/StageGuard/mirai-rhinojs-sdk
#download rhino
wget https://github.com/mozilla/rhino/releases/download/Rhino1_7_12_Release/rhino-1.7.12.jar
```
②Clone this repo
```bash
git clone https://github.com/StageGuard/mirai-rhinojs-sdk
```
After this, you need to modify variable `server`，`authKey` and `qqnum` in `demo.js`
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

![Success](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/status.png)

Now try to send a poke message(SIXSIXSIX) to your bot.

![Poke message](https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/static/poke.png)

----

This script can also run in Android phone，Please see [my blog](https://stageguard.top/2020/04/01/run-qqbot-on-termux-android/) for more details.

----

All functions are under testing，Please open a issue if you surface a bug。

All methods and usage can be found in [SDK Documentation](https://stageguard.top/p/mirai-rhinojs-sdk.html)

----

## To-Do
- [x] 编写SDK文档
- [ ] 支持监听EventMessage
- [ ] 将MozillaRhino整合成mirai插件

## Changelog

### 2020.04.07 → 1.4_alpha

* Change `Permission` parent to `Mirai.GroupInfo`
* Change `GroupSenderInfo.getGroupInfo()` to `GroupSenderInfo.getGroup()`
* Add and support hooking event: `Mirai.EventType(Const)`
* `Change Mirai.MessageListener.hookOtherMessage(JSON msg)` to `Mirai.MessageListener.hookEvent(Mirai.EventType.? event)` for hooking events.

Doc has updated!

### 2020.04.06 → 1.3.1_alpha

* Adapt data received from `/fetchMessage` for `mirai-api-http` v1.5.
* Add `Mirai.MessageType.FlashImage` message， usege is the same with `Mirai.MessageType.Image`
* Add param `path` to the constructor of `Mirai.MessageType.(Flash)Image`

### Apr 6th, 2020 → 1.3_alpha
* Now you can call `Session.sendMessage` to send `Mirai.MessageType.?` directly instead of building a message chain for a only message object.
* Change `Mirai.GroupInfo.getBotPermission` to `Mirai.GroupInfo.getPermission`
* Add constant OWNER, ADMIN and MEMBER to `Mirai.GroupInfo.Permission`
* Add`Mirai.EventType` and `Mirai.EventTypeConst`.\nIn another word that now support hook various events.
* (Change `hookOtherMessage(JSON msg)` to `hookEvent(Mirai.EventType.? event)` in function `Mirai.MessageListener`)
* Update demo.js for showing new features of MiraiBot_HTTP.js
* Fix some remaining bugs.

### Apr 5th, 2020 → 1.2_alpha
* Change the arguments of `MessageChain.build` 
* Add `Session.getCachedMessage`
* Add `MessageChain.discordMessage`
* Add `MessageChain.addMessage`
* Add `MessageChain.addMessageF`
* Add `MessageChain.toChainArray`

For the usage of these new function, please see [SDK Documentation](https://stageguard.top/p/mirai-rhinojs-sdk.html)


### Apr 5th, 2020 → 1.1_alpha
* Fix a bug which causes an error after running 30 minutes.
* Add Mirai.Session.recall(). Now you can recall message.
* Fix an error while error occurred when hooking meeeages.
* Fix a bug that cannot hook other messages.
### Apr 4th, 2020 → 1.0_alpha
* Initial release

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
