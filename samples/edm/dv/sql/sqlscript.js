var mc = WidgetCalls.createNew();
mc.add('dbtree_cm_database','sqlscript',function(d){
	var node = $('#dbtree').tree('getSelected');
	var id = getId(node.id);
	remoteCall('./dv/sql/sqlLayout.dspy','GET','json',{'dbname':node.id,'id':id},
		function(d){
			$('#dbc_tabs').tabs('add',
				{
					title:id,
					content:d,
					iconCls:'icon-database',
					closable:true,
					selected:true
				}
			);
		},
		function(e){
				$.messager.show("error",e,5000);
		}
	)
});

mc.add('dbtree_cm_database','sqlbuilder',function(d){
	var node = $('#dbtree').tree('getSelected');
	var id = getId(node.id + '_da');
	remoteCall('./dv/da/daLayout.dspy','GET','json',{'dbname':node.id,'id':id},
		function(d){
			$('#dbc_tabs').tabs('add',
				{
					title:id,
					content:d,
					iconCls:'icon-database',
					closable:true,
					selected:true
				}
			);
		},
		function(e){
				$.messager.show("error",e,5000);
		}
	)
});