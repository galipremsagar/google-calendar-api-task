'use strict';
var express        = require('express');
var passport       = require('passport');
var config         = require('../config');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var refresh = require('passport-oauth2-refresh');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/test';
var main_db;
var gcal    = require('google-calendar');


MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to MongoDB.");
    // db.createCollection("maintable");
    main_db = db;
});

var _accessToken;
var _refreshToken;


var googleStrategy = new GoogleStrategy({
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        prompt: 'consent',access_type: 'offline',approvalPrompt: 'force'
    },
    function(accessToken, refreshToken, profile, done) {
        console.log('Google Profile:', profile);
        console.log('accessToken:',accessToken);
        console.log('refreshToken:',refreshToken);
        _accessToken = accessToken;
        _refreshToken = refreshToken;
        var collection = main_db.collection('maintable');
        collection.remove({email:profile._json.email});
        collection.insertOne({email:profile._json.email,id:profile.id,accessToken:accessToken});
        done(null, profile);
    }
);
passport.use(googleStrategy);
refresh.use(googleStrategy);

router.get('/google', passport.authenticate('google', {
    session: false,
    accessType: 'offline',
    approvalPrompt: 'force'
}));

router.get('/oauth2callback', function(req, res, next) {
    console.log("came here");

    passport.authenticate('google', function(err, profile) {
        if(err) return next(err);
        req.session.accessToken = _accessToken;
        req.session.calendarId = profile._json.email;
        res.cookie('profile', profile);
        res.redirect('/');
    })(req, res, next);
});

var selectFromMainTable = function (db, ID, callback) {
    var collection = db.collection('maintable');
    var temp = {};
    console.log("eid",ID);
    collection.find({id:ID},{'_id':0}).toArray(function(err, results){
        console.log("select query",results); // output all records

            temp = results;

            callback(results[0]);
        return;
    });
};

var EvantsInsert = function (db, ID,event_obj, callback) {
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
router.post('/notify',function (req, res, next) {
    console.log(req.headers);

    selectFromMainTable(main_db, req.headers['x-goog-channel-id'], function(x) {
        console.log("select");
        console.log(x);
        // db.close();
        if (x!=[] && x!=undefined){
            x = JSON.parse(JSON.stringify(x));
        }
        else {
            return;
        }
        console.log(x);
        var calendar = new gcal.GoogleCalendar(x.accessToken);
        console.log("Calendar ID is",x.email);

        setTimeout(function(){
            console.log("Calendar inside timeout ID is",x.email);
            console.log("cleared....");
        },1000);
        calendar.events.list(x.email, {}, function(err, eventList) {
            console.log("listing....");
            if(err) return err;
            console.log(eventList);
            for (var index in eventList.items){
                console.log("index",index);
                console.log(eventList.items[index]);
                EvantsInsert(main_db,eventList.summary,eventList.items[index],function (x) {
                    console.log("inserted========",eventList.summary);
                });
            }
        });
        console.log("out");
    });
    console.log("finally");
});

module.exports = router;