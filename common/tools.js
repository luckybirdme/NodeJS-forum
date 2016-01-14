var config = require("../config")
var moment = require("moment");
var bcrypt = require('bcrypt');
var utility = require('utility');
var mkdirp = require('mkdirp');

exports.mkDirpath = mkDirpath;
exports.formatDate = formatDate;
exports.bcryptGenSalt = bcryptGenSalt;
exports.bcryptCompare = bcryptCompare;
exports.getActiveKey = getActiveKey;

function getActiveKey(user){
	var activeKey = utility.md5(user.userEmail+user.password+config.auth.activeKey+user.update_at);
	return activeKey;
}



function bcryptCompare(password,hash,callback){
	bcrypt.compare(password, hash, callback);
}

function bcryptGenSalt(password,callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(password, salt,callback);
	});
}


function formatDate (date, friendly) {
	date = moment(date);
	if (friendly) {
		return date.fromNow();
	} else {
		return date.format('YYYY-MM-DD HH:mm');
	}

}

function mkDirpath(dir,callback){
	mkdirp(dir,callback);
}



