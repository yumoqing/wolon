$.extend($.fn.datagrid.methods, {
    /* 删除选中行 */
     deleteSelectedRow: function (datagrid, url) {
         var row = datagrid.datagrid("getSelected");
         if (row == undefined) {
             $.messager.show({
                 title: "系统提示",
                 msg: "请选择要操作的行",
                 width: 350,
                 heigth: 200,
                 style: {
                     top: document.body.scrollTop + document.documentElement.scrollTop,
                 }
             });
             return;
         }
         $.messager.confirm("系统提示", "您确定要执行操作吗？", function (key) {
             if (key) {
                 $.ajax({
                     url: url,
                     data: { ID: row.ID },
                     type: "POST",
                     success: function (data) {
                         if ($.ajaxRemind(data) == true) {
                             datagrid.datagrid("reload");
                         }
                     }
                 })
             }
         });
     }
});

