class GameOne{

    constructor(room){
        var room = room;
        var status = '';
        var counter = 0;
        var updateTask = null;
        var LIST_PLAYER = {};
        var keys = Object.keys(room.LIST_MEMB);
        var idArr = [];
        var quest; 
        var questNumber =0;
        var userReady = 0;
        var checking  = false;   
        var endGame = false;   
        keys.forEach(element=>{
            var memb = room.LIST_MEMB[element];
            var player = Player({socket:memb.socket,health:5});
            LIST_PLAYER[player.id]= player;
            idArr.push(player.id);
            player.socket.on("sendAnswer",(data)=>{
                player.questid = data.id;
                player.answer = data.answer;
            });

            player.socket.on("startGame",()=>{
                userReady ++;
                if(userReady == keys.length){
                    this.startGame();
                    UpdatePlayerInfo();
                }
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
                 },250);
            }

            if(!run && updateTask!=null){
                clearInterval(updateTask);
            }
            
        };

        function updateGameStatus(){
            if(status === 'ready'){
                counter ++; 
                if(counter%4 ===0){
                    var sec = Math.floor(counter/4) ;               
                    room.sendAll({event:"countDown",mess:{time:sec}});
                    if(sec == 6){
                        status = 'start';
                        room.sendAll({event:"gameStart",mess:{}});
                        counter = 0;
                    }
                }              
            }else if(status === 'start'){
                GameLoop();
            }else if(status === 'end'){
               // Check Winner               
               console.log("End Game");
               keys.forEach(element=>{
                var pl = LIST_PLAYER[element];
                pl.gameResult({
                    win:(pl.health>0),
                    number:questNumber
                });
                status="";

            });
            }
        };

        function GameLoop(){
            if(counter == 0){
                // Handle send question
                quest = Question({
                    id :questNumber,
                    type : "text",
                    quest : "What 's exactly?",
                    answers : ["A Answer","B Answer","C Answer","D Answer"],
                    correct : 1,  // "B Answer"
                });
                questNumber +=1;
                room.sendAll({event:"sendQuestion",mess:{
                    id:quest.id,
                    type:quest.type,
                    quest:quest.quest,
                    answers:quest.answers,
                    }}
                );
                checking = false;
                console.log("question : "+quest.id);
            }else if(counter <=120){
                // Handle send time
                var sec = 30-Math.floor(counter/4);
                room.sendAll({event:"timeQuest",mess:{time:sec}});                
            }else{
                // Kiem tra dap ap cua nguoi choi
                if(!checking){
                    checking = true;
                    keys.forEach(element=>{
                        var pl = LIST_PLAYER[element];
                        if(!pl.checkAnswer(quest))
                            endGame = true;
                    });
                    UpdatePlayerInfo();
                }                
                
                if(counter >= 140){
                    if(endGame)
                        status = "end";
                    else
                        counter = -1;                    
                }
            }
            counter++;
        };

        function UpdatePlayerInfo(){
            room.sendAll({event:"playersInfo",mess:{
                player1 :{
                    id: room.LIST_MEMB[idArr[0]].id,
                    name: room.LIST_MEMB[idArr[0]].name,
                    health : LIST_PLAYER[idArr[0]].health
                },
                player2: {
                    id: room.LIST_MEMB[idArr[1]].id,
                    name: room.LIST_MEMB[idArr[1]].name,
                    health : LIST_PLAYER[idArr[1]].health
                }
            }});
        }

    }
    
}

Player = function(data){
    var self ={
        id: data.socket.id,
        socket: data.socket,
        health : data.health,
        questid: "",
        answer : -1,
        checkAnswer : function(quest){
            if(this.questid != quest.id || this.answer != quest.correct){
                this.health -=1;
            }
            this.socket.emit("checkAnswer",{
                correct : quest.correct,
                health: this.health,
            });
            if(this.health>0){
                return true;
            }else{
                return false;
            }
        },

        gameResult : function(data){
            this.socket.emit("gameResult",{
                win: data.win,
                number: data.number,
            });
        }
    }
    return self;
}

Question = function(data){
    var self = {
        id : data.id,
        type : data.type,
        quest : data.quest,
        answers : data.answers,
        correct : data.correct
    }
    return self;
}

module.exports = GameOne;