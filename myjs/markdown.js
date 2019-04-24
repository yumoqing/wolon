/*
{
	md_url:'igengreggr',	// markdown text from url 
	md_text:'this is a text body',
	klass:'mdklass c
}
*/
(function($){
	function onclick(e){
		var url = $(e.target).attr('href');
		console.log('url=',url);
		if (url.startsWith('https://') || url.startsWith('http://')){
			window.open(url);
		} else {
			console.log('ghjkl;');
			var t=$(e.target).parents('.markdown');
			remoteWidget(url,{},t,'replace',showError);
		}
		return false;
	}
	function build(target,text){
		var cont = $('<div class="md_body"></div>')
			.css('width','100%')
			.css('height','100%')
			.appendTo($(target));
		var converter = new showdown.Converter()
		var txt = converter.makeHtml(text);
		$(txt).appendTo(cont);
		$('a',$(target)).bind('click',onclick);
	};
	function init(target,options) {
		console.log('init()...');
		$(target).addClass('markdown');
		if (options.klass)
			$(target).addClass(options.klass);
		console.log('init().1.');

		$.data(target,'markdown',{options:options});
		console.log('init().2.');
		if(options.md_url){
			console.log('init().3.');
			remoteCall(options.md_url,'GET','text',{},function(data){
					console.log('data=',data,'url=',options.md_url);
					build(target,data);
				},
				function(e){
					$.messager,alert('error',e);
				}
			);
		} else if (options.md_text) {
			console.log('init().4.');
			build(target,options.md_text);
		}
		console.log('init().5.');
	};
	$.fn.markdown = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.markdown.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'markdown');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.markdown.defaults, $.fn.markdown.parseOptions(this), options);
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.markdown.methods = {
		options:function(jq){
			var state = $.data(jq[0],'markdown');
			return state.options;
		}
	};
	$.fn.markdown.parseOptions = function(target){
		var r = $.extend({}, $.parser.parseOptions(target, ['valuewidth','valueheight','class']));
		return r;
	};
	$.fn.markdown.defaults = $.extend({}, $.fn.combo.defaults, {
	});
	
	$.parser.plugins.push("markdown");

})(jQuery);
