/*
var getType = 1;
var TimeInterval;
$(document).ready(function () {

    form_smiley.rend({
        spearate: 14,
        count: 27,
        size: 24,
        extend: "png",
        page: "page_smiley",
        list: "list_smiley",
        nav: "nav_smiley",
        img: "http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/smiley/smiley",
        key: "smiley"
    });
    $("#face_area").hide();
    $.getScript("http://" + SocketIp + ":8889/socket.io/socket.io.js", function () {
        LoadSocket();
    });
    $(window).bind("scroll", function () {
        if ($(document).scrollTop() <= 0) {
            var oldheight = document.body.scrollHeight;
            var page = $("#pageNumber").val();
            onLoadMessage(page);
            $(document).scrollTop(document.body.scrollHeight - oldheight)
        }

    });
    scrollTop();
    //imgonload();
    SetAudioEventLister();
    //SocketMessage(1, 2);
    //GetPolling();
});



var scrollTop = function () {
    TscrollTop();
    setTimeout(TscrollTop, 100);
    setTimeout(TscrollTop, 1000);
}
*/

var form_smiley = (function () {
    var fe = function () {
        this.spearate = 14
    }

    fe.prototype = {
        rend: function (options) {
            var that = this;
            var res = '';
            for (var i = 1; i <= options.count; i++) {
                if (i == 1 || i % 14 == 1) {
                    res += '<div>';
                }

                var ii = (i).toString();
                if (i < 10) {
                    ii = "0" + (i).toString();
                }
                res += '<dd><span data-type=' + options.key + ' data-key="' + options.key + '0' + ii + '" style="background: url(' + options.img + '0' + ii + '.' + options.extend + ') no-repeat 0 0; background-size: auto ' + options.size + 'px;width:' + options.size + 'px;height:' + options.size + 'px"></span></dd>';
                if (i % 14 == 0 && i > 0) {
                    res += '</div>';
                }
            }
            if (options.count % 14 != 0) {
                res += "</div>";
            }
            $("#" + options.list).html(res);
            var nav_span = new Array(Math.ceil(options.count / that.spearate));
            $("#" + options.nav).html('<span class="on">' + nav_span.join("</span><span>") + '</span>');
            that.bind(options);

            window.swiper = new Swipe(document.getElementById(options.page), {
                speed: 500,
                callback: function () {
                    $("#" + options.nav + " span").removeClass("on").eq(this.index).addClass("on");
                }
            });
            return that;
        },
		
        bind: function (options) {
            $("#" + options.list).on("click", function (evt) {
                if ("SPAN" == evt.target.tagName) {
                    var type = evt.target.getAttribute("data-type");

                    var val = '[' + evt.target.getAttribute("data-key").split('_') + ']';
                    if (type == "smiley") {
                        $("#sendtext").val($("#sendtext").val() + val).trigger('change');
                        //$("#btnsend").removeClass("on");
                        this.focus();
                    }
                    else {
                        //$("#btnsend").addClass("on");
                        Basic.sendMessage( type, val );
                    }

                }
            });
        }
    }

    return new fe();
})();

window.preViewImg = (function () {
        var imgsSrc = {};
        function reviewImage(dsrc, gid) {
            if (typeof window.WeixinJSBridge != 'undefined') {
                WeixinJSBridge.invoke('imagePreview', {
                    'current': dsrc,
                    'urls': imgsSrc[gid]
                });
            } else {
                alert("请在微信中查看", null, function () { });
            }
        }
        function init(thi, evt) {
            var dsrc = thi.getAttribute("data-src");
            var gid = thi.getAttribute("data-gid");

            if (dsrc && gid) {
                imgsSrc[gid] = imgsSrc[gid] || [];
                imgsSrc[gid].push(dsrc);
                thi.addEventListener("click", function () {
                    reviewImage(dsrc, gid);
                }, false);
            }
        }
        return init;
    })();

