class GameOne{

    constructor(room){
        var room = room;
        var status = '';
        var counter = 0;
        var updateTask = null;
        var LIST_PLAYER = {};
        var keys = Object.keys(room.LIST_MEMB);
        var quest; 
        var questNumber =0;
        keys.forEach(element=>{
            var memb = room.LIST_MEMB[element];
            var player = Player({socket:memb.socket,health:5});
            LIST_PLAYER[player.id]= player;
            player.socket.on("sendAnswer",(data)=>{
                player.questid = data.id;
                player.answer = data.answer;
            });
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
                GameLoop(count);
            }else if(status === 'end'){
               // Check Winner
               keys.forEach(element=>{
                var pl = LIST_PLAYER[element];
                pl.gameResult({
                    win:(pl.health>0),
                    number:questNumber
                });
            });
            }
        };

        function GameLoop(count){
            if(count == 0){
                // Handle send question
                quest = Question({
                    id :(questNumber+1),
                    type : "text",
                    quest : "What 's exactly?",
                    answer : ["A Answer","B Answer","C Answer","D Answer"],
                    correct : 1,  // "B Answer"
                });

            }else if(count <50){
                // Handle send time
                if(count%5 ==0){
                    var sec = counter/5;
                    sec = 10-sec;
                    room.sendAll({event:"timeQuest",mess:{time:sec}});
                }
            }else{
                // Kiem tra dap ap cua nguoi choi
                var endGame = false;
                keys.forEach(element=>{
                    var pl = LIST_PLAYER[element];
                    var plHealth = pl.checkAnswer(quest);
                    if(plHealth == 0)
                        endGame = true;
                });

                if(endGame)
                    status = "end";
                else{
                    if(count >= 60){
                        count = -1;
                    }
                }
            }

            count++;
        };

    }
    
}

Player = function(data){
    var self ={
        id: data.socket.id,
        socket: data.socket,
        health : data.health,
        questid: "",
        answer : -1,

        checkAnswer = function(quest){
            if(questid != quest.id || answer != quest.correct){
                health -=1;
            }
            socket.emit("checkAnswer",{
                correct : correct,
                health:health,
            });
            if(health<=0){
                return false;
            }else{
                return true;
            }
        },

        gameResult = function(data){
            socket.emit("gameResult",{
                win: data.win,
                number: data.number,
            });
        }
        
    },
    return self;
}

Question = function(data){
    var self = {
        id = data.id,
        type = data.type,
        quest = data.quest,
        answers = data.answers,
        correct = data.correct
    }
    return self;
}

module.exports = GameOne;