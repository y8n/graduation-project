var express = require('express');
var User = require('../models/user');
var multipart = require('connect-multiparty');
var fs = require('fs');
var router = express.Router();


// user personal page
router.get('/u/:username', function(req, res) {
	var username = req.params.username;
	User.findByName(username, function(err, user) {
		if (err) return console.log(err);
		res.render('user_setting', {
			title: '用户设置',
			currentuser: user
		});
	})
});
// 用户设置
router.post('/user/setting', multipart(), function(req, res) {
	var username = req.body.username;
	delete req.body.username;
	User.findByName(username,function(err,user){
		if(req.body.oldPassword){
			var oldpwd = req.body.oldPassword;
			var newpwd = req.body.newPassword;
			User.changePassword(username,oldpwd,newpwd,function(err,exists){
				if(err) {
					console.log(err);
				}
				if(exists){ // 修改成功
					res.render('user_setting', {
						title: '用户设置',
						currentuser: user,
						msg:'修改密码成功',
						setting:true
					});
				}else{ // 修改失败
					res.render('user_setting', {
						title: '用户设置',
						currentuser: user,
						msg:'修改密码失败',
						setting:true
					});
				}
			})

		}else if(req.body.sex){
			var avatar = req.files.avatar;
			if(avatar.name !== ''){
				var ext = avatar.type.substring(avatar.type.lastIndexOf('/') +1);
				if(!fs.existsSync('public/images/avatars')){
					fs.mkdirSync('public/images/avatars');
				}
				var root = process.cwd();
				if(user.avatar !== '/images/avatar-default.svg'){
					fs.unlinkSync(root+'/public'+user.avatar);
				}
				var url = '/images/avatars/' + username+'_'+ new Date().getTime() + '.'+ext;
				fs.renameSync(req.files.avatar.path,'public'+url);
				req.body.avatar = url;
				User.setting(username,req.body,function(err,doc){
					if(doc.result.ok === 1){
						for(var i in req.body){
							user[i] = req.body[i];
						}
						res.render('user_setting', {
							title: '用户设置',
							currentuser: user,
							msg:'修改成功',
							setting:true
						});
					}
				});
			}else{
				User.setting(username,req.body,function(err,doc){
					if(doc.result.ok === 1){
						for(var i in req.body){
							user[i] = req.body[i];
						}
						res.render('user_setting', {
							title: '用户设置',
							currentuser: user,
							msg:'修改成功',
							setting:true
						});
					}
				});
			}
			
		}
	})
});
// 获取所有用户列表
router.get('/user/list', function(req, res) {
	var page = req.query.p || 1;
	var count = 6;
	var index = (page - 1) * count;
	User.findAll(function(err, users) {
		if (err) {
			console.error(err);
			return;
		}
		var len = users.length;
		var results = users.splice(index, count);
		res.render('userlist', {
			title: '用户列表',
			users: results,
			currentPage: page,
			totalPage: Math.ceil(len / count)
		});
	})
});
// 用户注册
router.post('/user/signup', function(req, res) {
	var _user = new User(req.body);
	_user.save(function(err, user) {
		if (err) {
			console.log(err);
			return;
		} else if (user.message) { //用户已经存在
			res.send({
				success: false,
				msg: '用户已经存在，请登录！'
			});
		} else {
			console.log('Insert success');
			req.session.user = user; //直接登录
			res.send({
				success: true,
				msg: '注册成功！',
				pathname: req.session.preUrl[1]
			});
		}
	});

});

// 用户登陆
router.post('/user/signin', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	User.checkPassword(username, password, function(err, isMatch, user) {
		if (err) {
			console.error(err);
			return;
		}
		if (isMatch) {
			console.log('Signin success');
			req.session.user = user;
			res.send({
				success: true,
				pathname: req.session.preUrl[1]
			})
		} else {
			res.send({
				success: false
			});
		}
	})
});
// 用户登出
router.get('/logout', function(req, res) {
	delete req.session.user;
	res.redirect('/');
});

// 用户登录成功现实页面
router.get('/signin', function(req, res) {
	var user = req.session.user;
	if (user) {
		return res.redirect('/')
	}
	res.render('signin', {
		title: "登录"
	});
});
// 用户登录成功现实页面
// router.get('/signup',function(req,res){
// 	var user = req.session.user;
// 	if(user){
// 		return res.redirect('/')
// 	}
// 	res.render('signup',{
// 		title:"注册"
// 	});
// });

//需要用户登录
function signinRequired(req, res, next) {
		var user = req.session.user;
		if (!user) {
			return res.redirect('/signin');
		}
		next();
	}
	// 需要管理员权限
function adminRequired(req, res, next) {
	var user = req.session.user;
	if (!user || !user.role || user.role == 1) {
		return res.redirect('/signin');
	}
	next();
}
module.exports = router;