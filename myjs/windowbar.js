/*
window栏管理
支持一行window缩略图的管理，当显示不下时，支持左右箭头移动
当鼠标停在window缩略图上时，显示window的标题，点击缩略图（最小/还原，当前窗口），右键菜单支持关闭。
关闭关闭后窗口不存在，并从window栏中删除
提供增加窗口缩略图的功能。
{
	iconsize:32,
	direct:'width', // or 'height'
	height:XXX, // width:XXX
}
*/
(function($){
	function showCnt(target){
		var opts = $.data(target,'windowbar').options;
		var maxSize = Math.max($(target).width(),$(target).height());
		console.log('opts,maxsize,width,height,iconsize=',opts,maxSize,$(target).width(),$(target).height(),opts.iconsize);
		return Math.floor(maxSize / (opts.iconsize + 4) - 2);
	}
		
	function showWindowBar(target,mode){
		var ws = $('.windowbar-thumbnail',$(target));
		var data = $.data(target,'windowbar');
		var maxcnt = showCnt(target);
		console.log('maxcnt,curcnt=',maxcnt,ws.length);
		if (ws.length<=maxcnt){
			ws.show();
			data.left_arrow.hide();
			data.right_arrow.hide();
		} else {
			if (mode=='add'){
				var j = ws.length - 1;
				ws.hide();
				for(var i=0;i<maxcnt;i++){
					$(ws[j--]).show();
				}
				data.right_arrow.hide();
				data.left_arrow.show();
			} else if (mode='delete'){
				var cnt = 0;
				var firstShow = -1;
				for (var i=0;i<ws.length-1;i++){
					if (firstshow == -1 &&$(ws[i]).css('display')!='none'){
						firstshow = i;
					}
					if (firstshow != -1){
						if (cnt < maxcnt){
							$(ws[i]).show();
						}
						cnt ++;
					}
				}
				if (firstShow > 0){
					data.left_arrow.show();
				} else {
					data.left_arrow.hide();
				}
				if (cnt>maxcnt){
					data.right_arrow.show();
				} else {
					data.right_arrow.hide();
				}
			}
			else if (mode='left'){
				var firstshow = -1;
				var lastshow = ws[ws.length-1];
				for (var i=0;i<ws.length-1;i++){
					if (firstshow == -1 &&$(ws[i+1]).css('display')!='none'){
						$(ws[i]).show();
						firstshow = i;
					}
					if (firstshow!=-1 && $(ws[i+1]).css('display')=='none'){
						$(ws[i]).hide();
						lastshow = i;
					}
				}
				if ($(ws[ws.length-2]).css('display')!='none'){
					$(ws[ws.length-1]).hide();
				}
				if (firstshow>0){
					data.left_arrow.show();
				} else {
					data.left_arrow.hide();
				}
				if (lastshow<ws.length - 1){
					data.right_arrow.show();
				} else {
					data.right_arrow.hide();
				}
			} else {
				var firstshow = -1;
				var lastshow = ws[ws.length-1];
				for (var i=0;i<ws.length-1;i++){
					if (firstshow == -1 &&$(ws[i]).css('display')!='none'){
						$(ws[i]).hide();
						firstshow = i + 1;
					}
					if (firstshow!=-1 && $(ws[i+1]).css('display')=='none'){
						$(ws[i+1]).show();
						lastshow = i+1;
					}
				}
				if (firstshow>0){
					data.left_arrow.show();
				} else {
					data.left_arrow.hide();
				}
				if (lastshow<ws.length - 1){
					data.right_arrow.show();
				} else {
					data.right_arrow.hide();
				}
			}
		}			
	}
	function init(target,options) {
		var name='';
		$(target).addClass('windowbar');
		if (options.direct=='width'){
			$(target).css({
				width:options.width||'100%',
				border:1,
				height:2*(options.margin||4) + options.iconsize||16
			});
		} else {
			$(target).css({
				width:2*(options.margin||4) + options.iconsize||16,
				border:1,
				height:options.height||'100%'
			});
		}
		$.parser.parse($(target));
		console.log('width,height=',$(target).width(),$(target).height());
		var left_arrow = $('<span/>').hide();
		left_arrow.addClass('leftarrow');
		left_arrow.appendTo($(target));
		left_arrow.click(function(e){
			console.log('hahah');
			$(target).windowbar('moveleft',e);
		});
		var right_arrow = $('<span/>');
		right_arrow.addClass('rightarrow').hide().appendTo($(target));
		right_arrow.click(function(e){
			console.log('hahah');
			$(target).windowbar('moveright',e);
		});
		$.data(target,'windowbar',{
			options:options,
			left_arrow:left_arrow,
			right_arrow:right_arrow,
			windows:[]
		});
		$(target).resize(function(){
			showWindowBar(target,'resize');
		});
	};
	$.fn.windowbar = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.windowbar.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'windowbar');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.windowbar.defaults, $.fn.windowbar.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.windowbar.methods = {
		options: function(jq){
			return $.data(jq[0], 'windowbar').options;
		},
		deleteWindow:function(jq,wobj){
			var wid = wobj.attr('w_id');
			console.log('deleteWindow,wid=',wid);
			
			$('span[w_id="' + wid + '"]',jq).remove();
			var data = $.data(jq[0],'windowbar');
			var w = null;
			console.log('1 windows=',data.windows);
			for (var i=0;i<data.windows.length;i++){
				if(wid == data.windows[i].attr('w_id')){
					w = data.windows[i];
					data.windows.splice(i,1);
					break;
				}
			}
			console.log('2 windows=',data.windows);
			/*
			if (w){
				w.window('destroy');
			}
			*/
			showWindowBar(jq[0],'add');
		},
		addWindow:function(jq,wobj){
			var data=$.data(jq[0],'windowbar');
			wobj.attr('showed',1);
			data.windows.push(wobj);
			// 现有当前窗口处理
			var oldcurrwindow=$('.windowbar-current-window',$(jq[0]));
			oldcurrwindow.removeClass('windowbar-current-window');
			// 现有当前窗口处理完毕
			// var wobj = $('div[w_id="'+wid+'"]');
			console.log('wobj=',wobj);
			var iconCls = wobj.window('options').iconCls||'windowbar-default-iconCls';
			var wli = $('<span/>').attr('w_id',wobj.attr('w_id'))
				.addClass('windowbar-thumbnail')
				.addClass(iconCls)
				.hide()
				.appendTo(jq)
				.click(function(e){
					// 简单打开和关闭window 
					var wid = $(this).attr('w_id');
					var wb = $(this).parent('.windowbar');
					var data = $.data(wb[0],'windowbar');
					console.log('windows=',data.windows);
					var w = null;
					for (var i=0;i<data.windows.length;i++){
						if (data.windows[i].attr('w_id') == wid){
							w = data.windows[i];
							break;
						}
					}
					if (w){
						console.log('window found');
						var disp=w.attr('showed');

						if (disp==1){
							w.attr('showed',0);
							w.window('minimize');
							console.log('window minimized');
						} else {
							w.attr('showed',1);
							w.window('open');
							console.log('window restored');
						}

					}
				});
			/*
			var iconbox = $('<span/>')
				.addClass(iconCls)
				.appendTo(wli);
			*/
			showWindowBar(jq[0],'add');
		},
		destroyWindow:function(jq,target){
		},
		selectWindow:function(jq,target){
		},
		moveleft:function(jq,e){
			var target = jq[0];
			showWindowBar(target,'left');
		},
		moveright:function(jq,e){
			var target = jq[0];
			showWindowBar(target,'right');
		},
		destroy:function(jq){
			jq.remove();
		}
		
	};
	$.fn.windowbar.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height']));
	};
	$.fn.windowbar.defaults = {
	};
	
	$.parser.plugins.push("windowbar");

})(jQuery);