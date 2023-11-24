const { dblogin } = require("./loginUser");
const { dbregister } = require("./registerUser");

async function isAdmin(username){
    return new Promise(async(resolve, reject) => {
        dblogin.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if(err){
                reject({message: "ERROR", error: err.message});
            }
            else if(row === undefined){
                reject({message: "USERNOTFOUND"});
            }
            else{
                console.log(row.permissions);
                if(row.permissions === "admin"){
                    resolve(true);
                }else{
                    resolve(false);
                }
            }
        });
    });
};

function approveUser(req, res){
    isAdmin(req.session.user).then(isAdmin => {
        if (isAdmin) {
            let mode, usernameLower, {username} = req.body, password, permissions = "member", joined = 0;
            let response = {};

            dbregister.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ message: "ERROR", error: err.message });
                } else if (row === undefined) {
                    return res.status(400).json({ message: "USERNOTFOUND" });
                } else {
                    mode = row.mode;
                    usernameLower = row.usernameLower;
                    username = row.username;
                    password = row.password;

                    dblogin.run("INSERT INTO users (mode, usernameLower, username, password, permissions, joined) VALUES (?, ?, ?, ?, ?, ?)", [mode, usernameLower, username, password, permissions, joined], (err) => {
                        if (err) {
                            console.error("err in approving " + username + ": " + err.message);
                            response.login = { message: "ERROR", error: err.message };
                        } else {
                            console.log(username + " approved");
                            response.login = { message: "USER " + username + " APPROVED" };

                            dbregister.run("DELETE FROM users WHERE username = ?", [username], (err) => {
                                if (err) {
                                    console.error("error removing " + username + " from register db: " + err.message);
                                    response.register = { message: "ERROR", error: err.message };
                                } else {
                                    console.log(username + " removed from register db");
                                    response.register = { message: "USER " + username + " REMOVED" };
                                }
                                res.status(200).json(response);
                            });//oh boy
                        }//oh boy
                    });//oh boy
                }//oh boy
            });//oh boy
        }//oh boy
    });//oh boy
}//oh boy

function rejectUser(req, res){
    isAdmin(req.session.user).then((isAdmin) => {
        if(isAdmin){
            dbregister.run("UPDATE users SET rejected = 1 WHERE username = ?", [req.body.username], (err) => {
                if(err){
                    console.error("ERROR" + err.message);
                    return res.status(500).json({message: "ERROR", error: err.message});
                }
                console.log("user " + req.body.username + " rejected");
                return res.status(200).json({register: {message: "USER " + req.body.username + " REJECTED"}});
            });
        }
    })
}

function getUsers(req, res){
    dbregister.all("SELECT * FROM users", (err, rows) => {
        if(err){
            console.error(err.message);
            return res.status(500).json({error: err.message});
        }
        console.log(rows);
        for(const user of rows){
            delete user.password;
        }
        return res.status(200).json({ events: rows });
    });
}

function deleteUser(req, res){
    dbregister.run("DELETE FROM users WHERE username = ?", [req.body.username], (err) => {
        if(err){
            console.error("ERROR" + err.message);
            return res.status(500).json({message: "ERROR", error: err.message});
        }
        console.log("user " + req.body.username + " deleted");
        return res.status(200).json({register: {message: "USER " + req.body.username + " DELETED"}});
    });
}

module.exports = {isAdmin, approveUser, getUsers, rejectUser, deleteUser};