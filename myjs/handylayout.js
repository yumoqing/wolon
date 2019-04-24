(function($){
	function init(target,options) {
		var elems = [];
		
	}
	$.fn.handylayout = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.handylayout.methods[options];
			if (method){
				return method(this, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'handylayout');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.handylayout.defaults, $.fn.handylayout.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.handylayout.methods = {
		options: function(jq){
			return $.data(jq[0], 'handylayout').options;
		}
	};
	$.fn.handylayout.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.handylayout.defaults = {
		labelwidth:90,
		unitwidth:240
	};
	
	$.parser.plugins.push("handylayout");

})(jQuery);