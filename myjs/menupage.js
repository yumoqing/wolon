/*
带菜单的页，下面是菜单，上面是内容
{
	showwhich:'name' menu下的一个tool中的name，app启动是显示的内容
	menu:toolbar的内容，每个tool需有一个url属性，一个公共的handler
}
*/
(function($){
	function showContent(tool){
		var target = this;
		var pagebody = $('.pagebody',$(target));
		var contents = $('.pagecontent',pagebody);
		if (contents.length>0){
			contents.css('display','none');
		}
		var c = $('.pagecontent[name="' + tool.name + '"]',pagebody);
		if (c.length>0){
			c.css('display','block');
		} else {
			c = $('<div class="pagecontent"></div>');
			c.css('width','100%');
			c.css('height','100%');
			c.attr('name',tool.name);
			c.appendTo(pagebody);
			remoteWidget(tool.url,{},c,'replace',showError);
			$('a',c).bind('click',onclick);
		}
	};
	function menuhandler(e){
		var jq = $(e.target).parents('.menupage');
		if (jq.length>0){
			showContent.call(jq[0],e.data);
		}
	};
	function onclick(e){
		var a = this
		var ma = $(a).parents('.mobileapp');
		if (ma.length>0){
			var d = {
				url:a.attr('href'),
				params:{}
			}
			ma.mobileapp('newpage',d);
		}
	};
	function getMenuItemByName(toolbar,name){
		for (var i=0;i<toolbar.tools.length;i++){
			if (toolbar.tools[i].name == name)
				return toolbar.tools[i];
		}
		return null;
	};
	function menubar(target,options){
		var opts = $.extend({},options.menu);
		opts.handler = menuhandler;
		return $('<div></div>').toolbar(opts);
	};
	function onResize(e){
		var target = e.target;
		var menu = $('.toolbar',$(target));
		var pb = $('.pagebody',$(target));
		pb.css('height',$(target).height() - menu.height() - 4);
		pb.css('width',$(target).width());
	};
	function init(target,options) {
		$(target).css('width','100%')
			.css('height','100%')
			;
		$(target).addClass('menupage');
		$(target).empty();
		$.data(target,'menuapp',{options:options});
		var pb = $('<div class="pagebody"></div>');
		pb.appendTo($(target));
		var mb = menubar(target,options);
		mb.appendTo($(target));
		onResize({target:target});
		var tool = getMenuItemByName(options.menu,options.showwhich);
		showContent.call(target,tool);
		$(target).bind('resize',onResize);
		$.parser.parse($(target));
	};
	$.fn.menupage = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.menupage.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'menupage');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= $.extend({}, $.fn.menupage.defaults, $.fn.menupage.parseOptions(this), options);
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.menupage.methods = {
		options: function(jq){
			return $.data(jq[0], 'menupage').options;
		}
	};
	$.fn.menupage.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.menupage.defaults = {
		on:false
	};
	
	$.parser.plugins.push("menupage");
})(jQuery);
