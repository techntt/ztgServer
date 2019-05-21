class Member {

    constructor(data){
        this.id = data.id;
        this.socket = data.socket;
        this.name = data.name;
    }
}

module.exports = Member;