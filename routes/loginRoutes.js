const express = require("express");
const router = express.Router();
const {handleLogin, dblogin} = require("../serverscripts/loginUser.js");
const BASE_URL = require("../BASE_URL.js");

router.get("/" , (req, res) => {
    res.render("login", {redirect: req.query.redirect, message: req.query.message, error: req.query.error, BASE_URL: BASE_URL});
    console.log(req.session.user);
});

router.post("/loginUser", handleLogin);

module.exports = router;