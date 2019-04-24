(function($){
	function setupSwitchText(options){
		var txt =   '<div class="box">' +
						'<span></span>' + 
					'</div>';
		var jqObj = $(txt);
		return jqObj;
	}
	function setChecked(target,v){
		var checkbox = $('input',target);
		checkbox.css('display','none');
		if (v){
			checkbox[0].checked = true;
			$(target).addClass("onoff-on");
		} else {
			checkbox[0].checked = false;
			$(target).removeClass("onoff-on");
		}
	}
	function init(target,options) {
		$(target).addClass('onoff');
		$(target).empty()
		$('<input type="checkbox" value="" name=""/>').appendTo($(target));
		var jqObj = setupSwitchText(options);
		jqObj.appendTo($(target));
		$.data(target,'onoff',
			{
				options:options,
				readonly:options.readonly,
				'onoffobj':jqObj
			}
		);

		var checkbox = $('input',target);
		checkbox.css('display','none');
		setChecked(target,options.value);
		$.parser.parse($(target));

		jqObj[0].onclick = function(e){
			if($.data(target,'onoff').readonly) return;
			var v = true;
			var checkbox = $('input',target);
			//this.classList.toggle("onoff-on");
			if(checkbox[0].checked){
				v = false;
			}
			setChecked(target,v);
			console.log('onclick() options=',options);
			if (options.onChange){
				options.onChange.call(target,v,null);
			}
		}
	};
	$.fn.onoff = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.onoff.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'onoff');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.onoff.defaults, $.fn.onoff.parseOptions(this), options);
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.onoff.methods = {
		options: function(jq){
			return $.data(jq[0], 'onoff').options;
		},
		disable:function(jq){
			state = $.data(jq[0], 'onoff');
			state.readonly = true;
		},
		enable:function(jq){
			state = $.data(jq[0], 'onoff');
			state.readonly = false;
		},
		getValue:function(jq){
			var target = jq[0];
			var checkbox = $('input',target);
			return checkbox[0].checked;
		},
		setValue:function(jq,v){
			var target = jq[0];
			var checkbox = $('input',target);
			checkbox[0].checked = v;
		},
	};
	$.fn.onoff.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.onoff.defaults = $.extend({}, $.fn.textbox.defaults, {
		on:false
	});
	
	$.parser.plugins.push("onoff");

})(jQuery);
