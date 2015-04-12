var express = require('express');
var router = express.Router();
var Movie = require('../models/movie');
// movie detail
router.get('/m/:id',function(req,res){
	var id = req.params.id;
	Movie.findById(id,function(err,movie){
		if(err) return console.log(err);
		if(movie){
			res.render('detail',{
				title:"电影详情页-"+movie.title,
				movie:movie
			})
		}else{
			res.render('detail',{
				title:"电影详情页",
			})
		}
	})
});

// add movie

router.get('/movie/new',function(req,res){
	res.render('edit_movie',{
		title:"添加新电影",
		movie:{
			_id:"",
			title:"",
			doctor:"",
			actors:[],
			country:"",
			language:"",
			category:"",
			poster:"",
			flash:"",
			year:"",
			summary:"",
		},
		hot_movies:[
			{
				title:'战狼',
				doctor:'吴京',
				actors:['吴京','余男'],
				grade:8.4,
				category:'动作'
			},
			{
				title:'霍比特人',
				doctor:'彼得杰克逊',
				actors:['男一号','女一号'],
				grade:9.0,
				category:'魔幻，动作'
			},
			{
				title:'后会无期',
				doctor:'韩寒',
				actors:['忘了','不知道'],
				grade:8.5,
				category:'剧情，喜剧'
			},
			{
				title:'无人区',
				doctor:'宁浩',
				actors:['光头男','黄渤'],
				grade:9.1,
				category:'西部，犯罪'
			},
			{
				title:'失恋三十三天',
				doctor:'不知道',
				actors:['白百合','文章'],
				grade:7.422,
				category:'剧情，爱情'
			}
		]
	})
});

// update movie
router.get('/movie/update',function(req,res){
	res.render('edit_movie',{
		title:"update movie"
	})
});
// 提交表单
router.post('/post/new_movie',function(req,res){
	console.log(req.body);
	var movie = new Movie(req.body);
	movie.save(function(err,doc){
		console.log(doc);
		res.redirect('/m/'+doc._id);
	})
});
module.exports = router;













