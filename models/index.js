require('./users');
require('./tag');
require('./topic');
require('./comment');

var mongoose = require('mongoose');
var config   = require('../config');
var database = config.database;

mongoose.connect(database.address, {
  server: {poolSize: 20}
}, function (error) {
	if (error) {
		console.log('connect to '+database.address+' error: '+error.message);
		process.exit(1);
	}
});

exports.Users = mongoose.model('Users');
exports.Tag = mongoose.model('Tag');
exports.Topic = mongoose.model('Topic');
exports.Comment = mongoose.model('Comment');


