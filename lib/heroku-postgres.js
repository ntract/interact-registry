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
			allowNull: false,
			validate: {
				isGitUrl: function(value) {
				  if (!value.match(/^git\:\/\//)) {
				    throw new Error('is not correct format');
				  }
				  return this;
				}
			},
		},
		hits: {
			type: Sequelize.INTEGER,
			defaultValue: 0
		},
		updatedAt: {
			type: Sequelize.INTEGER,
			defaultValue: 0
		},
		createdAt: {
			type: Sequelize.INTEGER,
			defaultValue: 0
		}
	}, {
		instanceMethods: {
			hit: function () {
				this.hits += 1 ;
				this.save();
			},
			rename: function(newName) {
				this.name = newName;
				this.save();
			}
		}
	});

	var addIndex = sequelize.getQueryInterface().addIndex('Packages', ['name']);
	addIndex.error(function(e) {
	  if(e.toString() !== 'error: relation "packages_name" already exists'){
	    throw e;
	  }
	});


	events.on("bower:loaded", function Loaded() {

		var index = _.indexBy(bower.packages, "name");

		Package.findAll({
			order: 'name DESC'
		}).then(function(packages) {

			var index2 = _.indexBy(packages, "name");
			for (var k in index) {
				if (!index2[k]) {
					events.emit("bower:register", index[k]);
				}
				index2[k] = index[k];
			}

			bower.packages = _.values(index2);

	    });

	});

	events.on("bower:register", function Register(entry) {
		Package.build(entry).save().then(function () {
            console.log("Saved", entry.name)
		}).catch(function (e) {
			console.log("ERROR: Saving", entry.name)
		});
	});


	events.on("bower:unregister", function Register(packageName) {
		Package.destroy({where: ["name = ?", packageName]})
	});

}