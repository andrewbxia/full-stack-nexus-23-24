const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../fsnDB/legacyCalendarEvents.db", sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error(err.message);
    }
    else{
        console.log("successful legacy connection readonly");
    }
});



module.exports = db;