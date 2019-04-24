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
		/*
		var opt = {
			width:'100%',
			height:'100%',
			closed:false
		};
		if (panelOpt.label){
			opt.title = panelOpt.label;
		} 
		if(panelOpt.icon){
			opt.iconCls = panelOpt.icon;
		}
		if (!panelOpt.label&&!panelOpt.icon){
			opt.noheader = true;
		}
		*/
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
		$(target).addClass('popuppanel');
		var item = getTheOne(options);
		if (!isNull(item)){
			createPanel(target,item);
			state = $.data(target, 'popuppanel', {
					options: options,
					name:item.name,
			});
		}
	};
	$.fn.popuppanel = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.popuppanel.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'popuppanel');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.popuppanel.defaults, $.fn.popuppanel.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.popuppanel.methods = {
		refresh:function(jq){
			debug('here1');
			
			var target = jq[0];
			var data = $.data(target, 'popuppanel');
			var oldname = data.name;
			debug('here2');
			var item = getTheOne(data.options);
			if (isNull(item)){
				debug('here is null');
				return;
			}
			if (oldname == item.name){
				debug('here item equal');
				return;
			}
			/*
			$(target).panel('destroy');
			*/
			debug('here3');
			createPanel(target,item);
			debug('here4');
			state = $.data(target, 'popuppanel', {
					options: data.options,
					name:item.name,
			});
			debug('here5');
			
		},
		options: function(jq){
			return $.data(jq[0], 'popuppanel').options;
		},
	};
	$.fn.popuppanel.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.popuppanel.defaults = {
	};
	
	$.parser.plugins.push("popuppanel");

})(jQuery);