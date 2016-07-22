var handlebars = require("handlebars");

global.bower = {};
bower.packages = null;

bower.configs = {
	external_apis: JSON.parse(fs.readFileSync(path.join(cli.cwd, "configs/external_apis.json")).toString())
};


bower.package = {

	getBowerJSON: function(name, uri, callback) {

		//convert uri to bower.json uri object

		var ouri;

		try {
			ouri = url.parse(uri);
		} catch(e) {
			console.log("Cannot parse url", uri);
			callback(true);
			return;
		}

		var pathname = ouri.pathname;

		var indexOfGit = pathname.indexOf(".git");
		if (indexOfGit === -1) {
			console.log("Url does not end in .git", uri);
			callback(true);
			return;
		}

		var pathname = pathname.substr(0, indexOfGit) +"/";

		var nuri = url.parse(url.resolve("http://"+ouri.host+pathname, "raw/master/bower.json"));

		//get the bower repo json
		getURL(nuri, function(err, data) {
			callback(err, data, "https://"+ouri.host+ouri.pathname);
		});

	},

	getGitOwnerRepo: function(uri) {
		var uri;

		try {
			uri = url.parse(uri);
		} catch(e) {
			console.log("Cannot parse url", uri);
			return false;
		}

		var pathname = uri.pathname;

		var indexOfGit = pathname.indexOf(".git");
		if (indexOfGit === -1) {
			console.log("Url does not end in .git", uri);
			return false;
		}

		var pathname = pathname.substr(0, indexOfGit) +"/";

		var indexOfMiddleSlash = pathname.indexOf("/",1);
		var owner = pathname.slice(1, indexOfMiddleSlash);
		var repo = pathname.slice(indexOfMiddleSlash+1, pathname.length-1);

		return {
			host: uri.hostname,
			owner,
			repo
		};

	},

	confirmCollaboration: function(host, owner, repo, access_token, callback) {

		var api = _.find(bower.configs.external_apis, function(item) {
			if (  (new RegExp(host)).test(host) ) return true;
		});
		
		if (!api) return null;

		var uri = handlebars.compile(api.collaborators.url)({
			host: host,
			owner: owner,
			repo: repo,
			access_token: access_token
		});
		var uri = url.parse(uri);

		var options = {};

		switch (api.collaborators.authentication) {
		case "token":
			options.token = access_token;
			break;
		case "private-token":
			options['private-token'] = access_token;
			break;
		case "bearer":
			options['bearer'] = access_token;
		}


		getURL(uri, function(err, collaboratorsJSON) {

			if (err) {
				callback(err);
				return;
			}

			callback(false, collaboratorsJSON);

		}, options);

	}

};

var getURL = function(uriObject, callback, options) {
	options = options || {};

	var http = require('http');
	var https = require('https');

	var request = {
		protocol: uriObject.protocol,
		host: uriObject.host,
		path: uriObject.pathname,
		port: uriObject.port,
		method: 'GET',
		headers: {
			"User-Agent": "curl/7.43.0",
			"Accept": "*/*"
		}
	};


	if (options.token) {
		request.headers['Authorization'] = "token " + options.token;
	} else if (options['private-token']) {
		request.headers['PRIVATE-TOKEN'] = options['private-token'];
	} else if (options.bearer) {
		request.headers['Authorization'] = "Bearer " + options.token;
	}

	var api = http;

	switch (uriObject.protocol) {
	case "https:":
		api = https;
	case "http:":
	}

	var req = api.request(request, function(response) {

		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {

			switch (response.statusCode) {
			case 403:
				console.log("Forbidden");
				callback(true);
				return;
			case 301: case 302:
				var uri = url.parse(response.headers.location);
				console.log("Redirecting to",response.headers.location);
				getURL(uri, callback, options);
				return;
			case 200:
				try {
					var bowerJSON = JSON.parse(str);
					callback(false, bowerJSON);
				} catch (e) {
					callback(true);
				}
				return;
			default:
				console.log("Status code not understood", response.statusCode);
				callback(true);
				return;
			}
			
		});

	});

	req.on('error', (e) => {
		console.log("Error fetching bower.json", e);
		callback(true);
	});

	req.end();
}

require("./packages");
require("./register");
require("./unregister");
require("./save");