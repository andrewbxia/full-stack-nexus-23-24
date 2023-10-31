const icons = ["stacksvgtransparent", "stacksvgslant2transparent", "stacksvgslant1transparent", "stacksvgslant1", "stacksvgslant2", "stacksvgvertical1", "stacksvgalt", "stacksvg", "codesysvg"];
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");



router.get("/scripts/:id.js", (req, res) => {
    res.type("text/javascript");
    const fileName = `./scripts/${req.params.id}.js`;

    fs.readFile(fileName, (err, data) => {
        if(err){
            res.status(404).json({error: "jhavaskripted file does not exist."});
        }else{
            res.sendFile(path.resolve(fileName));
        }
    });
});


router.get("/icon:id?", (req, res) => {
    const randIcon = icons[Math.floor(Math.random() * icons.length)];
    var fileName = `./icons${req.params.id || ""}/${randIcon}`;
    //res.set("Content-Type", "image/png");
    console.log(fileName);
    if(req.query.type == "png"){
        fileName += ".png";
    }else{
        fileName += ".svg";
    }
    fs.readFile(fileName, (err, data) => {
        if(err){
            res.status(404).json({error: "eye-con file does not exist."});
        }else{
            res.sendFile(path.resolve(fileName));
        }
    });
});



router.get("/styles/:id.css", (req, res) => {
    const fileName = `./styles/${req.params.id}.css`;

    fs.readFile(fileName, (err, data) => {
        if(err){
            res.status(404).json({error: "see ess ess file does not exist."});
        }else{
            res.sendFile(path.resolve(fileName));
        }
    });
});



router.get("/:id?", (req, res) => {
    res.status(403).json({error: "forbidden access"});
});
module.exports = router;
