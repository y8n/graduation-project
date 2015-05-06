var express = require('express');
var Comment = require('../models/comment');
var router = express.Router();

// 获取新的评论
router.post('/comment/new',function(req,res){
	var _comment = req.body;
	var movieId = _comment.movieId;
	if(_comment.cid){
		var reply = {
			from:_comment.from,
			to:_comment.tid,
			content:_comment.content
		}
		Comment.findById(_comment.cid,function(err,comment){
			if(err){
				console.error(err);
				return;
			}
			var _reply = comment.reply;
			_reply.push(reply);
			Comment.addReply(_comment.cid,_reply,function(err,comment){
				if(err){
					console.log(err);
					return;
				}
				console.log(comment)
				console.log("Reply insert success");
				res.redirect('/m/'+_comment.movieId);
			});
		})
	}else{
		_comment = new Comment(req.body)
		_comment.save(function(err,comment){
			if(err){
				console.log(err);
				return;
			}
			console.log("Comment insert success");
			res.redirect('/m/'+_comment.movieId);
		});
	}
})
// 需要用户登录
function signinRequired(req,res,next){
	var user = req.session.user;
	if(!user){
		return res.redirect('/signin');
	}
	next();
} 

module.exports = router;