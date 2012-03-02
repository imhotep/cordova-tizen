/*
 * File
 */

/*
 * Supplies arguments to methods that lookup or create files and directories
 */
var Flags = function(create, exclusive) {
	this.create = create || false;
	this.exclusive = exclusive || false;
};

/*
 * LocalFileSystem
 */
var LocalFileSystem = {
		// File system types
		TEMPORARY: 0,
		PERSISTENT: 1
};

/*
 * Global File System initialization
 */
(function() {
	var w3cRequestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	var w3cResolveLocalFileSystemURI = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
	var w3cFileReader = FileReader;

	if (!w3cRequestFileSystem || !w3cResolveLocalFileSystemURI || !w3cFileReader) {
		console.log('PhoneGap File API not available');
		return;
	}

	/*
	 * Represents a single file.
	 *
	 * @constructor
	 */
	var PgFile = function() {
	};

	Object.defineProperty(PgFile.prototype, "name", {
		get: function() { return this._file.name; }
	});
	Object.defineProperty(PgFile.prototype, "lastModifiedDate", {
		get: function() { return this._file.lastModifiedDate; }
	});
	Object.defineProperty(PgFile.prototype, "type", {
		get: function() { return this._file.type; }
	});
	Object.defineProperty(PgFile.prototype, "size", {
		get: function() { return this._file.size; }
	});
	Object.defineProperty(PgFile.prototype, "fullPath", {
		get: function() { return this._entry.fullPath; }
	});

	function makeFile(entry, file) {
		var pgFile = new PgFile();

		pgFile._file = file;
		pgFile._entry = entry;

		return pgFile;
	}

	/*
	 * This class writes to the mobile device file system.
	 *
	 * @constructor
	 */
	var PgFileWriter = function() {
	};

	// States
	PgFileWriter.INIT = 0;
	PgFileWriter.WRITING = 1;
	PgFileWriter.DONE = 2;

	Object.defineProperty(PgFileWriter.prototype, "readyState", {
		get: function() { return this._writer.readyState; }
	});
	Object.defineProperty(PgFileWriter.prototype, "error", {
		get: function() { return this._writer.error; }
	});
	Object.defineProperty(PgFileWriter.prototype, "position", {
		get: function() { return this._writer.position; }
	});
	Object.defineProperty(PgFileWriter.prototype, "length", {
		get: function() { return this._writer.length; }
	});

	Object.defineProperty(PgFileWriter.prototype, "onwritestart", {
		get: function() { return this._writer.onwritestart; },
		set: function(handler) { this._writer.onwritestart = handler; }
	});
	Object.defineProperty(PgFileWriter.prototype, "onprogress", {
		get: function() { return this._writer.onprogress; },
		set: function(handler) { this._writer.onprogress = handler; }
	});
	Object.defineProperty(PgFileWriter.prototype, "onwrite", {
		get: function() { return this._writer.onwrite; },
		set: function(handler) { this._writer.onwrite = handler; }
	});
	Object.defineProperty(PgFileWriter.prototype, "onwriteend", {
		get: function() { return this._writer.onwriteend; },
		set: function(handler) { this._writer.onwriteend = handler; }
	});
	Object.defineProperty(PgFileWriter.prototype, "onabort", {
		get: function() { return this._writer.onabort; },
		set: function(handler) { this._writer.onabort = handler; }
	});
	Object.defineProperty(PgFileWriter.prototype, "onerror", {
		get: function() { return this._writer.onerror; },
		set: function(handler) { this._writer.onerror = handler; }
	});

	function makeFileWriter(entry, writer) {
		var pgWriter = new PgFileWriter();

		pgWriter._writer = writer;
		pgWriter.fileName = entry.name;

		return pgWriter;
	}

	/*
	 * Abort writing file.
	 */
	PgFileWriter.prototype.abort = function() {
		this._writer.abort();
	};

	/*
	 * Writes data to the file
	 *
	 * @param text to be written
	 */
	PgFileWriter.prototype.write = function(text) {
		var blob = new WebKitBlobBuilder();

		blob.append(text);
		this._writer.write(blob.getBlob('text/plain'));
	};

	/*
	 * Moves the file pointer to the location specified.
	 *
	 * If the offset is a negative number the position of the file
	 * pointer is rewound.  If the offset is greater than the file
	 * size the position is set to the end of the file.
	 *
	 * @param offset is the location to move the file pointer to.
	 */
	PgFileWriter.prototype.seek = function(offset) {
		this._writer.seek(offset);
	};

	/*
	 * Truncates the file to the size specified.
	 *
	 * @param size to chop the file at.
	 */
	PgFileWriter.prototype.truncate = function(size) {
		this._writer.truncate(size);
	};

	function makeEntry(entry) {
		return (entry.isDirectory) ? makeDirectoryEntry(entry) : makeFileEntry(entry);
	};

	/*
	 * An interface representing a directory on the file system.
	 *
	 * @constructor
	 */
	var PgFileEntry = function() {
		this.isFile = true;
		this.isDirectory = false;
	};

	Object.defineProperty(PgFileEntry.prototype, "name", {
		get: function() { return this._entry.name; }
	});
	Object.defineProperty(PgFileEntry.prototype, "fullPath", {
		get: function() { return this._entry.fullPath; }
	});

	function makeFileEntry(entry) {
		var pgEntry = new PgFileEntry();

		pgEntry._entry = entry;

		return pgEntry;
	}

	/*
	 * Copies a file to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to copy the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
		var w3cSuccessCB = null;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeFileEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.copyTo(parent._entry, newName, w3cSuccessCB, errorCallback);
	};

	/*
	 * Looks up the metadata of the entry
	 *
	 * @param {Function} successCallback is called with a Metadata object
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.getMetadata = function(successCallback, errorCallback) {
		this._entry.getMetadata(successCallback, errorCallback);
	};

	/*
	 * Gets the parent of the entry
	 *
	 * @param {Function} successCallback is called with a parent entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.getParent = function(successCallback, errorCallback) {
		var w3cSuccessCB = null;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeDirectoryEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.getParent(w3cSuccessCB, errorCallback);
	};

	/*
	 * Moves a file to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to move the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
		var w3cSuccessCB = null;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeFileEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.moveTo(parent._entry, newName, w3cSuccessCB, errorCallback);
	};

	/*
	 * Removes the entry
	 *
	 * @param {Function} successCallback is called with no parameters
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.remove = function(successCallback, errorCallback) {
		this._entry.remove(successCallback, errorCallback);
	};

	/*
	 * Returns a URI that can be used to identify this entry.
	 *
	 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
	 * @return uri
	 */
	PgFileEntry.prototype.toURI = function(mimeType) {
		return this._entry.toURL(mimeType);
	};

	/*
	 * Creates a new FileWriter associated with the file that this FileEntry represents.
	 *
	 * @param {Function} successCallback is called with the new FileWriter
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.createWriter = function (successCallback, errorCallback) {
		var w3cSuccessCB;

		var that = this;
		if (successCallback) {
			w3cSuccessCB = function(writer) {
				var pgWriter = makeFileWriter(that, writer);
				successCallback(pgWriter);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.createWriter(w3cSuccessCB, errorCallback);
	};

	/*
	 * Returns a File that represents the current state of the file that this FileEntry represents.
	 *
	 * @param {Function} successCallback is called with the new File object
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgFileEntry.prototype.file = function(successCallback, errorCallback) {
		var w3cSuccessCB;

		var that = this;
		if (successCallback) {
			w3cSuccessCB = function(file) {
				var pgFile = makeFile(that, file);
				successCallback(pgFile);
			};
		}
		else {
			w3cSuccessCB = function() {
			};
		}

		this._entry.file(w3cSuccessCB, errorCallback);
	};

	/*
	 * An interface that lists the files and directories in a directory.
	 * @constructor
	 */
	var PgDirectoryReader = function() {
	};

	function makeDirectoryReader(reader) {
		var pgReader = new PgDirectoryReader();

		pgReader._reader = reader;

		return pgReader;
	}
	/*
	 * Returns a list of entries from a directory.
	 *
	 * @param {Function} successCallback is called with a list of entries
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryReader.prototype.readEntries = function(successCallback, errorCallback) {
		var w3cSuccessCB;

		if (successCallback) {
			w3cSuccessCB = function(entries) {
				var pgEntries = new Array();

				for (var i = 0; i < entries.length; i++) {
					var pgEntry = makeEntry(entries[i]);
					pgEntries.push(pgEntry);
				}
				successCallback(pgEntries);
			};
		}
		else {
			w3cSuccessCB = function() {
			};
		}

		this._reader.readEntries(w3cSuccessCB, errorCallback);
	};

	/*
	 * An interface representing a directory on the file system.
	 *
	 * @constructor
	 */
	var PgDirectoryEntry = function() {
		this.isFile = false;
		this.isDirectory = true;
	};

	Object.defineProperty(PgDirectoryEntry.prototype, "name", {
		get: function() { return this._entry.name; }
	});
	Object.defineProperty(PgDirectoryEntry.prototype, "fullPath", {
		get: function() { return (this._entry.fullPath !== "/") ? this._entry.fullPath : ""; }
	});

	function makeDirectoryEntry(entry) {
		var pgEntry = new PgDirectoryEntry();

		pgEntry._entry = entry;

		return pgEntry;
	}

	/*
	 * Copies a directory to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to copy the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.copyTo = function(parent, newName, successCallback, errorCallback) {
		var w3cSuccessCB;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.copyTo(parent._entry, newName, w3cSuccessCB, errorCallback);
	};

	/*
	 * Looks up the metadata of the entry
	 *
	 * @param {Function} successCallback is called with a Metadata object
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.getMetadata = function(successCallback, errorCallback) {
		this._entry.getMetadata(successCallback, errorCallback);
	};

	/*
	 * Gets the parent of the entry
	 *
	 * @param {Function} successCallback is called with a parent entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.getParent = function(successCallback, errorCallback) {
		var w3cSuccessCB;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeDirectoryEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.getParent(w3cSuccessCB, errorCallback);
	};

	/*
	 * Moves a directory to a new location
	 *
	 * @param {DirectoryEntry} parent the directory to which to move the entry
	 * @param {DOMString} newName the new name of the entry, defaults to the current name
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.moveTo = function(parent, newName, successCallback, errorCallback) {
		var w3cSuccessCB;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.moveTo(parent._entry, newName, w3cSuccessCB, errorCallback);
	};

	/*
	 * Removes the entry
	 *
	 * @param {Function} successCallback is called with no parameters
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.remove = function(successCallback, errorCallback) {
		this._entry.remove(successCallback, errorCallback);
	};

	/*
	 * Returns a URI that can be used to identify this entry.
	 *
	 * @param {DOMString} mimeType for a FileEntry, the mime type to be used to interpret the file, when loaded through this URI.
	 * @return uri
	 */
	PgDirectoryEntry.prototype.toURI = function(mimeType) {
		return this._entry.toURL(mimeType);
	};

	/*
	 * Creates a new DirectoryReader to read entries from this directory
	 */
	PgDirectoryEntry.prototype.createReader = function() {
		var reader = this._entry.createReader();
		return makeDirectoryReader(reader);
	};

	/*
	 * Creates or looks up a directory
	 *
	 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a directory
	 * @param {Flags} options to create or excluively create the directory
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
		var w3cSuccessCB;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeDirectoryEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.getDirectory(path, options, w3cSuccessCB, errorCallback);
	};

	/*
	 * Creates or looks up a file
	 *
	 * @param {DOMString} path either a relative or absolute path from this directory in which to look up or create a file
	 * @param {Flags} options to create or excluively create the file
	 * @param {Function} successCallback is called with the new entry
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
		var w3cSuccessCB;

		if (successCallback) {
			w3cSuccessCB = function(entry) {
				var pgEntry = makeFileEntry(entry);
				successCallback(pgEntry);
			};
		}
		else {
			w3cSuccessCB = null;
		}

		this._entry.getFile(path, options, w3cSuccessCB, errorCallback);
	};

	/*
	 * Deletes a directory and all of it's contents
	 *
	 * @param {Function} successCallback is called with no parameters
	 * @param {Function} errorCallback is called with a FileError
	 */
	PgDirectoryEntry.prototype.removeRecursively = function(successCallback, errorCallback) {
		this._entry.removeRecursively(successCallback, errorCallback);
	};

	function makeFileSystem(fileSystem)
	{
		return {
			name: (fileSystem.name === "file__0:Persistent") ? "persistent" : "temporary",
			root: makeDirectoryEntry(fileSystem.root)
		};
	}

	var pgRequestFileSystem = function(type, size, successCallback, errorCallback) {
		if (type !== LocalFileSystem.TEMPORARY && type !== LocalFileSystem.PERSISTENT) {
			var err = {};
			err.code = FileError.SYNTAX_ERR;
			errorCallback(err);
			return;
		}

		var localSuccessCB = null;
		if (successCallback) {
			localSuccessCB = function(fileSystem) {
				var pgFileSystem = makeFileSystem(fileSystem);
				successCallback(pgFileSystem);
			};
		}

		w3cRequestFileSystem(type, size, localSuccessCB, errorCallback);
	};

	var pgResolveLocalFileSystemURI = function(uri, successCallback, errorCallback) {
		var localSuccessCB = null;
		if (successCallback) {
			localSuccessCB = function(entry) {
				var pgEntry;
				if (entry.isDirectory) {
					pgEntry = makeDirectoryEntry(entry);
				}
				else {
					pgEntry = makeFileEntry(entry);
				}
				successCallback(pgEntry);
			};
		}

		var localErrorCB = null;
		if (errorCallback) {
			localErrorCB = function(error) {
				var err = {};
				if (error.code === FileError.ENCODING_ERR && uri.match(/(file:\/\/).+/)) {
					err.code = FileError.NOT_FOUND_ERR;
				}
				else {
					err.code = error.code;
				}
				errorCallback(err);
			};
		}

		w3cResolveLocalFileSystemURI(uri, localSuccessCB, localErrorCB);
	};

	window.requestFileSystem = pgRequestFileSystem;
	window.resolveLocalFileSystemURI = pgResolveLocalFileSystemURI;

	/*
	 * PgFileReader
	 */
	var PgFileReader = function() {
		this._reader = new w3cFileReader();
	};

	// States
	PgFileReader.EMPTY = 0;
	PgFileReader.LOADING = 1;
	PgFileReader.DONE = 2;

	Object.defineProperty(PgFileReader.prototype, "readyState", {
		get: function() { return this._reader.readyState; }
	});
	Object.defineProperty(PgFileReader.prototype, "error", {
		get: function() { return this._reader.error; }
	});
	Object.defineProperty(PgFileReader.prototype, "result", {
		get: function() { return this._reader.result; }
	});

	Object.defineProperty(PgFileReader.prototype, "onloadstart", {
		get: function() { return this._reader.onloadstart; },
		set: function(handler) { this._reader.onloadstart = handler; }
	});
	Object.defineProperty(PgFileReader.prototype, "onprogress", {
		get: function() { return this._reader.onprogress; },
		set: function(handler) { this._reader.onprogress = handler; }
	});
	Object.defineProperty(PgFileReader.prototype, "onload", {
		get: function() { return this._reader.onload; },
		set: function(handler) { this._reader.onload = handler; }
	});
	Object.defineProperty(PgFileReader.prototype, "onloadend", {
		get: function() { return this._reader.onloadend; },
		set: function(handler) { this._reader.onloadend = handler; }
	});
	Object.defineProperty(PgFileReader.prototype, "onabort", {
		get: function() { return this._reader.onabort; },
		set: function(handler) { this._reader.onabort = handler; }
	});
	Object.defineProperty(PgFileReader.prototype, "onerror", {
		get: function() { return this._reader.onerror; },
		set: function(handler) { this._reader.onerror = handler; }
	});

	/*
	 * Abort reading file.
	 */
	PgFileReader.prototype.abort = function() {
		this._reader.abort();
	};

	/*
	 * Read text file.
	 *
	 * @param file          {File} File object containing file properties
	 * @param encoding      [Optional] (see http://www.iana.org/assignments/character-sets)
	 */
	PgFileReader.prototype.readAsText = function(file, encoding) {
		this._reader.readAsText(file._file, encoding);
	};

	/*
	 * Read file and return data as a base64 encoded data url.
	 * A data url is of the form:
	 *      data:[<mediatype>][;base64],<data>
	 *
	 * @param file          {File} File object containing file properties
	 */
	PgFileReader.prototype.readAsDataURL = function(file) {
		this._reader.readAsDataURL(file._file);
	};

	/*
	 * Read file and return data as a binary data.
	 *
	 * @param file          {File} File object containing file properties
	 */
	PgFileReader.prototype.readAsBinaryString = function(file) {
		this._reader.readAsBinaryString(file._file);
	};

	/*
	 * Read file and return data as a binary data.
	 *
	 * @param file          {File} File object containing file properties
	 */
	PgFileReader.prototype.readAsArrayBuffer = function(file) {
		this._reader.readAsArrayBuffer(file._file);
	};

	FileReader = PgFileReader;
}());

