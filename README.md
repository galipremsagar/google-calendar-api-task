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

