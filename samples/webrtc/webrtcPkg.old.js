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

/* server side generate event:
logon:
getFriends:
offlineCalls
getOfflineCall
offlineTextMsgs
getOfflineTextMsg:
offline
*/
function onError(e){
	$.messager.alert('error',e);
};
function WebRTCClient(opts){
	if (!isSupportedWebRTC){
		throw("WebRTC is not supported");
	}
	this.options = opts;
	this.friends = [];
	this.pc = null;
	this.socket = new WebSocket(this.options.ws_url);
	var myRTC = this;
	this.socket.onopen = function(){
		var d = {
			event:'login',
			data:{}
		}
		myRTC.toServer(d);
	}
	this.socket.onmessage = function(e){
		var d = JSON.parse(e.data);
		if (d.data.targetId != myRTC.userId) return;
		switch(d.event){
			case 'missing':	
			/* 返回脱机时错过的正文消息数据量和发起的call数量 */
				break;
			case 'offlineCalls':  
			/* 返回getOfflineCalls消息的结果 */
				break;
			case 'offlineTextMsgs':
				break;
			case 'logon':
				myRTC.onlogon(d.data);
				break;
			case 'getFriends':
				myRTC.ongetFriends(d.data);
				break;
			case 'callRequest':
				myRTC.onCallRequest(d);
				break;
			case 'rtc':
				myRTC.onRtc(d);
				break;
			case 'callAccept':
				myRTC.onCallAccept(d);
				break;
			case 'callReject':
				myRTC.onCallReject(d);
				break;
			case 'hangup':
				console.log('hangup event accept',d);
				myRTC.onHangup(d);
				break;
			case 'busy':
				myRTC.onBusy(d);
				break;
			case 'offline':
				myRTC.onOfflien(d);
				break;
			case 'textmsg':
				break;
			default:
				break;
		}
		myRTC.userdefinedCallback(d);
	};
}
WebRTCClient.prototype = {
	sendTextMessae:function(userId,msg){
		var myRTC = this;
		var d = {
			event:'textmsg',
			data:{
				msg:msg
			}
		};
		myRTC.toServer(d,userId);
	},
	getLocalWidget:function(){
		var myRTC = this;
		var jq = $('#' + myRTC.options.localElement);
		if (jq.length == 0){
			jq = $('<video id="' + myRTC.options.localElement + '"></video>')
				.appendTo($('body'));
		}
		return jq;
	},
	getRemoteWidget:function(){
		var myRTC = this;
		var jq = $('#' + myRTC.options.remoteElement);
		if (jq.length == 0){
			jq = $('<video id="' + myRTC.options.remoteElement + '"></video>')
				.appendTo($('body'));
		}
		return jq;
	},
	toServer:function(d,userId){
		d = this.includeBaseData(d);
		if(typeof(userId)!='undefined')
			d.targetId = userId;
		this.socket.send(JSON.stringify(d));
	},
	userdefinedCallback(d){
		var k = 'on' + d.event
		if(this.options.hasOwnProperty(k)){
			f = this.options[k];
			f(d);
		}
	},
	onlogon:function(d){
		var myRTC = this;
		var inlist = false;
		for (var i=0;i<myRTC.friends.length;i++){
			if (myRTC.friends[i].friendId == d.friend.friendId){
				myRTC.friends[i].logonStatus = true;
				inlist = true
			}
		}
		console.log('friend=',d);
		if (!inlist){
			d.friend.logonStatus = true;
			myRTC.friends.push(d.friend);
		}
		var data = {
			total:myRTC.friends.length,
			rows:myRTC.friends
		};
		var fw = $('#'+myRTC.options.friendsWidget);
		fw.datalist('loadData',data);
	},
	ongetFriends:function(d){
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
	setupRTC : function(){
		var myRTC = this;
		var configuration = {
			"iceServers":myRTC.options.iceServers 
		};
		//save Peer connection object to angular this to global access.
		myRTC.pc = new RTCPeerConnection(configuration);
		//add events handlers
		myRTC.pc.onicecandidate = function(e) {
			console.log('onicecandidate() called,e=',e);
			if (e.candidate) {
				var d = {
					event:'rtc',
					data:{
						type: 'candidate',
						label: e.candidate.sdpMLineIndex,
						id: e.candidate.sdpMid,
						candidate: e.candidate.candidate
					}
				};
				myRTC.toServer(d);
			}
		};
		myRTC.pc.onaddstream = function(e) {
			// here should be code for processing successful connection
			// for example save stream url to variable and insert it to HTML5 video player
			console.log('onaddstream() called',e);
			myRTC.remotestream = e.stream
			var jq = myRTC.getRemoteWidget(); // $('#' + myRTC.options.remoteVideo);
			jq[0].srcObject = e.stream;
		};
		myRTC.pc.oniceconnectionstatechange = function(e) {
			//if interrupted connection
			console.log('oniceconnectionstatechange() called',e);
			if (myRTC.pc && myRTC.pc.iceConnectionState == 'disconnected') {
				console.log('peer connection interrupted');
				if (myRTC.options.onpeerDisconnected){
					myRTC.options.onpeerDisconnected(myRTC);
				}
			}
		};
	},
	includeBaseData:function(d){
		d.userId = this.options.userId;
		d.authorization = this.options.authorization;
		d.targetId = this.targetId;
		return d;
	},
	enableSelfVideo:function(callback){
		var myRTC = this;
		myRTC.setupRTC();
		navigator.getUserMedia(myRTC.mediaConstraints, function(stream) {
			var jq = myRTC.getLocalWidget(); // $('#' + myRTC.options.localVideo);
			myRTC.pc.addStream(stream);
			jq[0].srcObject = stream;
			myRTC.selfstream = stream;
			callback();
		}, function(err) {
		    alert(err)
		});
	
	},
	startCall:function(targetId,mediaConstraints){
		var myRTC = this;
		myRTC.targetId = targetId;
		var d = {
			event:'callRequest',
			data:mediaConsraints
		};
		myRTC.busy = true;
		myRTC.mediaConstraints = mediaConstraints;
		myRTC.toServer(d);
	},
	onCallRequest:function(d){
		var myRTC = this;
		if (myRTC.busy){
			var d = {
				event:'busy',
				data:{
					oops:1
				}
			}
			myRTC.toServer(d);
			return;
		}
		var jq = $('#ring');
		jq[0].src='/gmxq.mp3';
		jq[0].currentTime = 0;
		jq[0].play();
		myRTC.busy = true;
		myRTC.mediaConstraints = d.data;
		$.messager.confirm("from "+d.userId,"want to start a " + d.data.type + " call",function(dx){
			jq[0].pause();
			if (dx){
				myRTC.callAccept(d.userId);
			} else {
				myRTC.callReject(d.userId);
			}
		});
	},
	callAccept:function(targetId){
		var myRTC = this;
		myRTC.targetId = targetId;
		myRTC.enableSelfVideo(function(){
			var d = {
				event:'callAccept',
				data:{
					type:'video',
				}
			};
			myRTC.toServer(d);
		});
	},
	callReject:function(targetId){
		var myRTC = this;
		myRTC.targetId = targetId;
		var d = {
			event:'callReject',
			data:{
			}
		};
		myRTC.toServer(d);
	},
	onCallReject:function(d){
		$.messager.alert('call reject','from ' + d.targetId);
	},
	hangup:function(){
		var myRTC = this;
		var d = {
			event:'hangup',
			data:{
			}
		}
		myRTC.toServer(d);
		myRTC.hangupRTC();
	},
	onHangup:function(d){
		console.log('onHangup() called');
		this.hangupRTC();
	},
	hangupRTC:function(){
		var myRTC = this;
		myRTC.pc.close();
		myRTC.pc = null;
		var jq = $('#' + myRTC.options.localVideo);
		jq[0].srcObject = null;
		jq = $('#' + myRTC.options.remoteVideo);
		jq[0].srcObject = null;
		myRTC.selfstream.getTracks().forEach(track => track.stop());
		myRTC.selfstream = null;
		myRTC.remotestream.getTracks().forEach(track => track.stop());
		myRTC.remotestream = null;
	},
	onCallAccept:function(d) {
		var myRTC = this;
		myRTC.enableSelfVideo(function(){
			myRTC.pc.createOffer(function(description) {
				myRTC.pc.setLocalDescription(description, function() {
					description.type = 'offer';
					var d = {
						event:'rtc',
						data:description
					};
					myRTC.toServer(d);
				}, onError);
			}, onError,myRTC.mediaConstraints);
		});
	},
	onRtc:function(d) {
		var myRTC = this;
		switch (d.data.type) {
			case 'offer':
				myRTC.onRtcOffer(d);
				break;
			case 'answer':
				myRTC.onRtcAnswer(d);
				break;
			case 'candidate':
				myRTC.onRtcCandidate(d);
				break;
		}
	},
	onRtcOffer:function(d) {
		var myRTC = this;
		var data = d.data;
		myRTC.pc.setRemoteDescription(new RTCSessionDescription(data), function() {
			myRTC.pc.createAnswer(function(description) {
				myRTC.pc.setLocalDescription(new RTCSessionDescription(description), 
						function(x) {
					description.type = 'answer';
					description.toId = data.fromId;
					console.log('setLocalDescription(),ending answer,x=',x);
					var d = {
						event:'rtc',
						data:description
					}
					myRTC.toServer(d);
					}, onError);
			}, onError, myRTC.mediaConstraints);
		}, onError);
	},
	onRtcAnswer:function(d) {
		var data = d.data;
		console.log('received answer');
		this.pc.setRemoteDescription(new RTCSessionDescription(data), function(x) {
			console.log('setREmoteDescription(),x=',x);
		}, onError);
	},
	onRtcCandidate:function(d) {
		var data = d.data;
		console.log('received candidate');
		var candidate = new RTCIceCandidate({
			sdpMLineIndex: data.label,
			candidate: data.candidate
		});
		console.log('onRtcCandidate(),candidate=',candidate);
		this.pc.addIceCandidate(candidate);
	}
}



