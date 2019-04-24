(function($){
	function init(target) {
		$(target).addClass('edatagrid');
		return $(target);
	};
	$.fn.edatagrid = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.edatagrid.methods[options];
			if (method){
				return method(this, param);
			} else {
				method = $.fn.datagrid.methods[options];
				//console.log('datagrid method=',options,method);
				return this.datagrid(options,param);
			}
		}
		
		options = $.extend({
			singleSelect:true,
			scrollOnSelect:true,
			fit:false,
			rowStyler:function(index,row){
				if (index%2==0){
					return 'background-color:#f4f4f4';
				}
				else {
					return 'background-color:#ffffff';
				}
			},
			toolbar: [
				{
					iconCls: 'icon-add',
					handler: function(){
						var grid = $('.edatagrid',$(this).parents('.datagrid'));
						grid.edatagrid('add');
					}
				},'-',{
					iconCls: 'icon-remove',
					handler: function(){
						var grid = $('.edatagrid',$(this).parents('.datagrid'));
						grid.edatagrid('delete');
					}
				},'-',{
					iconCls:'icon-edit',
					handler:function(){
						var grid = $('.edatagrid',$(this).parents('.datagrid'));
						grid.edatagrid('update');
					}
				},'-',{
					iconCls:'icon-uparrow',
					handler:function(){
						var grid = $('.edatagrid',$(this).parents('.datagrid'));
						grid.edatagrid('moveup');
					}
				},'-',{
					iconCls:'icon-downarrow',
					handler:function(){
						var grid = $('.edatagrid',$(this).parents('.datagrid'));
						grid.edatagrid('movedown');
					}
				}
			]			
		},options);
		return this.each(function(){
			var state = $.data(this, 'edatagrid');
			if (state){
				$.extend(state.options, options);
			} else {
				state = $.data(this,'edatagrid',{
					editMode:'none',
					editIndex:null,
					oldEditRow:null,
					userOnSelect:options.onSelect,
					userOnUnSelect:options.onUnselect,
					userOnAfterEdit:options.onAfterEdit,
					options:$.extend({}, $.fn.edatagrid.parseOptions(this), options, $.fn.edatagrid.defaults)
				});
				init(this);
			}
			var opts = $.extend(options,{
				onUnselect:function(index,row){
					$(this).edatagrid('finishEdit');
					var state = $.data(this, 'edatagrid');
					if (state.userOnUnselect){
						state.userOnUnselect.call(this,index,row);
					}
				},
				onSelect:function(index,row){
					$(this).edatagrid('finishEdit');
					var state = $.data(this, 'edatagrid');
					if (state.userOnSelect){
						state.userOnSelect.call(this,index,row);
					}
				},
				onAfterEdit:function(index,row,changes){
					var grid = $(this);
					var state = $.data(this,'edatagrid');
					state.newEditRow = row;
					if(state.editMode == 'add'){
						if(state.options.onAdded){
							state.options.onAdded.call(this,row);
						}
					} else if(state.editMode == 'update'){
						if (state.options.onUpdated){
							state.options.onUpdated.call(this,state.oldEditRow,row);
						}
					}
					state.oldEditRow = null;
					state.editMode = 'none';
					if (state.userOnAfterEdit){
						state.userOnAfterEdit.call(this,index,row,changes);
					}
				}
			});
			$(this).datagrid(opts); //调用继承的datagrid
			$.parser.parse($(this));
		});
	};
	 
	$.fn.edatagrid.methods = {
		options: function(jq){
			return $.data(jq[0],'edatagrid').options;
		},
		getEditIndex:function(jq){
			var state = $.data(jq[0],'edatagrid');
			return state.editIndex;
		},
		setEditIndex:function(jq,index){
			var state = $.data(jq[0],'edatagrid');
			state.editIndex = index;
			$.data(jq[0],'edatagrid',state);
		},
		getEditMode:function(jq){
			var state = $.data(jq[0],'edatagrid');
			return state.editMode;
		},
		setEditMode:function(jq,mode){
			var state = $.data(jq[0],'edatagrid');
			state.EditMode = mode;
			$.data(jq[0],'edatagrid',state);
		},
		moveup:function(jq){
			var grid = jq;
			grid.edatagrid('finishEdit');
			var row = $(grid).edatagrid('getSelected');
			if (!row) return;
			index = $(grid).edatagrid('getRowIndex',row);
			if (index===0) return;
			$(grid).edatagrid('insertRow',{index:index-1,row:row});
			$(grid).edatagrid('deleteRow',index+1);
			grid.edatagrid('selectRow',index-1);
		},
		movedown:function(jq){
			var grid = jq;
			grid.edatagrid('finishEdit');
			var row = $(grid).edatagrid('getSelected');
			if (!row) return;
			index = $(grid).edatagrid('getRowIndex',row);
			var data=$(grid).edatagrid('getData');
			if (index>=data.rows.length-1) return;
			$(grid).edatagrid('insertRow',{index:index+2,row:row});
			$(grid).edatagrid('deleteRow',index);
			grid.edatagrid('selectRow',index+1);
		},
		beginEditRow:function(jq,index){
			var ei = $(jq).edatagrid('getEditIndex');
			//console.log('beginEditRow,editIndex=',ei);
			if (ei>=0){
				$(jq).edatagrid('finishEdit');
			}
			$(jq).edatagrid('setEditIndex',index);
			$(jq).edatagrid('beginEdit',index);
		},
		finishEdit:function(jq){
			var index=$(jq).edatagrid('getEditIndex');
			if (index==null){
				//console.log('endEdit',index,'do nothing');
				return;
			}
			if (typeof(index)=='undefined'){
				//console.log('endEdit',index,'do nothing');
				return;
			}	
			if (index>=0){
				$(jq).edatagrid('endEdit',index);
				$(jq).edatagrid('setEditIndex',null);
			}
		},
		add:function(jq){
			var grid = jq;
			grid.edatagrid('finishEdit');
			var index = 0;
			var row = $(grid).edatagrid('getSelected');
			if (!row){
				row = {};
				grid.edatagrid('appendRow',row);
				var data=$(grid).edatagrid('getData');
				index = data.rows.length - 1;
			} else {
				index = $(grid).edatagrid('getRowIndex',row);
				index += 1
				grid.edatagrid('insertRow',{index:index,row:{}});
			}
			var state = $.data(jq[0],'edatagrid');
			state.editMode = 'add';
			$.data(jq[0],'edatagrid',state);
			grid.edatagrid('selectRow',index);
			grid.edatagrid('beginEditRow',index);
		},
		update:function(jq){
			var grid = jq;
			grid.edatagrid('finishEdit');
			var index = 0;
			var row = $(grid).edatagrid('getSelected');
			if (!row){
				return;
			} 
			var state = $.data(jq[0],'edatagrid');
			state.oldEditRow = row;
			state.editMode = 'update';
			$.data(jq[0],'edatagrid',state);
			console.log('row=',row);
			index = $(grid).edatagrid('getRowIndex',row);
			grid.edatagrid('beginEditRow',index);
		},
		delete:function(jq){
			grid = jq;
			grid.edatagrid('finishEdit');
			var row = $(grid).edatagrid('getSelected');
			if (row){
				var index = $(grid).edatagrid('getRowIndex',row);
				$(grid).edatagrid('deleteRow',index);
				var state = $.data(jq[0],'edatagrid');
				if (state.options.onDeleted){
					state.options.onDeleted.call(jq[0],row);
				}
				var data=$(grid).edatagrid('getData');
				if (index>=data.rows.length){
					index = data.rows.length - 1;
				}
				grid.edatagrid('selectRow',index);
			}
		},
		destroy:function(jq){
			jq.remove();
		}
	};
	$.fn.edatagrid.parseOptions = function(target){
		return $.extend({
		}, $.parser.parseOptions(target, ['width','height','class']));
	};
	$.fn.edatagrid.defaults = {
	};
	$.parser.plugins.push("edatagrid");

})(jQuery);