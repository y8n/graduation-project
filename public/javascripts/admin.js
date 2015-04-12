(function(){
	// 删除电影
	$('.del').click(function(e){
		var target = $(e.target);
		var id = target.data('id');
		var tr = $('.item-id-'+id);
		if(tr.length>0){
			var title = tr.children().eq(0).text();
			var flag = window.confirm("确认删除电影:"+title+"?");
			if(flag){
				$.ajax({
					type:"post",
					url:'/admin/movielist?id='+id
				})
				.done(function(results){
					if(results.success){
						tr.remove();
						alert("删除成功");
					}else{
						alert("删除失败");
					}
				})
			}
		}
	});
})();