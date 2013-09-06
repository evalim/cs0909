var config = require('./config/config'),
	db = require('mongoose').createConnection(config.mongouri),
	Baseinfo = require('./models/baseinfo.js')(db),
	express = require('express'),
	fs = require('fs'),
	jade = require('jade');

// express 设置
var app = express();
	app.use('/', express.static(__dirname + '/public'));
	app.use(express.bodyParser());

// mongodb 事件响应
db.on('error', function(err){
	if(err) {
		console.log(">> 数据库错误: " + err);
	}
});
db.once('open', function(){
	console.log(">> 数据库已经连接");
});

// 渲染 jade 文件
function renderFile(path, option, locals, res) {
	fs.readFile(path, function(err, data){
		if(err) throw err;
		var fn = jade.compile(data, option);
		var html = fn(locals);
		res.send(html);
	});
}

// 生成登录静态模板
var loginPage;
fs.readFile('template/login.jade', function(err, data){
	if(err) throw err;
	loginPage = jade.compile(data, {});
});


//////// express 路由设置 ////////////

// 获取登录页面
app.get('/', function(req, res){
	res.send(loginPage({
		info: "请先登录", 
		name:'', 
		infoclass:"text-info"
	}));
});

// 处理登录的 post 请求
app.post('/', function(req, res){
	console.log(">> login: " + req.body.name);

	Baseinfo.find({
		username: req.body.name
	},function(err, docs) {
		if(docs.length < 1) {
			res.send(loginPage({
				name:req.body.name, 
				info: "用户名或密码错误",
				infoclass:"text-error"
			}));
		} else if(docs[0].authenticate(req.body.pswd)) {
			// 获取所有记录
			Baseinfo.find({},null,{sort:{lastmodify: -1}},function(err, allDocs){
				if(err) 
					res.send(loginPage({
						name:req.body.name,
						info: "服务器忙，请稍后重试",
						infoclass:"text-error"
					}));
				else {
					var data = [];
					for(var i = 0, len = allDocs.length; i < len; ++i) {
						data.push([
							allDocs[i].truename,
							allDocs[i].phone,
							allDocs[i].address,
							allDocs[i].message
						]);
					}
					renderFile('template/index.jade', {}, {
						name: docs[0].truename,
						phone: docs[0].phone,
						address: docs[0].address,
						session: docs[0].authtoken,
						title: ['姓名', '电话', '收信地址', '最近动态'],
						table: data
					}, res);
					docs[0].save();		// 保存新的 authtoken
				}
			});
		} else {
			res.send(loginPage({
				name:req.body.name,
				info: "用户名或密码错误",
				infoclass:"text-error"
			}));
		}
	});
});

// 处理个人信息修改提交请求
app.post('/update', function(req, res) {
	console.log('call update');

	Baseinfo.find({
		username: req.body.name,
		authtoken: req.body.session
	}, function(err, docs){
		if(err) res.send('更新失败');
		else if(docs.length < 1) res.send('更新失败，请重新登录。');
		else {
			docs[0].phone = req.body.phone;
			docs[0].address = req.body.address;
			docs[0].message = req.body.remark;
			docs[0].lastmodify = new Date();
			docs[0].save();
			res.send('success');
		}
	});
});

// 处理密码修改请求
app.post('/update-pswd', function(req, res) {
	// 密码格式检查
	if(!req.body.newpswd || req.body.newpswd.length < 6) {
		res.send('新密码格式不正确');
		return ;
	}

	Baseinfo.find({
		username: req.body.name,
		authtoken: req.body.session
	}, function(err, docs) {
		if(err) {
			res.send("修改失败");
		}else if(docs.length < 1) {
			res.send("没有修改权限");
		} else if(docs[0].authenticate(req.body.oldpswd)) {
			docs[0].password = req.body.newpswd;
			docs[0].save(function(err){
				if(err) res.send('修改失败');
				else res.send({
					info: 'success',
					session: docs[0].authtoken
				});
			});
		} else {
			res.send("原密码错误");
		}
	})
});

app.listen(config.port);
console.log(">> visit http://localhost" + (config.port == 80) ? "" : (":" + config.port));