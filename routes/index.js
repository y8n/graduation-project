var express = require('express');
var router = express.Router();


// index page
router.get('/', function(req, res) {
    res.render('index',{
    	title:'Welcome to Movist!'
    });
});
module.exports = router;