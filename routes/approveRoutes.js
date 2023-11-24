const express = require("express");
const router = express.Router();
//import {isAdmin} from "../serverscripts/loginUser.js";
// const sqlite3 = require("sqlite3").verbose();
const { isAdmin, approveUser, getUsers, rejectUser, deleteUser } = require("../serverscripts/approveUser.js");




router.get("/", async (req, res) => {
    if(req.session.user){
        try{
            if(await isAdmin(req.session.user)){
                res.render("approve", {username: req.session.user});
            }else{
                res.redirect("/login?redirect=approve&message=noperms");
            }
        }catch(err){
            console.error(err);
            res.redirect("/login?redirect=approve&error=" + err.error);
        }
    }else{
        res.redirect("/login?redirect=approve");
    }
});

router.get("/getUsers", async(req, res) => {
    try{
        if(await isAdmin(req.session.user)){
            console.log("getting users")
            return getUsers(req, res);
        }else{
            res.json({message: "access forbidden"});
        }
    }catch(err){
        console.error(err);
        res.status(500).json({message: "ERROR", error: err.message});
    }
});

router.post("/approveUser", approveUser);
router.post("/rejectUser", rejectUser);
router.post("/deleteUser", deleteUser);


module.exports = router;
