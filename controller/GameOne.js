class GameOne{

    constructor(room){
        var room = room;
        var status = '';
        var counter = 0;
        var updateTask = null;
        var LIST_PLAYER = {};
        var keys = Object.keys(room.LIST_MEMB);
        keys.forEach(element=>{
            var memb = room.LIST_MEMB[element];
            var player = Player({socket:memb.socket,health:5});
            LIST_PLAYER[player.id]= player;
        });

        this.startGame = function(){
            status = 'ready';
            console.log("Game ready! "+status);
        };

        this.updateGame = function(run){
            if(run && updateTask == null){
                updateTask = setInterval(function(){
                    updateGameStatus();
                 },200);
            }

            if(!run && updateTask!=null){
                clearInterval(updateTask);
            }
            
        };

        function updateGameStatus(){
            if(status === 'ready'){
                counter ++;
                if(counter%5==0){
                    var sec = counter/5;
                    console.log("Second: "+sec);
                    room.sendAll({event:"countDown",mess:{time:sec}});
                    if(counter == 15){
                        status = 'start';
                        room.sendAll({event:"gameStart",mess:{}});
                        count = 0;
                    }
                }
                 
            }else if(status === 'start'){
                Question(count);
            }
        };

        function Question(count){
            if(count == 0){
                // Handle send question
            }else if(count <50){
                // Handle send time
                if(count%5 ==0){
                    var sec = counter/5;
                    sec = 10-sec;
                    room.sendAll({event:"timeQuest",mess:{time:sec}});
                }
            }else{
                // Kiem tra dap ap cua nguoi choi
            }

            count++;
        };

        // Handle user send Answer
        

    }
    
}

Player = function(data){
    var self ={
        id: data.socket.id,
        socket: data.socket,
        health : data.health,
        answer : "",
        subHealth = function(){
            health -=1;
            if(health<=0){
                return false;
            }else{
                return true;
            }
        }
    },
    return self;
}

module.exports = GameOne;