var Basic = {

	//变量定义
	vars : {
	
		getType : 1,
	
		reconnectFailCount : null,
		
		elelastmsgtime : $("#lastmsgtime"),
		
		//socket : 'http://'+ location.host + ':3000'
		socket : 'http://localhost:3000'
	
	},

	init : function(){
	
		document.domain = document.domain.substr( document.domain.indexOf('.') + 1 );
		
		//////////////////
	
		$.FormatDateTime = function (obj, IsMi) {
			var myDate = new Date(obj);
			var year = myDate.getFullYear();
			var month = ("0" + (myDate.getMonth() + 1)).slice(-2);
			var day = ("0" + myDate.getDate()).slice(-2);
			var h = ("0" + myDate.getHours()).slice(-2);
			var m = ("0" + myDate.getMinutes()).slice(-2);
			var s = ("0" + myDate.getSeconds()).slice(-2);
			var mi = ("00" + myDate.getMilliseconds()).slice(-3);
			if (IsMi == true) {
				return year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s;
			}
			else {
				return year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s + "." + mi;
			}
		};
		
		//////////////////
	
		form_smiley.rend({
			spearate: 14,
			count: 27,
			size: 24,
			extend: "png",
			page: "page_smiley",
			list: "list_smiley",
			nav: "nav_smiley",
			img: "http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/smiley/smiley",
			key: "smiley"
		});
		
		$("#face_area").hide();
		
		//////////////////
		
		var userAgent = navigator.userAgent.toLowerCase();
		var IsIOS = false;
		if(userAgent.indexOf("iphone") >= 0){
			IsIOS = true;
			$("#nav_footer ul").css("position","absolute");
		}
		
		$("#facePoint").click(function () {
			var facearea = $("#face_area");

			if (facearea.is(":hidden")) {
				$("#toolbar").height("195px");
			}
			else {
				$("#toolbar").height("48px");
			}
			facearea.toggle(100);
			$("#facetype").toggle();
			//scrollTop();
			Basic.resize();
		});

		//////////////////

		$("#facetype span").click(function () {
			var type = $(this).attr("data-key");
			$("#facetype span").each(function () {
				var e = this;
				$(this).removeClass("on");
			});
			$(this).addClass("on");
			if (type == "jingdian") {
				$("#page_smiley").show();
				$("#page_xiong").hide();
				$("#page_mayi").hide();
			}
			else if (type == "xiong") {
				$("#page_smiley").hide();
				$("#page_xiong").show();
				$("#page_mayi").hide();
				if ($("#list_xiong").html().trim() == "") {
					form_smiley.rend({
						spearate: 14,
						count: 98,
						size: 36,
						extend: "png",
						page: "page_xiong",
						list: "list_xiong",
						nav: "nav_xiong",
						img: "http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/xiong/xiong",
						key: "xiong"
					});
				}
			}
			else if (type == "mayi") {
				$("#page_smiley").hide();
				$("#page_xiong").hide();
				$("#page_mayi").show();
				if ($("#list_mayi").html().trim() == "") {
					form_smiley.rend({
						spearate: 14,
						count: 57,
						size: 30,
						extend: "gif",
						page: "page_mayi",
						list: "list_mayi",
						nav: "nav_mayi",
						img: "http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/mayi/mayi",
						key: "mayi"
					});
				}
			}
			
		});
		
		/////////
		
		
		
		//////////////////
		
		function cansend() {
			var text = $("#sendtext").val();
			var btn = $("#btnsend");
			if (text.trim().length > 0) {
				btn.removeClass("on");
			}
			else {
				btn.addClass("on");
			}
		}
		
		//回车发送消息
		$("#sendtext").on('input',cansend).on('change',cansend).on('propertychange',cansend).on('keydown',function(e) {
			if (e.keyCode === 13) {
				Basic.sendMessage( 'text', $(this).val() );
			}
		});
		
		//////////////////
		
		$("#btnsend").click(function(){
			var text = $("#sendtext").val();
			if (text.trim().length == 0) {
				return;
			}
			else{
				Basic.sendMessage( 'text', text.trim() );
			}
		});
		
		//////////////////
		
		$("#Upload_file").change(function(){
			Basic.sendimg( this );
		});
		
		//////////////////
		
		$( window ).on('resize',this.resize).on('load',this.resize);
	
	},
	
	resize : function(){
	
		if( $('#topper').size() ){
			$('#content').height( $(window).height() - $('#topper').outerHeight() - $('#toolbar').outerHeight() );
		}else{
			$('#content').height( $(window).height() - $('#toolbar').outerHeight() - 2 );
		}
		
		console.log( $('#content').height() );
	
	},
	
	getParam : function( key ){
		var reg = new RegExp("(^|\\?|&)"+ key +"=([^&]*)(\\s|&|$)", "i");  
		if (reg.test(location.href)) return unescape(RegExp.$2.replace(/\+/g, " ")); return "";
	},
	
	
	callimg : function( obj ){
	
		/*
		$("#Upload_iframe").load(function () {
			var iframebody = window.frames['Upload_iframe'].document.body;
			var text = iframebody.innerText;
			var obj = eval("(" + text + ")");
		*/
			console.log( obj );
			if ( obj != null && obj.return == 0 ) {
				Basic.sendMessage( obj.type, obj.image );
			}
			else if (obj.result) {
				alert(obj.result);
			}
		/*
		});
		*/
	
	},

	//照相机按钮上传图片
	sendimg : function(thi) {
		var file = thi.files[0];
		if (file != null) {
			var tform = $("#Upload_form");
			tform.attr( 'action', Basic.vars.socket + '/upload' );
			tform.submit();
			tform[0].reset();
		}  
	},

	//发送消息
	sendMessage : function( msgType, Content ) {
		
		//如果消息发送成功
		if( App.sendMsg( msgType, Content ) && msgType == 'text' ){
			
			$("#sendtext").val("");
			$("#sendtext").html("");
			//scrollTop();
			$("#btnsend").addClass("on");
		
		}
		
	},
	
	//获取消息
	onLoadMessage : function(page) {
		$.ajax({
			type: 'post',
			url: 'Ajax/CustomerChatAjax.aspx',
			data: {
				action: 'GetMessageData',
				weimobid: sWeimobId,
				AId: AId,
				page: page
			},
			dataType: 'json',
			success: function (json) {
				if (json) {
					for (var i = json.length - 1; i >= 0; i--) {
						var ulHtml = "";
						var voiceId = "";
						var obj = json[i];
						var fromType = obj.FromType;
						var ulclass = 'class="ul_talk reply"';
						var showFlag = true;
						var path = '<path d="M18,40 A9,5,0,0,0,2,37 L0,23" stroke-width="1" stroke="#2792ff" fill="#2792ff" />';
						var preobj;
						if (i != json.length - 1) {
							preobj = json[i + 1];
							var minsec = Date.parse(obj.AddTime) - Date.parse(preobj.AddTime);
							var minutes = minsec / 1000 / 60;
							if (null != preobj && minutes <= 2) {
								showFlag = false;
							}
						}
						if (obj.FromType == 2) {
							ulclass = 'class="ul_talk"';
							path = '<path d="M2,20 A9,5,0,0,1,18,24 L20,0" stroke-width="1" stroke="#e2e2e2" fill="#e2e2e2" />';
						}
						else {
							if (obj.MsgType == "faceimg") {
								path = '';
							}
						}
						if (showFlag) {
							ulHtml += '<p class="time" style="display:block;">' + $.FormatDateTime(obj.AddTime, true) + '</p>';
						}
						ulHtml += '<ul ' + ulclass + '>' +
								'<li class="tbox">' +
									'<div>';
						if (obj.FromType == 2) {
							var CustomerServiceHeadUrl = obj.HeadUrl;                      
							if (CustomerServiceHeadUrl != null) {
								if (CustomerServiceHeadUrl.trim().length == 0) {
									CustomerServiceHeadUrl = "images/mengmei.jpg";
								}
							}
						   
							ulHtml += '<span class="head">' +
											'<img src="' + CustomerServiceHeadUrl + '" />' +
										'</span>' +
									   ' <label class="name">' + obj.ReplyUserName + '</label>'
						}
						else {
							ulHtml += '<span class="head">' +
											'<img src="' + CustomerHeadUrl + '" />' +
										'</span>';
						}
						ulHtml += '</div>' +
									'<div>' +
										'<span class="arrow">' +
											'<svg>' + path + '</svg>' +
										'</span>' +
									'</div>' +
									'<div>';
						switch (obj.MsgType) {
							case 'text':
								ulHtml += '<article class="content">' + obj.Content + '</article></div></li></ul>';
								break;
							case 'image':
								var url;
								if (obj.Content != null) {
									url = obj.Content.trim();
									if (url == "") {
										url = obj.PicUrl;
									}
								}
								ulHtml += '<img src=' + url + ' data-src=' + url + ' data-gid="g2" title="点击查看大图" class="image" onload="preViewImg(this, event);" onerror="preViewImg(this, event);" /></div></li></ul>';
								break;
							case 'voice':
								var id = obj.Id;
								if (fromType == 2) {
									ulHtml += '<article class="content" data-id=' + id + ' data-value=' + fromType + ' data-name="Messagevoice" style="padding-bottom: 8px;" onclick="playAudio(this);">' +
							   '<span class="voice" id="voicespan' + id + '"></span><span class="second" id="VoiceSecond' + id + '" style="margin-left: 30px;">1”</span>' +
							   '<audio id="myaudio_' + id + '" data-value=' + fromType + ' data-id=' + id + ' controls name="MessageFromaudio" style="display:none;"><source src=' + obj.Content + ' type="video/mp4"></source></audio></article></div></li></ul>';
								}
								else {
									ulHtml += '<article class="content" data-id=' + id + ' data-value=' + fromType + '  data-name="Messagevoice" onclick="playAudio(this);">' +
								'<span class="replysecond" id="replysecond' + id + '">1”</span><span class="replyvoice" id="replyvoice' + id + '" style="margin-left:30px;"></span>' +
								'<audio id="myaudio_' + id + '" data-value=' + fromType + ' data-id=' + id + ' controls name="MessageFromaudio" style="display:none;"><source src=' + obj.Content + ' type="video/mp4"></source></audio></article></div></li></ul>';
								}
								voiceId = "myaudio_" + id
								break;
							case 'faceimg':
								var url = obj.Content.trim();
								if (url == "") {
									url = obj.PicUrl;
								}
								ulHtml += ' <img src=' + url + ' style="float:right;" /></div></li></ul>';
								break;
							case 'news':
								if (obj.News && obj.News.length > 0) {
									var objNewsList = obj.News;
									if (objNewsList.length == 1) {
										var objNews = objNewsList[0];
										ulHtml += '<div class="graphic">' +
												  '<p class="ftitle">' + objNews.title + '</p>' +
												  '<p class="stitle">' + obj.FormatAddTime + '</p>' +
												  '<a href="' + objNews.url + '" target="_blank"><img width="182" height="112" src="' + objNews.picurl + '" /></a>' +
												  '<a class="ttitle" href="' + objNews.url + '" target="_blank">' + objNews.description + '</a>' +
												  '<a class="readall" href="' + objNews.url + '" target="_blank">阅读全文</a>' +
											 '</div>';
									}
									else {
										ulHtml += '<div class="multigraphic">'
										var objNews = objNewsList[0];
										ulHtml += ' <a href="' + objNews.url + '" target="_blank"><img width="182" height="112" src="' + objNews.picurl + '" /></a>' +
												  ' <a class="maintitleback" href="' + objNews.url + '" target="_blank"></a>' +
												  ' <a class="maintitle" href="' + objNews.url + '" target="_blank">' + objNews.title + '</a>' +
												  '<div class="child"> ' +
												  '  <ul>';
										for (var j = 1; j < objNewsList.Count; j++) {
											var objN = objNewsList[j];
											ulHtml += ' <li> ' +
												  '  <a class="ctitle" href="' + objN.url + '">' + objN.title + '</a>' +
													 '   <img width="40" height="40" src="' + objN.picurl + '" />' +
											   ' </li>';
										}
										ulHtml += '</ul>' +
							   '</div>' +
					   '</div>';
									}
								}
								break;
						}
						$("#containertop").prepend(ulHtml);
						if (voiceId.trim().length > 0) {
							var audio = $("#" + voiceId);
							audio.bind("loadedmetadata", function () {
								showSeconds(this);
							});
						}
					}
					if (json.length > 0) {
						page++;
					}
					$("#pageNumber").val(page);
				}
			},
			error: function () {
			}
		});
	},
	
	formatMsg : function( msgType, Content ){		
		
		var type;
		var extension;
		if (msgType == "xiong" || msgType == "mayi") {
			type = msgType;
			msgType = 'faceimg';
			if (type == "xiong") {
				extension = '.png';
			}
			else {
				extension = '.gif';
			}
			Content = 'http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/' + type + '/' + Content.replace('[', '').replace(']', '') + extension;
		}	
		
		var ulHtml = '';
		
		switch ( msgType ) {
			case 'text':
				Content = this.FormatFace( Content );
				Content = this.FormatFaceImage( Content );
				ulHtml += Content;
			break;
				
			case 'image':
				var url;
				if (Content != null) {
					url = Content.trim();
					if (url == "") {
						url = obj.PicUrl;
					}
				}
				ulHtml += '<img src=' + url + ' data-src=' + url + ' data-gid="g2" title="点击查看大图" class="image" onload="preViewImg(this, event);" onerror="preViewImg(this, event);" />';
			break;
			
			case 'faceimg':
				var url = Content.trim();
				if (url == "") {
					url = obj.PicUrl;
				}
				ulHtml += ' <img src=' + url + ' />';
			break;
		}
		
		return ulHtml;
		
	},

	//替换表情符号
	FormatFace : function(contentFace) {
		var arr = ["/::)", "/::~", "/::B", "/::|", "/:8-)", "/::<", "/::$", "/::X", "/::Z", "/::'(", "/::-|", "/::@", "/::P", "/::D", "/::O", "/::(", "/::+", "/:–b", "/::Q", "/::T", "/:,@P", "/:,@-D", "/::d", "/:,@o", "/::g", "/:|-)", "/::!", "/::L", "/::>", "/::,@", "/:,@f", "/::-S", "/:?", "/:,@x", "/:,@@", "/::8", "/:,@!", "/:!!!", "/:xx", "/:bye", "/:wipe", "/:dig", "/:handclap", "/:&-(", "/:B-)", "/:<@", "/:@>", "/::-O", "/:>-|", "/:P-(", "/::'|", "/:X-)", "/::*", "/:@x", "/:8*", "/:pd", "/:<W>", "/:beer", "/:basketb", "/:oo", "/:coffee", "/:eat", "/:pig", "/:rose", "/:fade", "/:showlove", "/:heart", "/:break", "/:cake", "/:li", "/:bome", "/:kn", "/:footb", "/:ladybug", "/:shit", "/:moon", "/:sun", "/:gift", "/:hug", "/:strong", "/:weak", "/:share", "/:v", "/:@)", "/:jj", "/:@@", "/:bad", "/:lvu", "/:no", "/:ok", "/:love", "/:<L>", "/:jump", "/:shake", "/:<O>", "/:circle", "/:kotow", "/:turn", "/:skip", "[挥手]", "/:#-0", "[街舞]", "/:kiss", "/:<&", "/:&>"];
		try {
			for (var i = 0; i < arr.length; i++) {
				var face = arr[i];
				contentFace = contentFace.replace(face, "<img src='http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/face/" + i + ".gif' />");
			}
		} catch (e) {
			alert(e.message);
		}
		return contentFace;
	},

	FormatFaceImage : function(contentFace) {

		var arr = ["smiley001", "smiley002", "smiley003", "smiley004", "smiley005", "smiley006", "smiley007", "smiley008", "smiley009", "smiley010", "smiley011", "smiley012", "smiley013", "smiley014", "smiley015", "smiley016", "smiley017", "smiley018", "smiley019", "smiley020", "smiley021", "smiley022", "smiley023", "smiley024", "smiley025", "smiley026", "smiley027"];

		try {
			for (var i = 0; i < arr.length; i++) {
				var face = arr[i];
				contentFace = contentFace.replace('[', '').replace(']', '').replace(face, "<img src='http://hs-net-img.oss-cn-hangzhou.aliyuncs.com/Face/images/smiley/" + face + ".png' style='-webkit-background-size: auto 24px;width:24px;height:24px'/>");
			}
		} catch (e) {
			alert(e.message);
		}
		return contentFace;
	},

	hidenface : function(e) {
		var facearea = $("#face_area");
		if (facearea.is(":hidden")) {

		}
		else {
			$("#nav_footer").height("48px");
		}
		$("#face_area").hide();
		$("#facetype").hide();
		var userAgent = navigator.userAgent;
	}

}

/*
function TscrollTop() {
    $(window).scrollTop(document.body.scrollHeight);
}
*/

Basic.init();