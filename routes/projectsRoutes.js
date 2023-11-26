const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("projects", {username: req.session.user});//add users and db laterz
    console.log("projects");
});

module.exports = router;