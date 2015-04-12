var mongodb = require('mongodb'),
	DB = require('./DB'),
	MongoClient = mongodb.MongoClient,
	ObjectID = mongodb.ObjectID,
	url = 'mongodb://localhost:27017/movist';
function Movie(movie) {
	this.title = movie.title;
	this.doctor = movie.doctor;
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
		doctor: this.doctor,
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
			callback(err,doc.ops[0]);
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
		movies.find({_id:ObjectID(id)}).toArray(function(err,doc){
			if(err) return callback(err);
			callback(err,doc[0]);
		})
	});
}













