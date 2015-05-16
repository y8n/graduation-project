var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	ObjectID = mongodb.ObjectID,
	crypto = require('crypto'),
	url = 'mongodb://localhost:27017/movist';

var USER_COLLECTION;

function User (user){
	this.username = user.username;
	this.password = user.password;
	this.role = user.role || 3; // 3-normal user,2-vip user,1-admin
	this.score = user.score || 0 ;
	this.avatar = "/images/avatar-default.svg"; 
}

module.exports = User;


// 添加用户
User.prototype.save = function(callback){
	var md5 = crypto.createHash('md5'),
		password = md5.update(this.password).digest('base64');
	//存入mongodb中到文档
	var _user = {
		username : this.username,
		password : password,
		role : this.role,
		score  :this.score,
		avatar: this.avatar
	}
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		users.findOne({username:_user.username},function(err,doc){
			if(doc){
				db.close();
				callback(err,{
					message:'user is already exists.'
				});
			}else{
				users.insert(_user,function(err,doc){
					db.close();
					callback(err,doc.ops[0]);
				});
			}
		})
	});
}

// 查找用户
User.findByName = function findByName(username,callback){
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		users.findOne({username:username},function(err,doc){
			db.close();
			if(err){
				return callback(err);
			}
			callback(err,doc);
		})
	});
}


// 校验用户密码
User.checkPassword = function checkPassword(username,password,callback){
	var md5 = crypto.createHash('md5'),
		_password = md5.update(password).digest('base64');

	User.findByName(username,function(err,user){
		if(err){
			console.error(err);
			return;
		}
		if(user && user.password === _password){
			callback(err,true,user);
		}else{
			callback(err,false,null);
		}
	});
}


// 获取所有用户信息
User.findAll = function findAll(callback){
	MongoClient.connect(url,function(err,db){
		if(err) return callback(err);
		var users = USER_COLLECTION || db.collection('users');
		users.find({}).toArray(function(err,users){
			db.close();
			if(err) return callback(err);
			callback(err,users);
		})
	});
}
// 用户基本信息设置
User.setting = function(username,options,callback){
	User.findByName(username,function(err,user){
		if(err) return callback(err);
		MongoClient.connect(url,function(err,db){
			if(err) return callback(err);
			var users = USER_COLLECTION || db.collection('users');
			users.update({username:username},{$set:options},function(err,doc){
				if(err) callback(err);
				callback(err,doc);
			})
		});
	})
}
// 修改用户密码
User.changePassword = function(username,oldpwd,newpwd,callback){
	User.checkPassword(username,oldpwd,function(err,match,user){
		if(err) return callback(err);
		if(match){
			var md5 = crypto.createHash('md5'),
			_password = md5.update(newpwd).digest('base64');
			MongoClient.connect(url,function(err,db){
				if(err) return callback(err);
				var users = USER_COLLECTION || db.collection('users');
				users.update({username:username},{$set:{password:_password}},function(err,doc){
					if(err) callback(err);
					callback(err,user);
				})
			});
		}else{
			callback(err,null);
		}
	});
}

User.findById = function(id,callback){
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		users.findOne({_id:ObjectID(id)},function(err,doc){
			db.close();
			if(err){
				return callback(err);
			}
			callback(err,doc);
		})
	});
}
// 用户订阅电影类型
User.addOrder = function(id,category,callback){
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		User.findById(id,function(err,user){
			user.orders.push(category);
			users.update({_id:ObjectID(id)},{$set:{orders:user.orders}},function(err,doc){
				db.close();
				if(err){
					return callback(err);
				}
				if(doc.result.ok && doc.result.nModified >0){
					callback(err,true,user);
				}else{
					callback(err,false,user);
				}

			})
		})
	});
}
// 用户退订电影类型
User.minusOrder = function(id,category,callback){
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		User.findById(id,function(err,user){
			user.orders.splice(user.orders.indexOf(category),1);
			users.update({_id:ObjectID(id)},{$set:{orders:user.orders}},function(err,doc){
				db.close();
				if(err){
					return callback(err);
				}
				if(doc.result.ok && doc.result.nModified >0){
					callback(err,true,user);
				}else{
					callback(err,false,user);
				}

			})
		})
	});
}
// 获取用户订阅电影
User.getOrders = function(id,callback){
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		User.findById(id,function(err,user){
			var o_movies=[],len,categories = {};//{"动作":[],"动画":[],"喜剧":[],"犯罪":[],"剧情":[],"爱情":[],"奇幻":[],"科幻":[],"惊悚":[],"战争":[]};
			for(var order in user.orders){
				categories[user.orders[order]] = []
			}
			if(user.orderMovies){
				len = user.orderMovies.length;
			}else{
				len=0;
			}
			for(var i=0;i<len;i++){
				o_movies.push(ObjectID(user.orderMovies[i]));
			}
			// 获取用户订阅的电影
			db.collection('movies').find({_id:{$in:o_movies}}).toArray(function(err,movies){
				// 清空
				users.update({_id:ObjectID(id)},{$set:{orderMovies:[]}},function(err,doc){
					db.close();
					if(err){
						return callback(err);
					}
					if(doc.result.ok && doc.result.nModified >0){
						var keys = Object.keys(categories),cat;
						for(var j=0;j<keys.length;j++){
							cat = keys[j];
							for(var k=0;k<movies.length;k++){
								if(movies[k].category.indexOf(cat) !== -1){
									categories[cat].push(movies[k]);
								}
							}
						}
						user.orderMovies = [];
						callback(err,categories,user);
					}else{
						callback(err,null,user);
					}

				})
			});
		})
	});
}
// 用户订阅电影项添加
User.addOrderMovie = function(user_id,movie_id,callback){
	MongoClient.connect(url,function(err,db){
		var users = USER_COLLECTION || db.collection('users');
		User.findById(user_id,function(err,user){
			user.orderMovies.push(movie_id);
			users.update({_id:ObjectID(user_id)},{$set:{orderMovies:user.orderMovies}},function(err,doc){
				db.close();
				if(err){
					return callback(err);
				}
				if(doc.result.ok && doc.result.nModified >0){
					callback(err,true,user);
				}else{
					callback(err,false,user);
				}

			})
		})
	});
}















