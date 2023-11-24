const { dblogin } = require("./loginUser");
const { dbregister } = require("./registerUser");

function getMembers(req, res){
    let mode;
    if(req.session.user){
        dblogin.get("SELECT * FROM users WHERE username = ?", [req.session.user], (err, row) => {
            if(err){
                console.log(err.message);
                return res.status(500).json({message:"ERROR", error: err.message});
            }
            else{
                if(!row){
                    return res.redirect("/login?redirect=members&message=notloggedin");
                }
                mode = row.permissions;
                console.log(mode)
                let response = {};
                let sqlString;
                if(mode === "member"){
                    sqlString = "SELECT * FROM users WHERE rejected != 1";
                }
                else if(mode === "admin"){
                    sqlString = "SELECT * FROM users";
                }
                dbregister.all(sqlString, (err, rows) => {
                    if(err){
                        console.log(err.message);
                        res.status(500).json({message:"ERROR", error: err.message});
                    }
                    else{
                        response.register = rows;
                        dblogin.all("SELECT * FROM users", (err, rows) => {
                            if(err){
                                console.log(err.message);
                                res.status(500).json({message:"ERROR", error: err.message});
                            }
                            else{
                                response.login = rows;
                                for(const user of response.login){
                                    delete user.password;
                                }
                                for(const user of response.register){
                                    delete user.password;
                                }
                                res.status(200).json(response);
                            }
                        });
                    }
                });
            }
        });
    }else{
        return res.redirect("/login?redirect=members&message=notloggedin");
    }
}

module.exports = {getMembers};