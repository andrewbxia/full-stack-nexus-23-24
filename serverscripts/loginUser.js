//serverside code for login page
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const argon2 = require("argon2");
const dblogin = new sqlite3.Database("../fsnDB/users.db", sqlite3.OPEN_READWRITE, (err) => { 
    if(err){
        return console.error(err.message);
    }
    else{
        console.log("successful login connection i think");
    }

});

dblogin.serialize(async() => {
    dblogin.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,
        usernameLower TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        Knumber TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        permissions TEXT,
        joined INTEGER
        )`
    );

    fs.readFile("../fsnDB/admins.json", "utf8", async (err, data) => {
        if (err) {
            console.error(err.message);
            return;
        }

        const adminArr = JSON.parse(data);
        
        for (const admin in adminArr.members) {
            const { mode, usernameLower, username, Knumber, password, permissions, joined } = adminArr.members[admin];//adminArr.admins[admin] grabs the values of the objects
            console.log(username, Knumber, permissions, joined);
            await dblogin.run("INSERT OR IGNORE INTO users (mode, usernameLower, username, Knumber, password, permissions, joined) VALUES (?, ?, ?, ?, ?, ?, ?)", [mode, usernameLower, username, Knumber, password, permissions, joined], (err) => {
                if (err) {
                    console.error("wuh oh" + err.message);
                } else {
                    console.log(permissions + " " + username + " inserted or already exists :D good day to you!");
                }
            });
        }
    });
});

async function readUserDB(username, Knumber, password){
    return await new Promise(async(resolve, reject) =>{
        console.log("logging in user " + username);
        if(!username || !password || !Knumber){
            resolve({message: "UNDEFINEDCREDENTIALS"});
        }
        try{
            console.log(username);
            console.log(Knumber);
            console.log(password);

            await dblogin.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
                if(err){
                    console.error(err.message);
                    resolve({message: "ERROR", error: err.message});
                }
                else if(row === undefined){
                    console.log("user not found");
                    resolve({message: "USERNOTFOUND"});
                }
                else{
                    console.log("user found");
                    if(await argon2.verify(row.password, password) && row.Knumber.toLowerCase() === Knumber.toLowerCase()){
                        console.log("login successful " + username);
                        resolve({message: "SUCCESSFULLOGIN", username: username, Knumber: Knumber, permissions: row.permissions});
                    }
                    else{
                        resolve({message: "UNSUCCESSFULLOGIN"});
                    }
                }
            });
        }catch (err){
            resolve({message: "ERROR", error: err.message});
        }
    });
}


async function handleLogin(req, res){
    const {username, Knumber, password} = req.body;
    try{
        const response = await readUserDB(username, Knumber, password);

        dblogin.all("SELECT * FROM users", (err, rows) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log(rows.username + " " + rows.password);
            }
        });

        if(response.message === "SUCCESSFULLOGIN"){
            console.log(response.permissions);
            req.session.user = response.username;
            req.session.Knumber = response.Knumber;
            req.session.permissions = response.permissions;
            await req.session.save((err) => { // save session with callback
                if(err){
                    console.log('Session save error:', err);
                    return;
                }
                // session saved successfully
                res.status(200).json({message: response.message, username: response.username});
            });
        
        }else if(response.message === "UNSUCCESSFULLOGIN"){
            res.status(400).json({message: response.message, username: response.username});
        }else if(response.message === "UNDEFINEDCREDENTIALS" || response.message === "USERNOTFOUND"){
            console.log(response.message)
            res.status(400).json({message: response.message});
        }else if(response.message === "ERROR"){
            res.status(500).json({message: response.message, error: response.error});
        }else{
            res.status(500).json({message: "UNKNOWNSERVERRESPONSE"});
        }
    }catch(err){
        //no idea
    }
}


module.exports = {handleLogin, dblogin};