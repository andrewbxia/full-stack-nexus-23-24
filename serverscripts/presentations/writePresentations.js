const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("../fsnDB/presentations.db",sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        return console.error(err.message);
    }
    else{
        console.log("successful legacy connection i think");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS presentations(
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL
    )`);
});

module.exports = db;