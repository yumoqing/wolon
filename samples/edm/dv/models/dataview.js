var mc = WidgetCalls.createNew();

mc.init('dbtree_cm_table');
mc.add('dbtree_cm_table','v_data',function(d){
	var node = $('#dbtree').tree('getSelected');
	console.log("v_data, node=",node);
	var d = node.id.split(':');
	var dbname = d[0];
	var tablename = d[1];
	var label = dbname + ':' + tablename;
	var tablename;
	var url = '/dv/datagrid.dspy?id='+label;
	obj_dbc_tabs.addOrSelect('d'+node.id,url,'icon-table');
	console.log('v_data,here',url,label);
});
mc.add('dbtree_cm_table','v_structure',function(d){
	var node = $('#dbtree').tree('getSelected');
	console.log("v_data, node=",node);
	var d = node.id.split(':');
	var dbname = d[0];
	var tablename = d[1];
	var label = dbname + ':' + tablename;
	var tablename;
	var url = '/dv/models/fielddatagrid.dspy?dbname='+dbname + '&tablename=' + tablename;
	obj_dbc_tabs.addOrSelect('f'+ node.id,url,'icon-table');
	console.log('v_data,here',url,label);
});