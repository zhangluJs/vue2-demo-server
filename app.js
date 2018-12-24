/**
 * @file vue2-demo的node服务层入口
 * @author zhanglu
 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var goods = require('./routes/goods');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use(function (req, res, next) {
    if (req.cookies.userId) {
        next();
    }
    else {
        if (req.originalUrl === '/users/logout' || req.originalUrl === '/users/login' || req.path === '/goods/list') {
            next();
        }
        else {
            res.json({
                status: '10001',
                msg: '当前未登录',
                result: '你好，我是 弓长王足各，你能看到这里，就代表着，这个项目快要上线了，敬请期待！'
            });
        }
    }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/goods', goods);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
