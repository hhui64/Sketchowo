"use strict";
const ProjectName = "Sketchowo"
const ProjectVersion = "1.0.1.18603";

/*  
 *  Sketchowo - A Multi Player Online Sketchpad.
 *  (c) 2018 Scout EI Studio.
 *
 *  https://github.com/sc0utz/Sketchowo/blob/master/LICENSE
 */

$(document).ready(function() {

	// 初始化, 获取ID和设置绘制模式.
	var canvas_draw = [];
	var canvas_draw_ctx = [];
	var canvas_cursor = $("#cursor"); // 指针DIV
	// 预览画布
	var vc = $("#canvas-view");
	var vctx = vc[0].getContext("2d");

	// -------------系统类 -------------
	function system(){
		// 初始化 Canvas 元素
		this.initCanvasID = function(){
			canvas_draw.push($("#canvas-box").children(".canvas"));
		}
		// 获取 Canvas 前后文
		// * 0是预览画布
		this.initCanvasCtx = function(){
			for(let i = 0; i < canvas_draw[0].length; i++){
				canvas_draw_ctx.push(canvas_draw[0][i].getContext("2d"));
			}
		}
	}

	var system = new system();
	system.initCanvasID();
	system.initCanvasCtx();

	console.log(canvas_draw[0].length,canvas_draw_ctx);
	
	// ------------- Canvas 对象类 -------------
	function canvas(cid_, ctx_) {
		// 自身私有属性
		this.w_ = cid_.width();
		this.h_ = cid_.height();
		this.isDraw = false;
		this.msX = [];
		this.msY = [];
		this.bX = [];
		this.bY = [];
		this.data_ = ctx_.getImageData(0, 0, this.w_, this.h_);
		// 画板默认样式
		this.lineWidth_ = 1.03; 	// 1.03
		this.lineCap_ = "round";
		this.lineJoin_ = "round";
		this.lineColor_ = "black";
		this.bush = 1; // 默认笔刷
		// 自身伪成员
		this.self = ctx_;
		this.selfId = cid_[0];
		this.selfId_ = cid_;
		// 方法-设置样式-初始化默认样式
		this.setStrokeStyle = function(lw = 0, clr = "") {
			(lw == 0) ? ctx_.lineWidth = this.lineWidth_ : ctx_.lineWidth = lw;
			(clr == "") ? ctx_.strokeStyle = this.lineColor_ : ctx_.strokeStyle = clr;
			//(bush != 0) ? this.bush = bush;
			ctx_.lineCap = this.lineCap_;
			ctx_.lineJoin = this.lineJoin_;
			this.lineWidth_ = lw;
			this.lineColor_ = clr;
			//
		}
		// 方法-取元素宽高
		this.getWidthAndHeight = function() {
			this.w_ = cid_.width();
			this.h_ = cid_.height();
			return {w:cid_.width(), h:cid_.height()};
		}
		// 方法-设置画布宽高
		this.setWidthAndHeight = function(w, h) {
			cid_.attr("width", w);
			cid_.attr("height", h);
			$(".is-draw-canvas").css("width", w);
			$(".is-draw-canvas").css("height", h);
		}
		// 方法-保存当前画布内容
		this.save = function() {
			this.getWidthAndHeight();
			this.data_ = ctx_.getImageData(0, 0, this.w_, this.h_);
			return this.data_;
		}
		// 方法-恢复画布内容
		this.recovery = function() {
			this.getWidthAndHeight();
			ctx_.putImageData(this.data_, 0, 0);
		}
		// 方法-绘制线条 TODO: 笔刷
		this.drawline = function(isClear = false) {
			let beginX = 0, beginY = 0, ctrlX = 0, ctrlY = 0, endX = 0, endY = 0;
			ctx_.save();
			ctx_.beginPath();
			// 笔触 开始
			switch(this.bush){
				case 0:
					// 橡皮擦 by scout 2018-05-30
					this.bX.push((this.msX[this.msX.length - 1] - this.msX[this.msX.length - 2]) / 2 + this.msX[this.msX.length - 2]);
					this.bY.push((this.msY[this.msY.length - 1] - this.msY[this.msY.length - 2]) / 2 + this.msY[this.msY.length - 2]);
					beginX = this.bX[this.bX.length - 2];
					beginY = this.bY[this.bY.length - 2];
					ctrlX = this.msX[this.msX.length - 2];
					ctrlY = this.msY[this.msY.length - 2];
					endX = this.bX[this.bX.length - 1];
					endY = this.bY[this.bY.length - 1];
					ctx_.globalCompositeOperation = "destination-out";
					ctx_.moveTo(beginX, beginY);
					ctx_.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
					break;
				case 1:
					// 铅笔笔触 & 线条平滑算法 by scout 2018-05-21
					this.bX.push((this.msX[this.msX.length - 1] - this.msX[this.msX.length - 2]) / 2 + this.msX[this.msX.length - 2]);
					this.bY.push((this.msY[this.msY.length - 1] - this.msY[this.msY.length - 2]) / 2 + this.msY[this.msY.length - 2]);
					/*
					beginX = this.bX[this.bX.length - 2];
					beginY = this.bY[this.bY.length - 2];
					ctrlX = this.msX[this.msX.length - 2];
					ctrlY = this.msY[this.msY.length - 2];
					endX = this.bX[this.bX.length - 1];
					endY = this.bY[this.bY.length - 1];

					let offset = this.getWidthAndHeight().w;
					ctx_.translate(-offset, 0);

					ctx_.lineCap = "butt";

					ctx_.moveTo(beginX, beginY);
					ctx_.quadraticCurveTo(ctrlX, ctrlY, endX, endY);

					ctx_.shadowColor = 'rgba(0,0,0,0.3)';
					ctx_.shadowOffsetX = offset; //offset
					ctx_.shadowBlur = 5;

					// //ctx_.strokeStyle = "red";
					// //ctx_.translate(offset, 0);

					ctx_.stroke();
					ctx_.restore();
					*/

					//  绘制前是否清除
					if(isClear){
						ctx_.clear();
					}
					
					// 重新设置路径偏移
					let offset = this.getWidthAndHeight().w;
					ctx_.translate(-offset, 0);
					// 循环连线避免点重叠
					for(let i = 0; i < this.bX.length; i++){
						beginX = this.bX[i - 1];
						beginY = this.bY[i - 1];
						ctrlX = this.msX[i - 1];
						ctrlY = this.msY[i - 1];
						endX = this.bX[i];
						endY = this.bY[i];
						ctx_.moveTo(beginX, beginY);
						ctx_.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
					}

					// 设置阴影样式
					ctx_.shadowColor = 'rgba(0,0,0,0.3)';
					ctx_.shadowOffsetX = offset; //offset
					ctx_.shadowBlur = 5;

					// 绘制和抵消路径偏移
					//ctx_.globalCompositeOperation = "source-out";
					ctx_.stroke();
					ctx_.closePath();
					ctx_.restore();

					break;
				case 2:
					// 拉丝笔触第一版 by scout 2018-05-28
					beginX = this.msX[this.msX.length - 5]; // 10
					beginY = this.msY[this.msY.length - 5];
					ctrlX = this.msX[this.msX.length - 2];	// 8
					ctrlY = this.msY[this.msY.length - 2];
					endX = this.msX[this.msX.length - 1];	// 1
					endY = this.msY[this.msY.length - 1];
					ctx_.moveTo(beginX, beginY);
					ctx_.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
					break;
				case 3:
					// TUDO...
					break;
				default:
					// TUDO...
					break;
			}
			// 笔触 结束
			ctx_.stroke();
			ctx_.closePath();
			ctx_.restore();
			//console.log(this.bush, "bibi");
			//console.log(this.msX[this.msX.length - 2], this.msY[this.msY.length - 2], this.msX[this.msX.length - 1], this.msY[this.msY.length - 1]);
		}
		// 方法-修复交叉点无法绘制
		this.drawlineArc = function(x, y) {
			ctx_.beginPath();
			ctx_.arc(x, y, ctx_.lineWidth < 2 ? ctx.lineWidth : ctx_.lineWidth / 2 - 0.5, 0, 2 * Math.PI);
			ctx_.fillStyle = ctx_.strokeStyle;
			ctx_.fill();
			ctx_.closePath();
		}
		// 方法-清空画布
		this.clear = function() {
			this.getWidthAndHeight();
			ctx_.clearRect(0, 0, this.w_, this.h_);
		}
		// 16进制转10进制 255
		this.Hex2Num = function(hex){
			return parseInt(hex, 16).toString(10); 
		}
		// 0-100 转16进制透明度通道
		this.Num2Hex = function(num){
			num /= 0.3921568627451;
			let hex = Math.round(num).toString(16);
			if(hex.length < 2){
				return "0" + hex;
			}
			return hex; 
		}
		// --- 测试
		this.fixCrossPoint = function(){
			let beginX = 0, beginY = 0, ctrlX = 0, ctrlY = 0, endX = 0, endY = 0;
			ctx_.beginPath();
			let offset = this.getWidthAndHeight().w;
			ctx_.translate(-offset, 0);
			for(let i = 0; i < this.bX.length; i++){
				beginX = this.bX[i - 1];
				beginY = this.bY[i - 1];
				ctrlX = this.msX[i - 1];
				ctrlY = this.msY[i - 1];
				endX = this.bX[i];
				endY = this.bY[i];
				ctx_.moveTo(beginX, beginY);
				ctx_.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
			}
			ctx_.shadowColor = 'rgba(0,0,0,0.3)';
			ctx_.shadowOffsetX = offset; //offset
			ctx_.shadowBlur = 5;
			ctx_.stroke();
			ctx_.closePath();
			ctx_.restore();
		}
	}
	// ------------- 
	// 预览画布CANVAS类
	function view_canvas(cid_, ctx_) {
		// 自身私有属性
		this.allow = true;
		this.w_ = cid_.width();
		this.h_ = cid_.height();
		this.scale = 0;
		this.scale100 = 0;
		// 方法-取元素宽高
		this.getWidthAndHeight = function(){
			this.w_ = cid_.width();
			this.h_ = cid_.height();
			return {w:this.w_, h:this.h_};
		}
		// 方法-根据画布和预览窗口自动设置预览画布的尺寸
		this.setWidthAndHeight = function(ReferCanvasObject, ViewBoxWidth, ViewBoxHeight) {
			let wh = ReferCanvasObject.getWidthAndHeight();
			if (wh.w > wh.h) {
				this.scale = (wh.w / ViewBoxWidth);
				cid_.attr("width", ViewBoxWidth);
				cid_.attr("height", wh.h / this.scale);
				this.scale100 = (ViewBoxWidth / wh.w) * 100;
			} else {
				this.scale = (wh.h / ViewBoxHeight);
				cid_.attr("width", wh.w / this.scale);
				cid_.attr("height", ViewBoxHeight);		
				this.scale100 = (ViewBoxHeight / wh.h) * 100;
			}
		}
		// 方法-设置矩形视图大小
		this.setViewRectWidthAndHeight = function(ViewRectElementID, ReferClientRectBoxElementID){
			let rwh = { w:ReferClientRectBoxElementID.width(), h:ReferClientRectBoxElementID.height() }
			ViewRectElementID.css("width", Math.round(rwh.w / this.scale));
			ViewRectElementID.css("height", Math.round(rwh.h / this.scale));
			ViewRectElementID.css("max-width", this.getWidthAndHeight().w);
			ViewRectElementID.css("max-height", this.getWidthAndHeight().h);
		}
		// 方法-根据画布位置调整矩形视图位置
		this.setViewRectTopAndLeft = function(ViewRectElementID, ReferClientRectBoxElementID, ReferCanvasObject){
			if(this.allow == false) { // 开关
				return;
			} else {
				ViewRectElementID.css("left", Math.abs(ReferCanvasObject.selfId_.offset().left) / this.scale);
				ViewRectElementID.css("top", Math.abs(ReferCanvasObject.selfId_.offset().top) / this.scale);
			}
		}
		// 方法-设置缩放比例
		this.setScale = function(scaleX = 0, scaleY = 0){
			ctx_.scale(
				(scaleX == 0) ? this.scale100 / 100 : scaleX,
				(scaleY == 0) ? this.scale100 / 100 : scaleY
			);
		}
		// 方法-设置预览视图的拖拽事件
		this.setViewRectDrag = function(ViewRectElementID, ViewBoxIdName, ReferClientRectBoxElementID){

		}
	} // END

	// 画笔框跟踪鼠标类
	function cursor(CursorElementID){
		this.w = CursorElementID.width();
		this.h = CursorElementID.height();
		this.x = 0;
		this.y = 0;
		this.color = "black";
		this.display = false;
		this.trackMouse = function(msx, msy){
			this.x = msx - (this.w / 2);
			this.y = msy - (this.h / 2);
			if(this.display){
				CursorElementID.css("top", this.y);
				CursorElementID.css("left", this.x);
				CursorElementID.show();
			} else {
				CursorElementID.hide();
			}
		}
		this.setLineWidthAndStyle = function(ReferCanvasObject, LineWidth = 0, Color = ""){
			this.w = this.h = (LineWidth == 0) ? ReferCanvasObject.lineWidth_ : LineWidth;
			this.color = (Color == "") ? ReferCanvasObject.lineColor_ : Color;
			if(this.w <= 1.5 || this.h <= 1.5){
				this.w *= 3;
				this.h *= 3;
			}
			CursorElementID.css("width", this.w);
			CursorElementID.css("height", this.h);
			CursorElementID.css("border", "1px solid " + this.color);
		}
		this.setDisplay = function(isDisplay = false){
			this.display = isDisplay;
			if(this.display){
				CursorElementID.show();
			} else {
				CursorElementID.hide();
			}
		}
	}
	
	// 创建 canvas 对象
	var canvas_ = [];
	var vcanvas = new view_canvas(vc, vctx);
	var cursor = new cursor(canvas_cursor);

	for(let ci = 0; ci < canvas_draw[0].length; ci++){
		canvas_.push(new canvas(canvas_draw[0].eq(ci), canvas_draw_ctx[ci]));
		canvas_[ci].setWidthAndHeight(1920, 1200);
		canvas_[ci].setStrokeStyle(1.03, "#000"); // 设置线条样式
	}

	//console.log(canvas);
	
	// 初始化设置样式

	// canvas.setWidthAndHeight(1920, 1200);
	// canvas.setStrokeStyle(1.03, "#000"); // 设置线条样式

	cursor.setLineWidthAndStyle(canvas_[0], 0, "#666"); // 设置光标样式 VIEW
	
	// 创建监听事件合集
	window.addEventListener("resize", WindowResize, false); // 浏览器尺寸改变
	canvas_[0].selfId.addEventListener("mousedown", c_msdown, false); // 按下
	canvas_[0].selfId.addEventListener("mouseup", c_msup, false); // 抬起
	canvas_[0].selfId.addEventListener("mousemove", c_msmove, false); // 移动

	// 回调事件-鼠标按下
	function c_msdown(event) {
		//canvas.self.lineWidth = $(".-active-").data("linewidth");
		//canvas.save();
		canvas_[1].isDraw = true;
		c_msmove(event); // 按下同时push当前坐标点
	}

	// 回调事件-鼠标抬起
	function c_msup() {
		// 检测当前点是否交叉
		if(canvas_[0].msX.length == 1) {
			canvas_[1].drawlineArc(canvas_[0].msX[canvas_[0].msX.length - 1], canvas_[0].msY[canvas_[0].msY.length - 1]);
		}

		//canvas.fixCrossPoint();

		canvas_[1].isDraw = false;
		// 清空坐标数组
		canvas_[1].msX.splice(0, canvas_[1].msX.length);
		canvas_[1].msY.splice(0, canvas_[1].msY.length);
		canvas_[1].bX.splice(0, canvas_[1].bX.length);
		canvas_[1].bY.splice(0, canvas_[1].bY.length);

		// 所有画布内容push到预览画布
		// 这里是设置缩放了, clearRect必须对应缩放前的原尺寸.否则会导致一些稀奇古怪的BUG.
		let wh = canvas_[1].getWidthAndHeight();
		vctx.clearRect(0, 0, wh.w, wh.h);
		vctx.drawImage(canvas_draw[0][1], 0, 0);

	}
	// 回调事件-鼠标移动
	function c_msmove(event) {
		cursor.setDisplay(true);
		cursor.setLineWidthAndStyle(canvas, $(".-active-").data("linewidth"), "#666");
		cursor.trackMouse(event.clientX - canvas_[1].selfId_.offset().left, event.clientY - canvas_[1].selfId_.offset().top);
		if(canvas_[1].isDraw) {
			// * 像素偏移修正 by scout 2018-05-16
			// 修正 canvas 在绘制 1px 线条时和屏幕像素点不对齐导致的横纵向线条发虚
			// 这里给一个 0.5px 偏移即可和屏幕像素点对齐, 此玄学问题已困扰我多年...
			if(canvas_[1].lineWidth_ <= 1.2) {
				canvas_[1].msX.push(event.clientX - canvas_[1].selfId_.offset().left + .5);
				canvas_[1].msY.push(event.clientY - canvas_[1].selfId_.offset().top + .5);
			} else {
				canvas_[1].msX.push(event.clientX - canvas_[1].selfId_.offset().left);
				canvas_[1].msY.push(event.clientY - canvas_[1].selfId_.offset().top);
			}
	
			// 绘制线条
			canvas_[1].drawline();
	
		}
	}
	// 当鼠标移除边界时停止绘画
	canvas_[1].selfId_.mouseout(function() {
		cursor.setDisplay(false);
		if(canvas_[1].isDraw) { 
			c_msup();
		}
	});

	// 先根据大画布设置预览画布的大小
	vcanvas.setWidthAndHeight(canvas_[1], 299, 224);
	// 然后按照缩放比例设置预览画布
	vcanvas.setScale();
	// 回调事件-浏览器尺寸改变
	function WindowResize() {
		vcanvas.setViewRectWidthAndHeight($("#canvas-view-rect"), $(".draw-box"));
	}
	// 画板滚动时调整预览窗口的位置
	$(".draw-box").scroll(function(event){
		vcanvas.setViewRectTopAndLeft($("#canvas-view-rect"), $(".draw-box"), canvas_[1]);
		cursor.setDisplay(false);
	});
	// 预览框拖动时处理事件
	$("#canvas-view-rect").draggable({ 
		containment: "#canvas-view-box", // 限制拖动区域的父元素
		cursor: "crosshair",			 // 拖动时的鼠标指针样式
		scroll: false, 					 // 是否出现滚动条
		start: function(){ 				 // 拖拽元素被点击事件
			vcanvas.allow = false;
		},
		drag: function(){				 // 拖拽元素移动产生的事件
			// 拖动处理代码
			let pos = { x:$("#canvas-view-rect").position().left, y:$("#canvas-view-rect").position().top };
			$(".draw-box").scrollLeft(Math.abs(-(pos.x) * vcanvas.scale));
			$(".draw-box").scrollTop(Math.abs(-(pos.y) * vcanvas.scale));
		},
		stop: function(){				 // 拖拽元素鼠标放开事件
			vcanvas.allow = true;
		}
	});
	// END

	// 笔触栏切换处理
	$("ul#penlist").on("click", "li", function(){
		$("ul#penlist").each(function(){
			$(this).find("i").removeClass("tools-active");
			$(this).find("li").removeClass("-active-");
		});
		$(this).find("i").addClass("tools-active");
		$(this).addClass("-active-");
		canvas_[1].setStrokeStyle($(this).data("linewidth"), $(this).data("color") + canvas_[1].Num2Hex($(this).data("density")));
		canvas_[1].bush = $(this).val();
	});

	// 初始化时先设置一遍
	WindowResize();

	// 输出控制台信息
	console.log(ProjectName + ": Main.js ver " + ProjectVersion);
	console.log("%c嘿~您好! ⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄ 您似乎发现了什么呢?...", "color:green");
	console.log("如果您想帮助我们改进这个项目, 欢迎将您的代码提交给我们~\n您还可以向我们提出建议, 邮箱地址是: admin@cswar.cn\n此项目遵循 AGPL-3.0 开源协议, 项目的 Github 仓库地址:\nhttps://github.com/sc0utz/Sketchowo");

});
// End
