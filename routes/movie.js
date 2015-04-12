var express = require('express');
var router = express.Router();

// movie detail
router.get('/m/:id',function(req,res){
	res.render('detail',{
		title:"电影详情页-机械战警",
		// flash:http://player.youku.com/player.php/sid/XNjA1Njc0NTUy/v.swf
		movie:{
			title:'机械战警',
			doctor:'何塞·帕迪里亚',
			country:'美国',
			actors:['乔尔·金纳曼','加里·奥德曼','迈克尔·基顿','艾比·考尼什'],
			language:'英语',
			category:'动作/科幻/惊悚/犯罪',
			poster:'http://a.hiphotos.baidu.com/baike/c0%3Dbaike80%2C5%2C5%2C80%2C26/sign=83f58e674d4a20a425133495f13bf347/dc54564e9258d109733d7fc7d358ccbf6d814ded.jpg',
			flash:'http://player.youku.com/player.php/sid/XNjA1Njc0NTUy/v.swf',			
			year:'2014',
			summary:'2028年，专事军火开发的机器人公司Omni Corp生产了大量装备精良的机械战警，他们被投入到维和和惩治犯罪等行动中，取得显著的效果。罪犯横行的底特律市，嫉恶如仇、正义感十足的警察亚历克斯·墨菲（乔尔·金纳曼饰）遭到仇家暗算，身体受到毁灭性破坏。借助于Omni公司天才博士丹尼特·诺顿（加里·奥德曼饰）最前沿的技术，墨菲以机械战警的形态复活。数轮严格的测试表明，墨菲足以承担起维护社会治安的重任，他的口碑在民众中直线飙升，而墨菲的妻子克拉拉（艾比·考尼什饰）和儿子大卫却再难从他身上感觉亲人的温暖。感知到妻儿的痛苦，墨菲决心向策划杀害自己的犯罪头子展开反击。'
		}
	})
});

// add movie

router.get('/movie/new',function(req,res){
	res.render('edit_movie',{
		title:"添加新电影",
		movie:{
			_id:"",
			title:"",
			doctor:"",
			actors:[],
			country:"",
			language:"",
			category:"",
			poster:"",
			flash:"",
			year:"",
			summary:"",
		},
		hot_movies:[
			{
				title:'战狼',
				doctor:'吴京',
				actors:['吴京','余男'],
				grade:8.4,
				category:'动作'
			},
			{
				title:'霍比特人',
				doctor:'彼得杰克逊',
				actors:['男一号','女一号'],
				grade:9.0,
				category:'魔幻，动作'
			},
			{
				title:'后会无期',
				doctor:'韩寒',
				actors:['忘了','不知道'],
				grade:8.5,
				category:'剧情，喜剧'
			},
			{
				title:'无人区',
				doctor:'宁浩',
				actors:['光头男','黄渤'],
				grade:9.1,
				category:'西部，犯罪'
			},
			{
				title:'失恋三十三天',
				doctor:'不知道',
				actors:['白百合','文章'],
				grade:7.422,
				category:'剧情，爱情'
			}
		]
	})
});

// update movie
router.get('/movie/update',function(req,res){
	res.render('edit_movie',{
		title:"update movie"
	})
});
// 提交表单
router.post('/post/new_movie',function(req,res){
	console.log(req.body);
});
module.exports = router;













