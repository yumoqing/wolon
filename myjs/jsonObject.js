function JsonObject(o){
	if (Object.prototype.toString.call(o)==Object.prototype.toString.call('')){
		if (o.startsWith('jsscript:')){
			var x = o.substring(9,o.length);
			return eval(x);
		}
		return o;
	}
	if(Object.prototype.toString.call(o)==Object.prototype.toString.call({})){
		for(var i in o){
			if (o.hasOwnProperty(i)){
				o[i] = JsonObject(o[i]);
			}
		}
	}
	if(Object.prototype.toString.call(o)==Object.prototype.toString.call([])){
		for(var i=0;i<o.length;i++){
			o[i] = JsonObject(o[i]);
		}
	}
	return o;
}
global.JsonObject = JsonObject;
