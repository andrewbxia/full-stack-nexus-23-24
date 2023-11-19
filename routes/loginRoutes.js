const express = require("express");
const router = express.Router();
const {handleLogin, dblogin} = require("../serverscripts/loginUser.js");

router.get("/" , (req, res) => {
    res.render("login");
});

router.post("/loginUser", handleLogin);

module.exports = router;