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

	res.json(package);

});