/* packget protocol
packing:json
event: packet usility
data: data must include:
	userId: packet come from
	targetId:packet destination
	authorization: userid autorization infomation
	and other data
*/

var isSupportedWebRTC = true;

/* opts 

iceServers:[{ url: 'stun server url' }, {
		url: 'turn server url',
		username: 'turn server username',
		credential: 'turn server key'
		}]
*/
function onError(e){
	console.log('error',e);
	$.messager.alert('error',e);
}
function WebRTCClient(opts){
	if (!isSupportedWebRTC){
		throw("WebRTC is not supported");
	}
	this.options = opts;
	this.pc = null;
	this.socket = new WebSocket(this.options.ws_url);
	var myRTC = this;
	this.sessions = {};
	this.socket.onmessage = function(e){
		console.log('received message=',e);
		var d = JSON.parse(e.data);
		switch(d.event){
			case 'logon':
				myRTC.onlogon(d);
				break;
			case 'getFriends':
				myRTC.ononlineFriends(d);
				break;
			case 'callRequest':
				var session = new RtcSession(myRTC);
				session.setSessionId(d.sessionId);
				myRTC.sessions[d.sessionId] = session;
				myRTC.sessions[d.sessionId].onCallRequest(d);
				break;
			case 'rtc':
				myRTC.sessions[d.sessionId].onRtc(d);
				break;
			case 'callAccept':
				myRTC.sessions[d.sessionId].onCallAccept(d);
				break;
			default:
				console.log(d.event,'has not a handler');
				break;
		}
	};
	this.socket.onopen = function(){
		var d = {
			event:'login',
			data:{
				authorization : myRTC.options.authorization
			}
		}
		myRTC.toServer(d);
	}
}
WebRTCClient.prototype = {
	toServer:function(d){
		var d = this.includeBaseData(d);
		console.log('send to server object=',d);
		var txt = JSON.stringify(d);
		console.log('send to server text=',txt);
		this.socket.send(txt);
	},
	onlogon:function(d){
		d = d.data;
		var myRTC = this;
		var inlist = false;
		for (var i=0;i<myRTC.friends.length;i++){
			if (myRTC.friends[i].friendId == d.friend.friendId){
				myRTC.friends[i].logonStatus = true;
				inlist = true
			}
		}
		if (!inlist){
			d.friend.logonStatus = true;
			myRTC.friends.push(d.friend);
		}
		console.log('friends=',myRTC.friends);
		var data = {
			total:myRTC.friends.length,
			rows:myRTC.friends
		};
		var fw = $('#'+myRTC.options.friendsWidget);
		fw.datalist('loadData',data);
	},
	ononlineFriends:function(d){
		d = d.data;
		var myRTC = this;
		myRTC.friends = d.friends;
		var data = {
			total:myRTC.friends.length,
			rows:myRTC.friends
		};
		console.log('my friends=',myRTC.friends);
		var fw = $('#'+myRTC.options.friendsWidget);
		fw.datalist('loadData',data);
		
	},
	includeBaseData:function(d){
		d.userId = this.options.userId;
		return d;
	},
	startCall:function(targetId){
		var myRTC = this;
		if (typeof(targetId)=='undefined'){
			$.messager.alert('error','targetId is nulll');
			return;
		}
		var session = new RtcSession(myRTC);
		myRTC.sessions[session.sessionId] = session;
		session.startCall(targetId,myRTC.options.mediaContraints);
	},
}



