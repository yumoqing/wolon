(function($){
	function fonClickRow(row){
		$=jQuery;
		var w = $(this).parents('.urlbrowser');
		var ip = w[0].getElementsByTagName('input');
		var data = $.data(w[0],'urlbrowser');
		var v = row.path + '/' + row.name;
		$(ip).val(v);
		console.log('path,name,v=',row.path,row.name,v);
	};
	function fonDblClickRow(row){
		$=jQuery;
		var w = $(this).parents('.urlbrowser');
		var data = $.data(w[0],'urlbrowser');
		if (row.type == 'dir'){
			if (row.state == 'closed'){
				$('#' + data.tgid).treegrid('expand',row.id);
			} else {
				$('#' + data.tgid).treegrid('collapse',row.id);
			}
			return;
		}
		var p=row.path + '/' + row.name;
		console.log('p = ',p);
		if(data.options.onSelectFile){
			data.options.onSelectFile.call(this,p);
		}
		w.window('close');
	};
	function init(target) {
		var panel = $(target).window('body');
		var data = $.data(target,'urlbrowser');
		var btnname = data.options.browsetype == 'open'?i18n('open'):i18n('save');
		panel.empty();
		$(target).addClass('urlbrowser');
		$('<div id="' + data.tbid +
		'"><input class="easyui-textbox" value="" style="width:400px" />' + 
		'<button onclick="$(this).parents(\'.urlbrowser\').urlbrowser(\'baction\');" >' + btnname + '</button>').appendTo(panel);
		$.parser.parse($(target));
		var obj = $('.textbox-text',$(target));
		// 下面的事件不起作用
		obj[0].onkeydown = function(e){
			console.log('e.keyCode');
			if (e.keyCode == 13){
				console.log('return key entered')
				$(target).urlbrowser('baction');
			}
		};
		var d={
			id:data.tgid,
			url:data.options.url,
			idField:"id",
			treeField:"name",
			fields:[
				{
					name:"name",
					width:"290px",
					label:i18n("filename"),
					iotype:"text"
				},{
					name:"type",
					width:"70px",
					label:i18n("filetype"),
					iotype:"text"
				},{
					name:"size",
					label:("filesize"),
					iotype:"text"
				},{
					name:"mtime",
					label:i18n("filemtime"),
					iotype:"text"
				}
			],
			options:{
				pagination:false,
				dnd:false,
				toolbar:'#' + data.tbid,
				pageSize:60,
				onClickRow:fonClickRow,
				onDblClickRow:fonDblClickRow
			}
		};
		var txt = tmplRender('treegrid',d)
		$(txt).appendTo(panel);
		$.parser.parse($(target));		
	};
	$.fn.urlbrowser = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.urlbrowser.methods[options];
			if (method){
				return method(this, param);
			}
		}
		 
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'urlbrowser');
			if (state){
				$.extend(state.options, options);
			} else {
				var opts= objExt({}, $.fn.urlbrowser.defaults, $.fn.urlbrowser.parseOptions(this), options);
				$.data(this,'urlbrowser',{options:opts,tbid:getId('toolbar'),tgid:getId('treegrid')});
				state = $.data(this,'urlbrowser');
			}
			var wopts = {
				width:600,
				height:480,
				modal:true
			};
			switch(state.options.browsetype){
				case 'save':
					wopts.iconCls = 'icon-save';
					wopts.title = i18n('save');
					break;
				case 'saveas':
					wopts.iconCls = 'icon-save';
					wopts.title = i18n('save as');
					break;
				case 'open':
				default:
					wopts.iconCls = 'icon-open';
					wopts.title = i18n('open');
					break;
			}
			$(this).window(wopts);
			init(this);
			$(this).window('open');
		});
	};
	 
	$.fn.urlbrowser.methods = {
		baction:function(jq){
			var target = jq[0];
			var ip = target.getElementsByTagName('input');
			var fname = $(ip).val();
			if (!fname){
				$.messager.alert(i18n('error'),i18n('please input a filename'));
				return;
			}
			var data = $.data(target,'urlbrowser');
			var row = $('#' + data.tgid).treegrid('getSelected');
			var p = '';
			if (row) {
				p += row.path + '/' + row.name;
			}
			if (p!=fname){
				p += '/' + fname;
			} else {
				if (row.type=='dir'){
					return;
				}
			}
			if(data.options.onSelectFile){
				data.options.onSelectFile.call(this,p);
			}
			$(target).window('close');
		},
		newfolder:function(jq){
			var target = jq[0];
			var ip = target.getElementsByTagName('input');
			var fname = $(ip).val();
			if (!fname){
				$.messager.alert(i18n('error'),i18n('please input a filename'));
				return;
			}
			var data = $.data(target,'urlbrowser');
			var row = $('#' + data.tgid).treegrid('getSelected');
			var p = '';
			if (row) {
				p += row.path + '/' + row.name;
			}
			if (p!=fname){
				p += '/' + fname;
			} else {
				return;
			}
			if (row.type!='dir'){
				return;
			}
			if(data.options.newfolderURL){
				remoteCall(data.options.newfolderURL,'GET','json',{url:p},
					function(d){
						if (d.status&&d.errortype&&d.errmsg){
							$.messager.alert(d.status + ':' + d.errortype,d.errmsg);
							return;
						}
					},
					function(e){
						$.messager.alert('error',e);
					}
				);
			}
			$(target).window('close');
		},
		options: function(jq){
			return $.data(jq[0], 'urlbrowser').options;
		},
	};
	$.fn.urlbrowser.parseOptions = function(target){
		return $.extend({}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.urlbrowser.defaults = {
		browsetype:'open'
	};
	
	$.parser.plugins.push("urlbrowser");

})(jQuery);
