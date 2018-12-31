/* 
 * @name: UI Control 
 * @author: Scout
 * @param: Responsible for the UI logic and interaction processing.
 * @version: 1.0
 */
"use strict";
// 初始化框架
$(document).foundation();
// Canvas 对象类
class CanvasObject {
	constructor(CanvasBoxID, CanvasClassName, thisObject){
		this.CanvasBoxID = CanvasBoxID;
		this.CanvasClassName = CanvasClassName;
		this.thisObject = thisObject;
		this.CanvasCid = [];
		this.CanvasCid_ = []; // 这个遍历出来的不能当ID用, 但是能用来初始化绘制环境, 后面就没卵用了.
		this.CanvasCtx = [];
	}
	initObject(thisObject){ // 为了解决this指向问题, 发现居然能把自己当参数传进去赋值, 真TM神奇...
		this.CanvasCid_.push(this.CanvasBoxID.children(this.CanvasClassName));
		$(this.CanvasClassName).map(function(){
			thisObject.CanvasCid.push($(this));
		});
		return { Cid: this.CanvasCid, Cid_: this.CanvasCid_ };
	}
	initContext(){
		for(let i = 0; i < this.CanvasCid_[0].length; i++){
			this.CanvasCtx.push(this.CanvasCid_[0][i].getContext("2d"));
		}
		return this.CanvasCtx;
	}
}
// Canvas UI类
class CanvasUI {
	constructor(CanvasObject, CursorID){
		this.cp = {}; this.onChangeColor = false;
		this.CanvasBoxID = CanvasObject.CanvasBoxID;
		this.CanvasObject = CanvasObject;
		this.CursorID = CursorID;
		this.CanvasBush = { // 默认样式
			bush: 1,
			linewidth: 14,
			color: "#222222",
			rigidity: 100,
			density: 100,
			layer: 1
		};
		this.canvasViewData = {
			w: 0,
			h: 0,
			s: 0,
			s100: 0,
			cvcid: 0,
			cvctx: 0
		};
		this.viewAllow = true;
		this.canvasBuffer = document.createElement("canvas"); // 缓冲器
		this.canvasBufferCtx = 0;
		this.CursorObj = {
			msx: 0,
			msy: 0
		};
	}
	canvasSetSize(width, height, canvasviewbox, canvasviewdiv, canvasviewrect){ // 设置canvas宽高
		this.CanvasBoxID.css("width", width);
		this.CanvasBoxID.css("height", height);
		for(let i = 0; i < this.CanvasObject.CanvasCid.length; i++){
			this.CanvasObject.CanvasCid[i].attr("width", width);
			this.CanvasObject.CanvasCid[i].attr("height", height);
		}
		this.canvasBuffer.width = width;
		this.canvasBuffer.height = height;
		this.canvasBufferCtx = this.canvasBuffer.getContext("2d");
		this.canvasSetViewBox(this.CanvasBoxID, canvasviewbox, canvasviewdiv); // 顺便设置预览框.
	}
	canvasShowAndHidden(canvasindex, status){ // 设置canvas显示隐藏
		if(status){
			this.CanvasObject.CanvasCid[canvasindex].fadeIn(1);
		} else {
			this.CanvasObject.CanvasCid[canvasindex].fadeOut(1);
		}
	}
	canvasScrollTo(top, left, cl){ // 控制canvas滚动
		var pos = { top: Math.round(Math.abs(-(top) * this.canvasViewData.s)), left: Math.round(Math.abs(-(left) * this.canvasViewData.s)) }
		cl.scrollTop(pos.top);
		cl.scrollLeft(pos.left);
	}
	canvasGetViewScale(canvasbox, canvasviewbox){ // 取缩放值和推荐canvas尺寸
		let cbwh = { w: canvasbox.width(), h: canvasbox.height() };
		let cvbwh = { w: canvasviewbox.width(), h: canvasviewbox.height() };
		let cbscale = cbwh.w / cbwh.h;
		let cvbscale = cvbwh.w / cvbwh.h;
		let scale = 0,
			scale100 = 0;
		let canvasviewWHS = {};
		if (cbwh.w > cbwh.h && cbscale > cvbscale) { // 判断是否合适预览框的宽高比, 选择缩放横边还是纵边
			scale = (cbwh.w / cvbwh.w);
			scale100 = (cvbwh.w / cbwh.w) * 100;
			return {
				w: cvbwh.w,
				h: Math.round(cbwh.h / scale),
				s: scale,
				s100: scale100,
				cvcid: canvasviewbox.find("canvas"),
				cvctx: canvasviewbox.find("canvas")[0].getContext("2d")
			};
		} else {
			scale = (cbwh.h / cvbwh.h);
			scale100 = (cvbwh.h / cbwh.h) * 100;
			return {
				w: Math.round(cbwh.w / scale),
				h: cvbwh.h,
				s: scale,
				s100: scale100,
				cvcid: canvasviewbox.find("canvas"),
				cvctx: canvasviewbox.find("canvas")[0].getContext("2d")
			};
		}
	}
	canvasSetViewBox(canvasbox, canvasviewbox, canvasviewdiv){ // 设置预览画布宽高
		let data = this.canvasGetViewScale(canvasbox, canvasviewbox);
		this.canvasViewData = data;
		canvasviewdiv.css("width", data.w);
		canvasviewdiv.css("height", data.h);
		canvasviewdiv.find("canvas").attr("width", data.w);
		canvasviewdiv.find("canvas").attr("height", data.h);
		data.cvctx.scale(data.s100 / 100, data.s100 / 100);
	}
	canvasSetViewBoxScale(){
		// TODO...
	}
	canvasSetViewBoxRect(containerleft, canvasviewdiv, canvasviewrect){  // 设置预览框宽高
		let clwh = { w: containerleft.width(), h: containerleft.height() }
		canvasviewrect.css("width", Math.round(clwh.w / this.canvasViewData.s));
		canvasviewrect.css("height", Math.round(clwh.h / this.canvasViewData.s));
		canvasviewrect.css("max-width", canvasviewdiv.width());
		canvasviewrect.css("max-height", canvasviewdiv.height());
	}
	canvasSetViewBoxRectForCursor(msxy, cl, canvasviewbox, canvasviewrect){ // 点击预览视图外视图滚动
		let cvwh = { w: parseInt(canvasviewrect.css("width")), h: parseInt(canvasviewrect.css("height")) };
		let cvbwh = { w: parseInt(canvasviewbox.css("width")), h: parseInt(canvasviewbox.css("height")) };
		let centerXY = { x: cvwh.w / 2, y: cvwh.h / 2 };
		let cvPos = { top: parseInt(canvasviewrect.css("top")), left: parseInt(canvasviewrect.css("left")) };
		let newPos = { top: msxy.y - centerXY.y, left: msxy.x - centerXY.x };
		if(msxy.x - centerXY.x < 0){
			newPos.left = 0;
		}
		if(msxy.y - centerXY.y < 0){
			newPos.top = 0;
		}
		if(msxy.x + centerXY.x > cvbwh.w){
		 	newPos.left = cvbwh.w - cvwh.w;
		}
		if(msxy.y + centerXY.y > cvbwh.h){
		 	newPos.top = cvbwh.h - cvwh.h;
		}
		this.canvasSetViewBoxRectTopAndLeft(newPos.top, newPos.left, canvasviewrect);
		this.canvasScrollTo(newPos.top, newPos.left, cl);
	}
	canvasSetViewBoxRectTopAndLeft(top, left, canvasviewrect){ // 设置预览框位置
		if(this.viewAllow){
			canvasviewrect.css("top", top);
			canvasviewrect.css("left", left);
		}
	}
	canvasSetViewBoxData(){ // _CanvasUI.canvasSetViewBoxData(); // 该方法有严重性能问题, 正考虑用异步更新+双缓冲方案解决.
		let start = new Date().getTime();//起始时间
		this.canvasViewData.cvctx.clearRect(0, 0, this.CanvasBoxID.width(), this.CanvasBoxID.height()); // 这里的清除范围跟画布一样大
		for(let i = this.CanvasObject.CanvasCid.length; i > 0; i--){
			if(i < 10){
				if(!this.CanvasObject.CanvasCid[i].is(":hidden")){
					this.canvasViewData.cvctx.drawImage(this.CanvasObject.CanvasCid[i][0], 0, 0);
				}
			}
		}
		let end = new Date().getTime();//接受时间
		return (end - start) + "ms";
	}
	mouserDispose(msxy){ // 鼠标坐标转换canvas内坐标
		return { x: msxy.x - this.CanvasObject.CanvasCid[0].offset().left, y: msxy.y - this.CanvasObject.CanvasCid[0].offset().top };
	}
	cursorTrackMouse(msxy){ // 光标跟踪鼠标
		this.CursorObj.msx = msxy.x;
		this.CursorObj.msy = msxy.y;
		this.CursorID.css("left", msxy.x - this.CursorID.width() / 2 - 1);
		this.CursorID.css("top", msxy.y - this.CursorID.height() / 2 - 1);
	}
	cursorHoverOnCanvas(){ // 光标悬停
		// TODO...
	}
	cursorSetSize(width){ // 设置光标的粗细
		this.CursorID.css("width", width);
		this.CursorID.css("height", width);
	}
	cursorSetDisplay(status){ // 设置光标显示隐藏
		if(status){
			this.CursorID.css("display", "block");
		} else {
			this.CursorID.css("display", "none");
		}
	}
	initColorPicker(cpbox, cpbar, cpslide, cppicker, cr, cg, cb, ch, callback, CanvasUIFuckThis){ // 初始化颜色拾取器
		this.cp = ColorPicker(
			document.getElementById(cpbar),
			document.getElementById(cpbox),
			function(hex, hsv, rgb, mousePicker, mouseSlide){
				if(!CanvasUIFuckThis.onChangeColor){
					$(cr).val(rgb.r);
					$(cg).val(rgb.g);
					$(cb).val(rgb.b);
					$(ch).val(hex);
				}
				callback(hex, hsv, rgb);
				ColorPicker.positionIndicators(
					document.getElementById(cpslide),
					document.getElementById(cppicker),
					mouseSlide, mousePicker
				);
			}
		);
		$(cr + "," + cg + "," + cb).bind("input propertychange", function(){ // 处理三个RGB的输入 范围0到255, 且不能以0开头
			let val = $(this).val();
			$(this).val(Math.abs(val));
			if(isNaN(val)){
				$(this).val(0);
			} else if(val > 255) {
				$(this).val(255);
			}
			let rgb = {
				r: $(cr).val(),
				g: $(cg).val(),
				b: $(cb).val()
			};
			CanvasUIFuckThis.onChangeColor = true;
			CanvasUIFuckThis.cp.setHex(ColorPicker.rgb2hex(rgb)); // 转换颜色
			CanvasUIFuckThis.onChangeColor = false;
			$(ch).val(ColorPicker.rgb2hex(rgb));
		});
		$(ch).bind("input propertychange", function(){ // 处理HEX颜色输入 懒得做处理了, 就简单的正则判断一下
			let val = $(this).val().toLowerCase();
			let regex = /^#[0-9a-fA-F]{6}$/;
			let hex2rgb = ColorPicker.hex2rgb(val);
			CanvasUIFuckThis.onChangeColor = true;
			if(regex.test(val)){
				CanvasUIFuckThis.cp.setHex(val);
				$(cr).val(hex2rgb.r);
				$(cg).val(hex2rgb.g);
				$(cb).val(hex2rgb.b);
			}
			CanvasUIFuckThis.onChangeColor = false;
		});
	}
	setColorPickerColor(rgb, hex){ // 设置颜色拾取器的状态值
		this.cp.setHex(hex);
	}
	messagePut(name, message, msgbox, sysmsg = false){ // 推入消息
		let nHeight = msgbox.height();
		let nScrollHeight = msgbox[0].scrollHeight;
		let nScrollTop = msgbox[0].scrollTop;
		let msg_head = "<li><a>",
			msg_mid = "</a><span>:</span>",
			msg_end ="</li>";
		if(message == ""){
			return;
		}
		if(sysmsg){
			msg_head = "<li class='hh-msg-system'><a>";
		}
		let msg = msg_head + name + msg_mid + message + msg_end;
		msgbox.find(".hh-msg-list-ul").append(msg);
		if((nScrollTop + nHeight + 50) >= nScrollHeight){
			msgbox.scrollTop(1e6);
		}
	}
	messageSend(name, message, msgul){ // 发送消息至服务器

	}
}

