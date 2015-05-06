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




















