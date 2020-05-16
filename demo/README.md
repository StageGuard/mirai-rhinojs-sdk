这里是一些脚本demo，可以帮助你快速理解与开发。

## 如何使用？
```javascript
Mirai.loadExternalObject(scope, "https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/demo/xxx.js", "XXX");
...
bot.subscribe({
  group: (group, sender, message) => {
    //这里的subscribe是在XXX里定义的，你也可以换成你的方式。
    XXX.subscribe(group, sender, message);
    //为了防止耗时操作阻塞监听线程，你可以使用rsync异步执行
    rsync.run((s) => XXX.subscribe(group, sender, message));
  },
  friend: (sender, message) => {
    XXX.subscribe(null, sender, message);
  }
 });
```