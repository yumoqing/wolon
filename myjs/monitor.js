/*
一个导航栏（可换行）
	导航区域显示从用户监控根到当前监控项的tiny类型的threestate控件列表，
	点击其中的项，可重新刷新monitor控件
一个监控区域，显示所有子项监控
	点击其中一个子项（非原子项），重新刷新导航栏和监控区域
*/

(function($){
	function monitor_getdata(target,options){
		/*
		setInterval(function(){
			
		},1000);
		*/
	}
	function buildNavigator(target,options){
		var s = $('<div class="monitor-navigator">navigator</div>').appendTo($(target));
		return s;
	}
	function buildMonitorBody(target,opitons){
		var s = $('<div class="monitor-body">body</div>').appendTo($(target));
	}
	function setNavigator(target,objid){
		
	}
	function init(target,options) {
		$(target).addClass('monitor');
		$('<p>monitor</p>').appendTo($(target));
		buildNavigator(target,options);
		buildMonitorBody(target,options);
		return $(target);
	};
	$.fn.monitor = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.monitor.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'monitor');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts = objExt({}, $.fn.monitor.defaults, $.fn.monitor.parseOptions(this), options)
				console.log(opts,options);
				state = $.data(this, 'monitor', {
					options: opts,
					obj: init(this,opts)
				});
				monitor_getdata(this,options);
			}
		});
	};
	 
	$.fn.monitor.methods = {
		options: function(jq){
			return $.data(jq[0], 'monitor').options;
		},
	};
	$.fn.monitor.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.monitor.defaults = {
	};
	
	$.parser.plugins.push("monitor");

})(jQuery);