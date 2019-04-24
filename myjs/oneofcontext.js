(function($){
	function getTheOne(options){
		for (var i=0;i<options.items.length;i++){
			if (options.items[i].theOne&&options.items[i].theOne()){
				return options.items[i];
			}
		}
		return null;
	}
	function createPanel(target,panelOpt){
		console.log('createPanel()',panelOpt);
		if (panelOpt.remoteWidgets){
			remoteWidgets(panelOpt.remoteWidgets,
			{},
			$(target),
			'replace',function(e){$.messager.alert(e);}
			);
		}
	}
	function init(target,options) {
		var name='';
		$(target).addClass('oneofcontext');
		var item = getTheOne(options);
		if (!isNull(item)){
			createPanel(target,item);
			state = $.data(target, 'oneofcontext', {
					options: options,
					name:item.name,
			});
		}
	};
	$.fn.oneofcontext = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.oneofcontext.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'oneofcontext');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.oneofcontext.defaults, $.fn.oneofcontext.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.oneofcontext.methods = {
		refresh:function(jq){
			var target = jq[0];
			var data = $.data(target, 'oneofcontext');
			var oldname = data.name;
			console.log('here2',data);
			var item = getTheOne(data.options);
			if (isNull(item)){
				console.log('here is null');
				return;
			}
			if (oldname == item.name){
				console.log('here item equal');
				return;
			}
			/*
			$(target).panel('destroy');
			*/
			console.log('here3',item);
			createPanel(target,item);
			console.log('here4',data.options.items);
			state = $.data(target, 'oneofcontext', {
					options: data.options,
					name:item.name,
			});
			console.log('here5');
			
		},
		options: function(jq){
			return $.data(jq[0], 'oneofcontext').options;
		},
	};
	$.fn.oneofcontext.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.oneofcontext.defaults = {
	};
	
	$.parser.plugins.push("oneofcontext");

})(jQuery);