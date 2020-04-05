/*
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
*/

{
	module: "Shell",
	
	BASH: "bash",
	SH: "sh",
	COMMAND_EXIT: "exit",
	COMMAND_LINE_RND: "\n",

	gThreadGroup: new java.lang.ThreadGroup("ShellGroups"),

	Executor: (function() {
		var r = function(shell) {
			this.shell = shell;
			this.thread = null;
			this.timeout_limit = 300000;
		};
		r.prototype = {
			setLoginShell: function(s) {
				if (s) this.shell = s;
			},
			getLoginShell: function() {
				return this.shell;
			},
			setTimeoutLimit: function(time) {
				if (time) this.timeout_limit = time;
			},
			getTimeoutLimit: function(time) {
				return this.timeout_limit;
			},
			execute: function(command) {
				var process, processBuilder, os;
				var successResult = null,
				errorResult = null;
				var shell = this.shell;
				var rResult = null;
				var timeout_limit = this.timeout_limit;
				try {
					processBuilder = new java.lang.ProcessBuilder(shell, "-c", command);
					processBuilder.directory(new java.io.File(java.lang.System.getProperty("user.home")));
					process = processBuilder.start(); (new java.lang.Thread(new java.lang.Runnable({
						run: function() {
							java.lang.Thread.sleep(timeout_limit);
							if (process != null) process.destroy();
						}
					}))).start();
					rResult = process.waitFor();
					successMsg = new java.lang.StringBuilder();
					errorMsg = new java.lang.StringBuilder();
					successResult = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()));
					errorResult = new java.io.BufferedReader(new java.io.InputStreamReader(process.getErrorStream()));
					var s;
					while ((s = successResult.readLine()) != null) {
						successMsg.append(s);
						successMsg.append(Shell.COMMAND_LINE_RND);
					}
					while ((s = errorResult.readLine()) != null) {
						errorMsg.append(s);;
						errorMsg.append(Shell.COMMAND_LINE_RND);
					}
					if (successResult != null) successResult.close();
					if (errorResult != null) errorResult.close();
					if (process != null) process.destroy();
					process = null;
					return {
						code: rResult,
						success: successMsg.toString(),
						error: errorMsg.toString()
					};
				} catch(error) {
					Log.i("Timeout: " + command);
					if (successResult != null) successResult.close();
					if (errorResult != null) errorResult.close();
					if (process != null) process.destroy();
					process = null;
					return {
						code: 1,
						success: "",
						error: "Timeout after " + (timeout_limit / 1000) + " seconds."
					};
				}

			},
			terminate: function() {},
		};
		return r;
	} ()),

}