// 类实例化
var _CanvasObject = new CanvasObject($("#canvas-box"), ".hh-canvas");
var _CanvasUI = new CanvasUI(_CanvasObject, $("#cursor"));

// 初始化, 遍历获取所有 Canvas 的 DOM 和绘制环境
_CanvasObject.initObject(_CanvasObject);
_CanvasObject.initContext();

// 设置画布宽高和盒子宽高
_CanvasUI.canvasSetSize(1400, 1200, $("#box-1"), $("#canvas-view-div"), $("#canvas-view-rect"));
_CanvasUI.cursorSetSize(14);

// 初始化颜色选择器
_CanvasUI.initColorPicker("cp-box", "cp-bar", "slide-indicator", "picker-indicator", "#cr", "#cg", "#cb", "#ch", function(hex, hsv, rgb){
	// 这多层callback搞死人了, 妹的.
	$("a.color-a-active").css("background-color", hex);
	_CanvasUI.CanvasBush.color = hex;
}, _CanvasUI);

// 笔触栏切换处理
$("ul.pen-ul").on("click", "li", function(){
	let penname = $("#" + $(this).find("a").data("yeti-box")).text();
	let lw = $(this).find("a").data("linewidth");
	let dy = $(this).find("a").data("density");
	let ry = $(this).find("a").data("rigidity");
	$("#pen-name-title").html(penname);
	$("#width-value").val(lw).change();
	$("#density-value").val(dy).change();
	$("#rigidity-value").val(ry).change();
	$("ul.pen-ul").each(function(){
		$(this).find("a").removeClass("pen-a-active");
	});
	$(this).find("a").addClass("pen-a-active");
	_CanvasUI.CanvasBush.bush = Number($(this).val()),
	_CanvasUI.CanvasBush.linewidth = Number($(this).find("a").data("linewidth"));
	_CanvasUI.CanvasBush.color = $("a.color-a-active").css("background-color"); //$(this).find("a").data("color"),
	_CanvasUI.CanvasBush.rigidity = Number($(this).find("a").data("rigidity"));
	_CanvasUI.CanvasBush.density = Number($(this).find("a").data("density"));
	//console.log(_CanvasUI.CanvasBush);
});

