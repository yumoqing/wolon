/*
参数对象内容
url:获取数据集的url，需支持分页
page：指定获取第几页的数据，从1开始
pageSize：每页记录数
pattern：数据显示模板，使用修改版的DoT格式

返回数据格式
{
	"total":3000
	"rows":R_CONTENT_LENGTH_MISMATCH
		{},....
	]
}
说明：
	total：总记录数
	rows：指定页的记录集
	每个记录将会用pattern模板翻译成前端代码显示
*/
(function($){
	function _scroll(){
		var target = this;
		var sh = $(target).scrollTop();  // 滚动条距离顶部的高度
		var vh = $(target)[0].scrollHeight;  // 整个滚动区域高度
		var h = $(target).height();
		var k = (sh + h) /vh;
		if (k >= 0.95){
			loadPage(target);
			return;
		}
		if (k <= 0.005){
			// $(target).bufferedpanel('readprev');
			return;
		}
	};
	function loadPage(target){
		var state = $.data(target, 'bufferedpanel');
		if (state.page>0 && state.page>=state.maxpage){
			return;
		}
		state.page = state.page + 1;
		var params = state.options.params;
		params.page = state.page;
		params.rows = state.options.pageSize;
		params._ = Date.parse(new Date());
		var method = state.options.method || 'POST';
		remoteCall(state.options.url,method,'json',params,
			function(d){
				for(var i=0;i<d.rows.length;i++){
					$(strTmplRender(state.options.pattern,d.rows[i])).appendTo($(target));
					state.databuffer.push(d[i]);
				}
				state.maxpage = Math.ceil(d.total/state.options.pageSize);
				$.data(target, 'bufferedpanel',state);
				$.parser.parse($(target));
			},
			showError
		);

	};
	function loadPattern(target,callback){
		var state = $.data(target,'bufferedpanel');
		remoteCall(state.options.pattern_url,'GET','text',{},
			function(d){
				state.options.pattern = d;
				$.data(target,'bufferedpanel',state);
				if(callback)
					callback(target);
			},
			showError
		);
	};
	function init(target,options) {
		$(target).addClass('bufferedpanel');
		$(target).on('scroll',_scroll);
		return $(target);
	};
	$.fn.bufferedpanel = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.bufferedpanel.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var opts = objExt({}, $.fn.bufferedpanel.defaults, $.fn.bufferedpanel.parseOptions(this), options)
			state = $.data(this, 'bufferedpanel', {
				options: opts,
				obj: init(this,opts),
				page:0,
				maxpage:0,
				databuffer:[]
			});
			if (opts.pattern_url){
				loadPattern(this,loadPage);
			} else {
				loadPage(this);
			}
		});
	};
	 
	$.fn.bufferedpanel.methods = {
		options: function(jq){
			return $.data(jq[0], 'bufferedpanel').options;
		},
		readnext:function(jq){
			loadPage(jq[0]);
		},
		destroy:function(jq){
			var target=jq[0];
			$.data(target,'bufferedpanel',null);
			jq.empty();
		}
	};
	$.fn.bufferedpanel.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.bufferedpanel.defaults = {
		pageSize:50,
		params:{}
	};
	
	$.parser.plugins.push("bufferedpanel");

})(jQuery);
