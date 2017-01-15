'use strict';
var express = require('express');
var config  = require('../config');
var gcal    = require('google-calendar');
var fs = require('fs');
var refresh = require('passport-oauth2-refresh');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/test';
var main_db;
var watch_id;
var a_r;
MongoClient.connect(url, function(err, db) {
    console.log("trying to connect");
    assert.equal(null, err);
    console.log("Connected correctly to server.");
    //db.createCollection("maintable");
    console.log("after");
    main_db = db;
});
var router = express.Router();
var new_accessToken;
var email;
router.use(function(req, res, next) {
    if(!req.session.accessToken) {
        console.log(req.session);
        res.send(401, 'Not logged in.');
    } else {
        next();
    }
});

var selectFromMainTable = function (db, ID, callback) {
    var collection = db.collection('maintable');
    var temp = {};

    collection.find({email:ID},{'_id':0}).toArray(function(err, results){
        console.log("select query",results); // output all records
        temp = results;
        callback(results[0]);
    });
};

var selectEventsFromDB = function (db, ID, callback) {
    var collection = db.collection('events');


    collection.find({googleId:ID},{'_id':0}).toArray(function(err, results){
        console.log("select query",results); // output all records

        callback(results);
    });
};

var insertEvent = function (db, ID,event_obj, callback) {
    var collection = db.collection('events');

    collection.update({id:event_obj['id'],googleId:ID},{
        googleId:ID,id:event_obj['id'],status:event_obj['status'],htmlLink:event_obj['htmlLink'],created:event_obj['created'],
        updated:event_obj['updated'],summary:event_obj['summary'],description:event_obj['description'],location:event_obj['location'],
        colorId:event_obj['colorId'],creatorEmailId:event_obj.creator['email'],creatorDisplayName:event_obj.creator['displayName'],
        organizerEmailId:event_obj.organizer['email'],organizerDisplayName:event_obj.organizer['displayName'],startDateTime:event_obj.start,
        endDateTime:event_obj.end,recurrence:event_obj['recurrence'],recurrenceEventId:event_obj['recurringEventId'],createdAt:event_obj['created'],updatedAt:event_obj['updated']
    },{upsert:true});

    callback();
};

router.get('/events', function(req, res, next) {

    console.log("this is the req",req.query.date);
    var date_loc = String(req.query.date);
    date_loc = date_loc.split("-");
    console.log("came to events",date_loc);

    console.log(req.session.accessToken);
    var calendar = new gcal.GoogleCalendar(req.session.accessToken);
    console.log("Calendar ID is",req.session.calendarId);
    // 'timeMin': new Date(1995, 11, date_loc[0]).toISOString()
    calendar.events.list(req.session.calendarId, {}, function(err, eventList) {
        console.log("listing....");
        if(err) return err;
        console.log(eventList);
        for (var index in eventList.items){
            console.log("index",index);
            console.log(eventList.items[index]);
            insertEvent(main_db,eventList.summary,eventList.items[index],function (x) {
                console.log("inserted========",eventList.summary);
            });
        }
        a_r = eventList;
        console.log("a_r is set");

        //res.status(200).send(JSON.stringify(eventList, null, '\t'));
        console.log("POST: a_r is set",a_r);

        selectEventsFromDB(main_db, req.session.calendarId, function(x) {
            console.log("select FROM DB EVENTS");
            console.log(x);
            // db.close();
            x = JSON.parse(JSON.stringify(x));
            console.log(x);
            var sending_arr = [];

            var date_to_compare = new Date(parseInt(date_loc[2]),parseInt(date_loc[1])-1,parseInt(date_loc[0]));
            date_to_compare.setHours(5,30);
            console.log("date to compare",date_to_compare);
            for(var index in x)
            {
                console.log("INFOROUT");
                console.log(x[index].summary);
                console.log(curr_startdt,curr_enddt);
                var curr_startdt = new Date(x[index].startDateTime.date||x[index].startDateTime.dateTime);
                var curr_enddt = new Date(x[index].endDateTime.date||x[index].endDateTime.dateTime);
                if(((date_to_compare.getDay()==curr_startdt.getDay()) &&
                    (date_to_compare.getMonth()==curr_startdt.getMonth()) &&
                    (date_to_compare.getYear()==curr_startdt.getYear()) &&
                    (date_to_compare.getDate()==curr_startdt.getDate())) || (date_to_compare >= curr_startdt && date_to_compare <= curr_enddt))
                {
                    console.log("INFOR");
                    console.log(x[index].summary);
                    console.log(curr_startdt,curr_enddt);

                    sending_arr.push(x[index]);
                }
            }
            res.status(200).send(JSON.stringify(sending_arr, null, '\t'));

        });

    });

    selectFromMainTable(main_db, req.session.calendarId, function(x) {
        console.log("select");
        console.log(x);
        // db.close();
        x = JSON.parse(JSON.stringify(x));
        console.log(x);
        watch_id = x.id;
    });

    calendar.events.watch('primary',
        {
            id: watch_id,
            type: 'web_hook',
            address: "https://bc738e09.ngrok.io/notify",
            token: req.session.accessToken
        }, function(err, response) {
            if (err) {
                console.log(err);
            } else {
                console.log(response);
            }
        });
});

module.exports = router;