// 颜色栏切换处理
$("ul.color-ul").on("click", "li", function(){
	$("#color-picker").fadeOut(100);
	if($(this).find("a.color-a-active").length > 0){
		let ctop = $(this).offset().top - 14;
		let cleft = $(this).offset().left - $("#color-picker").width() - 28;
		if(ctop + $("#color-picker").height() > $(window).height()){
			ctop -= 204;
		}
		$("#color-picker").css("top", ctop);
		$("#color-picker").css("left", cleft);
		if($("#color-picker").is(":hidden")){
			$("#color-picker").fadeIn(100);
		} else {
			$("#color-picker").fadeOut(100);
		}
		_CanvasUI.cp.setHex(ColorPicker.rgb2Hex($(this).find("a").css("background-color"))); // 设置颜色
	}
	$("ul.color-ul").each(function(){
		$(this).find("a").removeClass("color-a-active");
	});
	$(this).find("a").addClass("color-a-active");
	//$("a.pen-a-active").data("color", $(this).find("a").css("background-color"));
	_CanvasUI.CanvasBush.color = $(this).find("a").css("background-color");
	console.log(_CanvasUI.CanvasBush);
});

// 图层栏切换处理
$("ul.hh-layer-box").on("click", "li", function(){
	$("ul.hh-layer-box").each(function(){
		$(this).find("li").removeClass("hh-layer-active");
	});
	$(this).addClass("hh-layer-active");
	_CanvasUI.CanvasBush.layer = $(this).index() + 1;
});

