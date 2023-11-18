//serverside code for login page
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const argon2 = require("argon2");
const admins = ["andrew xia"];
const dblogin = new sqlite3.Database("../fsnDB/users.db", (err) => { 
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
    usernameLower TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    permissions TEXT,
    joined INTEGER
    )`
    );

    //let adminArr;

    fs.readFile("../fsnDB/admins.json", "utf8", async (err, data) => {
        if (err) {
            console.error(err.message);
            return;
        }

        const adminArr = JSON.parse(data);
        
        console.log(adminArr);
        
        for (const admin in adminArr.admins) {
            const { usernameLower, username, password, permissions, joined } = adminArr.admins[admin];//adminArr.admins[admin] grabs the values of the objects
            console.log(usernameLower, username, password, permissions, joined);
            await dblogin.run("INSERT OR IGNORE INTO users (usernameLower, username, password, permissions, joined) VALUES (?, ?, ?, ?, ?)", [usernameLower, username, password, permissions, joined], (err) => {
                if (err) {
                    console.error("wuh oh" + err.message);
                } else {
                    console.log("admin inserted or already exists :D good day to you!");
                }
            });
        }
    });

});
async function readUserDB(username, password){
    return await new Promise(async(resolve, reject) =>{
        console.log("logging in user " + username);
        if(!username || !password){
            resolve({message: "UNDEFINEDCREDENTIALS"});
        }
        try{
            console.log(username);
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
                    console.log(row.password, password)
                    if(await argon2.verify(row.password, password)){
                        console.log("login successful " + username);
                        resolve({message: "SUCCESSFULLOGIN", username: username});
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
    const {username, password} = req.body;
    try{
        const response = await readUserDB(username, password);
        

        if(response.message === "SUCCESSFULLOGIN"){
            console.log(response.username)
            req.session.cookie.username = response.username;
            req.session.cookie.loggedIn = true;
            //res.cookie("username", response.username);
           
            res.status(200).json({message: response.message, username: response.username});
            //do i 
            
            /**return setTimeout(() => {
                res.redirect("/");
            }, 5000);*/
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
    }catch(err){}
}


module.exports = {handleLogin, dblogin};