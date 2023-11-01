/*const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("../files/fsnDB/calendarEvents.db", (err) => {
    if(err){
        return console.error(err.message);
    }
    else{
        console.log("successful connection i think");
    }
});



db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS events(
        id INTEGER PRIMARY KEY,
        user TEXT,
        title TEXT,
        description TEXT,
        date TEXT,
        starttime TEXT,
        endtime TEXT
    )`);//if start == end just display start
    //YYYY MM DD HH MM
    //ex: 2008 12 35 07 30
});

//app.use(bodyParser.json());S


module.exports = db; */


const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database("../fsnDB/users.db", (err) => {
    if(err){
        return console.error(err.message);
    }
    else{
        console.log("successful connection i think");
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users {
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
    }`);
});


function insertUser(username, password){
    
}

module.exports = db;