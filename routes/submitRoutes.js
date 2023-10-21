const express = require("express");
const router = express.Router();


router.get("/:id", (req, res) => {
    console.log(`Redirect from localhost:3000/events/${req.params.id} to events page.`);
    res.redirect(".");
});
router.get("", (req, res) => {
    res.send("yay");
    console.log("successful");
});

    




module.exports = router;

