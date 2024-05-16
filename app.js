var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var plantsRouter = require('./routes/plantRoutes');
var plantsRouter = require('./routes/plants');
const bodyParser = require('body-parser');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false,
  parameterLimit: 100000,
  limit: '50mb'
}
));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));
app.use('/public/images/uploads', express.static(path.join(__dirname, '/public/images/uploads')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/plants', plantsRouter);
app.use('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(__dirname + '/sw.js');
});
app.use('/chat.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(__dirname + '/chat.js');
});


app.use(bodyParser.json({ limit: '10mb' }));  // Increase JSON body limit
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));  // Increase URL-encoded body limit

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
