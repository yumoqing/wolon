/*
pagingcontext
{
	id:
	title:可选
	klass:css类，可选
	items:[	
		{
			name:name,项目名称，必须有
			label:label,项目显示名称，可选
			onBeforeNext:执行next之前的事件，可选
			onBeforePrevious:执行prevous之前的事件，可选
			onAfterNext:执行完next之后的事件，可选
			onAfterPrevious:执行完previous之后的事件，可选
			remoteWidgets:
			params:remoteWidgets的参数，可选
		},
	] 每项一页

}


*/

(function($){
	var debug=console.log;
	var points = [];
	function onResize(e){
		var target = e.target;
		var data=$.data(target,'pagingcontext');
		if (typeof(data)=='undefined'){
			var t = $(target).parents('.pagingcontext');
			data = $.data(t[0],'pagingcontext');
			target = t[0];
		}
		$(target).pagingcontext('resize',{width:$(target).width(),height:$(target).height()});
		return false;
	};
	function setTitle(jq,pid){
		var target = jq[0];
		var data = $.data(target,'pagingcontext');
		var opts = data.panel.panel('options');
		opts.title = data.options.items[pid].label;
		if(data.options.items[pid].icon){
			opt.iconCls = data.options.items[pid].icon;
		}
		data.panel.panel(opts);
	}
	function cpage(jq,pid){
		var target = jq[0];
		var data = $.data(target,'pagingcontext');
		for (var i=data.pages.length;i<pid;i++){
			cpage(jq,i);
		}
		setTitle(jq,pid);
		var p = $('<div class="pc_page"></div>')
					.css('width','100%')
					.css('height','100%')
					.css('display','block')
					.appendTo(data.panel.panel('body'))
					;
		data.pages.push(p);
		$.data(target,'pagingcontext',data);
		remoteWidgets(data.options.items[pid].remoteWidgets,
			data.options.items[pid].params||{},
			p,
			'replace',
			showError
		);
	};
	function init(target,options) {
		$(target).empty();
		$(target).addClass('pagingcontext');
		if (options.klass){
			$(target).addClass(options.klass);
		}
		$(target).bind('resize',onResize);
		var obj = $(target);
		var o = $('<div></div>')
			.css('width',options.width||obj.width())
			.css('height',options.height||obj.height())
			.appendTo(obj);
		$.data(target,'pagingcontext',{options:options,pages:[],currentPage:0,panel:o});
		var opt = {
			width:'100%',
			height:'100%',
			title:'will be replaced',
			tools:[
				{
					iconCls:'icon-previous',
					handler:function(e){
						$(target).pagingcontext('previous');
					}
				},'-',{
					iconCls:'icon-next',
					handler:function(e){
						$(target).pagingcontext('next');
					}
				},
				'-'
			],
			closed:false
		};
		o.panel(opt);
		o.on('touchstart',function(e){
			var po = e.originalEvent.changedTouches[0];
			points.push({x:po.pageX,y:po.pageY});
		});
		o.on('touchmove',function(e){
			var po = e.originalEvent.changedTouches[0];
			points.push({x:po.pageX,y:po.pageY});
		});
		o.on('touchend',function(e){
			var po = e.originalEvent.changedTouches[0];
			points.push({x:po.pageX,y:po.pageY});
			var xpos = points[points.length-1].x - points[0].x;
			var jq = $(e.currentTarget).parents('.pagingcontext');
			if (xpos<-2){
				jq.pagingcontext('next');
			} else if (xpos>2){
				jq.pagingcontext('previous');				
			}
			points = [];
		});
		cpage($(target),0);
		return $(target);
	};
	$.fn.pagingcontext = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.pagingcontext.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			options: objExt({}, $.fn.pagingcontext.defaults, $.fn.pagingcontext.parseOptions(this), options);
			try{
				init(this,options);
			} catch(e){
				console.log('e-',e);
				throw(e);
			}
		});
	};
	 
	$.fn.pagingcontext.methods = {
		show:function(jq,pageid){
			var data = $.data(jq[0],'pagingcontext');
			if (data.pages.length<=pageid){
				cpage(jq,pageid);
			}
			for (var i=0;i<data.pages.length;i++){
				data.pages[i].css('display','none');
			}
			data.pages[pageid].css('display','block');
			data.currentPage = pageid;
			$.data(jq[0],'pagingcontext',data);
		},
		previous:function(jq){
			var data = $.data(jq[0], 'pagingcontext');
			if(data.options.items[data.currentPage].onBeforePrevious){
				data.options.items[data.currentPage].onBeforePrevious.call(jq[0],{oldpage:data.currentPage});
			}
			var data = $.data(jq[0], 'pagingcontext');
			var oldpageid = data.currentPage;
			if (data.currentPage<1){
				return;
			}
			var newpageid = oldpageid - 1;
			data.currentPage = newpageid;
			jq.pagingcontext('show',data.currentPage);
			setTitle(jq,data.currentPage);
			if(data.options.items[oldpageid].onAfterPrevious){
				data.options.items[oldpageid].onAfterPrevious.call(jq[0],{oldpage:oldpageid,newpage:newpageid});
			}
			$.data(this, 'pagingcontext',data);
		},
		next:function(jq){
			var data = $.data(jq[0], 'pagingcontext');
			if(data.options.items[data.currentPage].onBeforeNext){
				data.options.items[data.currentPage].onBeforeNext.call(jq[0],{oldpage:data.currentPage});
			}
			var data = $.data(jq[0], 'pagingcontext');
			var oldpageid = data.currentPage;
			if (data.currentPage>= data.options.items.length - 1){
				return;
			}
			var newpageid = oldpageid + 1;
			data.currentPage = newpageid;
			jq.pagingcontext('show',data.currentPage);
			setTitle(jq,data.currentPage);
			if(data.options.items[oldpageid].onAfterNext){
				data.options.items[oldpageid].onAfterNext.call(jq[0],{oldpage:oldpageid,newpage:newpageid});
			}
			$.data(this, 'pagingcontext',data);
		},
		select:function(jq,name){
			debug('select',jq,name);
			var data = $.data(jq[0], 'pagingcontext');
			debug('select',data);
			for (var i=0;i<data.pages.length;i++){
				if (pages[i].name == name){
					jq.pagingcontext('show',i);
				}
			}
			data.currentPage = newpageid;
			$.data(this, 'pagingcontext',data);
		},
		options: function(jq){
			return $.data(jq[0], 'pagingcontext').options;
		},
		resize:function(jq,options){
			var data = $.data(jq[0],'pagingcontext');
			data.panel.panel('resize',options);			
		}
	};
	$.fn.pagingcontext.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.pagingcontext.defaults = {
	};
	
	$.parser.plugins.push("pagingcontext");

})(jQuery);