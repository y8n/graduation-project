var express = require('express');
var router = express.Router();


// user personal page
router.get('/u/:id', function(req, res) {
    res.render('user_setting',{
    	title:'User Personal page'
    });
});

// user list page 
router.get('/admin/userlist',function(req,res){
	res.render('userlist',{
		title:'user list'
	})
});
module.exports = router;