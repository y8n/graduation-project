$(function(){
	//导航栏切换
	var url = window.location.pathname;
	var $nav = $('ul.navbar-nav').eq(0);
	if(url === '/'){
		$nav.children().eq(0).addClass('active');
	}else if(url === '/movie/new'){
		$nav.children().eq(1).addClass('active');
	}else if(url === '/admin/movielist' || url === '/user/order'){
		$nav.children().eq(2).addClass('active');
	}else if(url === '/user/list'){
		$nav.children().eq(3).addClass('active');
	}else if(url === '/admin/category/list'){
		$nav.children().eq(4).addClass('active');
	}
	//注册界面表单验证
	$('#signupbtn').click(function(){
		var target = $(this);
		var $form = $('#signupModal form');
		var	username = $('#signupName');
		var password = $('#signupPassword');
		var repassword = $('#signupRePassword');
		var $alert = $('#signupModal .alert').hide();
		if(username.val() === '' || password.val() === '' || repassword.val() === ''){
			$alert.text('信息输入不完整!').show();
		}else if(password.val() !== repassword.val()){
			$alert.text('两次的密码不一致').show();
		}else{
			$.ajax({
				url:'/user/signup',
				type:'post',
				dataType:'json',
				data:$form.serialize(),
				success:function(data){
					if(data.success){
						$('#signupModal').hide();
						window.location = '/';
					}else{
						$alert.text('用户已经存在').show();
					}
				}
			});
		}
	});
	$('.logout').click(function(){
		$.post('/logout',function(data){
			if(data.success){
				alert('登出成功');
				window.location='/'
			}
		});
	})
	$('#signinbtn').click(function(){
		var target = $(this);
		var $form = $('#signinModal form');
		var	username = $('#signinName');
		var password = $('#signinPassword');
		var $alert = $('#signinModal .alert').hide();
		if(username.val() === '' || password.val() === ''){
			$alert.text('信息输入不完整!').show();
		}else{
			$.ajax({
				url:'/user/signin',
				type:'post',
				dataType:'json',
				data:$form.serialize(),
				success:function(data){
					if(data.success){
						$('#signinModal').hide();
						window.location = window.location.origin+data.pathname;
					}else if(data.freeze){
						alert("您已被冻结，请联系管理员!");
					}else{
						$alert.text('用户名或密码错误').show();
					}
				}
			});
		}
	});
	function checkImgType(filename) {  
	    var pos = filename.lastIndexOf(".");  
	    var str = filename.substring(pos, filename.length)  
	    var str1 = str.toLowerCase();  
	    if (!/\.(gif|jpg|jpeg|png|bmp)$/.test(str1)) {  
	        return false;  
	    }  
	    return true;  
	} 
	if($('form#user_setting').length >0){
		$('form#user_setting')[0].onsubmit = function(){
			var avatar = $('input.avatar');
			var sex = $('input[name="sex"]');
			if(avatar.val() !== '' &&  !checkImgType(avatar.val())){
				alert("格式不正确,只能上传格式为gif|jpeg|jpg|png|bmp！");  
	            return false;  
			}
			if(!sex[0].checked && !sex[1].checked){
				alert('请选择性别!')
				return false;
			}
		}
	}
	if($('form#changePwd').length >0){
		$('form#changePwd')[0].onsubmit = function(){
			var oldpwd = $('#oldPassword');
			var newpwd = $('#newPassword');
			var repwd = $('#reNewPassword');
			if(oldpwd.val() === '' || newpwd.val() === ''){
				alert('信息输入不完整!');
				return false;
			}
			if(newpwd.val() !== repwd.val()){
				alert('两次输入密码不一致!');
				return false;
			}
		}
	}
	var order = $('.order');
	if(order.length > 0){
		order.click(function(e){
			var target = $(this);
			var id = target[0].id
			var u_id = target.data('u_id');
			var category = target.data('cat');
			var children = target.children();
			$.ajax({
				url:"/u/order",
				method:"post",
				data:{uId:u_id,category:category,id:id},
				dataType:'JSON',
				success:function(result){
					if(id === "order-add"){ // 订阅->退订
						target.removeClass('btn-success').addClass('btn-warning')[0].id = "order-minus";
						children.eq(0).removeClass('glyphicon-plus').addClass('glyphicon-minus');
						children.eq(1).text("退订");
					}else if(id === "order-minus"){ // 退订->订阅
						target.removeClass('btn-warning').addClass('btn-success')[0].id = "order-add";
						children.eq(0).removeClass('glyphicon-minus').addClass('glyphicon-plus');
						children.eq(1).text("订阅");
					}
					alert(result.msg);
				},
				error:function(result){
					alert("操作失败！");
				}
			});
		})
	}
	var vip = $('.vip');
	if(vip.length > 0){
		vip.click(function(){
			var target = $(this);
			var id = target[0].id
			var u_id = target.data('u_id'); "添加权限申请和取消"
			$.ajax({
				url:'/user/vip',
				method:'post',
				data:{uId:u_id,id:id},
				dataType:'JSON',
				success:function(result){
					if(id === 'getVIP'){
						target.removeClass('btn-success').addClass('btn-warning').text('取消VIP权限')[0].id = "cancelVIP";
						var html = [
							'<li>',
								'<a href="/user/order?uId='+u_id+'">我的订阅</a>',
							'</li>'	
						].join('');
						$nav.append($(html));
						$('#tab3').removeClass('hide')
						$('ul.nav-tabs').children().eq(2).show();
					}else if(id === 'cancelVIP'){
						target.removeClass('btn-warning').addClass('btn-success').text('申请VIP权限')[0].id = "getVIP";
						$nav.children().eq(2).remove();
						$('#tab3').addClass('hide')
						$('ul.nav-tabs').children().eq(2).hide();
					}
					alert(result.msg);
				},
				error:function(result){
					alert("操作失败！");
				}
			});
		});
	}
	var changeRole = $('.changeRole');
	if(changeRole.length > 0){
		changeRole.click(function(){
			var target = $(this);
			var u_id = target.data('uid');
			var role = target.data('role');
			$.ajax({
				url:'/admin/changerole',
				method:'post',
				data:{uId:u_id,role:role},
				dataType:'JSON',
				success:function(result){
					alert(result.msg);
					window.location.reload();
				},
				error:function(){
					alert('操作失败!')
				}
			});
		})
	}
	var freeze = $('.freeze');
	freeze.click(function(){
		var target = $(this);
		var isFreeze = target[0].id;
		var u_id = target.data('id');
		$.ajax({
			url:'/admin/freeze',
			method:'post',
			data:{uId:u_id,isFreeze:isFreeze},
			dataType:'JSON',
			success:function(result){
				alert(result.msg);
				window.location.reload();
			},
			error:function(){
				alert('操作失败!')
			}
		});
	})
});