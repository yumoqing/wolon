function mainJQ(){
	l = $('#mainlayout');
	var r = l.layout('panel','center');
	return r;
};

function showEstateInfo(id){
	remoteWidgets(["{{absurl(request,'..')}}/saving/estateInfo.tmpl"],
		{eid:id},
		mainJQ(),
		'replace',
		showError
	);
}

var id2url = {
	"99":"{{absurl(request,'../maintable.tmpl')}}",
	"1":"{{absurl(request,'../saving/index.tmpl')}}",
	"1.1":"{{absurl(request,'../saving/myestate.tmpl')}}",
	"1.2":"{{absurl(request,'../saving/myfavorite.tmpl')}}",
	// "1.3":"{{absurl(request,'../saving/input_estate.tmpl')}}",
	"3":"{{absurl(request,'../rentfin/index.tmpl')}}",
	"3.1":"{{absurl(request,'../rentfin/myFavorites.tmpl')}}",
	"3.2":"{{absurl(request,'../rentfin/myRentfin.tmpl')}}",
	"3.5":"{{absurl(request,'../rentfin/packingAsset.tmpl')}}"
};


function unsupportfunc(text){
	$.messager.show({title:'info',msg:text + '：建设中'});
};

function menuCall(funcid,text){
	var url = id2url[funcid];
	var jq = mainJQ();
	if(url){
		remoteWidgets([url],{},jq,'replace',showError);
	} else {
		switch(funcid){
			case '0.1':
				popWindow('{{absurl(request,'..')}}/selfserv/register.tmpl',{title:'注册',width:"480px",height:"320px"});
				break;
			case '0.2':
				popWindow('{{absurl(request,'..')}}/public/login.tmpl',{title:'登录',width:"480px",height:"320px"});
				break;
			case '0.3':
				popWindow('{{absurl(request,'..')}}/selfserv/chkpassword1.tmpl',{title:'修改密码',width:"480px",height:"320px"});
				break;
			case '0.4':
				logout();
				break;
			case '1.3':
				popWindow('{{absurl(request,'..')}}/saving/input_estate.tmpl',{title:'新增存房',width:"740px",height:"480px"});
				break;
			case '3.3':
				popWindow('{{absurl(request,'..')}}/rentfin/new_rf.tmpl',{title:'新增融房',width:"640px",height:"480px"});
				break;
			default:
				unsupportfunc(text);
				break;
		}
	}
};
	
function popWindow(url,opts,inIframe){
	var mw = $('#modalWindow');
	if(mw.length==0){
		mw = $('<div id="modalWindow"></div>').appendTo('body')
			.window({
				width:"640px",
				height:"480px",
				modal:true,
				closed:true
			});
	}
	mw.window('open');
	mw.window('body').empty();
	if(opts){
		var o = mw.window('options');
		o = objExt(o,opts);
		mw.window(o);
	}
	var target = $('<div style="width:100%;height:100%;">this is a test</div>').appendTo(mw.window('body'));
	if(inIframe){
		var bd  = $('<iframe src="' + url + '" style="width:100%;height:100%;background:#E0E0E0;"></iframe>').appendTo(target);
	} else{
		remoteWidgets([url],{},target,'replace',showError);
	}
};

function showAddressOnMap(addr,city){
	remoteCall("{{absurl(request,'..')}}/public/getGeoPosition.dspy",'GET','json',
		{
			address:addr,
			city:city
		},
		function(d){
			// show addr 
			if (d.status == 0){
				showLocation(d.result.lng,d.result.lat,city);
			}
		},
		showError
	);
}

function showLocation(lng,lat,city){
	var url = "{{absurl(request,'../public/showMap.tmpl')}}?eid=" + eid;
	popWindow(url,{title:'位置'});
}

function showEstateInfo(eid){
	var url = "{{absurl(request,'../saving/estateDetail.tmpl')}}?eid=" + eid;
{% if terminalType.lower() in [ 'iphone','ipad','androidpad' ] %}
	var ma = $(this).parents('.mobileapp');
	console.log('mobileapp=',ma,this);
	ma.mobileapp('newpage',{url:url,params:{}});
{% else %}
	popWindow(url,{title:'资产详情'});
{% endif %}
}

function favoriting(rid){
	$.messager.alert('提示','收藏成功');
};

function cashflow(rid){
	var url = "{{absurl(request,'../rentfin/cashflow.tmpl')}}?rf_id =" + rid;
	popWindow(url,{title:'现金流'});
}
function startTextCall(peer){
	var url = "{{absurl(request,'../public/chat.tmpl')}}?peer=" + peer;
	popWindow(url,{title:'沟通'});
}

var users = {
		"u0001":{
			name:"林聪",
			imgs:'{{absurl(request,'..')}}/imgs/lc.png',
			msgs:[],
			status:false
		},
		"u0002":{
			name:"张无忌",
			imgs:'{{absurl(request,'..')}}/imgs/zwj.jpg',
			msgs:[],
			status:false
		},
		"u0003":{
			name:"王德妃",
			imgs:'{{absurl(request,'..')}}/imgs/wdf.jpg',
			msgs:[],
			status:false
		},
		"u0004":{
			name:"柳再重",
			imgs:'{{absurl(request,'..')}}/imgs/lzz.jpg',
			msgs:[],
			status:false
		},
		"u0005":{
			name:"武清甜",
			imgs:'{{absurl(request,'..')}}/imgs/wqt.jpg',
			msgs:[],
			status:false
		},
};
var logined_user = null;
var my_rtc = null;
	
function logout(){
	$.messager.confirm('提示','确认要签退吗？',function(yesno){
		if(yesno){
			$('#userimg')[0].src="{{absurl(request,'..')}}/imgs/nobody.jpg";
			$('#username').html('未登录');
			users[logined_user].status = false;
			logined_user = null;
			my_rtc = null;
		}
	});
};

function logined(userid){
	var info = users[userid];
	console.log('userid=',userid,'info=',info);
	if(typeof(info) != 'undefined'){
		if (info.status == 'login'){
			$.messager.show({title:'错误',msg:'用户已经登录'});
		} else {
			$('#userimg')[0].src = users[userid].imgs;
			$('#username').html(info.name);
			info.status = 'login';
			logined_user = userid;
			setupWebRTC();
			$('#modalWindow').window('close');
		}
	} else {
		$.messager.show({title:'错误',msg:'用户不存在，或密码错'});
	}
};


function setupWebRTC(){
	
        var opts = {
                userId:logined_user,
                authorization:"",
                ws_url:"wss://www.bsppo.com:9001",
                mediaContraints:{
                    video: true,
                    audio: true
                },
                friendsWidget:"friends",
                localElement:"localElement",
                remoteElement:"remoteElement",
                iceServers:[
                        {url: "stun:stunserver.org"},
                        {url: "stun:stun.xten.com"},
                        {
                                url: "turn:39.105.105.159:3478",
                                credential:"x",
                                username:"x"
                        }
                ],
		ontextmsg:function(d){
			users[d.userId].msg.push(d.data.msg);
			
		},
		
        };
        my_rtc = new WebRTCClient(opts);
};
