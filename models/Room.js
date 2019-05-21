var Room = function(data){

    var self = {
        id:data.id,
        name:data.name,
        status:'wait',
        count:0,
        LIST_MEMB : {},
        game: data.game,

        addMemb: function(memb){
            if(status === 'wait'){
                LIST_MEMB[memb.id]=memb;
                count ++;
                if(count>=2){
                    status = 'ready';
                    sendAll({event:'roomStatus',mess:status})
                    // start game
                }
            }
        },

        removeMemb :function(membId){
            if(LIST_MEMB.hasOwnProperty(membId)){
                delete LIST_MEMB[membId];
                count --;
                if(count < 2){
                    status = 'wait';
                    sendAll({event:'roomStatus',mess:status})
                }
            }
                
        },

        sendAll : function(data){
            var keys = LIST_MEMB.keys;
            for(var i =0;i < keys.length;i++){
                var memb = LIST_MEMB[keys[i]];
                memb.socket.emit(data.event,data.mess);
            }
        },

        sendMemb : function(data){
            if(LIST_MEMB.hasOwnProperty(data.id)){
                var memb = LIST_MEMB[data.id];
                memb.socket.emit(data.event,data.mess);
            }
        }
    }
    return self;
}