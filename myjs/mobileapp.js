/*
{
	backimg_url:"url",
	url:'url',
}
*/
(function($){
	function pagebody(target){
		return $('<div class="appbody"></div>')
			.css('width','100%')
			.css('height','100%')
			.appendTo($(target))
			;
	};
	function backbutton(target,imgurl){
		var jq = $('<div class="appback"></div>');
		jq.appendTo($(target));
		var zi = $(target).css('z-index');
		if (typeof(zi)=='undefined'){
			zi = 5000;
		}
		jq.css('z-index',zi + 1000);
		jq.css('display','none');
		jq.css('cursor','pointer');
		jq.css('position','absolute');
		jq.css('top','1px');
		jq.css('left','1px');
		var txt = '<img width="18px" height="18px" src="' + imgurl + '" />';
		$(txt).appendTo(jq);
		jq.bind('click',backfunc);
		return jq;
	};
	function backfunc(e){
		$.messager.show({title:'hint',msg:'back callback() called'});
		var ma = $(this).parents('.mobileapp')
		console.log('mobileapp=',ma);
		ma.mobileapp('goback');
	};
	function loadPage(target,url,params){
		var state = $.data(target,'mobileapp');
		var jq = $('.appbody',$(target));
		var existPages = $('.apppage',jq)
		if (existPages.length>0){
			existPages.css('display','none');
			$('.appback').css('display','block');
		}
		var c = $('<div class="apppage"></div>')
			.css('width','100%')
			.css('height','100%')
			.appendTo(jq);
		remoteWidget(url,params,c,'replace',showError);
	};
	function init(target,options) {
		$(target).addClass('mobileapp');
		$(target).empty()
		pagebody(target);
		backbutton(target,options.backimg_url);
		$.data(target,'mobileapp',{options:options,curStep:0});
		loadPage(target,options.url);
		$.data(target,'mobileapp',{options:options});
		return target;
	};
	$.fn.mobileapp = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.mobileapp.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'mobileapp');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.mobileapp.defaults, $.fn.mobileapp.parseOptions(this), options);
				init(this,opts);
			}
		});
	};
	 
	$.fn.mobileapp.methods = {
		options: function(jq){
			return $.data(jq[0], 'mobileapp').options;
		},
		goback:function(jq){
			var pages = $('.apppage',jq);
			if(pages.length>1){
				cp = pages.length - 1;
				op = cp - 1;
				var p = pages[cp];
				$(pages[cp]).css('display','none');
				$(pages[op]).css('display','block');
				pages.splice(pages[cp],1);
				p.remove();
				if (pages.length<2){
					$('.appback',jq).css('display','none');
				}
			}
		},
		/* data has follow format
			{
				url:'ffff',
				params:{
				}
			}
		*/
		newpage:function(jq,data){
			var target = jq[0];
			loadPage(jq[0],data.url,data.params);
		},
		destory:function(jq){
			$.data(jq,'mobileapp',null);
			jq.remove();
		},
		activate:function(jq){
			jq.css('display','block');
			if($('.apppage',jq).length>1){
				$('.appback',jq).css('display','block');
			}
		},
		unactivate:function(jq){
			$('.appback',jq).css('display','none');
			jq.css('display','none');
		}
	};
	$.fn.mobileapp.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.mobileapp.defaults = {
		backimg_url:'/imgs/leftarrow.png'
	};
	
	$.parser.plugins.push("mobileapp");

})(jQuery);
