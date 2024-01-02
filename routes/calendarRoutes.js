const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const dbWriteEvent = require("../serverscripts/calendar/writeCalendarEvent.js");
const dbReadEvent = require("../serverscripts/calendar/readCalendarEvent.js");
const BASE_URL = require("../BASE_URL.js");

router.get("/", (req, res) => {//homepage
    res.render("calendar", {BASE_URL: BASE_URL, username: req.session.user, permissions: req.session.permissions});
});

router.get("/events", async (req, res) => {//returns json of events
    console.log("read events")
    const events = await new Promise((resolve, reject) => {
        dbReadEvent.all("SELECT * FROM events", (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
    res.status(200).json(events);

});


router.get("/event/:id", async (req, res) => {
    //copypasted from legacyCalendar bc its GOOD
    const id = req.params.id;
    let lastEventID;

    try {
        lastEventID = await new Promise((resolve, reject) => {
            dbReadEvent.get("SELECT LAST_VALUE(id) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lastEvent FROM events;", (err, id) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(id.lastEvent);
                }
            });
        });

        const row = await new Promise((resolve, reject) => {
            dbReadEvent.get("SELECT * FROM events WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        res.render("./calendar/calendarday" ,{ events: row , lastEventID: lastEventID, BASE_URL: process.env.BASE_URL});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




router.post("/submitEvent", async (req, res) => {
    if(req.session.permissions === "admin"){
        console.log(req.body);
        const user = req.session.user;
        let {title, location, description, date, starttime, endtime} = req.body;

        description = description || "None";
        endtime = endtime ? (starttime > endtime ? starttime : endtime) : starttime;

        dbWriteEvent.run("INSERT INTO events(user, title, location, description, date, starttime, endtime) VALUES(?, ?, ?, ?, ?, ?, ?)", [user, title, location, description, date, starttime, endtime], (err) => {
            if(err){
                console.log(err);
                res.status(500).json({ message: "ERROR", error: err.message });
            }
            else{
                console.log(title + " event creation success");
                res.status(200).json({ message: title + " event creation success" });
            }
        });
    }
    else{
        res.status(403).json({message: "ERROR", error: "nonononono"});
    }
});

router.post("/deleteEvent", async (req, res) => {
    if(req.session.permissions === "admin"){
        const id = req.body.id;
        dbWriteEvent.run("DELETE FROM events WHERE id = ?", [id], (err) => {
            if(err){
                console.log(err);
                res.status(500).json({ error: err.message });
            }
            else{
                console.log("deletion success");
                res.status(200).json({message: "deletion success"});
            }
        });
    }
    else{
        console.log("non-admin deletion attempt");
        res.status(403).json({message: "ERROR", error: "NNONONOONONONONOONONOONONNONNO"});
    }

});





module.exports = router;