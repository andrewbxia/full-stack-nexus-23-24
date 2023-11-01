const express = require("express");
const usersRouter = require("./routes/userRoutes.js");
const submitRouter = require("./routes/submitRoutes.js");
const assetsRouter = require("./routes/assetsRoutes.js");
const dbwrite = require("./serverscripts/createCalendarEventDB.js");
const dbread = require("./serverscripts/readCalendarEvents.js");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");





//init express
const app = express();

//set ejs
app.set("view engine", "ejs");
//app.use(express.static(path.join(__dirname, "styles")));//express quirk that messes up express files for some reason
//send pages

app.get('/', (req, res) => {
    console.log("hi here");
    console.log(req.ip);
    res.render("home");
    //console.log("successful");
});


app.get("/favicon.ico", (req, res) => {
    res.sendFile(`${__dirname}/favicon.ico`);
});


//const postRouter = require("./routes/userRoutes.js");

//for reference
app.use("/users", usersRouter);
app.use("/events", submitRouter);
app.use("/assets", assetsRouter);

app.get("/calendar.html", (req, res) => {
    res.send(path.resolve("./views/calendar.html"));
})


app.get("/:id", (req, res) => {
    const id = req.params.id.split('.')[0]; // Extracts the route before the question mark
    res.render(id);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));







//send files




app.post("/handleResponse", (req, res) => {
    var {user, title, description, date, starttime, endtime} = (req.body);

    if(starttime > endtime){
        endtime = starttime;
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
});

app.post("/login", (req, res) => {

});


app.listen(3000, () => {
    console.log("successful start at http://localhost:3000");
});

