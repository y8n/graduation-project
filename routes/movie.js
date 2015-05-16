var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');
var Movie = require('../models/movie');
var fs = require('fs');
var Category = require('../models/category');
var Comment = require('../models/comment');
var User = require('../models/user');
var https = require('https');


// movie detail
router.get('/m/:id', function(req, res) {
	var id = req.params.id;
	Movie.findById(id, function(err, movie) {
		if (err) return console.log(err);
		if (movie) {
			Comment.findAllByMoiveId(id, function(err, comments) {
				res.render('detail', {
					title: movie.title,
					movie: movie,
					comments: comments
				})
			})
		} else {
			res.render('detail', {
				title: "电影详情页"
			})
		}
	},true);
});

var HOT_MOVIES;
// add movie

router.get('/movie/new', function(req, res) {
	var RES = res;
	var result = '';
	if(HOT_MOVIES){
		RES.render('edit_movie', {
			title: "添加新电影",
			movie: {
				_id: "",
				title: "",
				director: "",
				actors: [],
				country: "",
				language: "",
				category: "",
				poster: "",
				flash: "",
				year: "",
				summary: "",
			},
			hot_movies: HOT_MOVIES,
			user: req.session.user
		})
	}else{
		https.get('https://api.douban.com/v2/movie/top250', function(res) {
			res.on('data', function(d) {
				// console.log(d.toString())
				result += d.toString();
				// process.stdout.write(d);
			});
			res.on('end', function(data) {
				result = JSON.parse(result);
				var movies = result.subjects.splice(0,10),hot_movies = [];
				movies.forEach(function(movie){
					var temp = {
						title:movie.title,
						director:movie.directors[0].name,
						actors:[movie.casts[0].name,movie.casts[1].name],
						grade:movie.rating.average,
						category:movie.genres,
						poster:movie.images.small
					}
					hot_movies.push(temp);
				});
				HOT_MOVIES = hot_movies;
				RES.render('edit_movie', {
					title: "添加新电影",
					movie: {
						_id: "",
						title: "",
						director: "",
						actors: [],
						country: "",
						language: "",
						category: "",
						poster: "",
						flash: "",
						year: "",
						summary: "",
					},
					hot_movies: HOT_MOVIES,
					user: req.session.user
				})
			})
		}).on('error', function(e) {
			RES.render('edit_movie', {
				title: "添加新电影",
				movie: {
					_id: "",
					title: "",
					director: "",
					actors: [],
					country: "",
					language: "",
					category: "",
					poster: "",
					flash: "",
					year: "",
					summary: "",
				},
				user: req.session.user
			})
		});
	}
});

