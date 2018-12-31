/* 
 * @name: Sketchowo Canvas Control
 * @author: Scout
 * @param: Responsible for canvas drawing and various logical interactions.
 * @version: 1.0
 */
"use strict";
const ProjectName = "Sketchowo"
const ProjectVersion = "1.0.0.180608";

//console.log(_CanvasObject.CanvasCid);

class CanvasDraw {
	constructor(CanvasObject, CanvasUI, thisObject){
		this.co = CanvasObject;
		this.to = thisObject;
		this.msxy = { x: [], y: [], bx: [], by: []};
		this.isDraw = false;
	}
	msxyclear(){
		this.msxy = { x: [], y: [], bx: [], by: []};
	}
	bushcalc(bushid = 1){ // bush绘制路径计算
		let painter = { 
			beginX: 0, 
			beginY: 0, 
			ctrlX: 0, 
			ctrlY: 0, 
			endX: 0, 
			endY: 0 
		};
		switch(bushid){
			case 0: // 橡皮擦
				this.msxy.bx.push((this.msxy.x[this.msxy.x.length - 1] - this.msxy.x[this.msxy.x.length - 2]) / 2 + this.msxy.x[this.msxy.x.length - 2]);
				this.msxy.by.push((this.msxy.y[this.msxy.y.length - 1] - this.msxy.y[this.msxy.y.length - 2]) / 2 + this.msxy.y[this.msxy.y.length - 2]);
				painter.beginX = this.msxy.bx[this.msxy.bx.length - 2];
				painter.beginY = this.msxy.by[this.msxy.by.length - 2];
				painter.ctrlX = this.msxy.x[this.msxy.x.length - 2];
				painter.ctrlY = this.msxy.y[this.msxy.y.length - 2];
				painter.endX = this.msxy.bx[this.msxy.bx.length - 1];
				painter.endY = this.msxy.by[this.msxy.by.length - 1];
				break;
			case 1: // 画笔 2018-05-21
				this.msxy.bx.push((this.msxy.x[this.msxy.x.length - 1] - this.msxy.x[this.msxy.x.length - 2]) / 2 + this.msxy.x[this.msxy.x.length - 2]);
				this.msxy.by.push((this.msxy.y[this.msxy.y.length - 1] - this.msxy.y[this.msxy.y.length - 2]) / 2 + this.msxy.y[this.msxy.y.length - 2]);
				painter.beginX = this.msxy.bx[this.msxy.bx.length - 2];
				painter.beginY = this.msxy.by[this.msxy.by.length - 2];
				painter.ctrlX = this.msxy.x[this.msxy.x.length - 2];
				painter.ctrlY = this.msxy.y[this.msxy.y.length - 2];
				painter.endX = this.msxy.bx[this.msxy.bx.length - 1];
				painter.endY = this.msxy.by[this.msxy.by.length - 1];
				break;
			case 2:

				break;
			case 3: // 贝塞尔铅笔 2018-05-28
				painter.beginX = this.msxy.x[this.msxy.x.length - 5]; // 10,5
				painter.beginY = this.msxy.y[this.msxy.y.length - 5];
				painter.ctrlX = this.msxy.x[this.msxy.x.length - 2]; // 8,2
				painter.ctrlY = this.msxy.y[this.msxy.y.length - 2];
				painter.endX = this.msxy.x[this.msxy.x.length - 1];	// 1
				painter.endY = this.msxy.y[this.msxy.y.length - 1];
				break;
			case 4:
				break;
		}
		return painter;
	}
	drawarcfix(_msxy, _bush){ // 修复点交叉无法绘制
		let layer = _CanvasObject.CanvasCtx[_bush.layer];
		let painter = this.bushcalc(Number(_bush.bush));
		if(_bush.linewidth < 1.04){ // 像素偏移修正
			this.msxy.x.push(_msxy.x + .5);
			this.msxy.y.push(_msxy.y + .5);
		} else {
			this.msxy.x.push(_msxy.x);
			this.msxy.y.push(_msxy.y);
		}
		layer.lineCap = "round";
		layer.lineJoin = "round";
		layer.globalCompositeOperation = "source-over";
		switch(_bush.bush){
			case 0:
				layer.beginPath();
				layer.globalCompositeOperation = "destination-out";
				layer.arc(this.msxy.x[0], this.msxy.y[0], _bush.linewidth < 2 ? _bush.linewidth - .8 : _bush.linewidth / 2 - 0.5, 0, 2 * Math.PI);
				layer.fill();
				//layer.globalCompositeOperation = "source-over";
				layer.closePath();
			case 1:
				layer.fillStyle = _bush.color;
				layer.beginPath();
				layer.arc(this.msxy.x[0], this.msxy.y[0], _bush.linewidth < 2 ? _bush.linewidth - .8 : _bush.linewidth / 2 - 0.5, 0, 2 * Math.PI);
				layer.fill();
				layer.closePath();
			case 2:
				layer.fillStyle = _bush.color;
				layer.beginPath();
				layer.closePath();
			case 3:
				layer.fillStyle = _bush.color;
				layer.beginPath();
				layer.closePath();
			case 4:
				layer.fillStyle = _bush.color;
				layer.beginPath();
				layer.closePath();
		}
	}
	draw(_msxy, _bush){
		let layer = _CanvasObject.CanvasCtx[_bush.layer];
		let painter = this.bushcalc(Number(_bush.bush));
		if(_bush.linewidth < 1.04){ // 像素偏移修正
			this.msxy.x.push(_msxy.x + .5);
			this.msxy.y.push(_msxy.y + .5);
		} else {
			this.msxy.x.push(_msxy.x);
			this.msxy.y.push(_msxy.y);
		}
		layer.lineCap = "round";
		layer.lineJoin = "round";
		layer.globalCompositeOperation = "source-over";
		switch(_bush.bush){
			case 0:
				layer.lineWidth = _bush.linewidth;
				layer.strokeStyle = _bush.color;
				layer.beginPath();
				layer.globalCompositeOperation = "destination-out";
				layer.moveTo(painter.beginX, painter.beginY);
				layer.quadraticCurveTo(painter.ctrlX, painter.ctrlY, painter.endX, painter.endY);
				layer.stroke();
				layer.closePath();
				break;
			case 1:
				(_bush.linewidth < 1.04) ? layer.lineWidth = 1.03 : layer.lineWidth = _bush.linewidth;
				//layer.lineWidth = _bush.linewidth;
				layer.strokeStyle = _bush.color;
				layer.beginPath();
				layer.moveTo(painter.beginX, painter.beginY);
				layer.quadraticCurveTo(painter.ctrlX, painter.ctrlY, painter.endX, painter.endY);
				layer.stroke();
				layer.closePath();
				break;
			case 2:
				
				break;
			case 3:
				(_bush.linewidth == 1) ? layer.lineWidth = 0.5 : layer.lineWidth = _bush.linewidth;
				//layer.lineWidth = _bush.linewidth;
				layer.strokeStyle = _bush.color;
				layer.beginPath();
				layer.moveTo(painter.beginX, painter.beginY);
				layer.quadraticCurveTo(painter.ctrlX, painter.ctrlY, painter.endX, painter.endY);
				layer.stroke();
				layer.closePath();
				break;
			case 4:

				break;
		}
	}
}

var _CanvasDraw = new CanvasDraw(_CanvasObject, _CanvasUI, _CanvasDraw);

// var _TIMER = setInterval(function TIMER(){
	
// }, 1000);

var _TIMERS = 0;
var _TIMER = requestAnimationFrame(function TIMER(){
	_TIMERS++;
	if(_TIMERS == 100){
		//console.log(_CanvasUI.canvasSetViewBoxData());
		_TIMERS = 0;
	}
	requestAnimationFrame(TIMER);
});

function msDown(_msxy){
	_CanvasDraw.isDraw = true;
	_CanvasDraw.drawarcfix(_msxy, _CanvasUI.CanvasBush);
}

function msMove(_msxy){
	if(_CanvasDraw.isDraw){
		_CanvasDraw.draw(_msxy, _CanvasUI.CanvasBush);
	}
}
	
function msUp(_msxy){
	_CanvasDraw.msxyclear();
	_CanvasDraw.isDraw = false;
}

function msOut(_msxy){
	_CanvasDraw.msxyclear();
	_CanvasDraw.isDraw = false;
}

