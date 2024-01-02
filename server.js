const express = require("express");

//routers
const loginRouter = require("./routes/loginRoutes.js");
const registerRouter = require("./routes/registerRoutes.js");
const assetsRouter = require("./routes/assetsRoutes.js");
const calendarRouter = require("./routes/calendarRoutes.js");
const legacyCalendarRouter = require("./routes/legacyCalendarRoutes.js");
const projectsRouter = require("./routes/projectsRoutes.js");
const joinRouter = require("./routes/joinRoutes.js");
const profileRouter = require("./routes/profileRoutes.js");
const approveRouter = require("./routes/approveRoutes.js");
const membersRouter = require("./routes/membersRoutes.js");

//modules
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const startDate = new Date();
dotenv.config({ path: path.resolve(__dirname, "../files/.env")});
const BASE_URL = require("./BASE_URL.js");
let sess = {
    secret: process.env.SESSION_SECRET,
    resave: false,//resets every page load
    saveUninitialized: false,//saves empty sessions
    cookie: { 
        name: "session",
        maxAge: 3600000,
        httpOnly: true,
        sameSite: "Strict",
        expires: false,
        signed: true,
        secure: process.env.HTTP_S === "true" ? true : false,
    }
};


//init express
const app = express();

//set ejs
app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.use((req, res, next) => {res.header('Access-Control-Allow-Methods', 'GET, POST'); next();});
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sess));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//send pages
app.get('/', async (req, res) => {
    console.log("hi here");
    console.log(req.ip);
    console.log(req.session.user);
    res.render("home", {
        username: req.session.user, 
        starttime: startDate, 
        starttimems: startDate.getTime(), 
        BASE_URL: BASE_URL, 
        permissions: req.session.permissions
    });
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(`${__dirname}/favicon.ico`);
});

app.get("/robots.txt", (req, res) => {
    res.sendFile(`${__dirname}/robots.txt`);
});

app.get("/sitemap.xml", (req, res) => {
    res.sendFile(`${__dirname}/sitemap.xml`);
});


app.use("/login", loginRouter);
app.use("/register", registerRouter);
app.use("/assets", assetsRouter);
app.use("/calendar", calendarRouter);
app.use("/legacy-calendar", legacyCalendarRouter);
app.use("/projects", projectsRouter);
app.use("/join", joinRouter);
app.use("/profile", profileRouter);
app.use("/approve", approveRouter);
app.use("/members", membersRouter);


app.use((req, res) => {
    res.status(404).send("Sorry can't find that!");
    console.log("404 -> " + req.url);
});
app.listen(3000, () => {
    console.log("successful start at http://localhost:3000");
});