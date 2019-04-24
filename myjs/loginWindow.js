/*
{
}
*/
(function($){
	function init(target,options) {
		$(target).window({
			title:i18n('please login ...'),
			width:"450px",
			height:"300px"
		});
		$(target).addClass('loginwindow');
		$.parser.parse($(target));
		var b = $(target).window('body');
		console.log('loginwindow size=',b.width(),b.height(),options);
		b.datasheet(options);
		$(target).window('close');
		return $(target);
	};
	$.fn.loginwindow = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.loginwindow.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var target = this;
			debug('construction',this);
			var state = $.data(this, 'loginwindow');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.loginwindow.defaults, $.fn.loginwindow.parseOptions(this), options);
				init(this,opts);
				var state = {options:options}
				$.data(target,'loginwindow',state);
				console.log('state=',state,$.data(target,'loginwindow'));
			}
		});
	};
	 
	$.fn.loginwindow.methods = objExt({
		},
		$.fn.window.methods,
		{
			dologin:function(jq,callargs){
				var target = jq[0];
				var state = $.data(target,'loginwindow');
				state.callargs = callargs;
				$.data(target,'loginwindow',state);
				jq.window('open');
			},
			checkUser:function(jq,authdata){
				var target = jq[0];
				var state = $.data(target,'loginwindow');
				var callargs = state.callargs;
				var headers = [
					[
						'Authorization',authdata
					]
				]
				remoteCall(callargs[0],callargs[1],callargs[2],callargs[3],callargs[4],callargs[5],headers);
				$(target).window('close');
			}
				
		}
	);
	$.fn.loginwindow.parseOptions = function(target){
		var r = $.extend({}, $.parser.parseOptions(target, []));
		return r;
	};
	$.fn.loginwindow.defaults = {
	};
	
	$.parser.plugins.push("loginwindow");

})(jQuery);