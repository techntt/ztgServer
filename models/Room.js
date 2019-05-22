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
                var list = {};
                var keys = Object.keys(this.LIST_MEMB);
                for(var i =0;i < keys.length;i++){
                    list[keys[i]] = this.LIST_MEMB[keys[i]].name;
                };
                console.log("List: "+Object.keys(list));
                this.sendAll({event:"memberJoinRoom",mess:{members: list}});
                this.count ++;
                
                if(this.count>=2){
                    this.status = 'ready';
                    this.sendAll({event:'roomStatus',mess:{satus: this.status}})
                    // start game
                }
                
            }
        };

        this.removeMemb = function(membId){
            if(this.LIST_MEMB.hasOwnProperty(membId)){
                var list = {};
                var keys = Object.keys(this.LIST_MEMB);
                for(var i =0;i < keys.length;i++){
                    list[keys[i]] = this.LIST_MEMB[keys[i]].name;
                };
                this.sendAll({event:"memberLeaveRoom",mess:{members: list}});
                delete this.LIST_MEMB[membId];
                this.count --;
                if(this.count < 2){
                    this.status = 'wait';
                    this.sendAll({event:'roomStatus',mess:{satus: this.status}})
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