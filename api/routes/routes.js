var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var flash = require('connect-flash');
require('dotenv').config();

var passport = require('../../auth/passport');
var pg = require('pg');
var config = {
	user: process.env.DB_USER,
	database: process.env.DB_NAME,
	password: '123',
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT)
};
var pool = new pg.Pool(config);

var router = express.Router();

function checkLoginForDashboardAndLogout(req, res, next) {
	if (req.user) {
		next();
	} else {
		res.redirect('/login');
	}
};

function checkLoginForLoginAndRegister(req, res, next) {
	if (req.user) {
		res.redirect('/');
	} else {
		next();
	}
};


router.get('/', checkLoginForDashboardAndLogout, function(req, res) {
	// successful authentication automatically stores user in req.user
	res.locals.user = req.user;
	pool.connect(function(err, client, done) {
		if (err) {
			throw err;
		}
		client.query('SELECT * FROM tasks WHERE user_id = $1', [req.user.id], function(err, result) {
			if (err) {
				throw err;
			}
			res.render('index', {
				tasks: result.rows
			});
		});
	});
});

router.get('/login', checkLoginForLoginAndRegister, function(req, res) {
	res.render('login');
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login',
 failureFlash: true}), 
	function(req, res) {
		res.redirect('/');
});

router.get('/register', checkLoginForLoginAndRegister, function(req, res) {
	res.render('register');
});

router.post('/register', function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(password, salt, function(err, hash) {
	        // Store hash in your password DB. 
	        password = hash;
	        pool.connect(function(err, client, done) {
	        	if (err) {
	        		return console.error('Error fetching client: ' + err);
	        	}
	        	client.query('INSERT INTO users (name, username, password) VALUES ($1, $2, $3)' ,
	        	[name, username, password], function(err, result) {
	        		if (err) {
	        			return console.error('Error storing user :' + err);
	        		}
	        		done();
	        		req.flash('success', 'Successfully registered!');
	        		res.redirect('/login');
	        	});
	        });
	    });
	});
});

router.get('/logout', checkLoginForDashboardAndLogout, function(req, res) {
	// passport provides req.logOut() which removes req.user and clears login session
	req.logout();
	res.redirect('/login');
});

router.post('/add', function(req, res) {
	var title = req.body.title;
	var description = req.body.description;
	pool.connect(function(err, client, done) {
		if (err) {
			throw err;
		}
		client.query('INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3)', 
			[title, description, req.user.id], function(err, result) {
				if (err) {
					throw err;
				}
				done();
				res.redirect('/');
			});
	});
});

router.post('/delete/:id', function(req, res) {
	var id = req.params.id;
	pool.connect(function(err, client, done) {
		if (err) {
			throw err;
		}
		client.query('DELETE FROM tasks WHERE id = $1', [id], function(err, result) {
			if (err) {
				throw err;
			}
			done();
			res.redirect('/');
		});
	});
});

router.post('/edit', function(req, res) {
	var id = req.body.id;
	var title = req.body.title;
	var description = req.body.description;
	pool.connect(function(err, client, done) {
		if (err) {
			throw err;
		}
		client.query('UPDATE tasks SET title = $1, description = $2 WHERE id = $3', [title, description, id],
			function(err, result) {
				if (err) {
					throw err;
				}
				done();
				res.redirect('/');
			});
	});
});


module.exports = router;
