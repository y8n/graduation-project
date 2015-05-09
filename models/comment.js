var mongodb = require('mongodb'),
	MongoClient = mongodb.MongoClient,
	ObjectID = mongodb.ObjectID,
	crypto = require('crypto'),
	User = require('./user'),
	url = 'mongodb://localhost:27017/movist';
var COMMENT_COLLECTION;
var USER_COLLECTION;
function Comment(comment){
	this.from = comment.from;
	this.movieId = comment.movieId;
	this.reply = [];
	this.content = comment.content;
}
module.exports = Comment;
// 将评论存入数据库
Comment.prototype.save = function save (callback){
	//存入mongodb中到文档
	var _comment = {
		from : mongodb.ObjectID(this.from),
		movieId : mongodb.ObjectID(this.movieId),
		reply : this.reply,
		content : this.content,
		time : new Date().getTime()
	}
	MongoClient.connect(url,function(err,db){
		var comments = COMMENT_COLLECTION || db.collection('comments');
		comments.insert(_comment,function(err,doc){
			db.close();
			User.findById(_comment.from,function(err,user){
				doc.ops[0].from = user;
				callback(err,doc.ops[0]);
			})
		})
	});
}
// 通过电影的ID获取所有评论以及评论中所有回复
Comment.findAllByMoiveId = function findAllByMoiveId(id,callback){
	MongoClient.connect(url,function(err,db){
		var comments = COMMENT_COLLECTION || db.collection('comments');
		var users = USER_COLLECTION || db.collection('users');
		comments.find({movieId:mongodb.ObjectID(id)}).sort({time:1}).toArray(function(err,comments){
			if(comments.length > 0){
				var _comments = [];
				;(function iterator(i){
					if(i == comments.length){
						db.close();
						callback(err,_comments);
						return;
					};
					var comment = comments[i];
					var _comment = {
						_id:comment._id,
						content:comment.content
					}
					var _reply = [];
					users.findOne({_id:mongodb.ObjectID(comment.from)},function(err,from){
						_comment.from = from;
						;(function iterator2(j){
							if(j == comment.reply.length){
								_comment.reply = _reply;
								_comments.push(_comment);
								iterator(++i);
							}else{
								var __reply = {
									content:comment.reply[j].content
								};
								users.findOne({_id:mongodb.ObjectID(comment.reply[j].from)},function(err,from){
									__reply.from = from;
									users.findOne({_id:mongodb.ObjectID(comment.reply[j].to)},function(err,to){
										//console.log(to)
										__reply.to = to;
										_reply.push(__reply);
										iterator2(++j);
									})
								})
							}
						})(0)
					})
				})(0);
			}else{
				db.close();
				callback(err,null);
			}

		});
	});
	/*DB.open(function(err,db){
		if(err){
			return callback(err);
		}
		db.collection('comments',function(err,collection){
			if(err){
				DB.close();
				return callback(err);
			}
			collection.find({movieId:mongodb.ObjectID(id)}).toArray(function(err,comments){
				if(comments){
					var _comments = [];
					;(function iterator(i){
						if(i == comments.length){
							DB.close();
							callback(err,_comments);
							return;
						};
						var comment = comments[i];
						var _comment = {
							_id:comment._id,
							content:comment.content
						}
						var _reply = [];
						db.collection('users',function(err,collection){
							collection.findOne({_id:mongodb.ObjectID(comment.from)},function(err,from){
								_comment.from = from;
								;(function iterator2(j){
									if(j == comment.reply.length){
										_comment.reply = _reply;
										_comments.push(_comment);
										iterator(++i);
									}else{
										var __reply = {
											content:comment.reply[j].content
										};
										collection.findOne({_id:mongodb.ObjectID(comment.reply[j].from)},function(err,from){
											__reply.from = from;
											collection.findOne({_id:mongodb.ObjectID(comment.reply[j].to)},function(err,to){
												//console.log(to)
												__reply.to = to;
												_reply.push(__reply);
												iterator2(++j);
											})
										})
									}
								})(0)
							})
						})
					})(0);
				}else{
					DB.close();
					callback(err,null);
				}
			});
		});
	});*/
}
// 获取指定ID的评论
Comment.findById = function findById(id,callback){
	MongoClient.connect(url,function(err,db){
		var comments = COMMENT_COLLECTION || db.collection('comments');
		comments.findOne({_id:ObjectID(id)},function(err,doc){
			db.close();
			callback(err,doc);
		})
	});
}
// 向指定ID的评论中添加指定的回复内容
Comment.addReply = function addReply(comment,reply,callback){
	MongoClient.connect(url,function(err,db){
		var comments = COMMENT_COLLECTION || db.collection('comments');
		var _reply = comment.reply;
		_reply.push(reply);
		comments.update({_id:ObjectID(comment._id)},{$set:{reply:_reply}},function(err,doc){
			if(doc.result.ok ===1){
				User.findById(reply.from,function(err,from){
					reply.from = from;
					User.findById(reply.to,function(err,to){
						reply.to = to;	
						callback(err,reply);
					});
				})
				// comment.reply.push(reply);
				// console.log(reply);
				// var _comment = {
				// 	_id:comment._id,
				// 	content:comment.content
				// }
				// var _reply = [];
				// var reply = comment.reply;
				// (function iterator(i){
				// 	if(i >= reply.length){
				// 		_comment.reply = _reply;
				// 		callback(err,_comment);
				// 	}else{
				// 		var __reply = {
				// 			content:reply[i].content
				// 		};
				// 		User.findById(reply[i].from,function(err,from){
				// 			__reply.from = from;
				// 			User.findById(reply[i].from,function(err,from){
				// 				__reply.to = to;
				// 				_reply.push(__reply);
				// 				iterator(++i);
				// 			});
				// 		})
				// 	}
				// })(0);
			}else {
				callback(err,null);
			}
		})
	});
}














