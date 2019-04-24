/*
touch
{
	onClick:
	onMoveRight:
	onMoveLeft:
	onMoveUp:
	onMoveDown:
}


*/

(function($){
	var points = [];
	function init(target) {
		$(target).addClass('touch');
		$(target).on('touchstart',function(e){
			var po = e.originalEvent.changedTouches[0];
			points.push({x:po.pageX,y:po.pageY});
			var target = e.currentTarget;
			var data = $.data(target, 'touch');
			if (data){
				if(data.options.onTouchStart){
					data.options.onTouchStart(points);
				}
			}
		});
		$(target).on('touchmove',function(e){
			var po = e.originalEvent.changedTouches[0];
			points.push({x:po.pageX,y:po.pageY});
			var target = e.currentTarget;
			var data = $.data(target, 'touch');
			if (data){
				if(data.options.onTouchMove){
					data.options.onTouchMove(points);
				}
			}
		});
		$(target).on('touchend',function(e){
			var po = e.originalEvent.changedTouches[0];
			points.push({x:po.pageX,y:po.pageY});
			var target = e.currentTarget;
			var xpos = points[points.length-1].x - points[0].x;
			if (xpos<-2){
				$(target).touch('next');
			} else if (xpos>2){
				$(target).touch('previous');				
			}
			var data = $.data(target, 'touch');
			if (data){
				if(data.options.onTouchEnd){
					data.options.onTouchEnd(points);
				}
			}
			points = [];
		});
		return $(target);
	};
	$.fn.touch = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.touch.methods[options];
			if (method){
				return method(this, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'touch');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'touch', {
					options: objExt({}, $.fn.touch.defaults, $.fn.touch.parseOptions(this), options),
					obj: init(this)
				});
			}
		});
	};
	 
	$.fn.touch.methods = {
		previous:function(jq){
		},
		next:function(jq){
		},
		options: function(jq){
			return $.data(jq[0], 'touch').options;
		},
	};
	$.fn.touch.parseOptions = function(target){
		return {};
	};
	$.fn.touch.defaults = {
	};
	$.parser.plugins.push("touch");
})(jQuery);
