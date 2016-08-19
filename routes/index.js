var express = require('express');
var router  = express.Router();
var crypto  = require('crypto');
var User    = require('../models/user.js');
var Post    = require('../models/post.js');

/* GET home page. */

// module.exports = router;
module.exports = function (app) {
	// 首页
	app.get('/', function (req, res) {
		// 读取文章
		Post.get(null, function (err, posts) {
			if (err) {
				posts = [];
			}

			res.render('index', {
				title: '首页',
				user : req.session.user,
				posts: posts,
				success: req.flash('success').toString(),
				error:req.flash('error').toString()
			});
		});
	});

	// 用户注册页面
	app.get('/reg', checkNotLogin);
	app.get('/reg', function (req, res) {
		res.render('register', {
			title: '注册页',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	// 用户注册数据处理
	app.get('/reg', checkNotLogin);
	app.post('/reg', function (req, res) {
		var name       = req.body.name;
		var password   = req.body.password;
		var password_re= req.body['password-confirm'];

		if (password_re != password) {
			req.flash('error', '两次输入密码不一致');
			return res.redirect('/reg');
		}

		// 对用户输入的密码进行MD5加密
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		var newUser  = new User({
			name:name,
			password:password,
			email:req.body.email
		});

		// 检查用户名是否已注册,保证用户名的唯一性
		User.get(newUser.name, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			if (user) {
				req.flash('error', '用户已存在');
				return res.redirect('/reg');
			}

			// save user info
			newUser.save(function (err, user) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}

				req.session.user = newUser;
				req.flash('success', '注册成功');
				res.redirect('/');
			});
		});
	});

	// 用户登陆页面
	app.get('/login', checkNotLogin);
	app.get('/login', function (req, res) {
		res.render('login', {
			title: '登陆',
			user : req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});

	// 用户登陆输入信息判断
	app.get('/login', checkNotLogin);
	app.post('/login', function (req, res) {
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('hex');
		
		User.get(req.body.name, function (err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			if (!user) {
				req.flash('error', '用户不存在');
				return res.redirect('/login');
			}

			if (user.password != password) {
				req.flash('error', '密码错误');
				return res.redirect('/login');
			}

			req.session.user = user;
			req.flash('success', '登陆成功');
			res.redirect('/');
		});
	});

	// 发表文章页面
	app.get('/post', checkLogin);
	app.get('/post', function (req, res) {
		res.render('post', {
			title: '发表' ,
			user : req.session.user,
			success: req.flash('success').toString(),
			error :  req.flash('error').toString()
		});
	});

	// 文章发表数据处理
	app.post('/post', checkLogin);
	app.post('/post', function (req, res) {
		var currentUser = req.session.user;
		var newPost = new Post(currentUser.name, req.body.title, req.body.post);
		newPost.save(function (err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}

			req.flash('success', '发表成功');
			res.redirect('/');
		});
	});

	// 用户退出处理
	app.get('/logout', checkLogin);
	app.get('/logout', function (req, res) {
		req.session.user = null;
		req.flash('success', '退出成功');
		res.redirect('/');
	});

	/**
	 * 检测用户是否已经登陆
	 * @param req
	 * @param res
	 * @param next
     */
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录');
			res.redirect('/login');
		}
		next();
	}

	/**
	 * 检测用户是否还未登陆
	 * @param req
	 * @param res
	 * @param next
     */
	function checkNotLogin (req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登陆');
			res.redirect('back')
		}
		next();
	}
}
