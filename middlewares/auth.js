var config = require("../config");
exports.saveUserSession = saveUserSession;
exports.removeUserSession = removeUserSession;
exports.getUserBySession = getUserBySession;
exports.requiredLogin = requiredLogin;

function getUserBySession(req,callback){
	if(req.session && req.session.user){
		return callback(req.session.user);
	}else{
		return callback(false);;
	}
}

function requiredLogin(req,res,next){
	if(req.session && req.session.user){
		return next();
	}else{
		var url = config.url.host;
		res.redirect(url);
	}	
}

function saveUserSession(req,user){
	var session = req.session;
	session.user = user;
}

function removeUserSession(req,callback){
	req.session.destroy(callback);
}

