/*
options={
	min_width:int value,
	inline:false,	 // 图标和文字在一行
	tools_url:	// 从后台获取tools列表
	params:		// tools_url 需要的参数
	imgsize:	// 一个数值，img高和宽大小
	leftimg_url	// 向左的图片
	rightimg_url	// 向右的图片
	height:		// toolbar height
	handler		// 缺省的处理函数
	klass		// css class optional
	tools:[
		{
		img_url:'url',  // img的url
		name:'t1',
		label:'test1', // optional
		tip:'referger'   // optional
		klass:'gggg',		// class optional		
		handler:function
		}
	]
}
*/
(function($){
	function _newAtom(target,inline,imgsize,cls,imgurl,text,tip,handler,data){
		var item = $('<div class="lbox"></div>')
			.css('cursor','pointer')
			.addClass(cls)
		var sstr = imgsize||16;
		sstr = sstr.toString() + 'px';
		var txt = '<img src="' + imgurl +
				'" width="' + sstr + '" height="' + sstr + '" />';
		var br = '';
		if (!inline){
			br = "<br>";
		}
		txt += br;
		txt += '<span>' + text + '</span>';
		$(txt).appendTo(item);
		if (tip){
			item.tooltip({
				content:i18n(tip)
			});
		}
		item.bind('click',data,handler);
		return item;
	};
	function newAtom(target,inline,imgsize,cls,imgurl,text,tip,handler,data){
		return _newAtom(target,inline,imgsize,cls,imgurl,text,tip,handler,data)
			.appendTo($(target));
	};

	function newItem(target,options,tool){
		var text = tool.name;
		if (tool.label) text = tool.label;
		text = i18n(text);
		var cls = 'tb_item';
		if (tool.klass){
			cls=cls + ' ' + tool.klass;
		}
		var item = newAtom(target,options.inline,options.imgsize,
			cls,tool.img_url,text,tool.tip,tool.handler||options.handler,tool);
		item.attr('name',tool.name);
		return item;
	};
	function setItemSize(target,min_size){
		var twidth = $(target).width();
		var jq = $('.tb_item',target);
		if(jq.length==0) return;
		var width = Math.floor(twidth / jq.length);
		if (width >= min_size){
			jq.css('width',width);
			jq.css('display','block');
			$('.tb_left',$(target)).css('display','none');
			$('.tb_right',$(target)).css('display','none');
			return;
		}
		var cnt = Math.floor(twidth / min_size) - 2;
		var state = $.data(target,'toolbar');
		for(var i=0;i<jq.length;i++){
			var v = 'none';
			if (i>=state.showStart && i<state.showStart + cnt){
				v = 'block';
			}
			$(jq[i]).css('display',v);
		}
		$('.tb_left',$(target)).css('display','block');
		$('.tb_right',$(target)).css('display','block');
		state.showCount = cnt;
		$.data(target,'toolbar',state);
	};
	function resizeFunc(e){
		var state = $.data(e.target,'toolbar');
		setItemSize(e.target,state.options.min_width);
	};
	function moveRight(e){
		var target = $(e.target).parents('.toolbar')[0];
		var state = $.data(target,'toolbar');
		var jq = $('.tb_item',$(target));
		if (state.showStart + state.showCount >= jq.length) return;
		state.showStart += 1;
		$.data(target,'toolbar',state);
		setItemSize(target,state.options.min_width);
	};
	function moveLeft(e){
		var target = $(e.target).parents('.toolbar')[0];
		var state = $.data(target,'toolbar');
		if (state.showStart==0) return;
		state.showStart -= 1;
		$.data(target,'toolbar',state);
		setItemSize(target,state.options.min_width);
	};
	function setupItems(target,options,tools){
		var jq = newAtom(target,options.inline,options.imgsize,'tb_left',
				options.leftimg_url,i18n('left'),'move left',moveLeft);
		jq.css('display','none');
		for (var i=0;i<tools.length;i++){
			newItem(target,options,tools[i]);
		}
		var jq = newAtom(target,options.inline,options.imgsize,'tb_right',
				options.rightimg_url,i18n('right'),'move right',moveRight);
		jq.css('display','none');
		setItemSize(target,options.min_width);
		$(target).bind('resize',resizeFunc);
	};
	function init(target,options) {
		$(target).addClass('toolbar')
			.css('height',options.height)
			.css('align','center')
			.css('text-align','center');
		if(options.klass){
			$(target).addClass(options.klass);
		}
		$.data(target,'toolbar',{options:options,showStart:0});
		if(options.tools_url){
			var params = {};
			if (options.params){
				params = options.param;
			}
			remoteCall(options.tools_url,
				'GET',
				'json',
				params,
				function(tools){
					setupItems(target,options,tools);
				},
				showError
			);
		} else {
			setupItems(target,options,options.tools);
		}
	};
	$.fn.toolbar = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.toolbar.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var opts= objExt({}, $.fn.toolbar.defaults, $.fn.toolbar.parseOptions(this), options);
			init(this,opts);
			$.data(this,'toolbar',{options:opts,showStart:0});
				
		});
	};
	 
	$.fn.toolbar.methods = {
		options:function(jq){
			var target = jq[0];
			return $.data(target,'toolbar').options;
		},
		add:function(jq,tool){
			var target = jq[0];
			var state = $.data(target,'toolbar');
			var text = tool.name;
			if (tool.label) text = tool.label;
			text = i18n(text);
			var cls = 'tb_item';
			if (tool.klass){
				cls=cls + ' ' + tool.klass;
			}
			var item = _newAtom(target,state.options.inline,state.options.imgsize,
				cls,tool.img_url,text,tool.tip,tool.handler||state.options.handler,tool);
			item.attr('name',tool.name);
			$('.tb_right').before(item);
		},
		delete:function(jq,name){
			$('.tb_item[name="' + name + '"]').remove();
		}
	}
	$.fn.toolbar.parseOptions = function(target){
		var r = $.extend({}, $.parser.parseOptions(target, ['min_width','height','klass']));
		return r;
	};
	$.fn.toolbar.defaults = {
		min_width:36,
		height:34,
		imgsize:16,
		leftimg_url:'/imgs/leftarrow.png',
		rightimg_url:'/imgs/rightarrow.png'
	};
	
	$.parser.plugins.push("toolbar");

})(jQuery);
