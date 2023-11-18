const sqlite3 = require("sqlite3").verbose();
const { readUserDB, dblogin } = require("./loginUser");
const {dbregister} = require("./registerUser");

async function approveUserDB(username, password){//TODO: IMPLEMENT THIS LATER
    await dblogin.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if(err){
            console.error(err.message);
            return {message: "ERROR"};
        }
        else if(row === undefined){
            console.log("user not found");
            return {message: "USERNOTFOUND"};
        }
        else{
            console.log("user found");
            return {message: "USERAPPROVED"};
        }
    });
}



module.exports = {approveUserDB};
