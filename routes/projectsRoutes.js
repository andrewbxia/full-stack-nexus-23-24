const express = require("express");
const router = express.Router();

const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const BASE_URL = require("../BASE_URL.js");
const uploadLimit = 15000000;//15MB
const allowedFiles = ["zip"];
const puppeteer = require("puppeteer");
const url = require("url");
const multer = require("multer");
const extract = require("extract-zip");
const { get } = require("./loginRoutes.js");
const storage = multer.diskStorage({
    // destination: function(req, file, cb) {
    //     cb(null, path.resolve(__dirname + "../../../projects"));
    // },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});
let directoryHierarchy;

async function screenshot(url, outputPath){//make sure to use url.pathToFileUrl(path) for url
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

function findFileInDirectory(startDir, relDir, targetFile, includeDirectory = false) {
    const currstat = fs.statSync(startDir);
    if(currstat.isFile()){
        console.log("start with file")
        return path.basename(startDir) === targetFile ? {status: true, path: startDir, relPath: relDir, filePath: path.basename(startDir)} : {status: false};
    }
    const items = fs.readdirSync(startDir);

    for (let item of items) {
        const fullPath = path.join(startDir, item);
        const partPath = path.join(relDir, item);
        const stat = fs.statSync(fullPath);

        if(stat.isSymbolicLink()) return {status: false};

        if(includeDirectory) {
            if(item === targetFile) 
                return {status: true, path: fullPath, relPath: partPath};
        }

        if (stat.isDirectory()) {
            const dirResult = findFileInDirectory(fullPath, partPath, targetFile);
            if(dirResult.status){
                return dirResult;
            }
        } else if (item === targetFile){
            return {status: true, path: fullPath, relPath: partPath};
        }
    }
    return {status: false};
}

function getDirectoryHierarchy(dirPath) {
    let hierarchy = {};
    const currstat = fs.statSync(dirPath);
    if(currstat.isFile()){hierarchy[path.basename(dirPath)] = path.basename(dirPath); return hierarchy;}
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

function getDirectorySize(dirPath, size = 0) {
    const currstat = fs.statSync(dirPath);
    if(currstat.isFile()){return currstat.size;}
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            size += getDirectorySize(fullPath);
        } else {
            size += stat.size;
        }
    });
    return size;
}

function createDirIfNotExists(dirPath) {
    if(!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
}

function createDirs(args) {
    args.forEach(arg => {
        createDirIfNotExists(arg);
    });
}

function deleteUserEmpty(filePath){
    if(!fs.existsSync(filePath)) return;
    if(fs.readdirSync(filePath).length === 0){
        fsExtra.removeSync(filePath);
    }
}

function updateDirectoryHierarchy() {
    directoryHierarchy = getDirectoryHierarchy(path.join(__dirname, "../../projects"));
}


////////////////////////////////////////////////////////////////
//initialize directory hierarchy cache
updateDirectoryHierarchy();


router.get("/", (req, res) => {
    res.render("projects", {username: req.session.user, BASE_URL: BASE_URL, permissions: req.session.permissions});//TODO:add users and db laterz
    // console.log("projects");
});

router.get("/getProjects", async (req, res) => {
    return res.json({projects: directoryHierarchy});
});

router.get("/guide", (req, res) => {
    res.render("partials/projectGuide", {BASE_URL: BASE_URL});
});

router.get("/download", (req, res) => {
    let {user, project} = req.query;
    user = path.basename(user);
    project = path.basename(project);
    console.log(" downloading: " + user + " " +  project);
    if(!user || !project) {
        return res.status(400).json({message: "ERROR", error: "Missing user or project"});
    }
    if(project === "no projects yet!"){
        return res.status(400).json({message: "ERROR", error: "no projects yet!"});
    }

    const projectZipPath = path.join(__dirname, "../../projects", user, project, project + ".zip");
    console.log(projectZipPath)

    if(fs.existsSync(projectZipPath)){
        console.log("sent");
        res.setHeader("Content-Type", "application/zip");
        return res.download(projectZipPath);
    }
    else{
        return res.status(200).json({message: "ERROR", error: "project does not exist"});
    }
});

router.get("/:id/*", (req, res, next) => {
    const filePath = path.resolve(__dirname + "../../../projects/" + req.params.id + "/" + req.params[0])
    if(fs.existsSync(filePath))
        res.sendFile(filePath);
    else
        next();
    // console.log("projects/" + req.params.id);
});



router.post("/upload", upload.single("file"), async (req, res) => {
    //🎉🎉🎉 rewriting this api route from scratch part 3 🎉🎉🎉 (IT WORKS)
    //this took so long to write
    //orgainization hell

    //validate user
    if(!req.session.user) {
        return res.status(401).redirect("/login?redirect=/projects&reason=notloggedin");
    }
    
    //validate file
    if(!req.file){
        return res.status(400).json({message: "ERROR", error: "no file uploaded!"});
    }

    //check for extended file types and if it is zip
    const fileExtArr = req.file.originalname.split(".");
    console.log(fileExtArr);
    if(fileExtArr.length > 2) {
        return res.status(400).json({message: "ERROR", error: "file type not allowed!"});
    }
    let fileName = fileExtArr[0], fileExt = fileExtArr[1];
    console.log(!allowedFiles.includes(fileExt));
    if(!allowedFiles.includes(fileExt)) {
        return res.status(400).json({message: "ERROR", error: "file type not allowed! please upload a zip file"});
    }
    //extra preemptive size check
    if(req.file.size > uploadLimit && req.session.permissions !== "admin") {
        return res.status(400).json({message: "ERROR", error: "file is too biggies for 7 dollar/month server. tip: upload images to image hosting site and link them on your page instead!"});
    }

    //logg useless stats
    console.log("compressed size: " + req.file.size);
    console.log("user uploading: " + req.session.user);
    console.log("file uploading: " + req.file.originalname);

    //user inputted homepage
    const homePath = req.body.homePath;

    //path to zip file
    const zipPath = req.file.path;
    console.log(zipPath);
    
    //TEMP PROJECTS DIR
    //tempProjects tempProjects
    const tempRootDir = path.join(__dirname, "../../tempProjects");
    //tempProjects/user
    const tempUserDir = path.join(tempRootDir, req.session.user);
    //tempProjects/user/project
    const tempUserProjectDir = path.join(tempUserDir, fileName);

    //PROJECTS DIR
    //projects
    const rootDir = path.join(__dirname, "../../projects");
    //projects/user
    const userDir = path.join(rootDir, req.session.user);
    //projects/user/project
    const userProjectDir = path.join(userDir, fileName);

    try{
        //create and extract into temp dir
        createDirs([tempRootDir, tempUserDir, tempUserProjectDir]);
        await extract(zipPath, {dir: tempUserProjectDir});

        //update fileName to be correct with dir
        fileName = path.basename(fs.readdirSync(tempUserProjectDir)[0]);

        //set tempProjectLoc to correct nesting whether dir or file
        console.log(fs.existsSync(path.join(tempUserProjectDir, fileName)));
        const tempProjectLoc = fs.existsSync(path.join(tempUserProjectDir, fileName)) ? path.join(tempUserProjectDir, fileName) : path.join(tempUserProjectDir, fs.readdirSync(tempUserProjectDir)[0]);
        const tempProjectStats = fs.statSync(tempProjectLoc);

        //check size of extracted dir and get name
        const fileSize = getDirectorySize(tempProjectLoc, 0);
        console.log("is directory: " + tempProjectStats.isDirectory());
        console.log("is file: " + tempProjectStats.isFile());
        console.log("uncompressed size: " + fileSize);
        console.log("file/folder name: " + fileName);

        if(fileSize > uploadLimit && req.session.permissions !== "admin") {
            fsExtra.removeSync(tempUserDir);
            return res.status(400).json({message: "ERROR", error: "file is too biggies for 7 dollar/month server. tip: upload images to image hosting site and link them on your page instead!"});
        }

        

        //check if homepage path exists
        let homePagePath;//relative from target path, in this case projectdir
        const homePageFind = findFileInDirectory(tempProjectLoc, "", homePath);
        console.log("found path: " + homePageFind.relPath);
        if(!homePageFind.status) {
            return res.status(400).json({message: "ERROR", error: "homepage no exist, sEgMeNtAtIoN fAuLt"});
        }
        else{
            homePagePath = homePageFind.relPath || homePageFind.filePath;
        }

        //if project is dir then file is extra nested, if not just grab tempUserProjectDir
        //put project on root user if directory, put in own folder if file        
        const projectOrigin = tempProjectStats.isDirectory() ? path.join(tempUserProjectDir, fileName) : tempUserProjectDir;
        const projectDest = userProjectDir;
        // const projectDest = path.join(userProjectDir, tempProjectStats.isDirectory() ? "" : fileName);
        fsExtra.moveSync(projectOrigin, projectDest, {overwrite: true});
        fsExtra.removeSync(tempUserDir);
        fsExtra.moveSync(zipPath, path.join(projectDest, path.basename(zipPath)));//get the zip path out of temp storage
        console.log("transfer from temp to projects complete");

        //writing homePage.txt path
        fs.writeFileSync(path.join(projectDest, "homePath.txt"), homePagePath);
        
        //preview image
        console.log("path: " + homePagePath)
        await screenshot(url.pathToFileURL(path.join(projectDest, homePagePath)), path.join(projectDest, "preview.png"));
        // fsExtra.moveSync(zipPath, path.join(projectDest, path.basename(zipPath)));
        // fs.unlinkSync(zipPath); //DO NOT CALL THIS, THIS IS ALREADY MOVED TO PROJECTS
        //yay
        console.log("complete");
        updateDirectoryHierarchy();
        return res.status(200).json({message: "project uploaded successfully!"});
    }
    catch(err){
        console.log(err.message);

        //remove temp dir
        if(fs.existsSync(tempUserDir)) {
            fsExtra.removeSync(tempUserDir);
        }
        //remove zip in temp if exists
        if(fs.existsSync(zipPath)){
            fs.unlinkSync(zipPath);
        }
        //remove project dir if possible error during move/extraction
        if(fs.existsSync(userProjectDir)) {
            fsExtra.removeSync(userProjectDir);
        }

        return res.status(400).json({message: "ERROR", error: err.message});
    }
});


router.post("/delete", async(req, res) => {
    //perms checking
    if(!req.session.user) {
        return res.status(401).redirect("/login?redirect=/projects&reason=notloggedin");
    }

    //server console logging user
    console.log(req.session.user + ": " + req.session.permissions);
    console.log("deleting");
    //server console logging project
    let {user, project} = req.body;
    console.log(user + ": " + project);


    //check deletion ok or nono
    if(!user || !project) {
        return res.status(400).json({message: "ERROR", error: "missing user or project"});
    }
    if(project === "no projects yet!"){
        return res.status(400).json({message: "ERROR", error: "no projects yet!"});
    }
    if(req.session.permissions !== "admin" && req.session.user !== user) {
        return res.status(401).json({message: "ERROR", error: "you do not have permission to delete this project"});
    }
    if(project.split(".").length > 2) {
        return res.status(400).json({message: "ERROR", error: "invalid deletion name"});
    }


    //checking if project name exists

    //projects
    const rootDir = path.join(__dirname, "../../projects");
    //projects/user
    const userDir = path.join(rootDir, req.session.user);
    //projects/user/project
    const userProjectDir = path.join(userDir, project);

    console.log(userProjectDir);
    const projectExists = findFileInDirectory(userDir, "", project, true).status;

    if(!projectExists) {
        return res.status(400).json({message: "ERROR", error: "project requested for deletion does not exist"});
    }

    deleteUserEmpty(userDir); 
    updateDirectoryHierarchy();
    return res.status(200).json({message: "project deleted successfully!"});
});

module.exports = router;