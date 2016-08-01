commands
.on([undefined], function(done) {

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

	console.log("Starting server...");

	events.emit("ntract-registry:loaded");

	FileSystem.mkdir(path.join(cli.cwd, "data"));

	require("./lib/bower");

			//setup server listener
	app.listen(app.get('port'), function() {
	  console.log('Node app is running on port', app.get('port'));
	});

	done({stop:true});

});