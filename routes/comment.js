var express = require('express');
var Comment = require('../models/comment');
var router = express.Router();

// 获取新的评论
router.post('/comment/new',function(req,res){
	var _comment = req.body;
	var movieId = _comment.movieId;
	// console.log(_comment);
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
			Comment.addReply(comment,reply,function(err,reply){
				if(err){
					console.log(err);
					return;
				}
				if(reply){
					console.log("Reply insert success");
					// res.redirect('/m/'+_comment.movieId);
					res.send({
						success:true,
						reply:reply,
						cid:comment._id
					});
				}else{
					res.send({
						success:false
					});
				}
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
			// res.redirect('/m/'+_comment.movieId);
			res.send({
				success:true,
				comment:comment
			});
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