//引入程序包
var express = require('express')
, path = require('path')
, app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);

//设置日志级别
io.set('log level', 1); 

//连接清单
var sockets = {};
//var adminid = null;

var getSocket = function( query ){
	console.log( query );
	
	for( var k in sockets ){
		var find = true;
		for( var q in query ){
			if( sockets[k].hasOwnProperty(q) != true || sockets[k][q] != query[q] ){
				find = false;
				break;
			}
		}
		if( find ) return k;
	}
	
}

//WebSocket连接监听
io.on('connection', function (socket) {

	//通知客户端已连接
	socket.emit( 'open', socket.id );

	// 打印握手信息
	//console.log(socket.handshake);

	//console.log( socket.id );

	//console.log( socket.rooms );

	//初始化，分配 UID
	//socket.emit( 'init', { 'id' : socket.id } );

	//加入清单
	sockets[ socket.id ] = { socket : socket };

	// 构造客户端对象
	/*
	var client = {
	socket:socket,
	name:false,
	color:getColor()
	}
	*/
	
	// 初始化连接信息，接收来自客户端的回传
	socket.on('init', function( data ){
		//console.log( socket.id );
		//console.log( sockets );
		//sockets[ socket.id ].concat( data );
		for( var k in data ){
			sockets[ socket.id ][k] = data[k];
		}
		console.log( sockets );
	});

	// 监听来自商家的 replymsg 事件
	socket.on('replymsg', function( data ){

		//console.log( 'uid', data.uid, 'msg', data.msg, 'type', data.type );
		
		var id = getSocket( { 'userId' : data.uid, 'identity' : 'client' } );
		
		console.log( id );
		
		//加入时间
		data['time'] = new Date().getTime();

		//回复消息
		//if( data.type == 'call' ){
			//data['adminid'] = socket.id;
			io.sockets.connected[ id ].emit( 'reply', data );
		//}
		
	});

	// 监听来自用户的 sendmsg 事件
	socket.on('sendmsg', function( data ){

		//console.log( 'uid', data.uid, 'msg', data.msg, 'type', data.type );
		
		var id = getSocket( { 'siteId' : data.sid, 'identity' : 'service' } );
		
		console.log( id );
		
		//加入时间
		data['time'] = new Date().getTime();

		io.sockets.connected[ id ].emit( 'send', data );

	//var obj = {time:getTime(),color:client.color};

	//socket.broadcast.emit('message',obj);

	// 判断是不是第一次连接，以第一条消息作为用户名
	/*
	if(!client.name){
		client.name = msg;
		obj['text']=client.name;
		obj['author']='System';
		obj['type']='welcome';
		console.log(client.name + ' login');

		//返回欢迎语
		socket.emit('system',obj);
		//广播新用户已登陆
		socket.broadcast.emit('system',obj);
	 }else{

		//如果不是第一次的连接，正常的聊天消息
		obj['text']=msg;
		obj['author']=client.name;      
		obj['type']='message';
		console.log(client.name + ' say: ' + msg);

		// 返回消息（可以省略）
		socket.emit('message',obj);
		// 广播向其他用户发消息
		socket.broadcast.emit('message',obj);
	  }
	  */
	});

	//监听出退事件
	socket.on('disconnect', function () {
	
		//从清单移除
		delete sockets[ socket.id ];
	
		/*
	  var obj = {
		time:getTime(),
		color:client.color,
		author:'System',
		text:client.name,
		type:'disconnect'
	  };

	  // 广播用户已退出
	  socket.broadcast.emit('system',obj);
	  console.log(client.name + 'Disconnect');
	  */
	});

});

//express基本配置
//app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	//app.use(express.favicon());
	//app.use(express.logger('dev'));
	//app.use(express.bodyParser());
	//app.use(express.methodOverride());
	//app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	
	// Add headers
	app.use(function (req, res, next) {

		// Website you wish to allow to connect
		res.setHeader('Access-Control-Allow-Origin', '*');

		// Request methods you wish to allow
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

		// Request headers you wish to allow
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

		// Set to true if you need the website to include cookies in the requests sent
		// to the API (e.g. in case you use sessions)
		res.setHeader('Access-Control-Allow-Credentials', true);

		// Pass to next layer of middleware
		next();
	});
	
//});

//app.configure('development', function(){
//	app.use(express.errorHandler());
//});

// 指定webscoket的客户端的html文件
app.get('/client', function(req, res){
	res.sendfile('public/client.html');
});

// 指定webscoket的客户端的html文件
app.get('/service', function(req, res){
	res.sendfile('public/service.html');
});

Array.prototype.contains = function(k, callback) {
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }

        if (self[i] === k) {
            return callback(true);
        }

        return process.nextTick(check.bind(null, i+1));
    }(0));
}

// 处理文件上传
var fs = require('fs'),util = require('util');
	
app.post('/upload', function(req, res) {

	//console.log( req );
	
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	//文件信息
	var attach = req.files.attach;

	// 获得文件的临时路径
	var tmp_path = attach.path;
	
	//扩展名
	var extra = attach.name.split(/[. ]+/).pop();
	
	//跨域使用
	res.setHeader('Content-type: text/html; charset=UTF-8');
	var response = '<script> document.domain = document.domain.substr( document.domain.indexOf(\'.\') + 1 ); </script>';
	
	['jpg', 'png', 'gif', 'bmp'].contains( extra, function(found) {
	
		if (found) {
			//console.log("Found");
			
			// 指定文件上传后的目录 - 示例为"images"目录。 
			var target_path = './public/upload/' + attach.name;
			
			var readStream = fs.createReadStream( tmp_path )
			var writeStream = fs.createWriteStream( target_path );
			
			// 移动文件
			util.pump(readStream, writeStream, function() {
			
				// 删除临时文件夹文件,
				fs.unlink( tmp_path );
			
				//fs.unlinkSync(files.upload.path);
				response += '<script> parent.Basic.callimg({ "return" : 0, "type" : "image", "image" : "' + target_path.replace('./public/','/') + '", "size" : "' + attach.size + '"}); </script>';
				res.send(response);				
				
			});
			
		} else {
			response += '<script> parent.Basic.callimg{ "return" : 1, "extra" : '+ extra +', "result" : "' + attach.name + '"}); </script>';
			res.send(response);
		}
		
	});	
	
});

server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
