require('./models/Member');
require('./models/Room');
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req,res){

});

var port = process.env.port || 8080;
serv.listen(port);

var io = require('socket.io')(serv);

console.log('>>> Server started <<<');

var LIST_SOCKET = {};
var LIST_MEMB = {};
var LIST_ROOM = {};

io.sockets.on("connect",function(socket){
    socket.id = Math.random();
    LIST_SOCKET[socket.id] = socket;
    console.log('a client connected');
    
    socket.on('joinRoom',function(name){
        var memb = new Member({id:socket.id, socket: socket, name:name});
        LIST_MEMB[memb.id] = memb;
        console.log('joinRoom');
        var room = checkAvaiableRoom();
        if(room!=null){
            room.addMemb(memb);
        }else{
            room = new Room({id:memb.id,name:"r_"+memb.id});
            room.addMemb(memb);
            LIST_ROOM[room.id]= room;
        }
    });

    socket.on('leaveRoom',function(roomId){
        console.log('leaveRoom');
        if(LIST_MEMB.hasOwnProperty(socket.id))
            delete LIST_MEMB[socket.id];
        if(LIST_ROOM.hasOwnProperty(roomId)){
            var room = LIST_ROOM[roomId];
            room.removeMemb(socket.id);
            if(room.count <=0 )
                delete LIST_ROOM[roomId];
        }
    });
    
    // socket disconnect
    socket.on('disconnect',function(){
        console.log('a client disconnected');
        if(LIST_SOCKET.hasOwnProperty(socket.id))
            delete LIST_SOCKET[socket.id];
        if(LIST_MEMB.hasOwnProperty(socket.id))
            delete LIST_MEMB[socket.id];
    });
});


// prive function
var checkAvaiableRoom = function(){
    var keys = LIST_ROOM.keys;
    for(var i=0;i<keys.length;i++){
        var room = LIST_ROOM[keys[i]];
        if(room.status === 'wait')
            return room;
    }
    return null;
}

// update task
/*
setInterval(function(){

},1000);
*/
