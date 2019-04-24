/* */

function BufferAjaxData(){
};

BufferAjaxData.prototype.buffer = {};
BufferAjaxData.prototype.set = function(url,data){
	this.buffer.url = data;
};
BufferAjaxData.prototype.get = function(url)
{
	if ( url in this.buffer) return this.buffer.url;
	return null;
};

function DynamicSelect(url,args,inputId){
	this.url = url;
	this.args = args;
	this.inputId = inputId;
	this.bufferData = null;
};

DynamicSelect.prototype.buffer = new BufferAjaxData();
DynamicSelect.prototype.setValue = function(v){
	$('#' + this.inputId).val = v;
};

DynamicSelect.prototype.setup = funciton(){
	
};