// 图层显示隐藏处理
$("ul.hh-layer-box > li > i").click(function(){
	let index = $(this).parent().index() + 1; // +1对齐canvas层id数组
	if($(this).hasClass("mdi-eye")){
		$(this).removeClass("mdi-eye");
		$(this).addClass("mdi-eye-off");
		_CanvasUI.canvasShowAndHidden(index, false);
	} else {
		$(this).removeClass("mdi-eye-off");
		$(this).addClass("mdi-eye");
		_CanvasUI.canvasShowAndHidden(index, true);
	}
	return false;
});

// 窗口大小变化事件处理
$(window).resize(function(){
	// 关掉颜色选择框
	if(!$("#color-picker").is(":hidden")){
		$("#color-picker").fadeOut(100);
	}
	// 调整预览视图大小
	_CanvasUI.canvasSetViewBoxRect($("#container-left"), $("#canvas-view-div"), $("#canvas-view-rect"));
});
_CanvasUI.canvasSetViewBoxRect($("#container-left"), $("#canvas-view-div"), $("#canvas-view-rect"));

$(".hh-tool-bar-box").scroll(function(){
	// 关掉颜色选择框
	$("#color-picker").fadeOut(100);
});

// 笔触调整面板滑动条监听
$("#width-slider").on("moved.zf.slider", function(){
	let value = $("#width-value").val();
	$("a.pen-a-active").data("linewidth", value);
	_CanvasUI.CanvasBush.linewidth = Number(value);
	_CanvasUI.cursorSetSize(value);
});
$("#density-slider").on("moved.zf.slider", function(){
	let value = $("#density-value").val();
	$("a.pen-a-active").data("density", value);
	_CanvasUI.CanvasBush.density = Number(value);
});
$("#rigidity-slider").on("moved.zf.slider", function(){
	let value = $("#rigidity-value").val();
	$("a.pen-a-active").data("rigidity", value);
	_CanvasUI.CanvasBush.rigidity = Number(value);
});

