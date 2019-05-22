class Room{
    constructor(data){
        this.id=data.id;
        this.name=data.name;
        this.status='wait';
        this.count=0;
        this.LIST_MEMB = {};
        this.game= data.game;

        this.addMemb = function(memb){
            if(this.status === 'wait'){
                this.LIST_MEMB[memb.id]=memb;
                this.sendAll({event:"memberJoinRoom",mess:{name:memb.name,id:memb.id}});
                this.count ++;
                if(this.count>=2){
                    this.status = 'ready';
                    this.sendAll({event:'roomStatus',mess:this.status})
                    // start game
                }
            }
        };

        this.removeMemb =function(membId){
            if(this.LIST_MEMB.hasOwnProperty(membId)){
                var memb = this.LIST_MEMB[membId];
                this.sendAll({event:"memberLeaveRoom",mess:{name:memb.name,id:memb.id}});
                delete this.LIST_MEMB[membId];
                this.count --;
                if(this.count < 2){
                    this.status = 'wait';
                    this.sendAll({event:'roomStatus',mess:this.status})
                }
            }
                
        };

        this.sendAll = function(data){
            var keys = Object.keys(this.LIST_MEMB);
            for(var i =0;i < keys.length;i++){
                var memb = this.LIST_MEMB[keys[i]];
                memb.socket.emit(data.event,data.mess);
            }
        };

        this.sendMemb = function(data){
            if(this.LIST_MEMB.hasOwnProperty(data.id)){
                var memb = this.LIST_MEMB[data.id];
                memb.socket.emit(data.event,data.mess);
            }
        }
    }

    Instance(){
        return this;
    }
}

module.exports = Room;