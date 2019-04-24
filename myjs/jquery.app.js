(function ($) {
	var loaded = false;
	var prevOpenedApp,
	currentOpenedApp;
	var rf = RegisterFunction.createNew();
	rf.register('openApp',function(a){
		console.log(a,a[0].data);
		target = a[0].data.target;
		openUrl(target,a[0].data);
	});
	/**
	 * layout初始化
	 * @param target
	 */
	 
	function initLayout(target) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		
		var center = $('<div/>').attr({
				'border' : false,
				'region' : 'center'
			}).addClass('app-wall').appendTo(jqTarget);
		
		//为桌面绑定右键菜
		center.bind('contextmenu', function (e) {
			var appContainer = $.data(target, 'app')['appContainer'];
			if (appContainer && e.target != appContainer[0])
				return;
			opts.onWallContextMenu.call(target, e);
			e.preventDefault();
		});
		
		//墙纸设置
		if (opts.wallpaper) {
			center.css('background-image', 'url("' + opts.wallpaper + '")');
		}
		
		if (jqTarget.tagName !== 'BODY') //非body对象，添加fit属性
			jqTarget.attr('fit', true);
		
		var region = {
			south : true,
			north : true,
			west : true,
			east : true
		};
		if (!region[opts.taskBlankPos]) //有效值验证
			opts.taskBlankPos = 'south';
		
		var taskBlank = $('<div/>').attr({
				'border' : false,
				'region' : opts.taskBlankPos
			}).css({
				overflow : 'hidden'
			}).appendTo(jqTarget);
		if (opts.taskBlankPos == 'north' || opts.taskBlankPos == 'south') {
			taskBlank.css("height", 35);
		} else {
			taskBlank.css("width", 35);
		}
		
		//执行layout实例
		jqTarget.layout();
		
		var calendarDiv = $('<div/>').appendTo(center).calendar({
				current : new Date()
			}).hide().css({
				"position" : "absolute",
				"z-index" : 100
			}); //插入calendar占位
		
		$.data(target, 'app')['calendarDiv'] = calendarDiv;
		
		center.panel({
			onResize : function (width, height) {
				//appReset(target);
				setTaskListWidth(target);
			}
		});
	}
	
	/**
	 * 初始化任务栏
	 * @param target
	 */
	function initTaskBlank(target) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		var taskBlank = jqTarget.layout('panel', opts.taskBlankPos); //获取任务栏Layout面板容器
		var taskBar = $('<div/>').addClass('app-taskBar'); //创建任务栏对象
		
		var start = $('<div/>'); //开始菜单按钮
		start.addClass('lbox');
		var taskList = $('<div/>'); //创建任务区域
		taskList.addClass('lbox');
		var direct = 'width';
		if (opts.taskBlankPos == 'east' || opts.taskBlankPos == 'west'){
			direct = 'height';
		}
		var windowbaropt = {
				iconsize:opts.iconSize,
				direct:direct,
		};
		taskList.windowbar(windowbaropt);
		var calendar = $('<div/>'); //创建时间区域
		var b = browser();
		console.log('$.browser=',b);
		if (b.ie) { //兼容ie的hover
			start.hover(function () {
				$(this).addClass('app-startMenu-hover');
			}, function () {
				$(this).removeClass('app-startMenu-hover');
			});
		}
		
		if (opts.taskBlankPos == 'south' || opts.taskBlankPos == 'north') {
			taskBar.addClass('app-taskBar-bg1');
			start.addClass('app-startMenu-x');
			calendar.addClass('app-taskBar-calendar-x');
		
		} else {
			taskBar.addClass('app-taskBar-bg2');
			start.addClass('app-startMenu-y');
			calendar.addClass('app-taskBar-calendar-y');
		}
		
		//依次添加到任务栏对象里面
		start.appendTo(taskBar);
		taskList.appendTo(taskBar);
		calendar.appendTo(taskBar);
		taskBar.appendTo(taskBlank);
		
		$.data(target, 'app')['taskBar'] = taskBar;
		$.data(target, 'app')['start'] = start;
		$.data(target, 'app')['taskList'] = taskList;
		$.data(target, 'app')['calendar'] = calendar;
		
		//为taskList绑定右键菜单
		taskList.bind('contextmenu', function (e) {
			if (e.target.nodeName == "LI") {
				opts.onTaskBlankContextMenu.call(target, e, $(e.target).attr('l_id'));
			} else {
				opts.onTaskBlankContextMenu.call(target, e, false);
			}
		});
		
		setTaskListWidth(target);
	}
	
	/**
	 * 设置任务栏宽度
	 * @param target
	 */
	function setTaskListWidth(target) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		var dir='width';
		if (opts.taskBlankPos != 'south' && opts.taskBlankPos == 'north') {
			dir = 'height';
		}
		var taskBlank = jqTarget.layout('panel', opts.taskBlankPos); //获取任务栏Layou面板容器
		var taskList = $.data(target, 'app')['taskList'];
		var kids = taskList.siblings();
		var l = 0;
		for (var i=0;i<kids.length;i++){
			if (dir=='width'){
				l += $(kids[i]).width();
			} else {
				l += $(kids[i]).height();
			}
		}
		if (dir=='width'){
			console.log('l=',l,'pw = ',taskBlank.width());
			taskList.width((taskBlank.width() - l));
		} else {
			taskList.height((taskBlank.height() - l));
		}
	}
	
	
	/**
	 * 初始app
	 * @param apps
	 */
	function initApp(target, apps) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		var wall = jqTarget.layout('panel', 'center'); //桌面对象
		var appContainer = jqTarget.data().app.appContainer;
		
		var lines = Math.floor((wall.height() - 20) / (opts.iconSize + 45)); //可显示行数
		var columns = Math.floor((wall.width() - 20) / (opts.iconSize + 45)); //可显示列数
		var wallMax = lines * columns; //每页显示app最大值
		var lineAppBlank = ((wall.height() - 20) - (opts.iconSize + 45) * lines) / lines; //行间隔高度
		var columnAppBlank = ((wall.width() - 20) - (opts.iconSize + 45) * columns) / columns; //列间隔宽度
		//初始值
		var line = 1,
		col = 1,
		top = 20,
		left = 10;
		
		var relSize = opts.iconSize + 45;
		for (var i in apps) {
			if (line > lines) {
				line = 1;
				top = 20;
				left += relSize + columnAppBlank;
				col++;
			}
			
			var app = apps[i];
			var appItem = $('<li/>').css({
					height : relSize,
					width : relSize
				});
			appItem.data('app', app); //绑定每个app的详细信息到app元素上
			appItem.attr("app_id", UUID()); //指定app的唯一标识
			if (app.id) {
				appItem.attr("id", app.id);
			}
			
			appItem.css({
				left : left,
				top : top
			});
			
			var icon = $('<img/>').height(opts.iconSize).width(opts.iconSize).attr('src', app.icon).appendTo(appItem);
			var text = $('<span/>').text(app.text).appendTo(appItem);
			var em = $('<em/>').css({
					height : relSize,
					width : relSize
				}).appendTo(appItem);
			
			appItem.appendTo(appContainer);
			
			top += relSize + lineAppBlank; //下一行的top值
			line++;
			b = browser();
			if (b.ie) { //兼容ie的hover
				appItem.hover(function () {
					$(this).addClass('hover');
				}, function () {
					$(this).removeClass('hover');
				});
			}
			
			initAppDrag(target, appItem); //初始化app的拖拽事件
			
			if (opts.dbClick) { //绑定App的点击事件（dbClick是否双击）
				appItem.on('dblclick', function () {
					openApp.call(this, target);
				});
			} else {
				appItem.on('click', function () {
					openApp.call(this, target);
				});
			}
		}
		
		var appItems = appContainer.children('li');
		appItems.mousedown(
			function () {
			appItems.removeClass("select");
			$(this).addClass("select");
		}).bind('contextmenu', function (e) {
			opts.onAppContextMenu.call(target, e, $(this).attr('app_id'));
			e.preventDefault();
		});
	}
	
	/**
	 * 初始化图标拖拽
	 * @param target
	 * @param appItem
	 */
	function initAppDrag(target, appItem) {
		appItem.draggable({
			revert : true,
			cursor : "default"
		}).droppable({
			onDrop : function (e, source) {
				if ($(source).prev().attr('app_id') == $(this).attr('app_id')) {
					$(source).insertBefore(this);
				} else {
					$(source).insertAfter(this);
				}
				setTimeout(function () {
					appReset(target);
				}, 0);
			},
			accept : '.app-container li'
		})
	}
	/**
	 *初始化开始菜单
	 * @param target
	 */
	function initStartMenu(target) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		
		if (opts.loadUrl.startMenu && !loaded) {
			remoteCall(opts.loadUrl.startMenu,'GET','json',{},
				function(widgetdesc){
					try{
						console.log('menu data=',widgetdesc);
						if (isNull(widgetdesc)){
							$.messager.alert("error", "not a widget file");
							console.log('menu data=',data,widgetdesc,w);
							return;
						}
						initMenu(target, widgetdesc);
					}
					catch(e){
						$.messager.alert("error", "not a widget file"+e);
						return;
					}
				},
				function(e){
					$.messager.alert("error", e);
				}
			);
		}
	}
	
	/**
	 * 初始化菜单
	 * @param menus
	 */
	function initMenu(target, menus) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		var wall = jqTarget.layout('panel', 'center');
		var startMenuDiv;
		$(tmplRender('menu',menus.data)).appendTo($('body'));
		$.parser.parse($('body'));
		startMenuDiv = $('#' + menus.data.id);
		$.parser.parse(startMenuDiv);
		var obj = eval('d = obj_' + menus.data.id);
		
		console.log('startmenu=',startMenuDiv,obj);
		var start = $.data(target, 'app')['start'];
		//确定菜单显示位置
		var left = 0,
		top = 0;
		
		start.click(function (e) {
			e.pageY -= 16;
			obj.setValue({data:{target:target},event:e});
		});
		
		start.data('menu', startMenuDiv);
	}
	
	/**
	 * 设置时间位置
	 * @param target
	 */
	function setCalendarTopAndLeft(target) {
		var calendarDiv = $.data(target, 'app')['calendarDiv'];
		var opts = $.data(target, 'app').options;
		var css = {};
		if (opts.taskBlankPos == 'south' || opts.taskBlankPos == 'east') {
			css['bottom'] = 0;
			css['right'] = 0;
		} else if (opts.taskBlankPos == 'west') {
			css['bottom'] = 0;
			css['left'] = 0;
		} else {
			css['top'] = 0;
			css['right'] = 0;
		}
		calendarDiv.css(css);
	}
	
	/**
	 * 初始化时间
	 * @param target
	 */
	function initCalendar(target) {
		var jqTarget = $(target);
		var opts = $.data(target, 'app').options;
		var calendar = $.data(target, 'app')['calendar'];
		
		function init() {
			var nowDate = new Date();
			var date = format.call(nowDate, opts.dateFmt);
			calendar.attr('title', format.call(nowDate, 'yyyy-MM-dd'));
			
			if (opts.taskBlankPos == 'south' || opts.taskBlankPos == 'north') {
				calendar.html(date);
			} else {
				var t = nowDate.getHours() + ':';
				if (nowDate.getMinutes() < 10) {
					t += '0';
				}
				t += nowDate.getMinutes();
				calendar.html(t);
			}
		}
		
		init();
		window.setInterval(function () {
			init();
		}, 1000);
		
		var calendarDiv = $.data(target, 'app')['calendarDiv'];
		setCalendarTopAndLeft(target);
		
		calendar.click(function () {
			calendarDiv.slideToggle();
		});
		jqTarget.click(function (e) {
			var c = $(e.target).attr('class');
			if (c != 'app-taskBar-calendar-x' && c != 'app-taskBar-calendar-y' && !$.contains(calendarDiv[0], e.target)) {
				calendarDiv.hide();
			}
		});
		
		function format(format) {
			/*
			 * eg:format="yyyy-MM-dd hh:mm:ss";
			 */
			if (!format) {
				format = "yyyy-MM-dd hh:mm:ss";
			}
			var o = {
				"M+" : this.getMonth() + 1, // month
				"d+" : this.getDate(), // day
				"h+" : this.getHours(), // hour
				"m+" : this.getMinutes(), // minute
				"s+" : this.getSeconds(), // second
				"q+" : Math.floor((this.getMonth() + 3) / 3), // quarter
				"S" : this.getMilliseconds() // millisecond
			};
			if (/(y+)/.test(format)) {
				format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			for (var k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
			}
			return format;
		}
	}
	
	function openUrl(target,menudata){
		var url = menudata.url;
		var iconCls = menudata.iconCls;
		var title = i18n(menudata.label||menudata.name);
		
		var data = $.data(target,'app');
		if (!iconCls){
			iconCls = 'windowbar-default-iconCls';
		}
		var windowopt = {
			title:title,
			width:"800px",
			height:"600px",
			iconCls:iconCls,
			onClose:function(e){
				data.taskList.windowbar('deleteWindow',$(this));
				$(this).window('destroy');
			}
		}
		var obj = $('<div />').appendTo($('body'));
		obj.attr('w_id',getId('window'));
		obj.attr('w_url',url);
		console.log('****,obj=',obj);
		obj.window(windowopt);
		$.parser.parse($('body'));
		var obj1 = data.taskList;
		obj1.windowbar('addWindow',obj);
		if (/^http/i.test(url)){
			var iframe = $('<iframe/>').attr({
				width : '100%',
				height : '99%',
				frameborder : 0,
				src : url
			});
			iframe.appendTo(obj.window('body'));
		} else {
			remoteWidget(url,{},obj.window('body'),'replace',showSysError);
		}
	}

	/**
	 * 创建窗口
	 * @param target
	 * @param options
	 */
	function createWindow(target, options) {
		return openApp(target, options);
	}
	
	/**
	 * 生成UUID
	 */
	function UUID() {
		function S4() {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		}
		
		return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
	}
	
	/**
	 * 墙纸设置
	 * @param target
	 * @param url
	 */
	function setWallpaper(target, url) {
		var wall = $(target).layout('panel', 'center');
		wall.css('background-image', 'url("' + url + '")');
		$.data(target, 'app').options.wallpaper = url;
	}
	
	/**
	 * 第一步是初始化layout
	 * 第二部初始化任务栏
	 * 第三部初始化桌面
	 * 第四步初始化开始菜单
	 * 第五步初始化时间
	 * 第六步初始化widget
	 */
	var initMethods = [initLayout, initTaskBlank, initStartMenu, initCalendar];
	
	/**
	 * 初始化
	 * @param target
	 * @param options
	 */
	function init(target, options) {
		if (loaded)
			return;
		
		var progress = $.messager.progress({ //实例化进度条
				title : options.lang.progress.title,
				msg : options.lang.progress.msg,
				interval : null
			});
		
		var progressBar = $.messager.progress('bar'); //获取进度条实例
		$.ajaxSetup({
			async : false
		});
		for (var i in initMethods) {
			var step = initMethods[i];
			progressBar.progressbar({
				text : options.lang[step.name]
			}).progressbar('setValue', ((parseInt(i) + 1) / initMethods.length) * 100);
			step.call(this, target);
		}
		$.messager.progress('close');
		$.ajaxSetup({
			async : true
		});
		loaded = true;
		
		options.onLoaded.call(target);
		
		setTimeout(function () {
			$('body').attr({ //禁用全局事件
				oncontextmenu : 'return false',
				onselectstart : 'return false',
				ondragstart : 'return false',
				onbeforecopy : 'return false'
			});
		}, 500);
	}
	
	$.fn.app = function (options, params) {
		if (typeof options === 'string') {
			return $.fn.app.methods[options.toLowerCase()].call(this, params);
		}
		options = options || {};
		return this.each(function () {
			var state = $.data(this, 'app');
			if (state) {
				options = $.extend(state.options, options);
				state.options = options;
			} else {
				options = $.extend({}, $.fn.app.defaults, $.fn.app.parseOptions, options);
				$.data(this, 'app', {
					options : options
				});
			}
			
			init(this, options);
		});
	};
	
	$.fn.app.methods = {
		options : function () {
			return this.data().app.options;
		},
		appcontainer : function () {
			return this.data().app.appContainer;
		},
		calendar : function () {
			return this.data().app.calendar;
		},
		start : function () {
			return this.data().app.start;
		},
		taskbar : function () {
			return this.data().app.taskBar;
		},
		tasklist : function () {
			return this.data().app.taskList;
		},
		startmenu : function () {
			return this.data().app.start.data().menu;
		},
		layout : function () {
			return this.data().layout;
		},
		setwallpaper : function (wallpaperUrl) {
			return this.each(function () {
				setWallpaper(this, wallpaperUrl);
			});
		},
		appreset : function () {
			return this.each(function () {
				appReset(this);
			});
		},
		seticonsize : function (size) {
			return this.each(function () {
				$.data(this, 'app').options.iconSize = size;
				var appContainer = $.data(this, 'app').appContainer;
				appContainer.find("img").height(size).width(size);
				appContainer.find("em,li").height(size + 45).width(size + 45);
				appReset(this);
			});
		},
		closeapp : function (appId) {
			$("#" + appId).dialog("close");
		},
		openapp : function (appId) {
			$("#" + appId).dialog("open");
		},
		createmenu : function (opt) {
			return createMenu(this[0], opt.data,opt.opt||{});
		},
		createwindow : function (options) {
			return createWindow(this[0], options);
		},
		refreshapp : function (href) {
			refresh(this[0], href);
		}
	};
	
	$.fn.app.parseOptions = function () {};
	
	$.fn.app.defaults = {
		taskBlankPos : 'south', //任务栏的位置（north|south|west|east）
		iconSize : 32, //app图标大小
		dbClick : true, //app打开是否双击
		dateFmt : 'yyyy年MM月dd日 <br/> hh:mm:ss', //时间格式化形式
		wallpaper : null, //壁纸,url路径
		onTaskBlankContextMenu : function (event, appid) {}, //任务栏右键事件
		onWallContextMenu : function (event) {}, //桌面右键事件
		onAppContextMenu : function (event, appid) {}, //app右键事件
		onBeforeOpenApp : function (appOpt) {}, //打开app之前的事件,可以返回自定义的窗口options
		onLoaded : function () {}, //app实例化完成事件
		onOpenApp : function () {}, //app打开事件
		onClosedApp : function () {}, //app关闭事件
		onStartMenuClick : function (item) {}, //开始菜单点击事件
		iframeOpen : false,
		loadUrl : { //远程数据加载路径
			startMenu : 'json/startMenu.js', //开始菜单数据
		},
		lang : { //国际化
			initLayout : "init layout",
			initTaskBlank : "init task blank",
			initStartMenu : "init start menu",
			initCalendar : "init calendar",
			progress : {
				title : 'Please waiting',
				msg : 'Loading data...'
			}
		}
	};
	
	$.parser.plugins.push('app');
	
})(jQuery);
