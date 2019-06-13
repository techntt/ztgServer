const Member = require('./models/Member');
const Room = require('./models/Room');
const Database = require('./database/Database')

var path = require('path');
var express = require('express');
var app = express();
var serv = require('http').Server(app);



var expressip = require('express-ip');
app.use(expressip().getIpInfoMiddleware);

app.get('/',function(req,res){
	var ipInfo = req.ipInfo;
    var message = `${ipInfo.country}`;
    res.send(message);
});

var port = process.env.PORT || 25892;
serv.listen(port);

var io = require('socket.io')(serv);

console.log('>>> Server started <<<');
console.log('>>> Port: '+port+ " <<<");
var database = new Database();

var LIST_SOCKET = {};
var LIST_MEMB = {};
var LIST_ROOM = {};

io.sockets.on("connect",function(socket){
    socket.id = Math.random();
    LIST_SOCKET[socket.id] = socket;
    console.log("SocketList: "+ Object.keys(LIST_SOCKET).length);
    console.log('a client connected : '+socket.id);
    socket.emit('connectResponse',{id:""+socket.id});
    socket.on('joinRoom',function(data){        
        var memb =LIST_MEMB[socket.id];
        console.log(data.name+'-> joinRoom');
        var room = checkAvaiableRoom();
        if(room!=null){
            room.addMemb(memb);
        }else{
            room = new Room({id:memb.id,name:"r_"+memb.id});
            room.addMemb(memb);
            LIST_ROOM[room.id]= room;
        }
        memb.LIST_ROOM_JOIN[room.id] = room;
        socket.emit("joinRoomResponse",{id:room.id});
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

    /*
    Handle authenticate user
    */
    socket.on("requestSignIn",function(data){
        database.isValidUser(data,(res)=>{
            if(res.result){
                var user = res.user;
                var memb = new Member({
                    id:socket.id,
                    socket: socket,
                    name: user.username,
                    level: user.level,
                    score: user.score
                });
                LIST_MEMB[memb.id] = memb;
                console.log(memb.name+'-> Login');
                socket.emit("responseSignIn",{
                    result:true,
                    message:"login success",
                    name: memb.name,
                    level: memb.level,
                    score: memb.score
                });
            }else{
                socket.emit("responseSignIn",{                    
                    result:false,
                    message:"username or password is wrong"
                });
            }
        });
    });

    socket.on("requestSignUp",function(data){
        database.hasUserName(data,(err)=>{
            if(err){
                socket.emit("responseSignUp",{
                    result : false,
                    message : "username has exist"
                });
            }else{
                // user isn't exist
                database.addUser(data,(success)=>{
                    if(success){
                        socket.emit("responseSignUp",{
                            result : true,
                            message : "register success"
                        });
                    }else{
                        socket.emit("responseSignUp",{
                            result : false,
                            message : "something wrong"
                        });
                    }
                });
            }
        });
    });

    // socket disconnect
    socket.on('disconnect',function(){
        console.log('a client disconnected : '+socket.id);
        if(LIST_SOCKET.hasOwnProperty(socket.id))
            delete LIST_SOCKET[socket.id];
        if(LIST_MEMB.hasOwnProperty(socket.id)){
            var memb = LIST_MEMB[socket.id];
            
            if(Object.keys(memb.LIST_ROOM_JOIN).length > 0){
                var keys = Object.keys(memb.LIST_ROOM_JOIN);
                for(var i=0;i<keys.length;i++){
                    var room = memb.LIST_ROOM_JOIN[keys[i]];
                    room.removeMemb(socket.id);
                    if(room.count <=0 )
                        delete LIST_ROOM[room.id];
                }
            }
            delete LIST_MEMB[socket.id];
        }
        console.log("SocketList: "+ Object.keys(LIST_SOCKET).length);
        console.log("RoomList: "+ Object.keys(LIST_ROOM).length);
    });
});


// prive function
checkAvaiableRoom = function(){
    var keys = Object.keys(LIST_ROOM);
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
