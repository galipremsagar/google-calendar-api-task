'use strict';
var express            = require('express');
var compress           = require('compression');
var bodyParser         = require('body-parser');
var methodOverride     = require('method-override');
var serveStatic        = require('serve-static');
var logger             = require('morgan');
var errorHandler       = require('errorhandler');
var responseTime       = require('response-time');
var session            = require('express-session');
var cookieParser       = require('cookie-parser');
var path               = require('path');
var passport           = require('passport');
var cors               = require('./server/cors');
var globalErrorHandler = require('./server/error');
var routers            = require('./server/routers');
var app  = express();
var port = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if(process.env.NODE_ENV === 'development') {
    console.log('!! DEVELOPMENT MODE !!');
} else if(process.env.NODE_ENV === 'production') {
    console.log('!! PRODUCTION MODE !!');
}
app.use(logger('dev'));
app.use(errorHandler({ dumpExceptions: true, showStack: true }));
app.use(responseTime());
app.use(cookieParser());
app.use(session({secret: 'mysecret', key:'sid', cookie: { maxAge: 6000000000000000000 }}));
// app.use(cors());                                         //CORS implementation
app.use(compress());                                     //Compress response data with gzip / deflate. This middleware should be placed "high" within the stack to ensure all responses may be compressed.
app.use(bodyParser());                                   //Request body parsing middleware supporting JSON, urlencoded, and multipart requests. This middleware is simply a wrapper for the json(), urlencoded(), and multipart() middleware.
app.use(methodOverride());                               //Faux HTTP method support. Use if you want to simulate DELETE/PUT
app.use(serveStatic(path.join(__dirname, 'client')));    //serve up static files (html, js, css, etc.)
app.use(passport.initialize());                          //initializes passport                                    //application routes
app.use(globalErrorHandler);                             //handles all unresolved errors from the next() method

app.use('/auth', routers.auth);
app.use('/google', routers.google);
app.use('/',routers.auth);

app.listen(port, function() {
  console.log('Listening on ' + port);
});