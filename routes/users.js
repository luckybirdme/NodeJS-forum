var express = require('express');
var router = express.Router();
var users = require('../controllers/users');
var auth  = require("../middlewares/auth");




/* GET users listing. */
router.get('/login',auth.getCsrfToken, function(req, res, next) {
  	res.render('users/login', { title: 'Login' });
});
router.post('/login',users.login);

router.get('/logout',users.logout);


router.get('/register',auth.getCsrfToken, function(req, res, next) {
  	res.render('users/register', { title: 'Register' });
});
router.post('/register',users.register);


router.get('/active', auth.getCsrfToken,function(req, res, next) {
	var activeKey = req.param("activeKey");
  	res.render('users/active', { title: 'Active',activeKey:activeKey });
});
router.post('/active',users.active);

router.get('/home',users.home);

router.get('/setting',auth.getCsrfToken,auth.requiredLogin,function(req,res){
	res.render('users/setting', { title: "Setting"});
});
router.post('/setting',auth.requiredLogin,users.setting);

module.exports = router;
