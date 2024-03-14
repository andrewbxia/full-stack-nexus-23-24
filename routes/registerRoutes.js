const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();

router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const {registerUserDB, dbinsert} = require("../serverscripts/registerUser.js");
router.get("/" , (req, res) => {
    res.render("register");
});


router.post("/registerUser", (req, res) => {
    console.log("registering user");
    registerUserDB(req, res);
});

module.exports = router;