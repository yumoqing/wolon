/*
{
	width 			datasheet宽度（字符串）
	height 			datasheet高度（字符串）
	unitwidht 		输入单位宽度（数字）
	labelwidth		输入标题宽度（数字）
	klass			用户定义的datasheet类css
	fields			输入字段描述
	fields_url		输入字段描述从url中获取
	toolbar			功能区说明
	toolbar_postion		功能区位置
	toolbar_height		功能区高度（数字）
	toolbar_url		功能区描述从url中读取
}

*/
(function($){
	function setSize(target){
		var state = $.data(target,'datasheet');
		if (typeof(state)=='undefined')
			return;
		var h1 = $(target).height();
		var t = $('.toolbar',$(target));
		var th = 0;
		if (t.length>0){
			th = t.height()
		}
		var h = h1 - th;
		var b = $('.ds-body',$(target));
		b.css('height',h);
		// console.log('datasheet--target:width=',$(target).width(),'height=',$(target).height());
		// console.log('ds-body width=',b.width(),'height=',b.height());
	};
	function onResize(e){
		// console.log('here',e.target);
		setSize(e.target);
	};
	function createMain(target,options,createToolbarf,createSheetBodyf){
		var tbcontainer = null;
		if (options.toolbar){
			var tbcontainer = $('<div class="ds-toolbar"></div>')
					.css('height',options.toolbar_height.toString()+'px'||'35px')
			;
		}
		// console.log('datasheet--target:width=',$(target).width(),'height=',$(target).height());
		var bdcontainer = $('<div class="ds-body"></div>');
		if (tbcontainer==null){
			bdcontainer.appendTo($(target));
			bdcontainer.css('height','100%');
		} else {
			if (options.toolbar_position=='north'){
				tbcontainer.appendTo($(target));
				bdcontainer.appendTo($(target));
			}else{
				bdcontainer.appendTo($(target));
				tbcontainer.appendTo($(target));
			}
			bdcontainer.css('height',($(target).height() - options.toolbar_height).toString() + 'px');
		}
		// console.log('datasheet--target:width=',$(target).width(),'height=',$(target).height());
		if (tbcontainer!=null)
			createToolbarf(tbcontainer,options);
		createSheetBodyf(bdcontainer,options);
	};
	function init(target,options) {
		function buildToolbar(jq,opts){
			if (opts.toolbar_url){
				remoteWidget(opts.toolbar_url,{},jq,'replace',showError);
			} else {
				jq.toolbar(opts.toolbar);
			}
		}
		function buildSheetBody(jq,options){
			widget_objs = {};
			var jqBD=$('<div class="datasheet-body"></div>').appendTo(jq);
			jqBD.css('width','100%');
			jqBD.css('height','100%');
			if (options.title){
				var t=$('<div class="ds_title"><span>' + options.title + '</span></div>');
				t.appendTo(jqBD);
			}
			if(options.description){
				var t=$('<div class="ds_desc"><span>' + options.description + '</span></div>');
				t.appendTo(jqBD);
			}
			function textboxBuilder(options){
				var o = $('<input type="text" />');
				o.textbox(options);
				return o;
			}
			function render(opts){
				var o = $(tmplRender('datasheet_field',opts));
				return o;
			}
			var typemapping = {
				'hidden':{
				},
				'text':{
					widget:'scripteditor',
					builder:render,
					options:{}
				},
				'str':{
					widget:'textbox',
					builder:render,
					options:{}
				},
				'date':{
					widget:'datebox',
					builder:render,
					options:{}
				},
				'bool':{
					widget:'combobox',
					builder:render,
					options:{
						textField:'label',
						valueField:'value',
						data:[
							{
								value:true,
								label:i18n('True')
							},
							{
								value:false,
								label:i18n('False')
							}
						]
					}
				},
				'number':{
					widget:'numberbox',
					builder:render,
					options:{
						precision:0
					}
				},
				'url':{
					widget:'textbox',
					builder:render,
					options:{
						icons:[
							{
								iconCls:'icon-addfile',handler: function(e){
									$(e.data.target).textbox('clear');
								}
							}
						]
					}
				},
				'code':{
					widget:'combobox',
					builder:render,
					options:{
					}
				},
				'scripteditor':{
					widget:'scripteditor',
					builder:render,
					options:{
					}
				},
				'select':{
					widget:'selectbox',
					builder:render,
					options:{
					}
				},
				'onoff':{
					widget:'onoff',
					builder:render,
					options:{
					}
				},
				'codetree':{
					widget:'combotree',
					builder:render,
					options:{
					}
				},
				'codegrid':{
					widget:'combogrid',
					builder:render,
					options:{
					}
				},
				'codetreegrid':{
					widget:'combotreegrid',
					builder:render,
					options:{
					}
				},
				'password':{
					widget:'passwordbox',
					builder:render,
					options:{
					}
				},
				'tag':{
					widget:'tagbox',
					builder:render,
					options:{
					}
				},
				'json':{
					widget:'jsoneditor',
					builder:render,
					options:{}
				},
				'records':{
					widget:'edatagrid',
					builder:render,
					options:{}
				}
			}
			function buildInput(f,input_width){
				var obj = $('<div class="lbox"></div>');
				var tsize = $(target).width();
				var tdesc = typemapping[f.iotype];
				var opts = $.extend(tdesc.options,f);
				if (f.onChange){
					opt.user_onChange = f.onChange;
				}
				opts.width = input_width + 'px';
				if (f.valueheight){
					opts.height = f.valueheight;
				}
				var wobj = null;
				if (tdesc.builder){
					delete opts.label;
					wobj = tdesc.builder(opts);
				}
				wobj.appendTo(obj);
				widget_objs[f.name] = wobj;
				return obj;
			}
			function unitdiv(f){
				var obj = $('<div class="lbox datasheet-unit"></div>');
				obj.attr('fieldname',f.name);
				var ucnt = f.unitcnt || 1;
				obj.css('width',options.unitwidth*ucnt);
				var text = f.name;
				if (f.label) text = i18n(f.label);
				$('<div class="lbox" ></div>')
					.text(text+':')
					.css('text-align','right')
					.css('width',options.labelwidth)
					.appendTo(obj);
				return obj
			}
			function buildFields(fields){
				var state = $.data(target,'datasheet');
				state.fields = fields;
				$.data(target,'datasheet',state);
				var d = state.data;
				var objs = [];
				for (var i=0;i<fields.length;i++){
					var f = objExt({},fields[i]);
					if (f.hasOwnProperty('defaultvalue')){
						f.value = f.defaultvalue;
					}
					if (d && d.hasOwnProperty(f.name)){
						f.value = d[f.name];
					}
					if (options.readonly){
						f.readonly = true;
					}
					if (f.iotype=='hidden') continue;
					var obj = unitdiv(f);
					var uwidth = options.unitwidth;
					var ucnt = f.unitcnt||1;
					var iwidth = Math.floor(uwidth * ucnt - options.labelwidth);
					var iobj = buildInput(f,iwidth);
					// iobj.css('width',iwidth);
					iobj.appendTo(obj);
					obj.appendTo($(jqBD));
				}
				var state = $.data(target,'datasheet');
				state.inObjs = widget_objs;
				$.data(target,'datasheet',state);
				$.parser.parse($(target));
			}
			function initTarget(d){
				state = $.data(target, 'datasheet', {
						options: options,
						data:d,
						typemapping:typemapping
				});
				if (options.fields_url){
					remoteCall(options.fields_url,'GET','json',{},
						function(d){
							// console.log('fields_url return=',options.fields_url,d);
							buildFields(d);
						},showError);
				} else {
					buildFields(options.fields);
				}
				setSize(target);
			}
			if (options.data_url){
				remoteCall(options.data_url,'GET','json',{},initTarget,function(e){
					// console.log(e);
					showError(e);
				});
			} else {
				initTarget({});
			}
		}
		// console.log('datasheet--target:width=',$(target).width(),'height=',$(target).height());
		$.data(target,'datasheet',{options:options});
		$(target).empty();
		$(target).addClass('datasheet');
		$(target).css('align','center')
			.css('text-align','center')
			//.css('width',options.width||'100%')
			//.css('height','100%')
			;
		if($(target).height()==0){
			$(target).css('height','100%');
		}
		if($(target).width()==0){
			$(target).css('width','100%');
		}
		// console.log('datasheet--target:width=',$(target).width(),'height=',$(target).height());
		createMain(target,options,buildToolbar,buildSheetBody);
		$(target).bind('resize',onResize);
	}
	$.fn.datasheet = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.datasheet.methods[options];
			if (method){
				return method(this, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'datasheet');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.datasheet.defaults, $.fn.datasheet.parseOptions(this), options);
				
				init(this,opts);
				
			}
		});
	};
	 
	$.fn.datasheet.methods = {
		resize:function(jq){
			setSize(jq[0]);
		},
		options: function(jq){
			return $.data(jq[0], 'datasheet').options;
		},
		valueChanged:function(jq,obj,nv){
			var fo = $(obj).parents('.datasheet-unit');
			var d={name:fo.attr('fieldname'),value:nv};
			var state = $.data(jq[0],'datasheet');
			state.data[d.name] = d.value;
			$.data(jq[0],'datasheet',state);
			if (obj.user_onChange){
				if (obj.user_onChange.callable()){
					user_onChange.call(o,d);
				}
				else{
					callee = eval(obj.user_onChange);
					callee.call(o,d);
				}
			}
		},
		callFieldFunction:function(jq,params){
			var name = params.name;
			var fname = params.fname;
			var args = params.args;
			
			var state = $.data(jq[0],'datasheet');
			var wobj = state.inObjs[name];
			var f = null;
			for (var i=0;i<state.fields.length;i++){
				f = state.fields[i];
				if (name==f.name) break;
			}
			if (f==null) return;
			var widget = state.typemapping[f.iotype].widget;
			var cmd = 'wobj.' + widget + '(fname,args)';
			return eval(cmd);
		},
		disable:function(jq,name){
			var params = {
				name:name,
				fname:'disable',
				args:null
			}
			return $(jq[0]).datasheet('callFieldFunction',params);
		},
		enable:function(jq,name){
			var params = {
				name:name,
				fname:'enable',
				args:null
			}
			return $(jq[0]).datasheet('callFieldFunction',params);
		},
		setValue:function(jq,d){
			var state = $.data(jq[0],'datasheet');
			state.data = d;
			$.data(jq[0],'datasheet',state);
			for (var i=0;i<state.fields.length;i++){
				var f = state.fields[i];
				if (d.hasOwnProperty(f.name)&&f.iotype!='hidden'){
					var obj = state.inObjs[f.name];
					var cmd='obj.' + state.typemapping[f.iotype].widget + '("setValue",d[f.name])';
					eval(cmd);
				}
			}
		},
		validate:function(jq){
			var state = $.data(jq[0],'datasheet');
			for (var i=0;i<state.fields.length;i++){
				var f =  state.fields[i];
				if (f.iotype=='hidden') continue;
				var obj = state.inObjs[f.name];
				var cmd='obj.' + state.typemapping[f.iotype].widget + '("getValue")';
				r = eval(cmd);
				if (f.required && (!r||r=='')){
					var wobj = state.inObjs[f.name];
					wobj.focus();
					return false;
				}
				
			}
			return true;
		},
		getValue:function(jq){
			var state = $.data(jq[0],'datasheet');
			ret = {}
			for (var i=0;i<state.fields.length;i++){
				var f = state.fields[i];
				if (f.iotype!='hidden'){
					var obj = state.inObjs[f.name];
					var cmd='obj.' + state.typemapping[f.iotype].widget + '("getValue")';
					ret[f.name] = eval(cmd);
				} else {
					ret[f.name] = f.value||f.defaultvalue;
				}
			}
			state.data = $.extend(state.data,ret);
			$.data(jq[0],'datasheet',state);
			return state.data;
		},
	};
	$.fn.datasheet.parseOptions = function(target){
		return {};
	};
	$.fn.datasheet.defaults = {
		toolbar_height:36,
		toolbar_position:'north',
		labelwidth:90,
		unitwidth:240,
		width:'100%',
		height:'100%'
	};
	
	$.parser.plugins.push("datasheet");

})(jQuery);

