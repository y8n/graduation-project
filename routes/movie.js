var express = require('express');
var router = express.Router();

// movie detail
router.get('/m/:id',function(req,res){
	res.render('detail',{
		title:"movie detail:"+req.params.id
	})
});

// add movie

router.get('/movie/add',function(req,res){
	res.render('edit_movie',{
		title:"add movie"
	})
});

// update movie
router.get('/movie/update',function(req,res){
	res.render('edit_movie',{
		title:"update movie"
	})
});
module.exports = router;