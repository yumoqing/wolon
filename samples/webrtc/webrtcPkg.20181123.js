/* packget protocol
packing:json
event: packet usility
data: data must include:
	userId: packet come from
	targetId:packet destination
	authorization: userid autorization infomation
	and other data
*/

var isSupportedWebRTC = false;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;
isSupportedWebRTC = navigator.getUserMedia && window.PeerConnection && window.SessionDescription;

/* opts 

iceServers:[{ url: 'stun server url' }, {
		url: 'turn server url',
		username: 'turn server username',
		credential: 'turn server key'
		}]
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
			case 'logon':
				myRTC.onlogon(d.data);
				break;
			case 'getFriends':
				myRTC.ononlineFriends(d.data);
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
		}
	};
	this.setupRTC();
}
WebRTCClient.prototype = {
	toServer:function(d){
		d = this.includeBaseData(d);
		this.socket.send(JSON.stringify(d));
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
	ononlineFriends:function(d){
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
		myRTC.pc = new PeerConnection(configuration);
		//add events handlers
		myRTC.pc.onicecandidate = function(e) {
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
			myRTC.remotestream = e.stream
			var jq = $('#' + myRTC.options.remoteVideo);
			jq[0].srcObject = e.stream;
		};
		myRTC.pc.oniceconnectionstatechange = function() {
			//if interrupted connection
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
		navigator.getUserMedia({ audio: true, video: true }, function(stream) {
			var jq = $('#' + myRTC.options.localVideo);
			myRTC.pc.addStream(stream);
			jq[0].srcObject = stream;
			callback();
		}, function(err) {
		    alert(err)
		});
	
	},
	startCall:function(targetId){
		var myRTC = this;
		myRTC.targetId = targetId;
		myRTC.enableSelfVideo(function(){
			var d = {
				event:'callRequest',
				data:{
					type:'video'
				}
			};
			myRTC.toServer(d);
		});
		
	},
	onCallRequest:function(d){
		var myRTC = this;
		$.messager.confirm("from "+d.userId,"want to start a " + d.data.type + " call",function(dx){
			if (dx){
				myRTC.callAccept(d.userId);
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
	onCallAccept:function(d) {
		var myRTC = this;
		myRTC.pc.createOffer(function(description) {
			myRTC.pc.setLocalDescription(description, function() {
				description.type = 'offer';
				var d = {
					event:'rtc',
					data:description
				};
				myRTC.toServer(d);
			}, onError);
		}, onError,myRTC.options.mediaConstraints);
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
		myRTC.pc.setRemoteDescription(new SessionDescription(data), function() {
			myRTC.pc.createAnswer(function(description) {
				myRTC.pc.setLocalDescription(new SessionDescription(description), 
						function() {
					description.type = 'answer';
					description.toId = data.fromId;
					console.log('sending answer');
					var d = {
						event:'rtc',
						data:description
					}
					myRTC.toServer(d);
					}, onError);
			}, onError, myRTC.options.mediaConstraints);
		}, onError);
	},
	onRtcAnswer:function(d) {
		var data = d.data;
		console.log('received answer');
		this.pc.setRemoteDescription(new SessionDescription(data), function() {}, onError);
	},
	onRtcCandidate:function(d) {
		var data = d.data;
		console.log('received candidate');
		var candidate = new RTCIceCandidate({
			sdpMLineIndex: data.label,
			candidate: data.candidate
		});
		this.pc.addIceCandidate(candidate);
	}
}



