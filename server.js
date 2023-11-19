const express = require("express");
const loginRouter = require("./routes/loginRoutes.js");
const registerRouter = require("./routes/registerRoutes.js");
const assetsRouter = require("./routes/assetsRoutes.js");
const calendarRouter = require("./routes/calendarRoutes.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");


const {approveUserDB} = require("./serverscripts/approveUser.js");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const startDate = new Date();
dotenv.config({ path: path.resolve(__dirname, "../files/.env")});
let sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    expires:false,
    cookie: { 
        secure: true,
        maxAge: 3600000,
    }
};

//configure secrets


//init express
const app = express();

//set ejs
app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use((req, res, next) => {res.header('Access-Control-Allow-Methods', 'GET, POST'); next();});
app.use(cookieParser());
app.use(session(sess));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.locals.BASE_URL = process.env.BASE_URL;
//send pages
app.get('/', (req, res) => {
    console.log("hi here");
    console.log(req.ip);
    console.log("session: " + req.session.cookie.username);
    res.render("home", {username: req.session.cookie.username, starttime: startDate, starttimems: startDate.getTime(), BASE_URL: process.env.BASE_URL});
    //console.log("successful");
});


app.get("/favicon.ico", (req, res) => {
    res.sendFile(`${__dirname}/favicon.ico`);
});

app.get("/robots.txt", (req, res) => {
    res.sendFile(`${__dirname}/robots.txt`);
});


app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/assets", assetsRouter);
app.use("/calendar", calendarRouter);

//send files
app.post("/approveUser", approveUserDB);

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});
app.listen(3000, () => {
    console.log("successful start at http://localhost:3000");
});