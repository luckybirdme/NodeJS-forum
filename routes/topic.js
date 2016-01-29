var express = require('express');
var router = express.Router();
var auth  = require("../middlewares/auth");
var topic = require('../controllers/topic');



/* GET topics listing. */
router.get('/home',topic.home);
router.get('/getTags',topic.getTags);
router.get('/getComments',topic.getComments);

router.get('/show',auth.getCsrfToken,topic.show);
router.post('/comment',topic.comment);

router.get('/add',auth.getCsrfToken,auth.requiredLogin,topic.add);
router.post('/create',auth.requiredLogin,topic.create);




module.exports = router;
