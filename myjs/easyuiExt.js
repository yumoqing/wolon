var createGridHeaderContextMenu = function(e, field){
    e.preventDefault();
	debug('createGridHeaderContextMenu(),',e,'field=',field,'grid=',$(this),this);
	debug('this attr(id)=',$(this).attr('id'));
	var id = $(this).attr('id');
	var opts = $(this).data().datagrid.options;
	var mopts = opts.headerContextMenuOptions
	if (isNull(mopts)){
		return;
	}
    var headerContextMenu = this.headerContextMenu;/* grid上的列头菜单对象 */
    if (!headerContextMenu) {
		
		headerContextMenu = this.headerContextMenu = $(tmplRender('menu',mopts)).appendTo('body');
    }
    headerContextMenu.menu('show', {
        left : e.pageX,
        top : e.pageY
    });
};
$.fn.datagrid.defaults.onHeaderContextMenu = createGridHeaderContextMenu;
$.fn.treegrid.defaults.onHeaderContextMenu = createGridHeaderContextMenu;
