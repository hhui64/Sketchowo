/**
 * Sketchowo Server
 */
var app = require("express")();
var http = require("http").Server(app);
var server = app.listen(22223, function(){
	var host = server.address().address
	var port = server.address().port
});
var socket = require('socket.io').listen(server);

// app.get("/", function(req, res){
// 	res.send("hello world!");
// });

var player = [];

socket.on("connection", function(ClientSocket){ // disconnect
	player.push(ClientSocket);
	ClientSocket.on("test", function(data){ // 收到数据
		console.log(data);
	});
	ClientSocket.on("disconnect", function(socket){ // 
		let index = player.indexOf(socket);
		player.splice(index, 1);
	});
});