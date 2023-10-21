const express = require("express");
const router = express.Router();


router.get("", (req, res) =>{
    res.send("user list");
});

router.get("/new", (req, res) => {
    res.send("user new form");
});

router.post("/create", (req, res) =>{
    res.send("create new user");
});

router.get("/:id", (req, res) => {
    
    res.send(`user get id ${req.params.id}`);
})

module.exports = router;

