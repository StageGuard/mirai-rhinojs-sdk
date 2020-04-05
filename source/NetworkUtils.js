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
	module: "NetworkUtils",
	getInputStream: function(url, headers) {
		try {
			var urlConnect = new java.net.URL(url);
			var connection = urlConnect.openConnection();
			if (headers != null) {
				for (var i in headers) {
					connection.setRequestProperty(headers[i][0], headers[i][1]);
				}
			}
			connection.setDoInput(true);
			connection.connect();
			return [connection.getContentLength(), connection.getInputStream()];
		} catch(e) {
			throw e;
			return "";
		}
	},
	post: function(url, param, headers) {
		//Log.i("POST: " + url + "\nparams: " + _toSource(param));
			var result = "";
			var bufferedReader = null;
			var printWriter = null;
			try {
				var urlConnect = new java.net.URL(url);
				var connection = urlConnect.openConnection();
				for (var i in headers) {
					connection.setRequestProperty(headers[i][0], headers[i][1]);
				}
				connection.setConnectTimeout(12000);
				connection.setDoOutput(true);
				connection.setDoInput(true);
				printWriter = new java.io.PrintWriter(connection.getOutputStream());
				printWriter.print(param);
				printWriter.flush();
				bufferedReader = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
				var line;
				while ((line = bufferedReader.readLine()) != null) {
					result += line;
				}
				if (bufferedReader != null) bufferedReader.close();
				if (printWriter != null) printWriter.close();
			} catch (error) {
				if (bufferedReader != null) bufferedReader.close();
				if (printWriter != null) printWriter.close();
				throw error;
			}
			return result;
		},
		get: function(url, headers, isLineBreak) {
			var result = "";
			var bufferedReader = null;
			try {
				var urlConnect = new java.net.URL(url);
				var connection = urlConnect.openConnection();
				for (var i in headers) {
					connection.setRequestProperty(headers[i][0], headers[i][1]);
				}
				connection.setConnectTimeout(12000);
				connection.setDoInput(true);
				bufferedReader = new java.io.BufferedReader(new java.io.InputStreamReader(connection.getInputStream()));
				var line;
				while ((line = bufferedReader.readLine()) != null) {
					result += line;
					if(isLineBreak) result += "\n";
				}
				if (bufferedReader != null) bufferedReader.close();
			} catch (error) {
				throw error;
				if (bufferedReader != null) bufferedReader.close();
			}
			return result;
		}
}