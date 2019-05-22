class Member {

    constructor(data){
        this.id = data.id;
        this.socket = data.socket;
        this.name = data.name;
        this.LIST_ROOM_JOIN ={};
    }
}

module.exports = Member;