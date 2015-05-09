var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	ObjectID = mongodb.ObjectID,
	Category = require('./category'),
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
		year: this.year
	}
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		movies.insert(_movie,function(err,doc){
			if(err) return callback(err);
			Category.save(doc.ops[0],function(){
				callback(err,doc.ops[0]);
			})
		})
	});
}
/*
 * 获取电影信息
 * callback(err,movie)
 * movie 查找的电影信息
 */
Movie.findById = function (id,callback){
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		try{
			var _id = ObjectID(id);
		}catch(e){
			return callback(false,null);
		}
		movies.find({_id:ObjectID(id)}).toArray(function(err,doc){
			db.close();
			if(err) return callback(err);
			callback(err,doc[0]);
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
Movie.removeById = function(id,callback){
	MongoClient.connect(url,function(err,db){
		var movies = db.collection('movies');
		movies.remove({_id:ObjectID(id)},function(err,doc){
			db.close();
			if(err) return callback(err);
			callback(err,doc.result.n);
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
	    category : this.category
	}
	MongoClient.connect(url,function(err,db){
		db.collection('movies').update({_id:ObjectID(id)},{$set:_movie},function(err,doc){
			if(doc.result.ok ===1 && doc.result.n ===1){
				_movie._id = id;
				console.log(_movie)
				Category.save(_movie,function(err,movie){
					callback(err,_movie);
				})
			}else{
				callback(err,null);
			}
		});
	})
}











