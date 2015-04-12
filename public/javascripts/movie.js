(function() {
	var form = $('#new_movie_form')[0];
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
					$('#inputPoster').val(data.images.medium);
					$('#inputYear').val(data.year);
					$('#inputSummary').val(data.summary);
				}
			});
		}else{
			alert('豆瓣电影ID不能为空')
		}
	})
})();