$(function(){
	//导航栏切换
	var url = window.location.pathname;
	var $nav = $('ul.navbar-nav').eq(0);
	if(url === '/'){
		$nav.children().eq(0).addClass('active');
	}else if(url === '/movie/new'){
		$nav.children().eq(1).addClass('active');
	}else if(url === '/admin/movielist'){
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
						window.location = window.location.origin+data.pathname;
					}else{
						$alert.text('用户已经存在').show();
					}
				}
			});
		}
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
					}else{
						$alert.text('用户名或密码错误').show();
					}
				}
			});
		}

	})
});