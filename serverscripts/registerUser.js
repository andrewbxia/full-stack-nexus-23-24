const sqlite3 = require("sqlite3").verbose();
const argon2 = require("argon2");
const { dblogin } = require("./loginUser"); //finding if user already exists

const dbregister = new sqlite3.Database("../fsnDB/userRegister.db", sqlite3.OPEN_READWRITE, (err) => {
    if(err){
        console.error(err.message);
    }
    else{
        console.log("successful register connection i think");
    }
});

dbregister.serialize(() => {
    dbregister.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mode TEXT NOT NULL,
        usernameLower TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        Knumber TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        rejected INTEGER
        )`);//rejected is 0 if not rejected, 1 if rejected
});

async function registerUserDB(req, res){
    const { username, Knumber, password } = req.body;
    console.log(username, Knumber, password)
    const usernameLower = username.toLowerCase();
    const mode = "password";
    console.log("registering user " + username);

    if(!username || !password || !Knumber){
        return res.status(400).json({message: "UNDEFINEDCREDENTIALS"});
    }

    let userCheck;
    
    try {
        userCheck = await new Promise((resolve, reject) => {
            dblogin.get("SELECT * FROM users WHERE usernameLower = ?", [usernameLower], (err, row) => {
                if (err) {
                    reject(err);
                }
                else if (row !== undefined) {
                    reject(new Error("USERALREADYAPPROVED"));
                }
                else{
                    dbregister.get("SELECT * FROM users WHERE usernameLower = ?", [usernameLower], (err, row) => {
                        if (err) {
                            reject(err);
                        } else if (row !== undefined) {
                            if (row.rejected === 1) {
                                reject(new Error("USERREJECTED"));
                            }
                            reject(new Error("USERALREADYREGISTERED"));
                        } 
                        resolve(row);
                    });
                }
            });
        });
    } catch (err) {
        return res.status(400).json({message: err.message});
    }

    if (userCheck !== undefined) {
        return res.status(400).json({message: "USERALREADYREGISTERED"});
    }

    const hashpassword = await argon2.hash(password, {
        type: argon2.argon2i,
        memoryCost: 2 ** 16,
        hashLength: 75,
    });

    try{
        dbregister.run("INSERT INTO users (mode, usernameLower, username, Knumber, password, rejected) VALUES (?, ?, ?, ?, ?, ?)", [mode, usernameLower, username, Knumber, hashpassword, 0], (err) => {
            if (err){
                return res.status(500).json({message: "USERREGISTERFAILED", error: err.message});
            }
            else{
                console.log(hashpassword);
                return res.status(201).json({message: "USERREGISTERED"});
            }
        });
    }
    catch(err){
        return res.status(500).json({message: "ERROR", error: err.message});
    }
}

module.exports = {registerUserDB, dbregister};