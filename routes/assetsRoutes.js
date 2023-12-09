
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const icons = ["stacksvgtransparent", "stacksvgslant2transparent", "stacksvgslant1transparent", "stacksvgslant1", "stacksvgslant2", "stacksvgvertical1", "stacksvgalt", "stacksvg", "codesysvg"];


router.get("/scripts/:id.js", (req, res) => {
    res.type("text/javascript");
    const fileName = path.join(__dirname, `../assets/scripts/${req.params.id}.js`);

    return fs.existsSync(fileName) ? res.status(200).sendFile(fileName) : res.status(404).json({error: "jhavaskripted file does not exist"});
});


router.get("/icon:id?", (req, res) => {
    const randIcon = icons[Math.floor(Math.random() * icons.length)];
    var fileName = path.join(__dirname, `../assets/icons${req.params.id || ""}/${randIcon}`);
    console.log(fileName);
    fileName += req.query.type === "png" ? "png" : ".svg";

    return fs.existsSync(fileName) ? res.sendFile(fileName) : res.status(404).json({error: "eye-con file does not exist"});
});



router.get("/styles/:id.css", (req, res) => {
    const fileName = path.join(__dirname, `../assets/styles/${req.params.id}.css`);
    console.log(fileName);

    return fs.existsSync(fileName) ? res.status(200).sendFile(fileName) : res.status(404).json({error: "see ess ess file does not exist"});
});

router.get("/buttons/:id", (req, res) => {
    const fileName = path.join(__dirname, `../assets/buttons/${req.params.id}`);
    return fs.existsSync(fileName) ? res.status(200).sendFile(fileName) : res.status(404).json({error: "but imgg does not exist"});
});



router.get("/:id", (req, res) => {
    res.status(404).json({error: "asset not found"});
});


module.exports = router;
