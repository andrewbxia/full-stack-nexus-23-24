const express = require("express");
const router = express.Router();

const { getMembers } = require("../serverscripts/membersPage.js");

router.get("/", (req, res) => {
    if(req.session.user){
        res.render("members", {username: req.session.user});
    }else{
        res.redirect("/login?redirect=members");
    }
});

router.get("/get", getMembers);

module.exports = router;