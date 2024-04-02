const express = require("express");
const router = express.Router();
const BASE_URL = require("../BASE_URL.js");
const dbReadPresentations = require("../serverscripts/presentations/readPresentations.js");
const dbWritePresentations = require("../serverscripts/presentations/writePresentations.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const db = require("../serverscripts/presentations/readPresentations.js");
const presentationsLoc = path.resolve(__dirname + "../../../files/presentations/");
const dbIncLimit = 10000;
let lastPresentationId = null;

const storage = multer.diskStorage({
    // destination: function(req, file, cb) {
    //     cb(null, path.resolve(__dirname + "../../../files/presentations/"));
    // },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});

async function checkLastPresentationId(){
    if(!lastPresentationId){
        dbReadPresentations.serialize(() => {
            dbReadPresentations.get("SELECT MAX(id) AS maxId FROM presentations", (err, row) => {
                if(err){
                    console.error(err.message);
                }
                else{
                    console.log(row);
                    lastPresentationId = row.maxId || 0; // Assign 0 if row.maxId is null
                    console.log("last presentation id: " + lastPresentationId);
                }
            });
        });
    }
}

function updatePresentationsDB(){
    //resets presentations db to have no gaps in ids
    console.log("updating presentations db");
    try {
        dbWritePresentations.serialize(() => {
            dbWritePresentations.run("BEGIN TRANSACTION");

            dbWritePresentations.run(`CREATE TABLE presentations_temp(
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL
            )`);
        
            dbWritePresentations.run("INSERT INTO presentations_temp(title, description) SELECT title, description FROM presentations");
            dbWritePresentations.run("DROP TABLE presentations");
            dbWritePresentations.run("ALTER TABLE presentations_temp RENAME TO presentations");

            dbWritePresentations.run("COMMIT");
        });
    }
    catch (err) {
        console.error(err.message);
    }
}


router.get("/", async(req, res) => {
    // res.render("presentations", {BASE_URL: BASE_URL, permissions: req.session.permissions});
    // if(req.session.user){
    checkLastPresentationId();
    res.render("presentations", {BASE_URL: BASE_URL, username: req.session.user, permissions: req.session.permissions});
    // }
    // else{
    //     console.log("no user get presentations");
    //     res.status(401).redirect("login?redirect=login (or register if you haven't) to access the meeting presentations!");
    // }
});

router.get("/getPresentations", async (req, res) => {
    // if(!req.session.user){
    //     console.log("no user")
    //     return res.status(401).redirect(BASE_URL + "/login?redirect=login (or register if you haven't) to access the meeting presentations");
    // }
    dbReadPresentations.all("SELECT * FROM presentations", (err, rows) => {
        if (err) {
            return res.status(500).json({message: "ERROR", error: err.message});
        } else {
            return res.status(200).json(rows);
        }
    });
});

router.get("/:id", async (req, res) => {
    //send pdf file with id
    if(!req.session.user){
        console.log("no user get presentation id" + req.params.id);
        return res.status(401).redirect(BASE_URL + "/login?redirect=login (or register if you haven't) to access the meeting presentations");
    }
    await checkLastPresentationId();
    const id = req.params.id;
    if(parseInt(id) != id){
        return res.status(400).send("invalid id");
    }

    const filePath = path.join(presentationsLoc, "week " + id + ".pdf");
    if(fs.existsSync(filePath)){
        res.sendFile(filePath);
    }
    else{
        console.log("file not found " + filePath)
        res.status(404).send("file not found");
    }
});

router.post("/upload", upload.single("upload-file"), async (req, res) => {
    //upload presentations as pdf
    //optional week number to insert, else just append to db
    console.log(req.body);
    if(req.session.permissions !== "admin"){
        return res.status(401).json({message: "ERROR", error: "missing perms"});
    }

    if(!req.file){
        return res.status(400).json({message: "ERROR", error: "no file uploaded"});
    }

    const title = req.body["upload-title"];
    const description = req.body["upload-description"];

    [title, description].forEach((item) => {
        if(!item){
            return res.status(400).json({message: "ERROR", error: "missing input"});
        }
    });

    console.log(req.file.originalname)
    const fileExtArr = req.file.originalname.split(".");
    if(fileExtArr[fileExtArr.length - 1] !== "pdf"){
        return res.status(400).json({message: "ERROR", error: "file is not a pdf"});
    }

    const pdfPath = req.file.path;
    console.log(pdfPath);


    dbWritePresentations.run("INSERT INTO presentations (title, description) VALUES (?, ?)", [title, description], (err) => {
        if(err) {
            return res.status(500).json({message: "ERROR", error: err.message});
        }
        else{
            checkLastPresentationId();
            lastPresentationId += 1;
            fs.renameSync(pdfPath, path.join(presentationsLoc, "week " + lastPresentationId + ".pdf"));
            
            return res.status(200).json({message: "success add pres at index " + lastPresentationId});
        }
    });   
});

router.post("/update", upload.single("update-file"), async (req, res) => {
    //input is a number indicating week value and pdf updating
    if(req.session.permissions !== "admin"){
        return res.status(401).json({message: "ERROR", error: "missing perms"});
    }

    if(!req.file){
        return res.status(400).json({message: "ERROR", error: "no file uploaded"});
    }

    const title = req.body["update-title"];
    const description = req.body["update-description"];
    const index = req.body["update-index"];

    [title, description, index].forEach((item) => {
        if(!item){
            return res.status(400).json({message: "ERROR", error: "missing input"});
        }
    });

    const fileExtArr = req.file.originalname.split(".");
    if(fileExtArr[fileExtArr.length - 1] !== "pdf"){
        return res.status(400).json({message: "ERROR", error: "file is not a pdf"});
    }

    const pdfPath = req.file.path;
    console.log(pdfPath);

    dbWritePresentations.run("UPDATE presentations SET title = ?, description = ? WHERE id = ?", [title, description, index], (err) => {
        if(err){
            return res.status(500).json({message: "ERROR", error: err.message});
        }
        else{
            fs.renameSync(pdfPath, path.join(presentationsLoc, "week " + index + ".pdf"));
            
            return res.status(200).json({message: "success update at index " + index});
        }
    });
});

router.post("/insert", upload.single("insert-file"), async (req, res) => {
    if(req.session.permissions !== "admin"){
        return res.status(401).json({message: "ERROR", error: "missing perms"});
    }
    if(!req.file){
        return res.status(400).json({message: "ERROR", error: "no file uploaded"});
    }

    const title = req.body["insert-title"];
    const description = req.body["insert-description"];
    const indextemp = req.body["insert-index"];
    const index = parseInt(indextemp);

    [title, description, indextemp].forEach((item) => {
        console.log(item);
        if(!item){
            return res.status(400).json({message: "ERROR", error: "missing input"});
        }
    });

    if(index < 1 || index > lastPresentationId){
        return res.status(400).json({message: "ERROR", error: "invalid index"});
    }

    const fileExtArr = req.file.originalname.split(".");

    if(fileExtArr[fileExtArr.length - 1] !== "pdf"){
        return res.status(400).json({message: "ERROR", error: "file is not a pdf"});
    }

    const pdfPath = req.file.path;
    console.log(pdfPath);

    dbWritePresentations.serialize(() => {
        dbWritePresentations.run("BEGIN TRANSACTION");
        dbWritePresentations.run(`UPDATE presentations SET id = id + ${dbIncLimit + 1} WHERE id >= ${index}`);
        dbWritePresentations.run("INSERT INTO presentations (id, title, description) VALUES (?, ?, ?)", [index, title, description]);
        dbWritePresentations.run(`UPDATE presentations SET id = id - ${dbIncLimit} WHERE id >= ${index + 1}`);
        dbWritePresentations.run("COMMIT");
    });

    await checkLastPresentationId();
    for(let i = lastPresentationId; i >= index; i--){
        fs.renameSync(path.join(presentationsLoc, "week " + (i) + ".pdf"), path.join(presentationsLoc, "week " + (i + 1) + ".pdf"));
    }
    lastPresentationId += 1;
    fs.renameSync(pdfPath, path.join(presentationsLoc, "week " + index + ".pdf"));
    return res.status(200).json({message: "success insert at index " + index});

});

router.post("/delete", async (req, res) => {
    //input is number indicating week value
    if(req.session.permissions !== "admin"){
        return res.status(401).json({message: "ERROR", error: "missing perms"});
    }

    console.log(req.body);
    const indextemp = req.body["delete-index"];

    if(!indextemp){
        return res.status(400).json({message: "ERROR", error: "no index provided"});
    }

    const index = parseInt(indextemp);

    if(index < 1 || index > lastPresentationId){
        return res.status(400).json({message: "ERROR", error: "invalid index"});
    }

    dbWritePresentations.run("DELETE FROM presentations WHERE id = ?", [index], (err) => {
        if(err){
            return res.status(500).json({message: "ERROR", error: err.message});
        }
        else{
            fs.unlinkSync(path.join(presentationsLoc, "week " + index + ".pdf"));
            checkLastPresentationId();
            updatePresentationsDB();
            for(let i = index; i < lastPresentationId; i++){
                fs.renameSync(path.join(presentationsLoc, "week " + (i + 1) + ".pdf"), path.join(presentationsLoc, "week " + i + ".pdf"));
            }

            lastPresentationId--;
            return res.status(200).json({message: "success delete at index " + index});
        }
    });

});

module.exports = router;