/**
 * Server.
 * Start the server:
 * goto project root directory;
 * $ nodejs src/server/server.js
 *
 * @author		Fei Zhan
 * @version		0.0
 * 
**/

var BOARDFUL = require("../build/boardful.core.js");

var http = require("http"),
	url = require("url"),
	path = require("path"),
	fs = require("fs");

BOARDFUL.Server = BOARDFUL.Server || new Object();
// create a server
BOARDFUL.Server.load = function () {
	http.createServer(function(request, response) {
		var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
		var contentTypesByExtension = {
			'.html': "text/html",
			'.css':  "text/css",
			'.js':   "text/javascript"
		};
		// if file exists
		fs.exists(filename, function(exists) {
			if(! exists) {
				response.writeHead(404, {"Content-Type": "text/plain"});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
			// default file name
			if (fs.statSync(filename).isDirectory()) filename += '/index.html';
			// read and display it
			fs.readFile(filename, "binary", function(err, file) {
				if (err) {        
					response.writeHead(500, {"Content-Type": "text/plain"});
					response.write(err + "\n");
					response.end();
					return;
				}
				var headers = {};
				var contentType = contentTypesByExtension[path.extname(filename)];
				if (contentType) headers["Content-Type"] = contentType;
				response.writeHead(200, headers);
				response.write(file, "binary");
				response.end();
			});
		});
	}).listen(parseInt(BOARDFUL.Server.port, 10));
	console.log("Static file server running at => http://localhost:" + BOARDFUL.Server.port + "/ CTRL + C to shutdown");
};

// launch project
BOARDFUL.init("server");
BOARDFUL.Server.port = process.argv[3] || 8080;
BOARDFUL.Server.load();
