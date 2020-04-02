{
	module: "FileIO",
	STRING: 1,
	STREAM: 2,
	create: function(storage) {
		storage = storage.split(java.io.File.separator);
		if ((/\./i).test(storage[storage.length - 1]) && !(/^\./i).test(storage[storage.length - 1])) {
			var path = "";
			for (var i in storage) path += ((i == storage.length - 1) ? ("") : (storage[i]) + ((i == storage.length - 1) ? ("") : (java.io.File.separator)));
			var file = path + storage[storage.length - 1];
			var pathF = new java.io.File(path);
			if (!pathF.isDirectory() || !pathF.exists()) pathF.mkdirs();
			var fileF = new java.io.File(file);
			if (!fileF.isFile() || !fileF.exists()) fileF.createNewFile();
		} else {
			var path = "";
			for (var i in storage) path += ((storage[i]) + ((i == storage.length - 1) ? ("") : (java.io.File.separator)));
			var file = new java.io.File(path);
			if (!file.isDirectory() || !file.exists()) file.mkdirs();
		}
	},
	remove: function(storage) {
		var path = new java.io.File(storage);
		if (path.exists()) path.delete();
	},
	read: function(path, mode) {
		var file = new java.io.File(path);
		if (file.exists()) {
			try {
				var inputStream = new java.io.FileInputStream(file);
				if (mode == this.STREAM) {
					return inputStream;
					return new java.io.ByteArrayInputStream(byteArray);
				} else {
					var inputStreamReader = new java.io.InputStreamReader(inputStream);
					var bufferedReader = new java.io.BufferedReader(inputStreamReader);
					var stringBuffer = new java.lang.StringBuffer();
					var line = null;
					while ((line = bufferedReader.readLine()) != null) {
						stringBuffer.append(line);
						stringBuffer.append("\n");
					}
					inputStreamReader.close();
					return stringBuffer.toString();
				}
			} catch(error) {
				throw error;
				return "";
			}
		} else {
			throw ("File not exist: " + path);
			return "";
		}
	},
	writeString: function(path, string, isCover) {
		try {
			var file = new java.io.File(path);
			if (!file.exists()) {
				file.createNewFile();
				isCover = true;
			}
			if (isCover == false) {
				return;
			}
			var fileWriter = new java.io.FileWriter(file);
			fileWriter.write(string);
			fileWriter.close();
		} catch(error) {
			throw error; 
		}
	},
	writeStream: function(path, inputStream, isCover, isInputStreamClose) {
		try {
			var file = new java.io.File(path);
			if (!file.exists()) {
				file.createNewFile();
				isCover = true;
			}
			if (isCover == false) {
				if (isInputStreamClose) inputStream.close();
				return;
			}
			var buffer = new java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096);
			var outputStream = new java.io.FileOutputStream(file);
			var len = -1;
			while ((len = inputStream.read(buffer)) != -1) {
				outputStream.write(buffer, 0, len);
			}
			if (isInputStreamClose) inputStream.close();
			outputStream.flush();
			outputStream.close();
		} catch(error) {
			throw error;
		}
	},
	append: function(path, appendString) {
		try {
			var randomAccessFile = new java.io.RandomAccessFile(path, "rw");
			randomAccessFile.seek(randomAccessFile.length());
			randomAccessFile.write(java.lang.String(appendString).getBytes());
			randomAccessFile.close();
		} catch(error) {
			throw error;
		}
	}
}