// 画板滚动时调整预览窗口的位置
$("#container-left").scroll(function(event){
	_CanvasUI.canvasSetViewBoxRectTopAndLeft(Math.abs($("#canvas-box").offset().top / _CanvasUI.canvasViewData.s), Math.abs($("#canvas-box").offset().left / _CanvasUI.canvasViewData.s), $("#canvas-view-rect"));
	_CanvasUI.cursorSetDisplay(false);
});

// 预览视图矩形拖动处理
$("#canvas-view-rect").draggable({ 
	containment: "#canvas-view-div", // 限制拖动区域的父元素
	cursor: "crosshair",			 // 拖动时的鼠标指针样式
	scroll: false, 					 // 是否出现滚动条
	start: function(){ 				 // 拖拽元素被点击事件
		_CanvasUI.viewAllow = false;
	},
	drag: function(){				 // 拖拽元素移动产生的事件
		let pos = { left: $("#canvas-view-rect").position().left, top: $("#canvas-view-rect").position().top };
		_CanvasUI.canvasScrollTo(pos.top, pos.left, $("#container-left"));
	},
	stop: function(){				 // 拖拽元素鼠标放开事件
		_CanvasUI.viewAllow = true;
	}
});

// 预览视图外点击处理
$("#canvas-view-rect, #canvas-view").click(function(event){
	let msxy = { x: event.clientX - $("#canvas-view-div").offset().left - 0.5, y: event.clientY - $("#canvas-view-div").offset().top };
	_CanvasUI.canvasSetViewBoxRectForCursor(msxy, $("#container-left"), $("#canvas-view-div"), $("#canvas-view-rect"));
});

// 发送聊天内容
$("#msg-input").keydown(function(event){
	if(event.keyCode == 13){
		_CanvasUI.messagePut("测试君", $(this).val(), $("#msg-list-box"));
		$(this).val("");
	}
});

// 处理canvas mouse事件监听
$("#canvas-0")[0].addEventListener("mousedown", c_msdown, false); // 按下
$("#canvas-0")[0].addEventListener("mousemove", c_msmove, false); // 移动
$("#canvas-0")[0].addEventListener("mouseup", c_msup, false); // 弹起
$("#canvas-0").mouseout(function(){ // 移出边界
	_CanvasUI.cursorSetDisplay(false);
	c_msout(event);
});


function c_msdown(event){
	let msxy = { x: event.clientX, y: event.clientY };
	let _msxy = _CanvasUI.mouserDispose(msxy);
	msDown(_msxy);
}

function c_msmove(event){
	let msxy = { x: event.clientX, y: event.clientY };
	let _msxy = _CanvasUI.mouserDispose(msxy);
	_CanvasUI.cursorSetDisplay(true);
	_CanvasUI.cursorTrackMouse(_msxy);
	msMove(_msxy);
}

function c_msup(event){
	let msxy = { x: event.clientX, y: event.clientY };
	let _msxy = _CanvasUI.mouserDispose(msxy);
	msUp(_msxy);
	_CanvasUI.canvasSetViewBoxData(); 
}

function c_msout(event){
	let msxy = { x: event.clientX, y: event.clientY };
	let _msxy = _CanvasUI.mouserDispose(msxy);
	msOut(_msxy);
	msUp(_msxy); // legend never die!
}



