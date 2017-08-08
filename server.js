var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var pg = require('pg');
var handleBars = require('express-handlebars');
var passport = require('passport-local');
var bcryptjs = require('bcryptjs');
var flash = require('connect-flash');
var session = require('express-session');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
var passport = require('./auth/passport');
require('dotenv').config();

var app = express();

// Middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handleBars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(session({
	secret: process.env.SECRET_KEY,
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 30 
	}
}));

app.use(flash());
// Setup global variables
app.use(function(req, res, next) {
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

app.use(passport.initialize());
app.use(passport.session());

var routes = require('./api/routes/routes');
app.use('/', routes);

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log('Running on port: ' + port);
});