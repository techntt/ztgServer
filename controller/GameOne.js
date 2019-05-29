class GameOne{

    constructor(room){
        var room = room;
        var status = '';
        var counter = 0;
        var updateTask = null;
        

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
                    }
                }
                 
            }else if(status === 'start'){
                room.sendAll({event:"gameStart",mess:{}});
            }
        };

    }
    
}

module.exports = GameOne;