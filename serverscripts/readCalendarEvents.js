const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../../files/calendarEvents.db", sqlite3.OPEN_READONLY, (err) => {
    if(err){
        console.error(err.message);
    }
    else{
        console.log("successful connection readonly");
    }
});



module.exports = db;