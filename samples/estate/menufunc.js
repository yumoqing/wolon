var id2url = {
	"3":"./rentfin/rentfinView.tmpl"
};

function unsupportfunc(text){
	$.messager.show({title:'info',msg:text + '：建设中'});
}

function menuCall(funcid,text){
	var url = id2url[funcid];
	var ly = $('.layout',$('body'));
	var target = ly[0];
	if(url){
		remoteWidgets([url],{},$(target).layout('panel','center'),'replace',showError);
	} else {
		unsupportfunc(text);
	}
};
	
