
/*
http://localhost:3000/client?sid=99&uid=88
http://localhost:3000/service?sid=99&uid=88
*/
 
var App = {
	
	//变量定义
	vars : {
	
		//用户ID（数字）
		userId : null,
		
		//商家ID（数字）
		siteId : null,
		
		//Socket ID
		sockId : null,
		
		//身份（client 普能用户，service 商家）
		identity : 'client',
		
		//最近一条消息
		lasttime : null
	
	},
	
	objs : {
		content : $('#content'),
		status : $('#status'),
		input : $('#input')
	},

	$ : function( e ){
		return document.getElementById( e );
	},
	
	init : function(){
	
		//当前网站ID
		this.vars.siteId = Basic.getParam('sid');
		
		//当前网站ID
		this.vars.userId = Basic.getParam('uid');
		
		////////////////
		
		//建立websocket连接
		socket = io.connect( Basic.vars.socket );
		
		//收到连接确认
		socket.on('open',function( sid ){
		
			//App.objs.status.remove();
			
			//
			$("#content .nobody").remove();
			
			//打印日志
			console && console.log( 'SID: ' + sid + ' 身份：'+App.vars.identity );
		
			//App.showMsg( '<div class="dialog"><span>UID</span> : '+ sid +'</div>' );
			
			//回传给服务
			socket.emit( 'init', { siteId : App.vars.siteId, userId : App.vars.userId, identity : App.vars.identity } );
			
			//记录 Socket ID
			App.vars.sockId = sid;
			
		});
		
		////////////////
		
		//监听来自商家的 reply 事件
		socket.on('reply',function( data ){
		
			//格式化消息
			text = Basic.formatMsg( data.type, data.msg );
			
			//最近消息时间
			App.vars.lasttime = data.time;
		
			var p = '<div class="dialog"><span>' + data.uid +'</span><p class="bubble">'+ text +'</p></div>';
			App.showMsg(p);
		});
		
	},
	
	showMsg : function( html ){
		App.objs.content.append( html );
		App.objs.content.find('div:last')[0].scrollIntoView();
	},
	
	//用户发送消息
	sendMsg : function( type, msg ){
		if( !msg ) return;
		
		//向服务端发送消息
		socket.emit( 'sendmsg', { 'sid' : App.vars.siteId, 'uid' : App.vars.userId, 'type' : type, 'msg' : msg } );
		
		//格式化消息
		text = Basic.formatMsg( type, msg );
		
		//显示消息
		App.showMsg( '<div class="dialog self"><span>' + App.vars.sockId +'</span><p class="bubble">' + text +'</p></div>' );
		
		return true;
	}

};

App.init();