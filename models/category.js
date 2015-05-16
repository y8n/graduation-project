var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	ObjectID = mongodb.ObjectID,
	url = 'mongodb://localhost:27017/movist';


function Category (name,movie_id){
	this.name = name;
	this.movies = [movie_id];
}
module.exports = Category;
/* 
 * 将电影存入多种类型中
 * movie object类型
 */
Category.save = function(movie,callback){
	MongoClient.connect(url,function(err,db){
		if(err) return console.error(err);
		var collection = db.collection('categories');
		(function it(i){
			if(i==movie.category.length){
				db.close();
				callback();
				return;
			}
			collection.findOne({name:movie.category[i]},function(err,category){
				if(category){		//如果已经有了这个类型对电影集合
					if(category.movies.indexOf(movie._id) !== -1){ // 已经存在的话直接下一次循环
						it(++i);
					}else{ // 没有的话加上
						category.movies.push(movie._id); //这里把movieId存入数组
						collection.update({name:movie.category[i]},{$set:{movies:category.movies}},function(err,category){
							it(++i);
						})
					}
				}else{  // 没有这个电影的集合
					var _category = new Category(movie.category[i],movie._id);
					collection.save(_category,function(err,category){
						it(++i);
					})
				}
			})
		})(0);
	});
}
// 获取指定ID的电影类型集合
Category.findByName = function findByName(name,callback){
	MongoClient.connect(url,function(err,db){
		var categories = db.collection('categories');
		var movies = db.collection('movies');
		categories.findOne({name:name},function(err,category){
			var _movies = [];
			(function iterator(j){
				if(j == category.movies.length){
					db.close();
					category.movies = _movies;
					callback(err,category);
					return;
				}else{
					movies.findOne({_id:ObjectID(category.movies[j])},function(err,movie){
						_movies.push(movie);
						iterator(++j);
					})
				}
			})(0)
		})
	});
}

// 获取所有电影类别
Category.findAll = function findAll(callback){
	MongoClient.connect(url,function(err,db){
		if(err) return callback(err);
		db.collection('categories').find({}).sort({index:1}).toArray(function(err,categories){
			if(categories){
				var _categories = [];
				;(function iterator(i){
					if(i == categories.length){
						db.close();
						callback(err,_categories);
						return;
					}
					var category = categories[i];
					var _category = {
						_id:category._id,
						name:category.name
					};
					var _movies = [];
					var movies = db.collection('movies');
					;(function iterator2(j){
						if(j == 10 || j == category.movies.length){ // 首页只展示对应类型的10部电影
							_category.movies = _movies;
							_categories.push(_category);
							iterator(++i);
						}else{
							movies.findOne({_id:mongodb.ObjectID(category.movies[j])},function(err,movie){
								_movies.push(movie);
								iterator2(++j);
							})
						}
					})(0);
				})(0)
			}
		});
	});
}
// 从oldCategory中移除指定ID的电影
Category.removeMovie = function removeMovie(oldCategory,movieId,callback){
	MongoClient.connect(url,function(err,db){
		if(err) return callback(err);
		var categories = db.collection('categories');
		categories.findOne({name:oldCategory},function(err,category){
			if(category){
				// 如果有了这一部电影,把原来电影数据删除再更新
				for(var j=0,len=category.movies.length;j<len;j++){
					if((category.movies[j]+'') == (movieId+'')){
						category.movies.splice(j,1);
						categories.update({name:oldCategory},{$set:{movies:category.movies}},function(err,doc){
							if(doc.result.ok === 1 && doc.result.n ===1)
								callback(err,doc);						
						})
						break;
					}
				}
				
			}
		});
	});	
}





