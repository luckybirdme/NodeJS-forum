var config = require("../config")
var validator = require('validator');
var eventproxy = require('eventproxy');

var auth = require("../middlewares/auth");
var tools = require("../common/tools");
var email = require("../common/email");
var global = require("../common/global");
var proxy = require('../proxy');
var Users = proxy.Users;
var Topic = proxy.Topic;
 
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.active = active;
exports.setting = setting;
exports.home = home;

function home(req,res,next){
	var userName = req.query.userName;

	Users.getByName(userName,function(error,user){
		if (error) {
		    return next(error);
		}	
		if(user){
			Topic.getUserTopics(userName,function(error,topics){
				if (error) {
				    return next(error);
				}

				var resData = {
					title : 'Home',
					topics : topics,
					user:user
				};
				res.render('users/home', resData);	

			})
		}else{
			var url = config.url.host;
			res.redirect(url);			
		}	
	})

}

function setting(req,res,next){
	var userName = validator.trim(req.body.userName);
	var userEmail = validator.trim(req.body.userEmail);
	var userAvatar = validator.trim(req.body.userAvatar);
	
	var ep = new eventproxy();
	ep.fail(next);
	ep.once('setting_error', function (name,notice) {
		global.resJsonError(req,res,name,notice);
	});


	var checkEvent = new eventproxy();
	checkEvent.all('checkName', function (user) {
		user.update_at = new Date();
		Users.save(user,function(error,user){
			if (error) {
			    return next(error);
			}
			auth.saveUserSession(req,user);
			var url = config.url.host+"/users/setting";
			global.jsonRedirect(res,url);		

		});


	});



	Users.getByEmail(userEmail,function(error,originalUser){
		if (error) {
	      	return next(error);
	    }
		if (originalUser) {
			if(!validator.isNull(userAvatar) && userAvatar != originalUser.userAvatar){
				originalUser.userAvatar = userAvatar;
			}
			if(!validator.isNull(userName) &&  userName != originalUser.userName){
					Users.getByName(userName,function(error,user){
						if (error) {
					      	return next(error);
					    }
					    if (user) {
					      	ep.emit("setting_error","userName","Name had been registered"); 
					    }else{
					    	originalUser.userName = userName;
					    	checkEvent.emit("checkName",originalUser);
					    }

					});
			}else{
				checkEvent.emit("checkName",originalUser);
			}
	      	
	    }else{ 
	    	 ep.emit("setting_error","submit","User is not exists");
	   	}
	});


}

function active(req,res,next){
	var activeKey = validator.trim(req.body.activeKey);
	var userEmail = validator.trim(req.body.userEmail);

	var ep = new eventproxy();
	ep.fail(next);
	ep.once('active_error', function (name,notice) {
		global.resJsonError(req,res,name,notice);
	});	

	Users.getByEmail(userEmail,function(error,user){
		if (error) {
	      	return next(error);
	    }
	    if (user) {
	    	var getActiveKey = tools.getActiveKey(user);
	    	if(getActiveKey == activeKey){
	    		var update = {activeState : true,update_at : new Date()};
	    		Users.update(user._id,update,function(error){
	    			if (error) {
				      	return next(error);
				    }

				    global.resJsonSuccess(req,res,"userEmail","Active successfully , please login !");

	    		})	

			}else{
				ep.emit("active_error","userEmail","ActiveKey is not right");
			}
	      	
	    }else{  	
	    	ep.emit("active_error","userEmail","Email is not exists");
	    }

	    return;

	});	
}



function logout(req,res,next){
	auth.removeUserSession(req,function(error){
		if (error) {
	      	return next(error);
	    }
		var url = config.url.host;
		res.redirect(url);
	});

}

function login(req, res, next){
	var userEmail = validator.trim(req.body.userEmail);
	var passWord = validator.trim(req.body.passWord);
	var ep = new eventproxy();
	ep.fail(next);
	ep.once('login_error', function (name,notice) {
		global.resJsonError(req,res,name,notice);
	});	

	if(validator.isNull(userEmail)){
		ep.emit("login_error","userEmail","Email can't be empty");
		return;
	}

	if(validator.isNull(passWord)){
		ep.emit("login_error","passWord","Password can't be empty");
		return;
	}

	Users.getByEmail(userEmail,function(error,user){
		if (error) {
	      	return next(error);
	    }
	    if (user) {
			if(config.auth.checkActive && !user.activeState){
				ep.emit("login_error","userEmail","Email is not active , please check your register email");
				return;
			}

	    	tools.bcryptCompare(passWord,user.passWord,function(error,state){
				if (error) {
			      	return next(error);
			    }	    		
	    		if(state){
		    		auth.saveUserSession(req,user);
					var url = config.url.host;
					global.jsonRedirect(res,url);
	    		}else{
	    			ep.emit("login_error","passWord","Password is not right");
	    		}

	    	});
	      	
	    }else{  	
	    	ep.emit("login_error","userEmail","Email is not exists");
	    }

	    return;

	});	

}


function register(req, res, next){
	var userName = validator.trim(req.body.userName);
	var userEmail = validator.trim(req.body.userEmail);
	var passWord = validator.trim(req.body.passWord);
	var confirmPassword = validator.trim(req.body.confirmPassword);

	var ep = new eventproxy();
	ep.fail(next);
	ep.once('register_error', function (name,notice) {
		global.resJsonError(req,res,name,notice);
	});

	if(userName.length < 6){
		ep.emit("register_error","userName","Name's length is too short");
		return;
	}

	if(!validator.isEmail(userEmail)){
		ep.emit("register_error","userEmail","Email is not right");
		return;
	}

	if(validator.isNull(passWord) || passWord.length < 6){
		ep.emit("register_error","passWord","Password is too shorts");
		return;
	}

	if(validator.isNull(passWord) || passWord != confirmPassword){
		ep.emit("register_error","confirmPassword","ConfirmPassword is not the same as passWord");
		return;
	}


	var checkEvent = new eventproxy();
	checkEvent.all('checkName','checkEmail', function () {


		tools.bcryptGenSalt(passWord,function(error, hash){
			if (error) {
		      	return next(error);
		    }

			var newUser = {
				userName : userName,
				userEmail : userEmail,
				passWord : hash,
				userAvatar : config.upload.defaultAvatar
			};

			Users.insert(newUser,function(error,user){
				if (error) {
			      	return next(error);
			    }

			    if (user) {
			      	sendActiveEmail(user);
			      	var url = config.url.host+"/users/login"
					global.jsonRedirect(res,url);
			    }else{
			    	ep.emit("register_error","userEmail","Error occurred when save user");
			    }
			});

		});



	});

	Users.getByEmail(userEmail,function(error,user){
		if (error) {
	      	return next(error);
	    }
	    if (user) {
	      	ep.emit("register_error","userEmail","Email had been registered");
	    }else{
	    	checkEvent.emit("checkEmail");
	    }

	    return;

	});

	Users.getByName(userName,function(error,user){

		if (error) {
	      	return next(error);
	    }
	    if (user) {
	      	ep.emit("register_error","userName","Name had been registered"); 
	    }else{
	    	checkEvent.emit("checkName");
	    }

	    return;

	});
}


function sendActiveEmail(user){
	var activeKey = tools.getActiveKey(user);

	var activeUrl = config.url.host+"/users/active?activeKey="+activeKey
	var from = config.email.from;
	var subject = "Active Email from LuckyBird";
	var html = "<p>Wellcome to LuckyBird </p><p>This is your active url : "+activeUrl+" </p>";
	email.sendMail(from,user.userEmail,subject,html);
}



