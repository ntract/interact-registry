app.get('/packages', function(req, res) {
	res.json(bower.packages);
});

app.get('/packages/:packageid', function(req, res) {

	var package = _.findWhere(bower.packages, {name:req.params.packageid});

	if (!package) {
		res.status(404);
		res.end("Package not found");
		return;
	}

	package.hits = package.hits ? ++package.hits : 1;
	package.updatedAt = (new Date()).toISOString();
	events.emit("bower:hit", package);
	events.emit("bower:save");

	res.json(package);

});

RegExp.escape = RegExp.escape || function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.get('/packages/search/:search', function(req, res) {

	var searchTerm = new RegExp(RegExp.escape(req.params.search));

	var packages = _.filter(bower.packages, function(item) {
		return searchTerm.test(item.name);
	});

	if (packages.length === 0) {
		res.status(404);
		res.end("Package not found");
		return;
	}

	res.json(packages);

});