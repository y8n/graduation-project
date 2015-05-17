var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	ObjectID = mongodb.ObjectID,
	Category = require('./category'),
	Comment = require('./comment'),
	url = 'mongodb://localhost:27017/movist';
function Movie(movie) {
	this.title = movie.title;
	this.director = movie.director;
	this.actors = movie.actors;
	this.country = movie.country;
	this.language = movie.language;
	this.poster = movie.poster;
	this.flash = movie.flash;
	this.summary = movie.summary;
	this.category = movie.category;
	this.year = movie.year;
	this.score = 5;
	this.user = movie.user_id;
	this.VV = 0;
}

module.exports = Movie;
/* 
 * 插入电影
 * callback(err,movie)
 * movie 新插入的电影
 */
Movie.prototype.save = function(callback) {
	var _movie = {
		title: this.title,
		director: this.director,
		actors: this.actors,
		country: this.country,
		language: this.language,
		poster: this.poster,
		flash: this.flash,
		summary: this.summary,
		category: this.category,
		year: this.year,
		score:this.score,
		user:this.user,
		VV:this.VV
	}
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		movies.insert(_movie,function(err,doc){
			db.close();
			if(err) return callback(err);
			var movie = doc.ops[0];
			Category.save(movie,function(){
				callback(err,movie);
			})
		})
	});
}
/*
 * 获取电影信息
 * callback(err,movie)
 * movie 查找的电影信息
 */
Movie.findById = function (id,callback,count){
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		try{
			var _id = ObjectID(id);
		}catch(e){
			return callback(false,null);
		}
		movies.find({_id:ObjectID(id)}).toArray(function(err,doc){
			if(err) return callback(err);
			// 如果是需要统计访问次数的话
			if(count){
				var vv;
				if(doc[0].VV){
					vv = doc[0].VV +1;
				}else{
					vv = 1;
				}
				movies.update({_id:ObjectID(id)},{$set:{VV:vv}},function(err){
					db.close();
					if(err){
						return callback(err);
					}
					callback(err,doc[0]);
				})
			}else{
				callback(err,doc[0]);
			}
		})
	});
}

/*
 * 获取所有电影
 * callback(err,moveis)
 * movies 所有的电影信息
 */
Movie.findAll = function(callback){
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		movies.find({}).toArray(function(err,doc){
			db.close();
			if(err) return callback(err);
			callback(err,doc);
		})
	});
}

/* 
 * 删除指定id的电影
 * callback(err,movie)
 * 即将被删除的电影
 */
Movie.removeById = function(id,categories,callback){
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		// 删除movies collection 中的
		movies.remove({_id:ObjectID(id)},function(err,DOC){
			db.close();
			if(err) return callback(err);
			// 删除电影类别里的
			(function it(n){
				if(n >= categories.length){
					// 删除评论里面的
					Comment.removeByMId(id,function(err,doc){
						callback(err,DOC.result.n);
					});		
				}else{
					Category.removeMovie(categories[n],id,function(err,doc){
						it(++n);
					})
				}
			})(0);
		})
	});
}

// 搜索包含指定名字的电影
Movie.search = function search(name,callback){
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		var reg = new RegExp(name,'i');
		movies.find({title:reg}).toArray(function(err,movies){
			db.close();
			if(movies){
				callback(err,movies);
			}else{
				callback(err,null);
			}
		});
	})
}
// 根据电影ID更新数据
Movie.prototype.update = function update(id,callback){
	var _movie = {
		title : this.title,
	    director : this.director,
	    actors:this.actors,
	    country : this.country,
	    year : this.year,
	    poster : this.poster,
	    flash : this.flash,
	    summary : this.summary,
	    language : this.language,
	    category : this.category,
	    score:this.score,
	    user:this.user
	}
	MongoClient.connect(url,function(err,db){
		db.collection('movies').update({_id:ObjectID(id)},{$set:_movie},function(err,doc){
			db.close();
			if(doc.result.ok ===1 && doc.result.n ===1){
				_movie._id = id;
				Category.save(_movie,function(err,movie){
					callback(err,_movie);
				})
			}else{
				callback(err,null);
			}
		});
	})
}
//为指定电影添加用户评分
Movie.addScore = function(id,userId,score,callback){
	Movie.findById(id,function(err,movie){
		if(movie.scores && movie.scores.indexOf(userId) !== -1){
			return callback(err,true,false);
		}
		var scores;
		if(!movie.scores){
			scores = [userId];
		}else{
			scores = movie.scores;
			scores.push(userId);
		}
		score = (movie.score+score)/2;
		MongoClient.connect(url,function(err,db){
			db.collection('movies').update({_id:ObjectID(id)},{$set:{scores:scores,score:Math.round(score)}},function(err,doc){
				db.close();
				if(doc.result.ok ===1 && doc.result.n ===1){
					callback(err,false,true,Math.round(score));
				}else{
					callback(err,false,false);
				}
			});
		})
	})
}











