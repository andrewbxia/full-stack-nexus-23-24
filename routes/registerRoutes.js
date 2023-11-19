const express = require("express");
const router = express.Router();
const {registerUserDB, dbinsert} = require("../serverscripts/registerUser.js");
router.get("/" , (req, res) => {
    res.render("register");
});


router.post("/registerUser", registerUserDB);

module.exports = router;