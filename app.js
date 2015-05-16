var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongodb = require('mongodb'),
    MongoStore = require('connect-mongo')(session),
    setting = require('./setting');

// 路由配置
var index = require('./routes/index');
var user  = require('./routes/user');
var movie = require('./routes/movie');
var comment = require('./routes/comment');

var routes = [index,user,movie,comment];

var port = process.env.PORT || 3000;
var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('views','./views/pages');
app.set('view engine','jade');
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')))
app.locals.pretty = true //后台代码格式化输出
//配置session
app.use(session({
    secret:setting.cookieSecret,
    store:new MongoStore({
        db:setting.db
    }),
    resave:false,
    saveUninitialized:false
}));



var MongoClient = mongodb.MongoClient;
var url = 'mongodb://localhost:27017/movist';

MongoClient.connect(url, function(err, db){
    if(err) return console.error(err);
    console.log('connect mongodb success');
    app.database = db;
    app.listen(port);
    console.log('Server listen on '+port);
    // require("child_process").exec('open "http://localhost:3000"');
});
//用户写入模板,并记录当前url
app.use(function(req,res,next){
    var user = req.session.user;
    // 记录用户最近5次的浏览记录
    if(req.session.preUrl){
        req.session.preUrl.unshift(req.url);
        if(req.session.preUrl.length > 5){
            req.session.preUrl.pop();
        }
    }else{ 
        req.session.preUrl = [req.url];
    }
    if(user){
        res.locals.user = user;
    }
    next();
})
exports.app = app;
app.use(routes);

/*

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    console.log(404)
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         console.log(500)
//         res.status(err.status || 500);
//         res.render('404', {});
//     });
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.log(501)
    res.status(err.status || 500);
    res.render('404', {});
});

*/



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



