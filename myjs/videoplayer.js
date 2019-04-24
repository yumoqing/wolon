(function($){
	function getNextVideoUrl(url){
		var target=this;
		var jqData=$.data(target,'videoplayer');
		var video = $(this).children('video')[0];
		var data = {};
		if (jqData.cur_videourl){
			data.lasturl = jqData.cur_videourl;
		}
		remoteCall(jqData.options.url,'GET','json',data,
			function(d){
				if(isError(d)){
					showError(d);
					return;
				} else {
					video.src = d.url;
					video.load();
					if (video.paused) {
						video.play();
					}
					$.data(target,'videoplayer').cur_videourl = d.url;
				}
			},
			function(e){
				$.messager.alert('error',e);
			}
		);
	}
	function init(target,options) {
		var id = getId('video');
		var s = '<video id="' + id + 
			'" controls style="border: 1px solid blue;" height="240" width="320" title="video element">HTML5 Video is required for this example</video>';
		console.log('s=',s);
		var v = $(s);
		$.data(target,'videoplayer',{options:options,playerid:id});
		$(target).empty();
		v.appendTo($(target));
		var video = $(target).children('video')[0];
		console.log('video=',video);
		if (options.url){
			getNextVideoUrl.call(target,options.url);
		}
		video.onended = function(s){
			if (options.onEnded){
				options.onEnded.call(target,s);
			}
			if (options.url){
				getNextVideoUrl.call(target,options.url);
			}
		};
		video.onerror = function(e){
			if(options.onError){
				options.onError.call(target,e);
			}
			if (options.nextUrl){
				getNextVideoUrl.call(target,options.url);
			}
		}
	};
	$.fn.videoplayer = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.videoplayer.methods[options];
			if (method){
				return method(this, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'videoplayer');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.videoplayer.defaults, $.fn.videoplayer.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.videoplayer.methods = {
		options: function(jq){
			return $.data(jq[0], 'videoplayer').options;
		},
		destroy:function(jq){
			jq.remove();
			//$.removeData(jq[0],'videoplayer');
		}
	};
	$.fn.videoplayer.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.videoplayer.defaults = {
	};
	
	$.parser.plugins.push("videoplayer");

})(jQuery);