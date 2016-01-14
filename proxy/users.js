var models  = require('../models');
var Users    = models.Users;



exports.insert = function (user,callback) {
	var newUser = new Users(user);
 	newUser.save(callback);
};

exports.save = function(user,callback){
	user.save(callback);
}

exports.update = function(_id,update,callback){
	Users.update({_id:_id},{$set:update},callback);
}

exports.getByEmail = function (userEmail,callback){
	Users.findOne({userEmail: userEmail}, callback);
};

exports.getByName = function (userName,callback){
	Users.findOne({userName: userName}, callback);
};



