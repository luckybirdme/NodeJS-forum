var express = require('express');
var router = express.Router();
var topic = require('../controllers/topic');

/* GET home page. */
router.get('/', topic.home);

module.exports = router;
