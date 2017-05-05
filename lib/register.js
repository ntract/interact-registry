app.post('/packages', upload.array(), function(req, res) {
	
	var name = req.body.name;
	var uri = req.body.url;

	if (!name || !uri) {
		console.log('Pacakge cannot be registerd');
		res.status("400");
		res.end("Package cannot be registered");
		return;
	}

	var validation = bower.package.isValidName(name);
	if (validation.error) {
		console.log('Invalid Package Name', validation.error);
		res.status("400");
		res.end('Invalid Package Name. ' + validation.error);
		return;
	}

	var package = _.findWhere(bower.packages, {name:name});
	if (package) {
		console.log("Package already registered", name, uri);
		res.status("403");
		res.end("Package already registered");
		return;
	}

	var endingRegEx = /\.git$/;
	if (!endingRegEx.test(uri)) {
		console.log("Cannot register", name, uri, "does not end in .git");
		res.status("400");
		res.end("Invalid URL");
		return;
	}
	var location = bower.package.getGitOwnerRepo(uri);
	if (!location) {
		console.log("Cannot register - unknown error", name, uri);
		res.status("400");
		res.end("Invalid URL");
		return;
	}

	var api = _.find(bower.configs.external_apis, function(item) {
		if (  (new RegExp(item.host)).test(location.host) ) return true;
		return false;
	});

	var options = {};

	var access_token = req.query.access_token;
	if (access_token) {
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
	}

	var entry = {
		name: name,
		url: uri,
		hits: 0,
		updatedAt: (new Date()).toISOString(),
		createdAt: (new Date()).toISOString()
	};

	bower.packages.push(entry);

	console.log("Registered", name, uri);
	res.status("201");
	res.end("Package registered");

	events.emit("bower:register", entry);
	events.emit("bower:save");
	
});