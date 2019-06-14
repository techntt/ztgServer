var mongo = require('mongojs');
class Database {
    constructor(){
    var uri = "mongodb://admin:admin@cluster0-shard-00-00-tzr0l.mongodb.net:27017,cluster0-shard-00-01-tzr0l.mongodb.net:27017,cluster0-shard-00-02-tzr0l.mongodb.net:27017/camvan?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";
    var db = mongo(uri);
    console.log("Database Connected: "+db);
    
    this.isValidUser = function(data,callback){
        db.user.find({username : data.username, password : data.password},function(err,res){
            if(res.length>0){
                callback({
                    result:true,
                    user:res[0],
                });
            }
            else
                callback({
                    result:false,
                });
            });
    };

    this.hasUserName = function(data,callback){
        db.user.find({username: data.username},function(err,res){
            if(res.length>0)
                callback(true);
            else
                callback(false);
        });
    };

    this.addUser = function(data,callback){
        db.user.insert({
            username:data.username,
            password:data.password,
            email: data.email,
            level:0,
            score:0,
            status: 1},
            function(err){
                console.log("DB create user: "+data.username);
                callback(err);
            }
        );
    };

    this.changeStatusUser = function(data,callback){
        db.user.update({username:data.username},{$set:{status:data.status}},function(err){
            console.log("Change "+data.username+" status : "+data.status);
            callback();
        });
    };

    this.deleteUser = function(data,callback){
        db.user.remove({username:data.username,password:data.password},function(err){
            callback();
        })
    },

    this.CloseDB = function(){
        database.close();
    };

    };

}
module.exports = Database;