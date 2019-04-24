var createGridHeaderContextMenu = function(e, field){
    e.preventDefault();
    var grid = $(this);/* grid本身 */
	var opts = grid.datagrid('options').headerContextMenuOptions
	if (isNull(opts)){
		return;
	}
    var headerContextMenu = this.headerContextMenu;/* grid上的列头菜单对象 */
    if (!headerContextMenu) {
		
		headerContextMenu = this.headerContextMenu = $(tmplRender('menu',opts)).appendTo('body');
    }
    headerContextMenu.menu('show', {
        left : e.pageX,
        top : e.pageY
    });
};
$.fn.datagrid.defaults.onHeaderContextMenu = createGridHeaderContextMenu;
$.fn.treegrid.defaults.onHeaderContextMenu = createGridHeaderContextMenu;
