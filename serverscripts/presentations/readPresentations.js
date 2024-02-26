const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("../fsnDB/presentations.db",sqlite3.OPEN_READONLY, (err) => {
    if(err){
        return console.error(err.message);
    }
    else{
        console.log("successful legacy connection i think");
    }
});

module.exports = db;