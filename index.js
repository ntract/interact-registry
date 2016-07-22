global.express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
global.upload = multer(); // for parsing multipart/form-data

global.app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.raw({
	type: "application/octet-stream",
	limit: 2097152
}));


events.once("modules:loaded", function() {

	if (cli.config.commands[0] === "help") return;

	console.log("Starting server...");

	events.emit("interact-registry:loaded");

	FileSystem.mkdir(path.join(cli.cwd, "data"));

	require("./bower");

			//setup server listener
	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});

});

events.emit("command:handled");