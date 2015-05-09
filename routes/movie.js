var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var Movie = require('../models/movie');
var fs = require('fs');
var Category = require('../models/category');
var Comment = require('../models/comment');


// movie detail
router.get('/m/:id',function(req,res){
	var id = req.params.id;
	Movie.findById(id,function(err,movie){
		if(err) return console.log(err);
		if(movie){
			Comment.findAllByMoiveId(id,function(err,comments){
				res.render('detail',{
					title:movie.title,
					movie:movie,
					comments:comments
				})
			})
		}else{
			res.render('detail',{
				title:"电影详情页"
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
			director:"",
			actors:[],
			country:"",
			language:"",
			category:"",
			poster:"",
			flash:"",
			year:"",
			summary:"",
		},
		hot_movies:hot_movies
	})
});

// update movie
router.get('/movie/update/:id',function(req,res){
	var id = req.params.id;
	Movie.findById(id,function(err,movie){
		if(err) return console.log(err);
		if(movie){
			res.render('edit_movie',{
				title:"更新电影信息-"+movie.title,
				movie:movie,
				hot_movies:hot_movies
			})
		}else{
			res.render('detail',{
				title:"电影详情页",
			})
		}
	})
	
});
// 提交表单
router.post('/post/new_movie',multipart(),function(req,res){
	if(typeof req.body.category === 'string'){
		var temp = req.body.category;
		req.body.category = new Array(req.body.category);
	}
	var movie = new Movie(req.body);
	var poster = req.files.uploadPoster;
	if(poster.name !== ''){
		var ext = poster.type.substring(poster.type.lastIndexOf('/') +1);
		if(!fs.existsSync('public/images/posters')){
			fs.mkdirSync('public/images/posters');
		}
		var url = '/images/posters/' + new Date().getTime() + '.'+ext;
		fs.renameSync(poster.path,'public'+url);
		movie.poster = url;	
	}
	if(req.body._id ===''){
		movie.save(function(err,doc){
			res.redirect('/m/'+doc._id);
		})
	}else {
		function contains(arr,ele){
			for(var n=0;n<arr.length;n++){
				if(arr[n] === ele){
					return true;
				}
			}
			return false;
		}
		var oldCategory = req.body.oldCategory.split(',');
		for(var i=0;i<oldCategory.length;i++){
			if(!contains(movie.category,oldCategory[i])){
				Category.removeMovie(oldCategory[i],req.body._id,function(err,doc){
				})
			}
		}
		movie.update(req.body._id,function(err,movie){
			res.redirect('/m/'+movie._id);
		})	
	}
});
// 电影列表
router.get('/admin/movielist',function(req,res){
	var page = req.query.p  || 1;
    var count = 6;
    var index = (page-1) * count;
	Movie.findAll(function(err,movies){
        if(err){
            console.error(err);
            return;
        }
        var len = movies.length;
        var results = movies.splice(index,count);
        res.render('movielist',{
            title:'Movie List',
            movies:results,
            currentPage:page,
            totalPage:Math.ceil(len/count)
        });
    })
});
// 删除电影信息
router.post('/admin/movielist',function(req,res){
    var id = req.query.id;
    if(id){
        Movie.removeById(id,function(err,movie){
            if(err){
                console.error(err);
                return;
            }
            if(movie === 1){
                console.log("Remove success");
                res.send({success:true,msg:"删除成功"})
            }else if(movie === 0){
                console.log("No matched data");
                res.send({success:false,msg:"删除失败:电影不存在"})
            }
        });
    }
})
module.exports = router;

var hot_movies = [
	{
		title:'战狼',
		director:'吴京',
		actors:['吴京','余男'],
		grade:8.4,
		category:'动作'
	},
	{
		title:'霍比特人',
		director:'彼得杰克逊',
		actors:['男一号','女一号'],
		grade:9.0,
		category:'魔幻，动作'
	},
	{
		title:'后会无期',
		director:'韩寒',
		actors:['忘了','不知道'],
		grade:8.5,
		category:'剧情，喜剧'
	},
	{
		title:'无人区',
		director:'宁浩',
		actors:['光头男','黄渤'],
		grade:9.1,
		category:'西部，犯罪'
	},
	{
		title:'失恋三十三天',
		director:'不知道',
		actors:['白百合','文章'],
		grade:7.422,
		category:'剧情，爱情'
	}
]











