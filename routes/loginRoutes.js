const express = require("express");
const router = express.Router();
const {handleLogin, dblogin} = require("../serverscripts/loginUser.js");

router.get("/" , (req, res) => {
    res.render("login", {redirect: req.query.redirect, message: req.query.message, error: req.query.error});
    console.log(req.session.user);
});

router.post("/loginUser", handleLogin);

module.exports = router;