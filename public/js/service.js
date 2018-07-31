
/*
http://localhost:3000/client?sid=99&uid=88
http://localhost:3000/service?sid=99&uid=88
*/
 
var App = {
	
	//变量定义
	vars : {
	
		//当前聊天对象
		userId : null,
		
		//商家ID（数字）
		siteId : null,
		
		//Socket ID
		sockId : null,
		
		//对话清单
		dialog : [],
		
		//身份（client 普能用户，service 商家）
		identity : 'service',
		
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
		//this.vars.userId = Basic.getParam('uid');
		
		////////////////
		
		//建立websocket连接
		//'http://localhost:3000'
		socket = io.connect( Basic.vars.socket );
		
		//收到连接确认
		socket.on('open',function( sid ){
			
			//打印日志
			console && console.log( 'SID: ' + sid + ' 身份：'+App.vars.identity );
		
			//App.showMsg( '<div class="dialog"><span>UID</span> : '+ sid +'</div>' );
			
			//回传给服务端
			socket.emit( 'init', { siteId : App.vars.siteId, identity : App.vars.identity } );
			
			//记录 Socket ID
			App.vars.sockId = sid;
			
		});
		
		////////////////
		
		//监听来自用户的 send 事件
		socket.on('send',function( data ){
			
			//最近消息时间
			App.vars.lasttime = data.time;
		
			App.displayMsg( data );
			
		});
		
	},	
	
	//切换消息面板
	switchMsg : function( uid ){
		
		if( App.vars.userId != uid ){
			$("#users li[data-uid="+ uid +"]").attr('class','active');
			$("#users li[data-uid!="+ uid +"]").attr('class','');
			
			$("#content ul[data-uid="+ uid +"]").attr('class','active');
			$("#content ul[data-uid!="+ uid +"]").attr('class','');
			
			//消息数清零
			App.countMsg( uid, 0 );
		}
		
		App.vars.userId = uid;
	
	},
	
	//创建对话窗口
	createMsg : function( uid, name ){
	
		//
		$("#content .nobody").remove();
	
		//加入用户清单
		if( !App.vars.dialog[uid] ){		
		
			App.vars.dialog[uid] = { uid : uid, name : 'U' + uid, msgs : 0 };
			
			//
			var html = '<ul data-uid="'+ uid +'" data-name="'+ name +'"></ul>';
			$("#content").append( html );
			
			//
			var html = '<li data-uid="'+ uid +'" data-name="'+ name +'"><strong>'+ name +'</strong><em>0</em></li>';
			$("#users").append( html );
			
			//
			$("#users").find('li:last').on('click',function(){
				App.switchMsg( $(this).attr('data-uid') );
			});
			
		}
	
	},
	
	//显示未读消息数量
	countMsg : function( uid, num ){
		
		//如果为当前用户则清零
		if( uid == App.vars.userId ){
			num = 0;
		}
	
		//清零消息
		if( num == 0 ){
			App.vars.dialog[uid].msgs = 0;			
		}else{
			App.vars.dialog[uid].msgs += num;
		}
		
		var obj = $("#users").find('li[data-uid='+ uid +'] em');
		
		if( num == 0 ){
			obj.html(0).hide();
		}else{
			obj.html( App.vars.dialog[uid].msgs ).show();
		}
	
	},
	
	
	//显示用户发的消息
	displayMsg : function( data ){
		
		//创建对话窗口
		App.createMsg( data.uid, 'U' + data.uid );
		
		//是否切换窗口
		if( !App.vars.userId ){
			App.switchMsg( data.uid );
		}
		
		//消息数+1
		App.countMsg( data.uid, 1 );
		
		//格式化消息
		text = Basic.formatMsg( data.type, data.msg );
		
		
		
		//显示消息
		App.showMsg( data.uid, '<li><span>' + data.uid +'</span><p class="bubble">'+ text +'</p></li>' );
	},
	
	//显示自己发的消息
	showMsg : function( uid, html ){
		//var uid = App.vars.userId;
		App.objs.content.find('ul[data-uid='+ uid +']').append( html );
		App.objs.content.find('ul[data-uid='+ uid +'] li:last')[0].scrollIntoView();
	},
	
	//商家回复消息
	sendMsg : function( type, msg ){		
		if( !type || !msg || !App.vars.userId ) return false;
		
		//向服务端发送消息
		socket.emit( 'replymsg', { 'sid' : App.vars.siteId, 'uid' : App.vars.userId, 'type' : type, 'msg' : msg } );
		
		//格式化消息
		text = Basic.formatMsg( type, msg );
		
		//显示消息
		App.showMsg( App.vars.userId, '<li class="self"><span>' + App.vars.sockId +'</span><p class="bubble">' + text +'</p></li>' );
		return true;
	}

};

App.init();

//////////////////
 
 /*
 $(function () {
    var content = $('#content');
    var status = $('#status');
    var input = $('#input');
    var myName = false;
	var type = getQueryStringRegExp('type');
	var adminid = null;
	
	//alert( type );
	
	function getQueryStringRegExp(name){
		var reg = new RegExp("(^|\\?|&)"+ name +"=([^&]*)(\\s|&|$)", "i");  
		if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " ")); return "";
	};

    //建立websocket连接
    socket = io.connect('http://localhost:3000');
	
    //收到server的连接确认
    socket.on('open',function(){
        status.text('Choose a name:');
    });

    //监听system事件，判断welcome或者disconnect，打印系统消息信息
	
    socket.on('system',function(json){
        var p = '';
        if (json.type === 'welcome'){
            if(myName==json.text) status.text(myName + ': ').css('color', json.color);
            p = '<p style="background:'+json.color+'">system  @ '+ json.time+ ' : Welcome ' + json.text +'</p>';
        }else if(json.type == 'disconnect'){
            p = '<p style="background:'+json.color+'">system  @ '+ json.time+ ' : Bye ' + json.text +'</p>';
        }
        content.prepend(p); 
    });
	
	//初始化
    socket.on('init',function( data ){
		uid = data.id;
        content.prepend( '<p><span>UID</span> : '+ uid +'</p>' );
    });

    //监听message事件，打印消息信息
    socket.on('message',function(json){
        var p = '<p><span style="color:'+json.color+';">' + json.author+'</span> @ '+ json.time+ ' : '+json.text+'</p>';
        content.prepend(p);
    });

    //监听message事件，打印消息信息
    socket.on('call',function(json){
        var p = '<p><span>' + json.uid +'</span> : '+ json.msg +'</p>';
        content.prepend(p);
    });

    
});

*/