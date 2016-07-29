var packageJSONPath = path.join(cli.cwd, "data", "packages.json");

var saveHandle = null;
events.on("bower:save", function() {
	//save packages.json after 250ms
	if (saveHandle) clearTimeout(saveHandle);
	var saveHandle = setTimeout(function() {
		fs.writeFileSync( packageJSONPath, JSON.stringify(bower.packages, null, "    " ) );
		saveHandle = null;
	}, 250);
});


try {
	bower.packages = JSON.parse(fs.readFileSync(packageJSONPath).toString());
} catch(e) {
	bower.packages = []
	events.emit("bower:save");
}

events.on("modules:destroy", function() {
	fs.writeFileSync( packageJSONPath, JSON.stringify(bower.packages, null, "    " ) );
});
