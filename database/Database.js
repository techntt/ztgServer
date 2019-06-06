var mongo = require('mongojs');
class Database {
    constructor(){
    var uri = "mongodb://admin:admin@cluster0-shard-00-00-tzr0l.mongodb.net:27017,cluster0-shard-00-01-tzr0l.mongodb.net:27017,cluster0-shard-00-02-tzr0l.mongodb.net:27017/camvan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
    var database = mongo(uri);
    console.log("Database Connected: "+database);
    
    this.CloseDB = function(){
        database.close();
    }
    };

}
module.exports = Database;