// update movie
router.get('/movie/update/:id', function(req, res) {
	var RES = res;
	var id = req.params.id;
	var result = '';
	if(HOT_MOVIES){
		Movie.findById(id, function(err, movie) {
			if (err) return console.log(err);
			if (movie) {
				res.render('edit_movie', {
					title: "更新电影信息-" + movie.title,
					movie: movie,
					hot_movies: HOT_MOVIES
				})
			} else {
				res.render('detail', {
					title: "电影详情页",
				})
			}
		})
	}else{
		https.get('https://api.douban.com/v2/movie/top250', function(res) {
			res.on('data', function(d) {
				// console.log(d.toString())
				result += d.toString();
				// process.stdout.write(d);
			});
			res.on('end', function(data) {
				result = JSON.parse(result);
				var movies = result.subjects.splice(0,10),hot_movies = [];
				movies.forEach(function(movie){
					var temp = {
						title:movie.title,
						director:movie.directors[0].name,
						actors:[movie.casts[0].name,movie.casts[1].name],
						grade:movie.rating.average,
						category:movie.genres,
						poster:movie.images.small
					}
					hot_movies.push(temp);
				});
				HOT_MOVIES = hot_movies;
				Movie.findById(id, function(err, movie) {
					if (err) return console.log(err);
					if (movie) {
						RES.render('edit_movie', {
							title: "更新电影信息-" + movie.title,
							movie: movie,
							hot_movies: HOT_MOVIES
						})
					} else {
						RES.render('detail', {
							title: "电影详情页",
						})
					}
				})
			})
		}).on('error', function(e) {
			Movie.findById(id, function(err, movie) {
				if (err) return console.log(err);
				if (movie) {
					RES.render('edit_movie', {
						title: "更新电影信息-" + movie.title,
						movie: movie,
					})
				} else {
					RES.render('detail', {
						title: "电影详情页",
					})
				}
			})
		});
	}

});
// 提交表单
router.post('/post/new_movie', multipart(), function(req, res) {
	if (typeof req.body.category === 'string') {
		var temp = req.body.category;
		req.body.category = new Array(req.body.category);
	}
	var movie = new Movie(req.body);
	var poster = req.files.uploadPoster;
	if (poster.name !== '') {
		var ext = poster.type.substring(poster.type.lastIndexOf('/') + 1);
		if (!fs.existsSync('public/images/posters')) {
			fs.mkdirSync('public/images/posters');
		}
		var url = '/images/posters/' + new Date().getTime() + '.' + ext;
		fs.renameSync(poster.path, 'public' + url);
		movie.poster = url;
	}
	if (req.body._id === '') {
		movie.save(function(err, movie) {
			var user = req.session.user;
			User.addOrderMovie(user._id,movie._id,function(err,success,user){
				req.session.user = user;
				res.redirect('/m/' + movie._id);
			})
		})
	} else {
		function contains(arr, ele) {
			for (var n = 0; n < arr.length; n++) {
				if (arr[n] === ele) {
					return true;
				}
			}
			return false;
		}
		var oldCategory = req.body.oldCategory.split(',');
		for (var i = 0; i < oldCategory.length; i++) {
			if (!contains(movie.category, oldCategory[i])) {
				Category.removeMovie(oldCategory[i], req.body._id, function(err, doc) {})
			}
		}
		movie.update(req.body._id, function(err, movie) {
			res.redirect('/m/' + movie._id);
		})
	}
});
// 电影列表
router.get('/admin/movielist', function(req, res) {
	var page = req.query.p || 1;
	var count = 6;
	var index = (page - 1) * count;
	Movie.findAll(function(err, movies) {
		if (err) {
			console.error(err);
			return;
		}
		var len = movies.length;
		var results = movies.splice(index, count);
		res.render('movielist', {
			title: 'Movie List',
			movies: results,
			currentPage: page,
			totalPage: Math.ceil(len / count)
		});
	})
});
// 删除电影信息
router.post('/admin/movielist', function(req, res) {
	var id = req.query.id;
	var categories  = req.query.cat.split(',');
	if (id) {
		Movie.removeById(id, categories,function(err, movie) {
			if (err) {
				console.error(err);
				return;
			}
			if (movie === 1) {
				console.log("Remove success");
				res.send({
					success: true,
					msg: "删除成功"
				})
			} else if (movie === 0) {
				console.log("No matched data");
				res.send({
					success: false,
					msg: "删除失败:电影不存在"
				})
			}
		});
	}
});
// 处理电影评分
router.post('/movie/score', function(req, res) {
	var movieId = req.body.movieId;
	var from = req.body.from;
	var score = parseInt(req.body.score);
	Movie.addScore(movieId, from, score, function(err, exists, success, new_score) {
		if (err) return console.log(err);
		if (exists) {
			res.send({
				success: false,
				msg: '用户已经评论过该电影，不能重复评论!'
			});
		} else if (success) {
			req.session.user = user;
			res.send({
				success: true,
				msg: '评分成功，感谢支持!',
				score: new_score
			});
		} else {
			res.send({
				success: true,
				msg: '评分失败，请稍后重试!'
			});
		}
	});

})

module.exports = router;

