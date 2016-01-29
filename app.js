var config = require("./config");
var global = require("./common/global");


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');



var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var csrf = require('csurf');

var routes = require('./routes/index');
var users = require('./routes/users');
var topic = require('./routes/topic');
var upload = require('./routes/upload');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/upload',express.static(path.join(__dirname, 'upload')));
global.appRoot = path.resolve(__dirname);

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: config.session.cookie.secret,
    name: config.session.cookie.name,
    cookie: {
        maxAge:config.session.cookie.maxAge
    },
    resave: false,
    saveUninitialized: true,
        store: new MongoStore({ url:config.session.database.address })
}));

var csrfProtection = csrf();
app.use(csrfProtection);

app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)

    // handle CSRF token errors here
    var name = 'submit';
    var notice = 'Invalid csrf token , please refresh';
    global.resJsonError(req,res,name,notice);
})


app.use(function(req,res,next){
    res.locals.session = req.session;
    res.locals.webName = config.web.name;
    next();
});


app.use('/', routes);
app.use('/users', users);
app.use('/topic', topic);
app.use('/upload', upload);

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


module.exports = app;
