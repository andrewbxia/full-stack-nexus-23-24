const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const dbwrite = require("../serverscripts/legacyCalendar/createCalendarEventDB.js");
const dbread = require("../serverscripts/legacyCalendar/readCalendarEvents.js");
const BASE_URL = require("../BASE_URL.js");

let lastEventID;
dbread.get("SELECT LAST_VALUE(id) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lastEvent FROM events;", (err, id) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log("last legacy calendar event: " + id.lastEvent);
        lastEventID = id.lastEvent;
    }
});

router.get("/", (req, res) => {
    res.render("legacy-calendar", {BASE_URL: BASE_URL});
})

router.get("/event/:id", async (req, res) => {
    try {
        const row = await new Promise((resolve, reject) => {
            dbread.get("SELECT * FROM events WHERE id = ?", [req.params.id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        res.render("./legacyCalendar/calendarday" ,{ events: row , lastEventID: lastEventID, BASE_URL: BASE_URL});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





router.post("/handleResponse", (req, res) => {
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
        else{
            console.log("event created");
            lastEventID++;
            console.log("new last legacy calendar event id: " + lastEventID);
            res.status(201).json({message: "event created."});
        }
    });
});

router.post("/readResponse", (req, res) => {//TODO: make this from an export function soon

    console.log("read response received");
    console.log(req.ip);

    dbread.all("SELECT * FROM events", (err, rows) => {
        if(err){
            console.error(err.message);
            return res.status(500).json({error: err.message});
        }
        return res.status(200).json({ events: rows });
    });
});

module.exports = router;