var Member = function(data){
    var self ={
        id: data.id,
        socket: data.socket,
        name: data.name,
    }

    return self;
}