console.log("Searching for heroku postgres...");
if (process.env.DATABASE_URL) {

	var Sequelize = require("sequelize");

	var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

	var options = {
		dialect:  'postgres',
		protocol: 'postgres',
		port:     match[4],
		host:     match[3],
		dialectOptions: {
			ssl: true
		}
	};

	console.log('Connection:', process.env.DATABASE_URL, match);

	var sequelize = new Sequelize(match[5], match[1], match[2], options);

	var Package = sequelize.define('Package', {
		name: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		},
		url: {
			type: Sequelize.STRING,
			unique: true,
			allowNull: false
		},
		hits: {
			type: Sequelize.INTEGER,
			defaultValue: 0
		},
		updatedAt: {
			type: Sequelize.STRING,
			allowNull: false
		},
		createdAt: {
			type: Sequelize.STRING,
			allowNull: false
		}
	}, {
		instanceMethods: {
			setHits: function (value) {
				this.hits = value;
				this.save();
			},
			rename: function(newName) {
				this.name = newName;
				this.save();
			}
		}
	});

	

	var isDatabaseConfigured = false
	Package.sync().then( function () {
		isDatabaseConfigured = true;
		updatePackages();
	});

	var isServerLoader = false;
	events.on("bower:loaded", function Loaded() {
		console.log("Bower Loaded");
		isServerLoader = true;
		updatePackages();
	});

	function updatePackages() {
		if (!isServerLoader || !isDatabaseConfigured) return;

		console.log("Updating packages...");

		var index = _.indexBy(bower.packages, "name");

		Package.findAll({
			order: 'name DESC'
		}).then(function(packages) {

			var index2 = _.indexBy(packages, "name");
			for (var k in index) {
				if (!index2[k]) {
					console.log("Force registering package", k);
					events.emit("bower:register", index[k]);
				}
				index2[k] = index[k];
			}

			bower.packages = _.values(index2);
			console.log("All packages updated");

	    });
	}

	events.on("bower:register", function Register(entry) {
		Package.build(entry).save().then(function () {
            console.log("Saved", entry.name)
		}).catch(function (e) {
			console.log("ERROR: Saving", entry.name);
			console.log(e);
		});
	});

	events.on("bower:hits", function(entry) {
		Package.find({where: ["name = ?", entry.name]}).then(function(pkg) {
			if (!pkg) return;
			
			pkg.setHits();

		});
    });



	events.on("bower:unregister", function Register(packageName) {
		Package.destroy({where: ["name = ?", packageName]})
	});

}