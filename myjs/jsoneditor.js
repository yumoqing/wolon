/*
json数据编辑器options数据格式
{
	jeurl:"/vc/vc.dspy",	
	registerTypes:[
		{
			datatype:'menu',
			allowNewAttributes:false,
			basetype:'OBJECT',
			fields:[
				{
					name:'id',
					datatype:'str',
					required:true
				},{
					name:'registerfunction',
					datatype:'str',
					required:false
				},{
					name:'submenu',
					required:true,
					datatype:'topmenus'
				}
			]
		},
		{
			datatype:'topmenus'
			basetype:'ARRAY',
			allowedTypes:[
				'topmenu'
			]
		},
		{
			datatype:'submenus',
			basetype:'ARRAY',
			allowedTypes:[
				'submenu',
				'-',
			]
		},
		{
			datatype:'submenu',
			basetype:'OBJECT',
			allowNewAttributes:false,
			fields:[
				{
					name:"name",
					required:true,
					datatype:"str"
				},{
					name:"icon",
					datatype:"str",
				},{
					name:"submenu",
					datatype:"submenu",
					required:false
				}
			]
		},
		{
			datatype:"topmenu",
			allowNewAttributes:true,
			basetype:'OBJECT',
			basetype:'ARRAY',
			fields:[
				{
					name:"menubar",
					required:true,
					datatype:"code",
					valueField:"value",
					textField:"label",
					data:[{label:'true',value:true},{label:'false',value:false}]
				},{
					name:"name",
					required:true,
					datatype:"str"
				},{
					name:"icon",
					datatype:"str"
				},{
					name:"submenu",
					datatype:"submenus",
					required:true
				}
			]			
		}
	],
	rootname:'menu',
	roottype:'menu',
}

数组options
{
	allowedTypes:[
		a,数据类型名字
		{类型定义对象
			datatype 
			...
			数据约束选项
		}
	],如果为空则可以是任意类型
	minlength,缺省为0
	maxlength,缺省为无穷大
}

*/
/*
后台返回一个json数据，此数据是用于编辑的数据。

节点数据：
id:需在树上唯一，使用guid函数生成
options：
*/

