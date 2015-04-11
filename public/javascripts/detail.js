(function() {
	var form = $('#new_movie_form')[0];
	form.onsubmit = function checkForm() {
		if (form.inputTitle.value === "") {
			alert("电影的名字不能为空！");
			return false;
		}
		if (form.inputDoctor.value === "") {
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
})();