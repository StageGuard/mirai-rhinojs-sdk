这里是一些脚本demo，可以帮助你快去理解。

## 如何使用？
```javascript
Mirai.loadExternalObject(scope, "https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/demo/xxx.js", "XXX");
...
bot.subscribe({
  group: (group, sender, message) => {
    //这里的subscribe是在XXX里定义的，你也可以换成你的方式。
    XXX.subscribe(group, sender, message);
  },
 });
```