(function($){
	function getData(target){
		var je = $(target).parents('.jsoneditor');
		return je.jsoneditor('getValue');
	}
	function buildInput(node){
		node.tree_target=this;
		if (typeof(node.value)=='undefined' && typeof(node.defaultvalue)!='undefined'){
			node.value = node.defaultvalue;
		}
		if (node.datatype=='jsscript'&&node.value.startsWith('jsscript:')){
			node.value = node.value.substing(9);
		}
		ret = tmplRender('jsoneditorfield',node);
		return ret;
	}
	function menuCommand(items){
		var item = items[0];
		var node = item.data.node;
		var target = node.tree_target;
		if (item.data.typ == 'attr'){
			if ($(target).jsoneditor('findChildByName',{node:node,name:item.data.name})){
				return;
			}
			$(target).jsoneditor('addChildByName',{node:node,name:item.data.name});
		}else{
			$(target).jsoneditor('addChildByType',{node:node,name:item.data.name});
		}
		
	}
	var rf = RegisterFunction.createNew();
	rf.register('jem_command',menuCommand);
	function objectMenu(){
		var mi = [
			{
				name:"str",
				typ:"type"
			},
			{
				name:"number",
				typ:"type"
			},
			{
				name:"jsscript",
				typ:"type"
			},
			{
				name:"url",
				typ:"type"
			},
			{
				name:"date",
				typ:"type"
			},
			{
				name:"bool",
				typ:"type"
			},
			{
				name:"text",
				typ:"type"
			},
			{
				name:"ARRAY",
				typ:"type"
			},
			{
				name:"OBJECT",
				typ:"type"
			}
		];
		return mi;
	}
	function contextMenu(node){
		function build(d){
			$(tmplRender('menu',d)).appendTo('body');
			$.parser.parse($('body'));			
		}
		var target = node.tree_target;
		var data = $.data(target,'jsoneditor');
		var d = {
			id:node.id + '_menu',
			registerfunction:"jem_command",
			width:'150px',
		};
		node.menubuild = 'Y';
		if (node.datatype=='OBJECT' || node.datatype=='ARRAY'){
			d.submenu = objectMenu();
			build(d);
		}
		if (node.basetype=="OBJECT"){
			var submenu=[];
			for (var i=0;i<node.fields.length;i++){
				if (!node.fields[i].required){
					submenu.push({
						name:node.fields[i].name,
						typ:"attr"					
					});
				}
			}
			submenu.push('-');
			if(node.allowNewAttributes){
				submenu = submenu.concat(objectMenu());
			}
			d.submenu = submenu;
			build(d);
		}
		if (node.basetype=="ARRAY"){
			var submenu = [];
			if (node.allowedTypes){
				for (var i=0;i<node.allowedTypes.length;i++){
					if(Object.prototype.toString.apply(node.allowedTypes[i])==Object.prototype.toString.apply('')){
						submenu.push({
							name:node.allowedTypes[i],
							typ:"type"

						});
					}else{
						submenu.push({
							name:node.allowedTypes[i].datatype,
							typ:"type"
						});
					}
				}
			} else {
				
				submenu = objectMenu()
			}
			d.submenu = submenu;
			build(d);
		}
	}
	function validateNode(target,node){
		if($(target).jsoneditor('options').atomtypes.contains(node.datatype) && node.required && node.datatype!='bool' && !node.value){
			$(target).jsoneditor('expandTo',node.target);
			$(target).jsoneditor('select',node.target);
			$('#' + node.id + '_v').next('span').find('input').focus();
			console.log('validate failed',node);
			return false;
		}
		if (node.children){
			for (var i=0;i<node.children.length;i++){
				if(!validateNode(target,node.children[i])) return false;
			}
		}
		return true;
	}
	function nodeValue(node){
		var dt = node.datatype;
		if (node.basetype){
			dt = node.basetype
		}
		switch(dt){
			case 'str':
			case 'text':
			case 'date':
			case 'number':
			case 'url':
			case 'bool':
			case 'code':
			case 'urlcode':
				if (node.name){
					var ret = {};
					ret[node.name] = node.value;
					return ret;
				}
				return node.value;
			case 'jsscript':
				if (node.name){
					var ret = {}
					ret[node.name] = 'jsscript:' + node.value;
					return ret;
				}
				return 'jsscript:' + node.value
			case 'OBJECT':
				var v = {};
				if (!node.children){
					node.children = [];
				}
				for (var i=0;i<node.children.length;i++){
					v = objExt(v,nodeValue(node.children[i]));
				}
				if (node.name){
					var ret = {};
					ret[node.name] = v;
					return ret;
				}
				return v;
			case 'ARRAY':
				var v = [];
				if (!node.children){
					node.children = [];
				}
				for (var i=0;i<node.children.length;i++){
					v.push(nodeValue(node.children[i]));
				}
				if (node.name){
					var ret={};
					ret[node.name] = v;
					return ret;
				}
				return v;
			default:
				if (node.name){
					var ret = {};
					ret[node.name] = node.value;
					return ret;
				}
				return node.value;
		}
	}
	function getTypeByTypeName(types,tname){
		if(!types) return;
		for(var i=0;i<types.length;i++){
			if (types[i].datatype==tname){
				return types[i];
			}
		}
		return null;
	}
	function showMenu(target,node,e){
		$.parser.parse($('#' + node.id + '_menuc'));		
		options = $(target).jsoneditor('options');
		if(!node.menubuild){
			return;
		}
		$(target).tree('select', node.target);
		var d = {
			event:e,
			data:{node:node}
		}
		eval('obj_' + node.id + '_menu.setValue(d)');
	}
	function guessDatatype(types,d){
		var dtype=typeof(d);
		switch(dtype){
			case typeof(''):
				var reg = /^(\d{4})(-)(\d{2})\2(\d{2})$/; 
				if(d.match(reg)){
					return 'date';
				}
				if (d.substring(0,8) == '{{absurl'){
					return 'url';
				}
				if (d[0] == '/'||d.substring(0,2)=='./' ||d.substring(0,3)=='../'||d.substring(0,7)=='http://'||d.substring(0,8)=='https://'){
					return 'url';
				}
				if(d.indexOf("\n")!=-1){
					return 'text';
				}
				if(d.startsWith('jsscript:')){
					return 'jsscript';
				}
				return 'str';
				break;
			case typeof(1):
			case typeof(0.1):
				return 'number';
				break;
			case typeof(true):
				return 'bool';
				break;
			default:
				if(Object.prototype.toString.apply(d)==Object.prototype.toString.apply([])){
					matches_type = 'ARRAY';
					matches_cnt = 0;
					if (types){
						for(var i=0;i<types.length;i++){
							if (types[i].basetype!='ARRAY') continue;
							var matches = true;
							var cnt = 0;
							for (var j=0;j<d.length;j++){
								var dtype = guessDatatype(types,d[j]);
								if (types[i].allowedTypes.contains(dtype)){
									cnt++;
								} else {
									matches = false;
								}
							}
							if(matches){
								if (cnt>matches_cnt){
									matches_type == types[i].datatype;
									matches_cnt = cnt;
								}								
							}
						}
					}
					return matches_type;
				}
				if (Object.prototype.toString.apply(d)==Object.prototype.toString.apply({})){
					var matches_type = 'OBJECT';
					var matches_cnt = 0;
					if (types.length>0){
						for(var i=0;i<types.length;i++){
							if (types[i].basetype!='OBJECT') continue;
							var matches = true;
							var cnt = 0;
							var rcnt = 0;
							for (var j=0;j<types[i].fields.length;j++){
								if (d.hasOwnProperty(types[i].fields[j].name)){
									cnt += 1;
								} else if(types[i].fields[j].required){
									matches = false;
								}
							}
							if (matches){
								if (cnt>matches_cnt){
									matches_type = types[i].datatype;
									matches_cnt = cnt;
								}
							} else {
								console.log('miss matched type,d=',types[i],d);
							}
						}
					}
					return matches_type;
				}
				break;
		}
	}
	function _setupObject(target,options,d){
		var data = $.data(target,'jsoneditor');
		var atomtypes = data.options.atomtypes;
		if (options.registed&&!options.basetype){
			options = objExt(options,getTypeByTypeName(data.options.registerTypes,options.datatype));
		}
		var rec = objExt({id:guid()},options);
		switch(rec.datatype){
			case 'str':
				rec.value=typeof(d)==typeof('')?d:options.defaultvalue||'';
				return rec;
				break;
			case 'jsscript':
				rec.value = '';
				return rec;
				break;
			case 'text':
				rec.value=typeof(d)==typeof('')?d:options.defaultvalue||'';
				return rec;
				break;				
			case 'number':
				rec.value=typeof(d)==typeof(1)?d:options.defaultvalue||0;
				return rec;
				break;
			case 'url':
				rec.value=typeof(d)==typeof('')?d:options.defaultvalue||'';
				return rec;
				break;
			case 'bool':
				rec.value=typeof(d)==typeof(true)?d:options.defaultvalue||false;
				return rec;
				break;
			case 'date':
				rec.value=typeof(d)==typeof('')?d:options.defaultvalue||'2017-12-31';
				return rec;
				break;
			case 'code':
				rec.value=d?d:options.defaultvalue;
				return rec;
				break;
			case 'urlcode':
				rec.value=d?d:options.defaultvalue;
				return rec;
				break;
			case 'ARRAY':
				var children = [];
				for (var i=0;i<d.length;i++){
					var datatype=guessDatatype(types,d[i]);
					var opt={
							datatype:datatype,
							required:false,
							name:null,
						}
					children.push(_setupObject(target,opt,d[i]));
				}
				rec.children = children;
				rec.state = 'closed';
				return rec;
				break;
			case 'OBJECT':
				var children = [];
				var fmtfields = [];
				for (var k in d){
					var datatype=guessDatatype(data.options.registerTypes,d[k]);
					var opt={
						datatype:datatype,
						anydata:true,
						required:false,
						name:k,
					}
					children.push(_setupObject(target,opt,d[k]));
				}
				rec.children = children;
				rec.state='closed';
				return rec;
				break;
			default:
				if (options.basetype&&options.basetype=='OBJECT'){
					var children = [];
					var fmtfields = [];
					if (options.fields){
						for(var i=0;i<options.fields.length;i++){
							var d_field = d?d[options.fields[i].name]:null;
							if (options.fields[i].required||d_field){
								fmtfields.push(options.fields[i].name);
								var rec1 = _setupObject(target,options.fields[i],d_field);
								children.push(rec1);
							}
						}
					}
					for (var k in d){
						if (fmtfields.notcontains(k)){
							var datatype=guessDatatype(data.options.registerTypes,d[k]);
							var opt={
								datatype:datatype,
								anydata:true,
								required:false,
								name:k,
							}
							children.push(_setupObject(target,opt,d[k]));
						}
					}
					rec.children = children;
					rec.state='closed';
					return rec;
				}
				if (options.basetype&&options.basetype=='ARRAY'){
					var children = [];
					var allowedTypes = options.allowedTypes;
					var types = []
					for(var i=0;i<data.options.registerTypes.length;i++){
						if (allowedTypes.contains(data.options.registerTypes[i].datatype)) {
							types.push(data.options.registerTypes[i]);
						}
					}
					if (d){
						for (var i=0;i<d.length;i++){
							var datatype=guessDatatype(types,d[i]);
							var opt={
									datatype:datatype,
									required:false,
									name:null,
							};
							if(data.options.unregisteredtype.notcontains(datatype)){
								opt.registed = true;
							}
							children.push(_setupObject(target,opt,d[i]));
						}
					}
					rec.children = children;
					rec.state='closed';
					return rec;
				}
				return options;
				break;
		}
	}

	function loadFilter(d){
		var target = this;
		var data=$.data(target,'jsoneditor');
		if (data.dataLoaded){
			return d;
		}
		data.dataLoaded = true;
		$.data(target,'jsoneditor',data);
		
		var opt={
			datatype:data.options.roottype,
			required:true,
			name:data.options.rootname
		};
		var types = data.options.atomtypes.concat(['ARRAY','OBJECT']);
		if (types.notcontains(data.options.roottype)){
			var typeopt = getTypeByTypeName(data.options.registerTypes,data.options.roottype);
			if (typeopt){
				opt = objExt(opt,typeopt);
			} else {
				console.log("Error: roottype not found in registerTypes,opt,registerTypes,roottype= ",opt,data.options.registerTypes,data.options.roottype);
			}
		}
		if (Object.prototype.toString.apply(d)==Object.prototype.toString.apply([])){
			if (d.length==0&&(opt.datatype=='OBJECT'||opt.basetype=='OBJECT')){
				d = {};
			}
		}

		var children = _setupObject(target,opt,d);
		$.parser.parse($(target));
		return [children];
	}
	function setTextHeight(node){
		if (!node.target){
			return;
		}
		if (node.datatype=='text'){
			node.target.style.height=node.valueheight||'300px';
		} else {
			node.target.style.height=node.valueheight||'30px';
		}
		if (node.children){
			for (var i=0;i<node.children.length;i++){
				setTextHeight(node.children[i]);
			}
		}
	}
	function init(target) {
		$(target).addClass('jsoneditor');
		return $(target);
	};
	$.fn.jsoneditor = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.jsoneditor.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.tree(options,param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'tree');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this,'jsoneditor',{
					isChanged:false,
					options:$.extend({}, $.fn.jsoneditor.parseOptions(this), options, $.fn.jsoneditor.defaults)
				});
				init(this);
			}
			if (!state.options.url&&!state.options.data){
				state.options.data={};
			}
			var treeopts = {
				
				loadFilter:loadFilter,
				onExpand:function(node){
					setTextHeight(node);
					$.parser.parse($(this));
				},
				onLoadSuccess:function(node,data){
					$.parser.parse($(data.target));
					var target = this;
					if (!target){
						target = data.target;
					}
					var root = $(target).jsoneditor('getRoot');
					var data=$(this).jsoneditor('getData',root.target);
					setTextHeight(data);
					$.parser.parse($(this));
				},
				formatter:buildInput,
			};
			if(options.url){
				treeopts.url = options.url;
			} else {
				treeopts.data={};
			}
			$(this).tree(treeopts); //调用继承的tree
			$('<div id="' + state.options.menuc_id + '"></div>').appendTo($('body'));
			$.parser.parse($('body'));
		});
	};
	 
	$.fn.jsoneditor.methods = {
		options: function(jq){
			return $.data(jq[0],'jsoneditor').options;
		},
		setUrl:function(jq,url){
			$.data(jq[0],'jsoneditor').options.url = url;
		},
		getUrl:function(jq){
			var url = $.data(jq[0],'jsoneditor').options.url;
			if(url){
				console.log('url=',url)
				var urls = url.split('?');
				if (urls.length>1){
					var dp = /url=[^\&]*/g;
					var aa = urls[1].match(dp);
					console.log('aa=',aa);
					url = aa[0].split('=')[1];
				}
			} else {
				url = '';
			}
			return url;
		},
		isChanged:function(jq){
			return $.data(jq[0],'jsoneditor').ischanged;
		},
		findChildByName:function(jq,params){
			var node = params.node;
			var name = params.name;
			var children = $(jq[0]).jsoneditor('getChildren',node.target);
			for(var i=0;i<children.length;i++){
				if (name==children[i].name) return children[i];
			}
			return null;
		},
		validate:function(jq){
			var target = jq[0];
			var root = $(target).jsoneditor('getRoot');
			var data=$(target).jsoneditor('getData',root.target);
			return validateNode(target,data);
		},
		addChildByName:function(jq,params){
			var node = params.node;
			if (!node.children||!node.children.length){
				node.children = [];
			}
			var name = params.name;
			for (var i=0;i<node.fields.length;i++){
				if (name==node.fields[i].name){
					var newnode = {id:guid(),name:name,wellformated:true};
					var opts = objExt({},node.fields[i]);
					if (node.fields[i].registed){
						var types = $.data(jq[0],'jsoneditor').options.registerTypes;
						var typedef = getTypeByTypeName(types,node.fields[i].datatype);
						opts = objExt(opts,typedef);
					}
					newnode = objExt(newnode,opts);
					if (newnode.datatype=='OBJECT'||newnode.datatype=='ARRAY'||newnode.basetype=='OBJECT'||newnode.basetype=='ARRAY'){
						newnode.state = 'closed';
						var d;
						if (newnode.basetype=='ARRAY') {
							d = [];
						} else {
							d = {};
						}
						newnode = _setupObject(jq[0],newnode,d);
					}
					$(jq[0]).jsoneditor('append',{
						parent:node.target,
						data:[newnode]
					});
					var n = $(jq[0]).jsoneditor('find',newnode.id);
					setTextHeight(node);
					$(jq[0]).tree('expand',node.target);
					$.parser.parse($(n.target));
					$.data(jq[0],'jsoneditor').ischanged = true;
				}
			}
		},
		addChildByType:function(jq,params){
			var node = params.node;
			if (!node.children || !node.children.length){
				node.children = [];
			}
			var name = params.name;
			var newnode = {
				id:guid(),
				datatype:name,
				anydata:true,
				wellformated:true
			}
			if (node.datatype!='ARRAY'&&node.basetype!='ARRAY'){
				newnode.name = 'newattr';
			}
			switch(name){
				case 'ARRAY':
					newnode.state = 'closed';
					newnode.children = [];
					break;
				case 'OBJECT':
					newnode.children = [];
					newnode.state = 'closed';
					break;
				case 'str':
					newnode.value = '';
					break;
				case 'url':
					newnode.value = '';
					break;
				case 'number':
					newnode.value = 0;
					break;
				case 'bool':
					newnode.value = true;
					break;
				case 'text':
					newnode.value = '';
					break;
				case 'date':
					newnode.value = '';				
					break;
				default:
					var data=$.data(jq[0],'jsoneditor');
					var d;
					var registerTypes = data.options.registerTypes;
					newnode = objExt(newnode,getTypeByTypeName(registerTypes,name));
					if (newnode.basetype=='ARRAY') {
						d = [];
					} else {
						d = {};
					}
					newnode.state = 'closed';
					newnode = _setupObject(jq[0],newnode,d);
					break;
			}
			$(jq[0]).jsoneditor('append',{
				parent:node.target,
				data:[newnode]
			});
			var n = $(jq[0]).jsoneditor('find',newnode.id);
			setTextHeight(node);
			$(jq[0]).tree('expand',node.target);
			$.parser.parse($(n.target));
			$.data(jq[0],'jsoneditor').ischanged = true;

		},
		searchUrl:function(jq,id){
			var getFBwin=function(){
				var fbwin = $('#filebrowserw');
				if(fbwin.length<1) {
					fbwin = $('<div id="filebrowserw"><div>').appendTo($('body'));
				}
				return fbwin;
			};
			function seturl(url){
				$('#'+id+'_v').textbox('setValue',url);
				$(jq).jsoneditor('setNodeValue',{id:id,value:url});
			};
			var options = $(jq[0]).jsoneditor('options');
			var fbwin = getFBwin();
			fbwin.urlbrowser({
				browsetype:'open',
				url:options.vc_url + '?action=list',
				onSelectFile:seturl
			});

		},
		getValue:function(jq){
			var target = jq[0];
			var options = $(target).jsoneditor('options');
			var root = $(target).jsoneditor('getRoot');
			var data=$(target).jsoneditor('getData',root.target);
			var ret = nodeValue(data);
			ret = ret[options.rootname];
			if (options.__jename__){
				ret.__metadata__ = {
					__jename__ : options.__jename__
				};
			}
			return ret;
		},
		showContextmenu:function(jq,d){
			id = d.id;
			var target = jq[0];
			var data = $(target,'jsoneditor');
			var node = $(target).jsoneditor('find',id);
			if(!node.menubuild){
				contextMenu(node);
			}
			var showobj = $('#' + node.id + '_menuc')[0];
			x = showobj.clientLeft + showobj.offsetLeft;
			y = showobj.clientTop + showobj.offsetTop;
			$.parser.parse($('#' + node.id + '_menu'));
			showMenu(target,node,d.event);
		},
		setNodeName:function(jq,data){
			var target = jq[0];
			var node = $(target).jsoneditor('find',data.id);
			node.name = data.value;
			if (node.onNameChange){
				var f = node.onNameChange;
				if (typeof(f)==typeof('')){
					try{
						f = eval('f=' + f);
						f.call(target,node,data.value);
					}
					catch(e){
						console.log(e,node.onNameChange);
					}
				} else {			
					f.call(target,node,data.value);
				}
			}
			$.data(jq[0],'jsoneditor').ischanged = true;

		},
		setNodeValue:function(jq,data){
			var target = jq[0];
			var node = $(target).jsoneditor('find',data.id);
			node.value = data.value;
			if (node.onValueChange){
				var f = node.onValueChange;
				if (typeof(f)==typeof('')){
					try{
						f = eval('f='+f);
						f.call(target,node,data.value);
					}
					catch(e){
						console.log(e,node.onValueChange);
					}
				} else {			
					f.call(target,node,data.value);
				}
			}
			$.data(jq[0],'jsoneditor').ischanged = true;
		},
		deleteNode:function(jq,id){
			var node = $(jq[0]).jsoneditor('find',id);
			$(jq[0]).jsoneditor('remove',node.target);
			$.data(jq[0],'jsoneditor').ischanged = true;
		},
		destroy:function(jq){
			jq.remove();
		}
	};
	$.fn.jsoneditor.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	var atomtypes = ['str','text','number','url','date','bool','code','urlcode'];
	$.fn.jsoneditor.defaults = {
		menuc_id:guid(),
		atomtypes:atomtypes,
		unregisteredtype:atomtypes.concat(['OBJECT','ARRAY'])
	};
	
	$.parser.plugins.push("jsoneditor");

})(jQuery);
