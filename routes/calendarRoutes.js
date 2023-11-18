const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const dbwrite = require("../serverscripts/createCalendarEventDB.js");
const dbread = require("../serverscripts/readCalendarEvents.js");

router.get("/event/:id", async (req, res) => {
    const id = req.params.id;
    let lastEventID;

    try {
        lastEventID = await new Promise((resolve, reject) => {
            dbread.get("SELECT LAST_VALUE(id) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lastEvent FROM events;", (err, id) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(id.lastEvent);
                }
            });
        });

        const row = await new Promise((resolve, reject) => {
            dbread.get("SELECT * FROM events WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
        res.render("./partials/calendarday" ,{ events: row , lastEventID: lastEventID, baseURL: process.env.BASE_URL});
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
        
        res.status(201).json({message: "event created."});
    });
});

router.post("/readResponse", (req, res) => {//TODO: make this from an export function soon

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

module.exports = router;