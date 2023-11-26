const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.status(404).render("join");
    console.log("join");
});

module.exports = router;