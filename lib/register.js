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

	

	if (!api.checkBowerJSON) {

		bower.packages.push({
			name: name,
			url: uri,
			hits: 0,
			updatedAt: (new Date()).toISOString(),
			createdAt: (new Date()).toISOString()
		});

		console.log("Registered", name, uri);
		res.status("201");
		res.end("Package registered");

		events.emit("bower:save");
		return;

	} else {

		bower.package.getBowerJSON(name, uri, function(err, bowerJSON, uri) {

			if (err) {
				console.log("Cannot register", name, uri);
				res.status("400");
				res.end("Package cannot be registered");
				return;
			}

			try {

				if (bowerJSON.name === name) {

					bower.packages.push({
						name: name,
						url: uri,
						hits: 0,
						updatedAt: (new Date()).toISOString(),
						createdAt: (new Date()).toISOString()
					});

					console.log("Registered", name, uri);
					res.status("201");
					res.end("Package registered");

					events.emit("bower:save");
					return;

				} else {
					console.log("Name and bower.json name do not match. "+name+" vs "+bowerJSON.name+" @ "+uri);
					res.status("402");
					res.end("Name and bower.json name do not match. "+name+" vs "+bowerJSON.name+" @ "+uri);
					return;
				}

			} catch(e) {}

			console.log("Cannot register - unknown error", name, uri);
			res.status("400");
			res.end("Package cannot be registered");

		});
	}

});