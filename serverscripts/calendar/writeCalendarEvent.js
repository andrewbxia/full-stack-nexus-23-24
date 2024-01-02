const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("../fsnDB/calendarEvents.db", sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        console.error(err.message);
    }
    else{
        console.log("successful connection write");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS events(
        id INTEGER PRIMARY KEY,
        user TEXT NOT NULL,
        title TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        starttime TEXT NOT NULL,
        endtime TEXT
    )`);//if start == end just display start
    //YYYY MM DD HH MM
    //ex: 2008 12 35 07 30
});


module.exports = db;