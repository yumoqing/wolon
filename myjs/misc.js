try	{
	if (wolon==1) debug('wolon loaded');
}
catch(e)
{
	wolon = 1;
	wolon_modules = {};
	debug = function(){
		return;
	};
	function JsonObject(o){
		if (Object.prototype.toString.call(o)==Object.prototype.toString.call('')){
			if (o.startsWith('jsscript:')){
				var x = o.substring(9,o.length);
				return eval('__jsonobject__js=' + x);
			}
			return o;
		}
		if(Object.prototype.toString.call(o)==Object.prototype.toString.call({})){
			for(var i in o){
				if (o.hasOwnProperty(i)){
					o[i] = JsonObject(o[i]);
				}
			}
		}
		if(Object.prototype.toString.call(o)==Object.prototype.toString.call([])){
			for(var i=0;i<o.length;i++){
				o[i] = JsonObject(o[i]);
			}
		}
		return o;
	};

	callLater = function(seconds,f){
		setTimeout(f,seconds * 100);
	};
	function clearClipBoard(){
		var target = $('body');
		$.data(target[0],'clipboard',{});
	};
	
	function setClipBoard(dtype,d){
		var target = $('body')[0];
		$.data(target,'clipboard',{dtype:d});
	};
	
	function getClipBoard(){
		var target = $('body')[0];
		return $.data(target,'clipboard');
	};
	//var debug=console.log;
	isVisible = function(jq){
		if ($(window).scrollTop()>(jq.offset().top+jq.outerHeight())||
			($(window).scrollTop()+$(window).height())<jq.offset().top){
			return false;
		}
		if (jq.is(':visible')){
			return true;
		}
		/* jq.is(':hidden') */
		return false;
	};
	
	browser = function() {
		var Sys = {};
		var ua = navigator.userAgent.toLowerCase();
		var s;
		(s = ua.indexOf('edge') !== - 1 ? Sys.edge = 'edge' : ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1]:
			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
			(s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
			(s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
			(s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
			(s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
		return Sys;
	};
	function isError(d){
		return d.hasOwnProperty('errortype')&&d.hasOwnProperty('errmsg');
	};
	function showError(d){
		$.messager.alert('error:',d);
	};
	function showSysError(e){
		$.messager.alert('error:js error',e);
	};
	function money(s, n)   
	{   
	   n = n > 0 && n <= 20 ? n : 2;   
	   s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";   
	   var l = s.split(".")[0].split("").reverse(),   
	   r = s.split(".")[1];   
	   t = "";   
	   for(i = 0; i < l.length; i ++ )   
	   {   
		  t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");   
	   }   
	   return t.split("").reverse().join("") + "." + r;   
	};
	
	objExt = function(){
		var ret = {}
		var args = [];
		for (var i=0;i<arguments.length;i++){
			args.push(arguments[i]);
		}
		args.map(function(o){
			if (isNull(o)){
				return;
			}
			if (Object.prototype.toString.apply(ret)!=Object.prototype.toString.apply(o)){
				/* debug('ret and o type difference',ret,o);*/
				ret = o;
				return;
			}
			if (Object.prototype.toString.apply(o)==
					Object.prototype.toString.apply([])){
				debug('o is a array',ret,o)
				var v1 = [];
				var slen = Math.min(o.length,ret.length);
				var llen = Math.max(o.length,ret.length);
				for (var i=0;i<slen;i++){
					v1.push(objExt(ret[i],o[i]));
				}
				for (var i=slen;i<=llen;i++){
					if (slen==o.length){
						v1.push(ret[i]);
					} else {
						v1.push(o[i]);
					}
				}
				ret = v1;
				return;
			} else if(Object.prototype.toString.apply(o)==
					Object.prototype.toString.apply({})){
				for (var i in o){
					if (ret.hasOwnProperty(i)){
						ret[i] = objExt(ret[i],o[i]);
					} else {
						ret[i] = o[i];
					}
				}
				return
			}
			ret = o;
			return;
		});
		return ret;
	};

	/* 单向数据mapping
	*/

	/* key mapping */
	kmapping = function(sourceData,mappingtable){
		var ret = {}
		for (var x in sourceData){
			var y = mappingtable[x];
			ret[y] = sourceData[x];
		}
		return ret;
	};

	/* value mapping */
	vmapping = function(sourceData,mappingtable){
		var ret;
		for(var x in sourceData){
			if (mappingtable.hasOwnProperty(sourceData[x])){
				ret[x] = mappingtable[sourceData[x]];
			} else if (mappingtable.hasOwnProperty('__else__')){
				ret[x] = mappingtable['__else__'];
			} else {
				ret[x] = sourceData[x];
			}
		}
		return ret;
	};
	strWidget=function(s,target,method){
		var data = s;
		if (method=='replace'){
			target.empty();
		}
		var step = 0;
		var widgetdesc;
		try{
			widgetdesc = eval('__widget_description__ = ' + data);
			if (isNull(widgetdesc)){
				console.log('widgetdesc is null');
				return;
			}
			step = 1;
			try {
				widgetdesc = JsonObject(widgetdesc);
			} catch(e){
				console.log('widgetdesc=',widgetdesc,e);
			}
			if (widgetdesc.hasOwnProperty('__ctmpl__')){
				step = 2;
				$(tmplRender(widgetdesc.__ctmpl__,widgetdesc.data)).appendTo(target);
			} else if (widgetdesc.hasOwnProperty('__widget__')){
				step = 3;
				eval('$(target).' + widgetdesc.__widget__ + '(widgetdesc.data)');
			} else {
				step = 4;
				$(data).appendTo(target);
			}
		}
		catch(e){
			$(data).appendTo(target);
		}
		$.parser.parse(target);
	};
	remoteWidgets=function(urls,idata,target,method,cef){
		if (urls.length>0){
			var url = urls.shift();
			remoteCall(url,'GET','html',idata,function(data){
					strWidget(data,target,method);
					if(urls.length>0){
						remoteWidgets(urls,idata,target,'append',cef);
					}
				},
				cef
			);
		}
	};
	remoteWidget= function(url,data,target,method,cef){
		remoteCall(url,'GET','html',data,function(d){
				strWidget(d,target,method);
			},
			cef);
	};
	rsaEncode = function(text){
		//var rsa = forge.pki.rsa;
		var pemKey = getPublicKey();
		var pki = forge.pki;
		var publicKey = pki.publicKeyFromPem(pemKey);
		//var bytes = text.getBytes();
		var encrypted = publicKey.encrypt(text, 'RSA-OAEP', {md:forge.md.sha256.create()});
		var ciphertext_base64 = forge.util.encode64(encrypted)
		console.log('rsaEncode():encrypted=',ciphertext_base64,pki.publicKeyToPem(publicKey));
		return ciphertext_base64
	}

	/*
	远程调用
	url：远程地址
	method：方法：支持http协议的方法
	type：返回数据类型：'html','json','script'
	data：上传数据
	cbf：调用成功回调方法,接受一个参数，服务器返回的数据
	cef：调用失败回调方法，接受三个参数分别是：XMLHttpRequest,msg,e
	*/

	remoteCall = function(url,method,type,data,cbf,cef,headers){
		$.ajax({
			method : method||'GET',
			url:url,
			cache:false,
			async : true,
			dataType : type||'html',
			data:data,
			beforeSend: function(xhr) {
				if (typeof(headers)!='undefined'){
					if (headers.length>0){
						for (var i=0;i<headers.length;i++){
							xhr.setRequestHeader(headers[i][0], headers[i][1]);
						}
					}
				}
			},
			success:function(rd){
				var x=false;
				if(type=='json'){
					x = rd;
				} else {
					try {
						x = $.parseJSON( rd );
						//console.log('x=',x,typeof(x));
					} catch(e){
						//console.log('is not a json text',rd);
					}
				}
				if (typeof(x)=='object'){
					if (x.status=='error' && x.errorcode == 69999){
						var lw = getLoginWindow();
						var callargs = [url,method,type,data,cbf,cef];
						lw.loginwindow('dologin',callargs);
						return;
					}
				}
				cbf(rd);
			},
			error:function(XMLHttpRequest,msg,e){
				var options = {
					title: e,
					msg: 'error:' + url + ':' + XMLHttpRequest.statusText,
					showType: 'slide',
					icon:'error',
					timeout: 5000
				};
				$.messager.show(options);
				cef(XMLHttpRequest,msg,e);
			}
		});	
	};
	
	tmplRender = function(ctmpl,data){
		var o = {__ctmpl__:ctmpl,data:data};
		var ct = ClientTemplate.createNew();
		return ct.render(o);
	};
	strTmplRender = function(tmplStr,data){
		var ct = ClientTemplate.createNew();
		return ct.tmplTextRender(tmplStr,data);
	}
	remoteJson = function(url,func,method,cache){
		var j = $.ajax({
			method : method||'GET',
			url:url,
			cache:cache||false,
			async : true,
			success:func,
			dataType : 'json',
			error:function(XMLHttpRequest,msg,e){
				var options = {
					title: e,
					msg: 'error:' + url + ':' + XMLHttpRequest.statusText,
					showType: 'slide',
					icon:'error',
					timeout: 5000
				};
				$.messager.show(options);
			}
		});
		return j;
	};

	isNull = function(v){
			return String(v) == 'null';
	};

	deepCopy = function(p, c) { 
		var c = c || {};
		for (var i in p) { 
			if (typeof p[i] === 'object') { 
				c[i] = (p[i].constructor === Array) ? [] : {};
				deepCopy(p[i], c[i]);
			} else {
				c[i] = p[i];
			}
		}
		return c;
	};

	/* client I18N
	从后台获取一个json文件，根据前台的语言获取不同的语言的json翻译文件
	*/


	ClientI18N = {
		i18ndict:{},
		dicturl:'/getI18nDict.dspy',
		loadDict:function(){
			remoteJson(ClientI18N.dicturl,function(d){
					ClientI18N.i18ndict = d;
			});
		},
		createNew:function(){
			ClientI18N.loadDict();
			i18n = function(s,ns){
				if (ClientI18N.i18ndict.hasOwnProperty(s)){
					d = ClientI18N.i18ndict[s];
				} else
				{
					d = s;
				}
				var f = doT.template(d,undefined,{});
				return f(ns);
			}
			return i18n;
		}
	};

	i18n = ClientI18N.createNew();

	/* i18n(s,ns); */

	MetaData = {
		metadata:{},
		loadMeta:function(url){
			remoteJson(url,function(d){MetaData.metadata = d;});
		},
		get:function(name){
			if (MetaData.metadata.hasOwnProperty(name)){
				return MetaData.metadata[name];
			} else {
				return {};
			}
		}
	};

	WidgetCalls = {
		calls:{},
		namedId:{},
		createNew:function(){
			var o = {
				execute:function(oid,action,data,callback){
					if (!WidgetCalls.calls.hasOwnProperty(oid)){
						debug("WidgetCalls().calls",oid,'not defined','when execue with',oid,action,data);
						return false;
					}
					var cnt = 0;
					var obj = WidgetCalls.calls[oid];
					if (obj.hasOwnProperty(action)){
						var callees = obj[action];
						if (!isNull(callees) && callees.length > 0)
						{
							for (var i =0;i<callees.length;i++){
								data = callees[i](data);
								cnt++;
							}
						}
					}
					if (obj.hasOwnProperty('*')){
						var callees = obj['*'];
						if (!isNull(callees) && callees.length > 0)
						{
							for (var i =0;i<callees.length;i++){
								data = callees[i](data);
								cnt++;
							}
						}
					}
					if (cnt==0 && obj.hasOwnProperty('#')){
						var callees = obj['#'];
						if (!isNull(callees) && callees.length > 0)
						{
							for (var i =0;i<callees.length;i++){
								data = callees[i](data);
								cnt++;
							}
						}
					}
					return data;
				},
				init:function(oid){
					WidgetCalls.calls[oid] = {};
				},
				add:function(oid,action,func){
					if (!WidgetCalls.calls.hasOwnProperty(oid)){
						WidgetCalls.calls[oid] = {};
					}
					var obj = WidgetCalls.calls[oid];
					if (! obj.hasOwnProperty(action)){
						obj[action] = new Array();
					}
					for (var i=0;i<WidgetCalls.calls[oid][action].length;i++){
						if (func == WidgetCalls.calls[oid][action][i]) return;
					}
					WidgetCalls.calls[oid][action].push(func);
					debug('wc.add():here',oid,action);
				}
			};
			return o;
		}
	};
	tmplurl= function(urlt,data){
		var f = doT.template(urlt,undefined,{}); 
		return f(data);
	};
	getId = function(name){
		if (!WidgetCalls.namedId.hasOwnProperty(name)){
			WidgetCalls.namedId[name] = 0;
		}
		var id = name+'_' + WidgetCalls.namedId[name];
		WidgetCalls.namedId[name] += 1;
		return id;
	};

	isArrayFn = function (value){ 
		if (typeof Array.isArray === "function") { 
			return Array.isArray(value); 
		}else{ 
			return Object.prototype.toString.call(value) === "[object Array]"; 
		} 
	};

	quotconv = function(s){
		return s.replace('"','\\"').replace("'","\\'");
	};
	 
	dump = function(obj){
		var a = new Array();
		var o = {};
		if (typeof obj == typeof ''){
			return "'" + obj + "'";
		}
		if (isArrayFn(obj)){
			var s = '[';
			for (var i=0;i<obj.length;i++){
				s += dump(obj[i]);
				if (i<obj.length-1){
					s += ','
				}
			}
			s += ']';
			return s
		}
		if(typeof(obj) == typeof o ){
			var s = '{';
			var c = false;
			for (var i in obj){
				if (c){
					s += ',';
				}
				c = true;
				s+= i + ':' + dump(obj[i]);
			}
			s += '}';
			return s;
		}
		return String(obj);
	};
	dataoption_dump=function(d){
		var s = dump(d);
		if (s[0]=='{'){
			return s.substring(1,s.length-1);
		}
		return d;
	};

	CodeMapping = {
		codes:{}
	};

	function addTooltip(tooltipContentStr,tootipId){
		//添加相应的tooltip   
		$('#'+tootipId).tooltip({  
			position: 'bottom',  
			content: tooltipContentStr,  
			onShow: function(){  
			$(this).tooltip('tip').css({
				backgroundColor: '#e0e0e0',
				color:'#e80000',
				borderColor: '#97CBFF'
			});
			}     
		}); 
	}
	
	setIdByCatelog=function(obj){
		if (obj.hasOwnProperty('id'))
			return;
		if(obj.hasOwnProperty('widget_name')){
			obj.id = getId(obj.widget_name);
		} else {
			obj.id = getId('misc');
		}
	};
	catelogCreated = function(catelog,id){
		var wc = WidgetCalls.createNew();
		wc.execute(catelog,'created',id,null);
	};
	
	isModuleLoaded = function(modulename){
		return wolon_modules.hasOwnProperty('modulename');
	};
	moduleLoaded = function(modulename){
		wolon_modules.modulename = 1;
	};
	widgetCreated = function(widget_type,id){
		var d = {
			widget_type:widget_type,
			id:id
		};
		var wc = WidgetCalls.createNew();
		wc.init(id);
		var catelog = widget_type + ':' + id;
		wc.execute(catelog,'created',d,null);
		debug('widgetCreated()',catelog);
	};
	RegisterFunction = {
		rfs : {},
		createNew:function(){
			var o = {
				register:function(name,func){
					RegisterFunction.rfs[name] = func;
				},
				call:function(name){
					if (RegisterFunction.rfs.hasOwnProperty(name)){
						var args = new Array();
						for (i=1;i<arguments.length;i++)
							args[i-1] = arguments[i];
						debug('RegisterFunction',args);
						return RegisterFunction.rfs[name](args);
					} else {
						debug('registor function(',name,') not found');
					}
				}
			};
			return o;
		}
	};
	partedColor=function(color1,color2,cnt){
		/* color1,color2的格式如下：#CC038F 
			cnt:返回颜色的个数
		*/
		var ret_array = [];
		var partcnt = cnt - 1;
		var color_from,color_to;

		var getColorValue=function(colorstr){
			var color={};
			color.x = parseInt(colorstr.substring(1,3),16);
			color.y = parseInt(colorstr.substring(3,5),16);
			color.z = parseInt(colorstr.substring(5,7),16);
			return color;
		}
		var setColorString=function(color){
			return '#' + color.x.toString(16) + color.y.toString(16) + color.z.toString(16);
		}
		color_from = getColorValue(color1);
		color_to = getColorValue(color2);
		ret_array.push(color1);
		for (var i=1;i<partcnt;i++){
			var tmpcolor = {}
			tmpcolor.x = (color_from.x + color_to.x) * i / partcnt;
			tmpcolor.y = (color_from.y + color_to.y) * i / partcnt;
			tmpcolor.z = (color_from.z + color_to.z) * i / partcnt;
			ret_array.push(setColorString(tmpcolor));
		}
		ret_array.push(color2);
		debug('partedColor()',cnt,ret_array);
		return ret_array;
	};
	canGetGeoLocation = function(){
		if (navigator.geolocation) {
			return true;
		}
		else {
			return false;
		}		
	};
	getGeoLocation = function(repeat,onSuccess,onError,options){
		/*
		repeat==0:只取一次，否则连续
		onSuccess接受一个参数：position,经纬度保存在：
		position.coords.longitude 经度
		position.coords.latitude  维度
		onError接受一个参数：error
		switch(error.code){
			case 1:
			alert("位置服务被拒绝");
			break;

			case 2:
			alert("暂时获取不到位置信息");
			break;

			case 3:
			alert("获取信息超时");
			break;

			case 4:
			alert("未知错误");
			break;
		}
		*/
		if (repeat){
			return watchCurrentPosition(onSuccess,onError,options);
		} else {
			return getCurrentPosition(onSuccess,onError,options);
		}
		
	};
	/* 计算给定一组坐标位置的中心点位置 */
	centerLocation=function(points,x,y){
		/* points:坐标点
			x:points横坐标的属性名
			y:points纵坐标的属性名
		*/
		var total = points.length;
		var ret = {};
		var x=0.0,y=0.0;
		
		points.map(function(p){
			x += p[x] * Math.PI / 180;
			y += p[y] * Math.PI / 180;
		});
		x /= total;
		y /= total;
		ret[x] = x;
		ret[y] = y;
		return ret;
	};
	function guid() {
		return 'xxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return r.toString(16);
		});
	};
	function contains(v){
		for (var i=0;i<this.length;i++){
			if (this[i] === v) return true;
		}
		return false;
	};
	function notcontains(v){
		for (var i=0;i<this.length;i++){
			if (this[i] === v) return false;
		}
		return true;
		
	};
	Array.prototype.contains = contains;
	Array.prototype.notcontains = notcontains;
	test1 = function(it){

	};
	if (typeof String.prototype.startsWith != 'function') {
		String.prototype.startsWith = function (prefix){
			return this.slice(0, prefix.length) === prefix;
		};
	}
	if (typeof String.prototype.endsWith != 'function') {
		String.prototype.endsWith = function(suffix) {
			return this.indexOf(suffix, this.length - suffix.length) !== -1;
		};
	}
};


