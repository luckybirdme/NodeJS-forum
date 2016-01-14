var express = require('express');
var router = express.Router();
var auth  = require("../middlewares/auth");
var upload = require('../controllers/upload');



/* GET upload listing. */

router.post('/image',auth.requiredLogin,upload.image);


module.exports = router;
