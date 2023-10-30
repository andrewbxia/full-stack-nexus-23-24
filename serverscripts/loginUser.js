const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("..files/fsnDB/users.db", (err) => {
    if(err){
        return console.error(err.message);
    }else{
        console.log("successful connection login");
    }
});


export function readUserDB(req, res){
    var {username, password} = req.body;
    console.log("logging in user " + username);//add username and password to this later


}

module.exports = db;