// server.js
// where your node app starts

// init project
const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

 
//-------------------------------------------------------------//


// room map
var roomMap = new Map();

// user map
var userMap = new Map();

// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');
const { env } = require('process');
const e = require('express');

// Replace with your redirect URI, required scopes, and show_dialog preference
var redirectUri = `http://localhost:8888/callback`;
var scopes = ['user-top-read', 'user-read-playback-state', 'user-modify-playback-state'];
var showDialog = true;


// The API object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENT_ID, 
  clientSecret : process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri : redirectUri
});

// call backend /authorize to create an authorize url
app.get("/authorize", function (request, response) {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);
  response.send(authorizeURL);
});

// call backend /callback to exchange authorization code for an access token
app.get("/callback", function (request, response) {
  var authorizationCode = request.query.code;
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then(function(data) {
    var accessToken = data.body['access_token'];
    var refreshToken = data.body['refresh_token'];
    var userUuid = uuidv4();
    userMap.set(userUuid, {'access_token': accessToken, 'refresh_token': refreshToken});
    response.redirect('/#' + userUuid)
  }, function(err) {
    console.log('Something went wrong when retrieving the access token!', err.message);
  });
});

// get home page html
app.get("/home", function (request, response) {
  response.sendFile(__dirname + '/views/home.html');
});

// get room page html
app.get("/room", function (request, response) {
  response.sendFile(__dirname + '/views/room.html')
});

app.post("/logout", urlencodedParser, function (request, response) {
  var roomCode = request.body.roomCode;
  var userUuid = request.body.userUuid;
  // if user logs out in a room, remove from room first
  if (roomCode != "") {
    if (userMap.has(userUuid)) {
      //remove from room first
      var userUuids = roomMap.get(roomCode)
      for (var uuid of userUuids) {
        if (uuid == userUuid) {
          var index = userUuids.indexOf(uuid);
          userUuids.splice(index, 1);
        }
      }
      // if room is empty, remove the room
      if (userUuids.length == 0) {
        roomMap.delete(roomCode)
      } else {
        roomMap.set(roomCode, userUuids);
      }
    } else {
      response.sendStatus(400);
    }
  }
  // remove from user map
  if (userMap.has(userUuid)) {
    userMap.delete(userUuid)
    response.sendStatus(200)
  } else {
    response.sendStatus(400);
  }
});

app.post('/create-room', urlencodedParser, function (request, response) {
  var roomCode = Math.floor(100000 + Math.random() * 900000);
  roomMap.set(roomCode.toString(), [request.body.userUuid]);
  response.send(roomCode.toString());
});

app.post('/join-room', urlencodedParser, function (request, response) {
  var roomCode = request.body.roomCode;
  if (roomMap.has(roomCode)) {
    var userUuids = roomMap.get(roomCode);
    userUuids.push(request.body.userUuid);
    roomMap.set(roomCode, userUuids);
    response.send(roomCode);
  } else {
    response.sendStatus(400);
  }
});

app.post('/leave-room', urlencodedParser, function (request, response) {
  var roomCode = request.body.roomCode;
  var userUuid = request.body.userUuid;
  if (userMap.has(userUuid)) {
    var userUuids = roomMap.get(roomCode)
    for (var uuid of userUuids) {
      if (uuid == userUuid) {
        var index = userUuids.indexOf(uuid);
        userUuids.splice(index, 1);
      }
    }
    // if room is empty, remove the room
    if (userUuids.length == 0) {
      roomMap.delete(roomCode)
    } else {
      roomMap.set(roomCode, userUuids);
    }
    response.sendStatus(200);
  } else {  
    response.sendStatus(400);
  }
});

app.get('/test', function (request, response) {
  response.send("hello world");
});

app.post("/play", urlencodedParser, function(request, response) {
  var userUuid = request.body.userUuid;
  if (userMap.has(userUuid)) {
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(userMap.get(userUuid)['access_token']);
    loggedInSpotifyApi.play()
      .then(function() {
        console.log("playing")
      }, function(err) {
        console.log("playing went wrong")
      });
  } else {
    response.sendStatus(400);
  }
 
});

app.post("/pause", urlencodedParser, function(request, response) {
  var userUuid = request.body.userUuid;
  if (userMap.has(userUuid)) {
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(userMap.get(userUuid)['access_token']);
    loggedInSpotifyApi.pause()
      .then(function() {
        console.log("pausing")
      }, function(err) {
        console.log("pausing went wrong")
      });
  }
  
});



//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(8888, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
