//引入程序包
var io = require('socket.io').listen(3000);

//设置日志级别
io.set('log level', 1); 

//连接清单
var sockets = {};

//查询连接
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

//////////////

//WebSocket连接监听
io.on('connection', function (socket) {

	//通知客户端已连接
	socket.emit( 'open', socket.id );

	//加入清单
	sockets[ socket.id ] = { socket : socket };
	
	//////////////
	
	// 初始化连接信息，接收来自客户端的回传
	socket.on('init', function( data ){
		for( var k in data ){
			sockets[ socket.id ][k] = data[k];
		}
		console.log( sockets );
	});
	
	//////////////

	// 监听来自商家的 replymsg 事件
	socket.on('replymsg', function( data ){
		
		var id = getSocket( { 'userid' : data.userid, 'identity' : 'client' } );
		
		//加入时间
		data['time'] = new Date().getTime();
		
		console.log( 'replymsg', data );

		//回复消息
		io.sockets.socket( id ).emit( 'reply', data );
		
	});
	
	//////////////

	// 监听来自用户的 sendmsg 事件
	socket.on('sendmsg', function( data ){
		
		var id = getSocket( { 'siteid' : data.siteid, 'identity' : 'service' } );
		
		//加入时间
		data['time'] = new Date().getTime();
		
		console.log( 'sendmsg', data );

		io.sockets.socket( id ).emit( 'send', data );

	});
	
	//////////////

	//监听出退事件
	socket.on('disconnect', function () {
	
		//从清单移除
		delete sockets[ socket.id ];
	
	});

});
