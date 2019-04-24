#assetpoolstree.dspy

def level1():
	return [ {
		"id":"distinct:%s" % i,
		"type":"assettype",
		"value":i,
		"text":i,
		"iconCls":"icon-dimension",
		"state":"closed",
		"pid":None,
		"pt":None
	} for i in ['北京','上海','深圳','杭州','苏州','其他'] ]

def level2():
	return [
		 {
		"id":"distinct:%s" % i,
		"type":"leaf",
		"value":i,
		"text":i,
		"iconCls":"icon-dimension",
		"state":"closed",
	} for i in ['0 - 1年','1-3年','3-5年','5年以上']
	]
	

ns = request2ns()
id = ns.get('id',None)
if id is None:
	return [
		{
			"id":"assetpools:" + 'total',
			"text":'资产池',
			"iconCls":"icon-dimension",
			"state":'closed',
			"nodetype":"total",
			"pid":None,
			"ptype":None
		}
	]

ids = id.split(':')
if ids[0]=='assetpools':
	return level1()
if ids[0]=='distinct':
	return level2
print('id','not found')
	
