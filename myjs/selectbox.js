(function($){
	function setupSelectBoxText(target,options,data){
		$(target).empty();
		var txt = '';
		var attrs='style="height:24px;width:' + (options.width||'100px') + '"';
		if (options.readonly){
			attrs = attrs + 'disabled ';
		}
		txt = '<select ' + attrs + '>';
		for(var i=0;i<data.length;i++){
			txt += '<option value="' + data[i][options.valueField] + '"';
			if (data[i][options.valueField]==options.value){
				txt += ' selected';
			}
			txt += '>' + data[i][options.textField] + '</option>';
		}
		txt += '</select>';
		var jqObj = $(txt);
		jqObj[0].addEventListener('change',function(e){			
			if (options.onChange){
				options.onChange.call(jqObj,e.srcElement.value,null);
			}
			return ;
		});
		return jqObj;
	}
	function init(target,options) {
		$(target).addClass('selectbox');
		if(options.url){
			var params = objExt({},(options.params||{}));
			remoteCall(options.url,'GET','json',params,function(data){
					var jqObj = setupSelectBoxText(target,options,data);
					jqObj.appendTo($(target));
					$.data(target,'selectbox',
						{
							options:options,
							'selectobj':jqObj
						}
					);
				},
				function(e){
					$.messager,alert('error',e);
				}
			);
		} else if (options.data) {
			var jqObj = setupSelectBoxText(target,options,options.data);
			jqObj.appendTo($(target));
			$.data(target,'selectbox',
				{
					options:options,
					'selectobj':jqObj
				}
			);
		}
	};
	$.fn.selectbox = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.selectbox.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'selectbox');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.selectbox.defaults, $.fn.selectbox.parseOptions(this), options);
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.selectbox.methods = objExt({
		},
		$.fn.validatebox.methods,{
			reload:function(jq,url,params){
				if (typeof(params)=='undefined'){
					params = {};
				}
				var target = jq[0];
				var options = $.data(target,'selectbox').options;
				var params = objExt({},(options.params||{}),params);
				remoteCall(options.url,'GET','json',params,function(data){
						var jqObj = setupSelectBoxText(target,options,data);
						jqObj.appendTo($(target));
					},
					function(e){
						$.messager,alert('error',e);
					}
				);
			},
			setValue:function(jq,v){
				var target = jq[0];
				var state = $.data(target,'selectbox');
				state.selectobj.val(v);
			},
			getValue:function(jq){
				var target = jq[0];
				var state = $.data(target,'selectbox');
				return state.selectobj.val();
			}
		}
	);
	$.fn.selectbox.parseOptions = function(target){
		var r = $.extend({}, $.parser.parseOptions(target, ['valuewidth','valueheight','class']));
		return r;
	};
	$.fn.selectbox.defaults = $.extend({}, $.fn.combo.defaults, {
	});
	
	$.parser.plugins.push("selectbox");

})(jQuery);