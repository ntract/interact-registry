app.post('/packages', upload.array(), function(req, res) {
	
	var name = req.body.name;
	var uri = req.body.url;

	if (!name || !uri) {
		res.status("400");
		res.end("Pacakge cannot be registered");
		return;
	}

	var package = _.findWhere(bower.packages, {name:name});
	if (package) {
		res.status("403");
		res.end("Pacakge already registered");
		return;
	}

	var location = bower.package.getGitOwnerRepo(uri);

	var api = _.find(bower.configs.external_apis, function(item) {
		if (  (new RegExp(item.host)).test(location.host) ) return true;
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
				res.end("Pacakge cannot be registered");
				return;
			}

			try {

				if (bowerJSON.name === name) {

					bower.packages.push({
						name: name,
						url: uri
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
			res.end("Pacakge cannot be registered");

		});
	}

});