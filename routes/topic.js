var express = require('express');
var router = express.Router();
var auth  = require("../middlewares/auth");
var topic = require('../controllers/topic');



/* GET topics listing. */
router.get('/home',topic.home);
router.get('/show',topic.show);
router.get('/getTags',topic.getTags);
router.get('/getComments',topic.getComments);


router.get('/add',auth.requiredLogin,topic.add);

router.post('/create',auth.requiredLogin,topic.create);
router.post('/comment',auth.requiredLogin,topic.comment);



module.exports = router;
