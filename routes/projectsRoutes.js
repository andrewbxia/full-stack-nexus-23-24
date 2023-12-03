const express = require("express");
const router = express.Router();

const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const BASE_URL = require("../BASE_URL.js");
// console.log(BASE_URL)
const puppeteer = require("puppeteer");
const url = require("url");
const multer = require("multer");
const extract = require("extract-zip");
const storage = multer.diskStorage({
    // destination: function(req, file, cb) {
    //     cb(null, path.resolve(__dirname + "../../../projects"));
    // },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});

async function screenshot(url, outputPath){
    const browser = await puppeteer.launch({
        headless:"new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({width: 400, height: 300});
    await page.goto(url);
    await page.screenshot({path: outputPath/*, fullPage: true*/});
    await browser.close();
}

function getDirectoryHierarchy(dirPath) {
    let hierarchy = {};
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            hierarchy[item] = getDirectoryHierarchy(fullPath);
        } else {
            
            hierarchy[item] = item;
        }
    });

    return hierarchy;
}


router.get("/", (req, res) => {
    res.render("projects", {username: req.session.user, BASE_URL: BASE_URL, permissions: req.session.permissions});//TODO:add users and db laterz
    console.log("projects");
});

router.get("/getProjects", async (req, res) => {
    return res.json({projects: getDirectoryHierarchy(path.resolve(__dirname + "../../../projects"))});
});

router.get("/manual", (req, res) => {
    res.render("partials/projectManual", {BASE_URL: BASE_URL});
});

router.get("/:id/*", (req, res) => {
    res.sendFile(path.resolve(__dirname + "../../../projects/" + req.params.id + "/" + req.params[0]));
    console.log("projects/" + req.params.id);
});



router.post("/upload", upload.single("file"), async (req, res) => {
    const homePath = req.body.homePath;

    if(!req.session.user) {
        res.status(401).redirect("/login?redirect=/projects&reason=notloggedin");
        return;
    }
    if(!req.file){
        res.status(400).json({message: "No file uploaded!"});
        return;
    }
    // if (req.file.mimetype !== 'application/zip') {
    //     res.status(400).json({message: "Uploaded file is not a zip file"});
    //     return;
    // }
    const root = path.resolve(__dirname + "../../../projects/" + req.session.user);
    //create user dir if not exists
    if(!fs.existsSync(root)) {
        fs.mkdirSync(root);
    }
    console.log(req.file.originalname);
    console.log(req.session.user);
    
    const reqfilePath = req.file.path;
    const exPath = path.resolve(__dirname + "../../../projects/" + req.session.user + "/" + req.file.originalname.slice(0, req.file.originalname.indexOf(".zip")));
    
    //create project dir if not exists
    if(!fs.existsSync(exPath)) {
        fs.mkdirSync(exPath);
    }

    await fsExtra.emptyDirSync(exPath);

    try{
        await extract(reqfilePath, {dir: path.resolve(__dirname + "../../../projects/" + req.session.user)});
        
        console.log("homepage: " + path.join(exPath, homePath));

        if(!fs.existsSync(path.join(exPath, homePath))) {//TODO: EXPORT ZIP TO NEW FILE AND CHECKING BEFORE MOVING BACK TO ORIGINAL DIRECTORY
            //homepage no exists
            fsExtra.emptyDirSync(exPath);
            fsExtra.rmdirSync(exPath);
            console.log("POOPY AAAAA WHERE IS THE FILE " + homePath);
            return res.status(400).json({message: "ERROR", error: "homepage file not found in main directory. sEgMeNtAtIoN fAuLt!!1!1"});
        }else{
            //if homepage exists, create preview
            console.log("file: " + homePath);
            fs.writeFileSync(path.join(exPath, "homePath.txt"), homePath);
            console.log(path.join(exPath, homePath))
            await screenshot(url.pathToFileURL(path.join(exPath, homePath)).href, path.join(exPath, "preview.png")).then(() => {
                return res.status(200).json({ message: "Project uploaded successfully!" });
            });
            
        }
    }
    catch(err) {
        console.log(err.message);
        res.status(500).json({message: "ERROR", error: err.message});
        if(!fs.existsSync(path.join(exPath, homePath))) {
            //zip is bad or sent in bad file, clear directory
            fsExtra.emptyDirSync(exPath);
            fsExtra.rmdirSync(exPath);
            console.log("error unzipping ocurred, removed " + req.file.originalname);
        }
    }
    
});

router.post("/delete", async(req, res) => {
    if(!req.session.user) {
        res.status(401).redirect("/login?redirect=/projects&reason=notloggedin");
        return;
    }

    console.log(req.session.user + ": " + req.session.permissions);
    console.log(req.body)
    let {user, project} = req.body;
    console.log(user + ": " + project)

    if(!user || !project) {
        return res.status(400).json({message: "ERROR", error: "Missing user or project"});
    }

    if(req.session.permissions !== "admin" && req.session.user !== user) {
        return res.status(401).json({message: "ERROR", error: "You do not have permission to delete this project"});
    }

    const projectPath = path.resolve(__dirname + "../../../projects/" + user + "/" + project);
    console.log("deleting " + projectPath + "for" + user);
    console.log(req.session.user + ": " + req.session.permissions);

    if(!fs.existsSync(projectPath)) {
        return res.status(400).json({message: "ERROR", error: "Project does not exist"});
    }

    fsExtra.emptyDirSync(projectPath);
    fsExtra.rmdirSync(projectPath);
    res.status(200).json({message: "Project deleted successfully!"});
});

module.exports = router;