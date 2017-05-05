app.delete("/packages/:packageid", function(req, res) {

	var package = _.findWhere(bower.packages, {name: req.params.packageid});
	if (!package) {
		console.log("Package not found", req.params.packageid);
		res.status("404");
		res.end();
		return;
	}

	var access_token = req.query.access_token;
	if (!access_token) {
		console.log("Cannot find access_token");
		res.status("404");
		res.end();
		return;
	}

	var location = bower.package.getGitOwnerRepo(package.url);

	bower.package.confirmCollaboration(location.host, location.owner, location.repo, access_token, function(err, isCollaborator) {

		if (err) {
			console.log("Forbidden");
			res.status("403");
			res.end();
			return;
		}

		res.status("204");
		res.end();

		bower.packages = _.reject(bower.packages, function(item) {
			return (item.name === package.name);
		});

		console.log("Unregistered", package.name);

		events.emit("bower:unregister", package.name);
		events.emit("bower:save");

	});

});