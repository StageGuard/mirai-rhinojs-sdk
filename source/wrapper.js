const scope = this;

var host = java.lang.System.getProperty("os.name"), ajs = false;
if("context" in scope) {host = "Android_AutoJS"; ajs = true; console.show();}

var http_get = function(url) {
	var result = [];
	var bufferedReader = null;
	try {
		var urlConnect = new java.net.URL(url);
		var connection = urlConnect.openConnection();
		connection.setDoInput(true);
		bufferedReader = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
		var line;
		while ((line = bufferedReader.readLine()) != null) {
			result.push(line);
		}
		if (bufferedReader != null) bufferedReader.close();
	} catch (error) {
		if (bufferedReader != null) bufferedReader.close();
		throw error;
	}
	return result.join("\n");
}
var readStdinLine = function() {
	var is = new java.io.InputStreamReader(java.lang.System.in);
	var br = new java.io.BufferedReader(is);
	var r = br.readLine();
	return r;
}
var log = function(str){
	if(ajs) {
		console.log(str);
	} else {
		java.lang.System.out.println(str);
	}
}

//实现core版本后将会开放版本选择
/*var prompt = "请选择 Mirai RhinoJS SDK 版本！\n它们的异同请在项目readme中查看。"
var iflag = false;
var input, options = ["core", "http", "ws"];
log(prompt);
while(!iflag) {
	if(ajs) {
		input = options[dialogs.select(prompt, options)];
	} else {
		input = readStdinLine();
	}
	for(var i in options) {
		if(input == options[i]) iflag = true;
	}
	if(!iflag) log("无效选择，请重试！");
}*/

var input = "http";
scope["Mirai"] = eval("(" + http_get("https://cdn.jsdelivr.net/gh/StageGuard/mirai-rhinojs-sdk/source/MiraiQQBot." + input + ".js") + ")");

delete host;
delete http_get;
delete log;
delete input;
delete readStdinLine;

Mirai.init(scope);