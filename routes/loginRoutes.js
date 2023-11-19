const express = require("express");
const router = express.Router();
const {handleLogin, dblogin} = require("../serverscripts/loginUser.js");

router.get("/" , (req, res) => {
    res.render("login");
});

router.post("/loginUser", handleLogin);

console.log(process.env.BASE_URL )

module.exports = router;