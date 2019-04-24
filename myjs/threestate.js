/*
three status object
{
	"objtype":"atom",
	"objtype":"complex",
	"is_atom":true,
	"show_mode":"normal",
	"show_mode":"tiny",
	"objid":"id001",
	"objtitle":"the object",
	"defaultvalue":"2",
	"valuetmpl":"[{=value}]",
	"state":"normal",
}
*/

(function($){
	/*
	var sock = new SockJS('http://localhost:9000');
	sock.onmessage = function(e){
		var data =  str.parseJSON(e.data);
		var jq = $('.threestate-' + data.objid);
		if (jq.length==0){
			return;
		}
		jq.threestate('update',data.data);
	};
	*/
	function stateImgUrl(objtype,state){
		return './stateimg.dspy?objtype=' + (objtype||'file') + '&state=' + (state||'normal');
	}
	function buildNormalThreeState(target,options){
		$(target).addClass('threestate');
		$(target).addClass('threestate-' + options.objid);
		if(options.objtype=='complex'){
			$(target).addClass('clickable');
			$(target).on('click',function(){
					if(options.onClick){
						options.onClick(options.objid);
					}
					$.messager.alert(options.objid,options.objtitle);
				}
			);
		}
		$(target).empty();
		var valuehtml = '';
		var imghtml = '';
		var titlehtml = ''
		if (options.objtitle){
			titlehtml = '<span class="threestate-Title">' + options.objtitle + '</span>';
		}
		var state = options.state||'normal';
		imghtml = '<span class="threestate-imgcontainer"><img class="threestate-Img" src="'+stateImgUrl(options.objtype,options.state) + '" /></span>'
		var s = '<div class="threestate-head">' + imghtml + titlehtml + '</div>';
		$(s).appendTo($(target));
		
		if(options.value){
			valuehtml = '<div class="threestate-Value"></div>'
		}
		var body = $('<div class="threestate-body"></div>').appendTo($(target));
		$(valuehtml).appendTo($(body))
					.addClass('threestate-Value-' + options.state);
		$.data(target,'threestate',{options:options});
		return target;
	}
	function buildTinyThreeState(target,options){
		$(target).addClass('threestate-tiny');
		$(target).addClass('threestate-' + options.objid);
		if(options.objtype=='complex'){
			$(target).addClass('clickable');
			$(target).on('click',function(){
					if(options.onClick){
						options.onClick(options.objid);
					}
				}
			);
		}
		$(target).empty();
		var valuehtml = '';
		var imghtml = '';
		var titlehtml = ''
		if (options.objtitle){
			titlehtml = '<span class="threestate-Title">' + options.objtitle + '</span>';
		}
		var state = options.state||'normal';
		imghtml = '<span class="threestate-imgcontainer"><img class="threestate-Img" src="'+stateImgUrl(options.objtype,options.state) + '" />kekek</span>'
		$(imghtml).appendTo($(target));
		$(titlehtml).appendTo($(target));
		$.data(target,'threestate',{options:options});
		return target;
	}
	function init(target,options) {
		// console.log('init(),options=',options,'target=',target);
		if (options.show_mode == 'tiny'){
			return buildTinyThreeState(target,options);
		}
		return buildNormalThreeState(target,options);
	};
	$.fn.threestate = function(options, param){
		var target = this;
		var ret = [];
		if (typeof options == 'string'){
			var method = $.fn.threestate.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		// console.log('threestate(),options=',options,'target=',target);
		for (var i=0;i<target.length;i++){
			var t = target[i];
			var state = $.data(t, 'threestate');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.threestate.defaults, $.fn.threestate.parseOptions(t), options);
				init(t,opts);
				var run = function(options){
					if (isVisible($(t))){
						var d = {objid:options.objid};
						/*
						sock.send(JSON.stringify(d));
						*/
						remoteCall(options.url,'GET','json',d,function(d){
								$(t).threestate('update',d);
							},showError);
					}
				}
				var c = function(opts){
					return function(){
						run(opts);
					}
				}
				if (options.refreshtime){
					setInterval(c(options),options.refreshtime);
				}
			}
			ret.push(t);
		}
		return ret;
	};
	$.fn.threestate.methods = {
		options: function(jq){
			return $.data(jq[0], 'threestate').options;
		},
		update:function(jq,data){
			var target = jq[0];
			var state = $.data(jq[0], 'threestate');
			if (!state){
				return;
			}
			// console.log('target=',target,state);
			if (!isVisible(jq)) {
				return;
			}
			var options = $.data(jq[0], 'threestate').options;
			var v = $('.threestate-Value',jq);
			if (v.length>0){
				v.html(strTmplRender(options.valuetmpl,data));
				v.removeClass('threestate-Value-normal');
				v.removeClass('threestate-Value-warning');
				v.removeClass('threestate-Value-error');
				v.addClass('threestate-Value-' + data.state);
			}
			var v = $('.threestate-Img',jq);
			if(v.length==0){
				return;
			}
			v.attr('src',stateImgUrl(options.objtype,data.state));
			$.parser.parse(jq);
		}
	};
	$.fn.threestate.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height']));
	};
	$.fn.threestate.defaults = {
	};
	
	$.parser.plugins.push("threestate");

})(jQuery);