var express = require('express');
var router = express.Router(),
	Category = require('../models/category'),
    Movie = require('../models/movie'),
	User = require('../models/user');


// index page
router.get('/', function(req, res) {
	Category.findAll(function(err,categories){
        res.render('index',{
            title:'Welcome to Movist!',
            categories:categories
        });
	})
});
// 根据GET请求分页显示不同类型的电影
router.get('/results',function(req,res){
    var catName = req.query.cat;
    var q = req.query.q;
    var count = 10;
    var page = req.query.p || 1;
    var index = (page-1) * count;
    // 显示某一类型的电影
    if(catName){
        Category.findByName(catName,function(err,category){
            var len = category.movies.length;
            var result = category.movies.splice(index,count);
            res.render('results',{
                title:'分类显示电影列表',
                keyword:category.name,
                query:'cat='+category.name,
                currentPage:page,
                totalPage:Math.ceil(len/count),
                movies:result
            })
        })
    }else if(q && q != ''){ // 显示用户搜索结果
        if(req.query.u_list){
            User.search(q,function(err,users){
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
        }else{
            Movie.search(q,function(err,movies){
                if(err){
                    return console.error(err);
                }
                var len = movies.length;
                var result = movies.splice(index,count);
                if(req.query.m_list){ //list列表显示
                    res.render('movielist',{
                        search:true,
                        title:'电影搜索结果',
                        keyword:q,
                        query:'q='+q,
                        currentPage:page,
                        totalPage:Math.ceil(len/count),
                        movies:result
                    })
                }else{ // 非列表显示
                    res.render('results',{
                        search:true,
                        title:'电影搜索结果',
                        keyword:q,
                        query:'q='+q,
                        currentPage:page,
                        totalPage:Math.ceil(len/count),
                        movies:result
                    })
                }
            })  

        }
    }else{ //请求不符合条件
        var temp = '';
        for(var i in req.query){
            temp  = temp + i +',';
        }
        temp = temp.substr(0,temp.length-1);
        var err = new Error('Cannot recognize this query "'+temp+'"');
        err.status = 404;
        res.render('error',{
            error:err
        })
    }

})
module.exports = router;