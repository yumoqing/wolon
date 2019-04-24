/*
editorpad
{
	id:
	title:可选
	items:[	
		{
			name:name,
			label:label,
			remoteWidgets:[]
		},
	] 每项一页

}
$("#text").bind("keyPress",function(event){ 
var k = event.which; 
String.fromCharCode(k)
}); 

*/

(function($){
	var debug=console.log;
	var points = [];
	function init(target,options) {
		$(target).addClass('editorpad');
		var s='
		<script type="text/javascript" src="/ueditor/ueditor.config.js"></script>
		<script type="text/javascript" src="/ueditor/ueditor.all.min.js"></script>		
		<textarea id="{{=it.id}}" name="{{=it.name}}" cols="{{=it.cols||80}}" row="{{=it.row||30}}" style="white-space:nowrap; overflow:scroll;width:{{=it.width||\'100%\'}};height:{{=it.height||\'100%\'}};background:{{=it.background||\'#444444\'}};color:{{=it.color||\'#dddddd\'}}">
		</textarea>';
		$(tmplRenders(s,options)).appendTo($(target));
		$('#' + options.id).bind('keyPress'),function(event){
			
		};
		if (options.onChange){
			$('#' + options.id).on('onchange',options.onChange);
		}
		return $(target);
	};
	function initPanels(target){
		var data = $.data(target, 'editorpad');
		debug('initPanels(),data=',data);
		var obj = $(target);
		var pageList = [];
		obj.empty();
		for (var i=0;i<data.options.items.length;i++){
			var o = $('<div></div>').appendTo(obj);
			var opt = {
				width:'100%',
				height:'100%',
				tools:[
					{
						iconCls:'icon-previous',
						handler:function(e){
							$(target).editorpad('previous');
						}
					},'-',{
						iconCls:'icon-next',
						handler:function(e){
							$(target).editorpad('next');
						}
					},
					'-'
				],
				closed:true
			};
			if (data.options.items[i].label){
				opt.title = data.options.items[i].label;
			}
			if(data.options.items[i].icon){
				opt.iconCls = data.options.items[i].icon;
			}
			o.panel(opt);
			if (data.options.items[i].remoteWidgets){
				remoteWidgets(data.options.items[i].remoteWidgets,
				{},
				o.panel('body'),
				'replace',function(e){$.messager.alert(e);}
				);
			}
			if (i==0){
				o.panel('open');
			}
			pageList.push({name:data.options.items[i].name,obj:o});
		}
		data.pagesObjects = pageList;
		data.currentPage = 0;
		$.data(target, 'editorpad',data);
	}
	$.fn.editorpad = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.editorpad.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			debug('construction',this);
			var state = $.data(this, 'editorpad');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this, 'editorpad', {
					options: objExt({}, $.fn.editorpad.defaults, $.fn.editorpad.parseOptions(this), options),
					obj: init(this)
				});
				initPanels(this);
				
			}
		});
	};
	 
	$.fn.editorpad.methods = {
		previous:function(jq){
			debug('previous',jq);
			var data = $.data(jq[0], 'editorpad');
			debug('previous',data);
			var oldpageid = data.currentPage;
			if (data.currentPage<1){
				return;
			}
			var newpageid = oldpageid - 1;
			if (newpageid < 0){
				newpageid = data.pagesObjects.length - 1;
			}
			data.pagesObjects[oldpageid].obj.panel('close');
			data.pagesObjects[newpageid].obj.panel('open');
			data.currentPage = newpageid;
			$.data(this, 'editorpad',data);
		},
		next:function(jq){
			debug('previous',jq);
			var data = $.data(jq[0], 'editorpad');
			debug('previous',data);
			var oldpageid = data.currentPage;
			if (data.currentPage>= data.pagesObjects.length - 1){
				return;
			}
			var newpageid = oldpageid + 1;
			if (newpageid >= data.pagesObjects.length){
				newpageid = 0;
			}
			data.pagesObjects[oldpageid].obj.panel('close');
			data.pagesObjects[newpageid].obj.panel('open');
			data.currentPage = newpageid;
			$.data(this, 'editorpad',data);
		},
		select:function(jq,name){
			debug('select',jq,name);
			var data = $.data(jq[0], 'editorpad');
			debug('select',data);
			for (var i=0;i<data.pagesObjects.length;i++){
				if (pagesObjects[i].name == name){
					data.pagesObjects[oldpageid].obj.panel('close');
					data.currentPage = i;
					data.pagesObjects[data.currentPage].obj.panel('open');
				}
			}
			data.currentPage = newpageid;
			$.data(this, 'editorpad',data);
		},
		options: function(jq){
			return $.data(jq[0], 'editorpad').options;
		},
	};
	$.fn.editorpad.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.editorpad.defaults = {
	};
	
	$.parser.plugins.push("editorpad");

})(jQuery);