/*
options
={
	value:vlaue of it
	defaultvalue:default value
	width:100%
	height:100%
}
*/
(function($){
	function keyhandle(target,e){
		/*
		console.log('k=',e.keyCode);
		*/
		switch (e.keyCode){
			case 9:  /* tab */
				var state = $.data(target,'scripteditor');
				var v = state.jqText.val();
				v += '\t';
				state.jqText.val(v);
				e.preventDefault();
				/*
				if (e && e.preventDefault) {
					e.preventDefault()
				} else {
					window.event.returnValue = false
				}
				*/
				break;
			case 8:  /* backspace */
			case 33: /* page up */
			case 34: /* page down */
			case 35: /* end */
			case 36: /* home */
			case 39: /* right arrow */
			case 38: /* up arrow */
			case 37: /* left arrow */
			case 40: /* down arrow */
			case 45: /* ins */
			case 46: /* del */
			case 13:
				break;
		}
	}
	function setSize(target,width,height){
		var state = $.data(target,'scripteditor');
		var jqText = state.jqText;
		var h = height - state.jqStatus.height()
		jqText.css('width',width-10);
		jqText.css('height',h-10);
	}
	function init(target,options) {
		$(target).addClass('scripteditor');
		$(target).css('width',options.width||options.valuewidth||'100%');
		$(target).css('height',options.height||options.valueheight||'100%');
		$(target).empty();
		var jqText = $('<textarea class="scripteditor-text" ></textarea>');
		jqText.appendTo($(target));
		var jqStatus = $('<div class="scripteditor-status"></div>');
		//jqStatus.appendTo($(target));
		$(target).keydown(function(e){
			keyhandle(target,e);
		});
		var editInfo={
			curline:0,
			curcol:0,
			totalline:0,
			totalchar:0,
			lines:[]
		}
		$.data(target,'scripteditor',{
			options:options,
			data:options.value?options.value:'',
			jqText:jqText,
			jqStatus:jqStatus,
		});
		$.parser.parse($(target));
		$(target).resize(function(x,y,z){
			setSize(target,$(target).width(),$(target).height());
		});
		setSize(target,$(target).width(),$(target).height());
	};
	$.fn.scripteditor = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.scripteditor.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'scripteditor');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.scripteditor.defaults, $.fn.scripteditor.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.scripteditor.methods = {
		options: function(jq){
			return $.data(jq[0], 'scripteditor').options;
		},
		setValue:function(jq,v){
			var state = $.data(jq[0],'scripteditor');
			state.jqText.val(v);
		},
		getValue:function(jq){
			var state = $.data(jq[0],'scripteditor');
			return state.jqText.val();
		}
	};
	$.fn.scripteditor.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['valuewidth','valueheight','class']));
	};
	$.fn.scripteditor.defaults = {
	};
	
	$.parser.plugins.push("scripteditor");

})(jQuery);