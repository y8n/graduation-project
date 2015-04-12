var express = require('express');
var router = express.Router(),
	Category = require('../models/category');


// index page
router.get('/', function(req, res) {
	Category.findAll(function(err,categories){
	    res.render('index',{
	    	title:'Welcome to Movist!',
	    	categories:categories
	    });
	})
});
module.exports = router;