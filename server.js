const express = require("express");
const usersRouter = require("./routes/userRoutes.js");
const submitRouter = require("./routes/submitRoutes.js");
const dbwrite = require("./serverscripts/createCalendarEventDB.js");
const dbread = require("./serverscripts/readCalendarEvents.js");
const bodyParser = require("body-parser");
const User = require("./serverscripts/userClass.js")
//init express


const userMap = new Map();
const app = express();

//set ejs
app.set("view engine", "ejs");

app.get('/', (request, response) => {
    console.log("hi here");
    console.log(request.ip);
    userMap.set(response.ip, new User(request.ip, Date.now()));
    //response.json({message: "error"});
    //render home.ejs when it loads
    response.render("home", {tdext: "yayyay"});
    //console.log("successful");
});


//const postRouter = require("./routes/userRoutes.js");

app.use("/users", usersRouter);
app.use("/events", submitRouter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/scripts/:id" + ".js", (req, res) => {
    res.type("text/javascript");
    res.sendFile(`${__dirname}/scripts/${req.params.id}.js`);
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(`${__dirname}/favicon.ico`);
});

app.post("/handleResponse", (req, res) => {

    
    var {user, title, description, date, starttime, endtime} = (req.body);

    if(starttime > endtime){
        endtime = starttime;
    }

    if(userMap.get(req.ip)){
        userMap.get(req.ip).addToActions({description: "submitting" ,user, title, description, date, starttime, endtime})
    }
    console.log("data recieved:");
    console.log("ip" + req.ip);
    console.log(user);
    console.log(title);
    console.log(description);
    console.log(date);
    console.log(starttime);
    console.log(endtime);

    dbwrite.run("INSERT INTO events (user, title, description, date, starttime, endtime) VALUES (?, ?, ?, ?, ?, ?)", [user, title, description, date, starttime, endtime], (err) => {
        if (err){
            return res.status(500).json({error: "Failed to create the event. Try again!"});
        }
        
        res.status(201).json({message: "event created."});
    });
});

app.post("/readResponse", (req, res) => {

    if(userMap.get(req.ip)){
        userMap.get(req.ip).addToActions({description: "requesting", time: Date.now()})
    }

    console.log("read response received");
    console.log(req.ip);
    const rows = [];

    dbread.each("SELECT * FROM events", (err, row) => {
        if (err) {
            res.status(500).json({ error: "failed to read database." });
        } else {
            rows.push(row);
        }
    }, () => {
        //after all rows have been processed
        res.status(200).json({ events: rows });
    });
});

app.post("/logUser", (req, res) => {

    const date = new Date(Date.now()).toISOString();
    console.log("user " + req.ip + "has disconnected at " + date);
    if(userMap.get(req.ip)){
        userMap.setUnload(date);
    }
});


app.listen(3000, () => {
    console.log("successful start at http://localhost:3000");
});