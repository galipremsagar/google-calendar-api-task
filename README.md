#Setup
Download the repo, run the following commands from the project root folder in terminal:
```
npm install
bower install
npm start
```
I have used MongoDB, but followed identical schema which was insisted in the email.
Also, make sure in your local machine MongoDB is up and running on port 27017, and the db name i've given is "test".
So a potential MongoDB url my nodeapp will be looking for is 
```
mongodb://localhost:27017/test
```
I've Deployed this web app on my Private server. The url to it is
```
http://bc738e09.ngrok.io/
```

I've truncated my google api credentials in server/config.js, so to make this app run on your local machine place your google calendar api credentials.

Following are the important end-points:
```
/google/events
This is a GET request to the server. This will take the date as param. The Date is a plain string("DD-MM-YYYY")
Post authentication the server will:
-> Fetch list of events from google calendar API.
-> Store/Update them all in the DB.
-> Query all events from DB & apply Date filter to extract the necessary events to be displayed only
-> Trigger a call to the google server with the url & params provided in google's documentation guidelines for enabling push notifications on any kind of updates from the current user. I've set the channel id as the user unique id which google assigns :) 
```

```
/notify
This is of method type POST. The push notifications from the google servers come to this endpoint and the sequence of steps i'm performing after there is a POST request to this endpoint are:
-> Get the channel id to determine which user events list got updated.
-> Fetch & Update the list of events from google calendar API into the DB.
```

For the purpose of those push notifications being recieved at the client end, i've implemented polling mechanism,.i.e., the client will keep polling the server for any changes in the events list & retrieve the same. I've used polling though I know the implementation of sockets to avoid complexity in the code and save time so that I could work on other issues I faced in this task.

Note: I've implemented the events api for valid cases only, so invalid dates check is not put.

Disclaimer: My major focus was to satisfy the actual requirement more than optimizations, My code can still be optimized given that I have time. Since This was a timed task, submitting the part which I've done :)
