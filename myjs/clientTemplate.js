/*
按照以下格式导入模板
<script id="ctmpl_pagetmpl" type="text/x-dot-template" src="/ctmpl/a.ctmpl" ></script> 
按照id检索模板，所有模板id都以ctmpl_开头
以it为开头检索变量

后台返回json数据，都需要支持客户端模板翻译，需要返回以下格式的数据
{
	"__ctmpl__":"模板名字",
	"__target__":"name",
	"data":使用的数据
}

“模板名字”是id中"ctmpl_"后面的内容

需要jquery支持
*/

var ClientTemplate = {
	tbuf:{},
	tmpl_dir:'/ctmpl',
	makeUrl:function(tname){
		return ClientTemplate.tmpl_dir + '/' + tname + '.ctmpl';
	},
	loadTmpl:function(tmplname){
		var url = ClientTemplate.makeUrl(tmplname);
		var data = $.ajax({
			method : 'GET',
			url:url,
			cache:false,
			async : false
		}).responseText;
		// debug(data);
		ClientTemplate.tbuf[url] = doT.template(data,undefined,ClientTemplate.tbuf);
	},
	getTmpl:function(tname){
		var url = ClientTemplate.makeUrl(tname);
		if(!ClientTemplate.tbuf.hasOwnProperty(url)) 
		{
			ClientTemplate.loadTmpl(tname);
		}
		return ClientTemplate.tbuf[url];
	},
	createNew:function(){
		ct = {};
		ct.render = function(data){
			var f;
			try {
				f = ClientTemplate.getTmpl(data['__ctmpl__']);
			}catch(e){
				debug('render():49',data);
				throw e;
			}
			try{
				var rez = f(data.data);
				return rez;
			} catch(e){
				debug('render(),error=',data,f,e);
				throw e;
			}
		};
		ct.tmplTextRender=function(tmpltext,data){
			var f = doT.template(tmpltext,undefined,ClientTemplate.tbuf);
			return f(data);
		};

		return ct;
	}
};



