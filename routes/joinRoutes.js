const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(404).send("Sorry, can't find that!");
    console.log("joikn")
    //res.render("join");
});

module.exports = router;