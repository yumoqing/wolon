var rf = RegisterFunction.createNew();

var prod_top5=function(d){
	var producttype=d[0].data.producttype;
	var url = d[0].data.url;
	console.log('prod_top5',d,url);
	if($('#prod_top5').length == 0){
		var obj = $('<div id="prod_top5"></div>').appendTo('body');
		$('#prod_top5').window({
				title:'产品五大分析',
				iconCls:'icon-search',
				width:600,
				height:400,
				modal:true,
				shadow:true,
				minimizable:false,
				closed:false
			});
	}
	$('#prod_top5').window('open');
	$('#prod_top5').window('options').title = producttype + '：五大分析';
	$('#prod_top5').window('body').html('');
	$('#prod_top5').window('clear');
	$('#prod_top5').window('options').onClose = function(e){
		console.log(arguments);
	};
	
	remoteWidgets(
		[
		url + '&producttype=' + producttype
		],
		{},
		$('#prod_top5').window('body'),
		'replacce',
		function(e){$.messager.alert(e);}
	);
}

rf.register('prod_top5',prod_top5);