/*
a RTC session
*/

function RtcSession(rtcClient){
	var session = this;
	session.client = rtcClient;
	this.sessionId = guid();
	var configuration = {
		"iceServers":session.client.options.iceServers 
	};
	session.pc = new RTCPeerConnection(configuration);
	session.pc.onicecandidate = function(e) {
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
			session.client.toServer(d);
		}
	};
	session.pc.onaddstream = function(e) {
		// here should be code for processing successful connection
		// for example save stream url to variable and insert it to HTML5 video player
		console.log('onaddstream() called,e=',e);
		session.client.remotestream = e.stream;
		var v = $('#' + session.client.options.remoteVideo);
		v[0].srcObject = e.stream;
	};
	session.pc.oniceconnectionstatechange = function() {
		//if interrupted connection
		if (session.pc && session.pc.iceConnectionState == 'disconnected') {
			console.log('peer connection interrupted');
			session.close();
			session.client.sessionClose(session.sessionId);
		}
	};
}

RtcSession.prototype = {
	close:function(){
		var session = this;
		// fix me
	},
	setSessionId:function(sid){
		this.sessionId = sid;
	},
	includeBaseData:function(d){
		d.userId = this.client.options.userId;
		d.targetId = this.targetId;
		d.sessionId = this.sessionId;
		return d;
	},
	startCall:function(targetId,mediaContraints){
		var session = this;
		session.targetId = targetId;
		session.mediaContraints = mediaContraints;
		var d = {
			event:'callRequest',
			data:{
				type:'video'
			}
		};
		d = session.includeBaseData(d);
		session.client.toServer(d);
	},
	enableSelfVideo:function(mediaContraints,callback){
		var session = this;
		if (typeof(session.client.selfstream) == 'undefined'){
			navigator.getUserMedia(mediaContraints, function(stream) {
				session.client.selfstream = stream;
				var jq = $('#' + session.client.options.localVideo);
				jq[0].srcObject = session.client.selfstream;
				session.pc.addStream(stream);
				callback();
			}, function(err) {
			    alert(err)
			});
		} else {
			var jq = $('#' + session.client.options.localVideo);
			jq[0].srcObject = session.client.selfstream;
			session.pc.addStream(stream);
			callback();
		}
	
	},
	onCallRequest:function(d){
		var requestInfo = d.data;
		var session = this;
		console.log('onCallRequest() called',requestInfo,session);
		var myRTC = this.client;
		$.messager.confirm('call from ' + d.userId,'request a ' + requestInfo.type + ' call',function(x){
			if(x){
				session.callAccept(d.userId);
			} else {
				session.callReject(d.userId);
			}
		});
	},
	callAccept:function(targetId){
		var session = this;
		var myRTC = this.client;
		session.targetId = targetId;
		console.log('callAccept():targetId=',targetId,session.targetId);
		session.enableSelfVideo(session.client.options.mediaContraints,function(){
			var d = {
				event:'callAccept',
				data:{
					type:'video',
				}
			};
			d = session.includeBaseData(d);
			myRTC.toServer(d);
		});
	},
	callReject:function(userId){
		this.targetId = userId;
		var d = {
			event:'callReject',
			data:{}
		}
		d = this.includeBaseData(d);
		this.client.toServer(d);
	},
	onCallReject:function(d){
		$.messager.alert('info','call reject from ' + d.userId);
	},
        hangup:function(){
                var myRTC = this.client;
                var d = {
                        event:'hangup',
                        data:{
                        }
                }
        },
        onHangup:function(d){
		var d = {
			event:'hangupok',
			data:{}
		}
                this.hangupRTC();
        },
        hangupRTC:function(){
                var myRTC = this.client;
                this.pc.close();
                this.pc = null;
                var jq = $('#' + myRTC.options.localVideo);
                jq[0].srcObject = null;
                jq = $('#' + myRTC.options.remoteVideo);
                jq[0].srcObject = null;
                $.messager.alert('hint','call hanguped');
        },
	onCallAccept:function() {
		var session = this;
		var myRTC = this.client;
		session.enableSelfVideo(session.client.options.mediaContraints,function(){
			session.pc.createOffer(function(description) {
				session.pc.setLocalDescription(description, function() {
					description.type = 'offer';
					var d = {
						event:'rtc',
						data:description
					};
					d = session.includeBaseData(d);
					myRTC.toServer(d);
				}, onError);
			}, onError,myRTC.options.mediaConstraints);
		});
	},
	onRtc:function(d) {
		var session = this;
		var data = d.data;
		console.log('onRtc(),data=',data);
		var myRTC = this.client;
		switch (data.type) {
			case 'offer':
				console.log('will call onRtcOffer() ...');
				session.onRtcOffer(d);
				break;
			case 'answer':
				console.log('will call onRtcAnswer() ...');
				session.onRtcAnswer(d);
				break;
			case 'candidate':
				console.log('will call onRtcCandidate() ...');
				session.onRtcCandidate(d);
				break;
			default:
				console.log('unknowed type=',data.type);
				break;
		}
	},
	onRtcOffer:function(d) {
		var data = d.data;
		var myRTC = this.client;
		var session = this;
		console.log('onRtcOffer():d = ',data);
		session.pc.setRemoteDescription(new RTCSessionDescription(data), function() {
			session.pc.createAnswer(function(description) {
				session.pc.setLocalDescription(new RTCSessionDescription(description), 
						function() {
					description.type = 'answer';
					description.toId = data.fromId;
					console.log('sending answer');
					var d = {
						event:'rtc',
						data:description
					}
					d = session.includeBaseData(d);
					myRTC.toServer(d);
					}, onError);
			}, onError, myRTC.options.mediaConstraints);
		}, onError);
	},
	onRtcAnswer:function(d) {
		var session = this;
		var data = d.data;
		console.log('received answer');
		myRTC = this.client;
		this.pc.setRemoteDescription(new RTCSessionDescription(data), function() {
			console.log('onRtcAnswer(),x=');
		}, onError);
	},
	onRtcCandidate:function(d) {
		var candidate = new RTCIceCandidate({
			sdpMLineIndex:d.data.label,
			candidate:d.data.candidate
		});
		this.pc.addIceCandidate(candidate);
		console.log('**********',d);
	}
}
