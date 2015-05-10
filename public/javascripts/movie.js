(function() {
	var form = $('#new_movie_form')[0];
	if(form){
		form.onsubmit = function checkForm() {
			if (form.inputTitle.value === "") {
				alert("电影的名字不能为空！");
				return false;
			}
			if (form.inputDirector.value === "") {
				alert('导演不能为空！');
				return false;
			}
			if (form.inputCountry.value === '') {
				alert('国家不能为空！');
				return false;
			}
			if (form.inputPoster.value === "") {
				alert('海报不能为空!');
				return false;
			}
			if (form.inputFlash.value === "") {
				alert('片源地址不能为空!');
				return false;
			}
			if (!/^http:\/\//.test(form.inputFlash.value)) {
				alert('片源地址输入有误!');
				return false;
			}
			if (!/^\d{4}$/.test(form.inputYear.value)) {
				alert('上映年份有误!');
				return false;
			}
			if (form.inputSummary.value.length < 10) {
				alert('电影简介不能少于10字！');
				return false;
			}
			return true;
		}
	}
	// 从豆瓣中获取数据
	$('#getDouban').click(function(){
	    var $btn = $(this).button('loading')
	    // business logic...
		var douban = $('#douban');
		var id = douban.val();
		if(id){
			$.ajax({
				url:'https://api.douban.com/v2/movie/subject/'+id,
				cache:true,
				type:'get',
				dataType:'jsonp',
				crossDomain:true,
				jsonp:'callback',
				success:function(data){
	    			$btn.button('reset')
					if(form){
						form.reset();
					}
					$('#inputTitle').val(data.title);
					$('#inputDirector').val(data.directors[0].name);
					var actors = [];
					for(var n=0;n<data.casts.length;n++){
						actors.push(data.casts[n].name);
					}
					$('#inputActors').val(actors.join(','));
					$('#inputCountry').val(data.countries[0]);
					var options = $('#selectCategory > option');
					for(var i=0;i<data.genres.length;i++){
						for(var j=0;j<options.length;j++){
							if(data.genres[i] === options.eq(j).val()){
								options[j].selected = 'selected';
							} 
						}
					}
					if(data.countries[0] === '美国' 
						|| data.countries[0] === '英国' 
						|| data.countries[0] === '澳大利亚'
						|| data.countries[0] === '加拿大'){
						$('#inputLanguage').val('英语');
					}else if(data.countries[0] === '法国' ){
						$('#inputLanguage').val('法语');
					}else if(data.countries[0] === '俄罗斯' ){
						$('#inputLanguage').val('俄语');
					}else if(data.countries[0] === '日本' ){
						$('#inputLanguage').val('日语');
					}else if(data.countries[0] === '德国' ){
						$('#inputLanguage').val('德语');
					}else if(data.countries[0].indexOf('香港') !== -1){
						$('#inputLanguage').val('粤语');
					}else{
						$('#inputLanguage').val('普通话');
					}
					$('#inputPoster').val(data.images.large);
					$('#inputYear').val(data.year);
					$('#inputSummary').val(data.summary);
				}
			});
		}else{
			alert('豆瓣电影ID不能为空')
		}
	});
	
	var commentForm = $('#commentForm');
	var commentContent = $('.commentContent');
	commentForm.find('button.btn-comment').click(function(){
		$.ajax({
			url:'/comment/new',
			method:'POST',
			data:commentForm.serialize(),
			dataType:'json',
			success:function(data){ // 添加成功
				if(data.comment){
					addComment(data.comment);
				}else if(data.reply){
					addReply(data.reply,data.cid);
					cancelReply();
				}
				// 清空表单
				commentContent.val('');
			},
			error:function(data){ //添加失败
				alert('操作失败！请重试！');
			}
		});
	});
	var list = $('ul.media-list');
	var addComment = function(comment){
		var html = [
			'<li class="media">',
			'<div class="pull-left">',
				'<a href="#comments" data-cid="'+comment._id+'" data-username='+comment.from.username+' data-tid="'+comment.from._id+'" class="comment" onClick="reply(this)">',
					'<img src="'+comment.from.avatar+'" style="width:55px;height:55px" alt="'+comment.from.username+'">',
				'</a>',
			'</div>',
			'<div class="media-body">',
	        	'<h4 class="media-heading">'+comment.from.username+'</h4>',
	        	'<p>'+comment.content+'</p>',
	        '</div>',
	        '<hr>',
	        '</li>'
		].join('');
		list.append(html);
	}
	var addReply = function(reply,cid){
		var html = [
			'<div class="media">',
				'<div class="pull-left">',
					'<a class="comment" data-cid="'+cid+'" data-tid="'+reply.from._id+'" data-username="'+reply.from.username+'"  onClick="reply(this)">',
						'<img src="'+reply.from.avatar+'" style="width:50px;height:50px" alt="'+reply.from.username+'">',
					'</a>',
				'</div>',
				'<div class="media-body">',
					'<h4 class="media-heading">',
						reply.from.username,
						'<span class="text-info">',
							'&nbsp;回复&nbsp;',
						'</span>',
						reply.to.username+':',
					'</h4>',
					'<p>'+reply.content+'</p>',
				'</div>',
			'</div>'
		].join('');
		var target = TARGET.parents('li.media').find('div.media-body').eq(0);
		target.append(html);
	}
	var cancelReply = function(){
		commentContent[0].placeholder = '评论一下吧';
		$('#commentForm').find('button.btn-comment').text('评论');
		$('#toId').remove();
		$('#commentId').remove();
		$('#cancelReply').hide();
	}
	$('#cancelReply').click(cancelReply);

})();
var TARGET;
function reply(self){
	var target = $(self);
	TARGET = target;
	var toId = target.data('tid');
	var commentId = target.data('cid');
	var commentContent = $('.commentContent');
	commentContent[0].placeholder = '回复'+target.data('username');
	commentContent[0].focus();
	$('#commentForm').find('button.btn-comment').text('回复'+target.data('username'));
	$('#cancelReply').show();
	if($('#toId').length>0){
		$('#toId').val(toId);
	}else{
		$('<input>').attr({
			type:'hidden',
			id:'toId',
			name:'tid',
			value:toId
		}).appendTo('#commentForm')
	}
	
	if($('#commentId').length > 0){
		$('#commentId').val(commentId);
	}else{
		$('<input>').attr({
			type:'hidden',
			id:'commentId',
			name:'cid',
			value:commentId
		}).appendTo('#commentForm')
	}
} 
var changeScore = function(self){
	var value = parseInt(self.value);
	var score = $('#score span.score').text(value); // 改变得分展示
	var stars = $('#score .star > span');
	stars.css('backgroundImage','url(/images/star-empty.png)');
	var m = parseInt(value/2,10);
	for(var i=0;i<m;i++){
		stars.eq(i).css('backgroundImage','url(/images/star-full.png)');
	}
	if(m !== value/2){
		stars.eq(m).css('backgroundImage','url(/images/star-half.png)');
	}
}
var doScore = function(self){
	var form = $('#scoreForm');
	var data = form.serialize();
	$.ajax({
		url:'/movie/score',
		method:'POST',
		data:data,
		dataType:'json',
		success:function(result){
			var h4 = $('#score h4').text('电影评分(当前得分:'+result.score+'分)');
			alert(result.msg);
		}
	});
}

