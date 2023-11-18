const sqlite3 = require("sqlite3").verbose();
const argon2 = require("argon2");
const { dblogin } = require("./loginUser"); //finding if user already exists

const dbregister = new sqlite3.Database("../fsnDB/userRegister.db", (err) => {
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
    usernameLower TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
    )`)
});

async function checkExists(registerUser){
    return await new Promise(async(resolve, reject) => {
        await dblogin.get("SELECT * FROM users WHERE usernameLower = ?", [registerUser], (err, row) => {
            if(err){
                reject({message: "ERROR", error: err.message});
            }
            else{
                if(row){
                    resolve(row);
                }
            }
        });
        await dbregister.get("SELECT * FROM users WHERE usernameLower = ?", [registerUser], (err, row) => {
            if(err){
                reject({message: "ERROR", error: err.message});
            }
            else{
                resolve(row);
            }
        });
    });
}

async function registerUserDB(req, res){
    const {username, password} = req.body;
    const usernameLower = username.toLowerCase();
    let exists;
    console.log("registering user " + username);

    if(!username || !password){
        return res.status(400).json({message: "UNDEFINEDCREDENTIALS"});
    }

    try{
        exists = await checkExists(usernameLower);
    } catch(err){
        return res.status(500).json(err);
    }

    if(exists !== undefined){
        if(exists.message === "ERROR"){//dont know how this would happen but just in case for redundancy
            return res.status(500).json(exists);
        }
        return res.status(400).json({message: "USERALREADYEXISTS"});
    }

    const hashpassword = await argon2.hash(password, {
        type: argon2.argon2i,
        memoryCost: 2 ** 16,
        hashLength: 75,
    });

    try{
        dbregister.run("INSERT INTO users (usernameLower, username, password) VALUES (?, ?, ?)", [usernameLower, username, hashpassword], (err) => {
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