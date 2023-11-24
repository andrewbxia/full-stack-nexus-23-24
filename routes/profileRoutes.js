const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
    if(!req.session.user){
        res.redirect("/login?redirect=profile");
        return;
    }
    res.render("profile", {username: req.session.user});
});

module.exports = router;