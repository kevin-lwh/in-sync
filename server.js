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
  console.log(roomMap);
  console.log(userMap);
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

app.post('/sync-play', urlencodedParser, function (request, response) {
  var userUuid = request.body.userUuid;
  if (userMap.has(userUuid)) {
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(userMap.get(userUuid)['access_token']);
    loggedInSpotifyApi.getMyCurrentPlayingTrack()
      .then(function(data) {
        console.log(data);
        response.send(data.body.progress_ms.toString());
      }, function(err) {
        console.log('failed to sync play')
      });
  } else {
    response.sendStatus(400);
  }
});

app.post('/seek-to', urlencodedParser, function (request, response) {
  console.log("seek-to")
  var roomCode = request.body.roomCode;
  var postionMS = request.body.positionMS;
  var users = roomMap.get(roomCode)
  for (var userUuid of users) {
    var accessToken = userMap.get(userUuid)['access_token'];
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.seek(Number("10000"))
      .then(function(data) {
        console.log('seek success');
      }, function(err) {
        console.log('failed to seek')
      })
  }
})

app.post("/play", urlencodedParser, function(request, response) {
  var roomCode = request.body.roomCode;
  var users = roomMap.get(roomCode)
  for (var userUuid of users) {
    var accessToken = userMap.get(userUuid)['access_token'];
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.play()
      .then(function() {
        console.log("playing")
      }, function(err) {
        console.log("playing went wrong, userUuid = " + userUuid)
      });
  }
});

app.post("/pause", urlencodedParser, function(request, response) {
  var roomCode = request.body.roomCode;
  var users = roomMap.get(roomCode)
  for (var userUuid of users) {
    var accessToken = userMap.get(userUuid)['access_token'];
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.pause()
      .then(function() {
        console.log("pausing playback")
      }, function(err) {
        console.log("pausing went wrong, userUuid = " + userUuid)
      });
  }
});

app.post("/next-track", urlencodedParser, function(request, response) {
  var roomCode = request.body.roomCode;
  var users = roomMap.get(roomCode);
  for (var userUuid of users) {
    var accessToken = userMap.get(userUuid)['access_token'];
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.skipToNext()
    .then(function(data) {
      console.log('skip to next track');
    }, function(err) {
      console.log('failed to skip to next track, userUuid = ' + userUuid)
    });
  }
})

app.post("/previous-track", urlencodedParser, function(request, response) {
  var roomCode = request.body.roomCode;
  var users = roomMap.get(roomCode);
  for (var userUuid of users) {
    var accessToken = userMap.get(userUuid)['access_token'];
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.skipToPrevious()
    .then(function(data) {
      console.log('skip to previous track');
    }, function(err) {
      console.log('failed to skip to previous track, userUuid = ' + userUuid)
    });
  }
})

app.post("/get-room-users", urlencodedParser, async function(request, response) {
  var roomCode = request.body.roomCode;
  var resData = {
    users: []
};
  if (roomMap.has(roomCode)) {
    var users = roomMap.get(roomCode)
    var names = []
    for (var userUuid of users) {
      var name = await getUserName(userUuid)
      names.push(name)
    }
    resData.users = names;
    response.send(resData);
  } else {
    response.sendStatus(400);
  }
});

async function getUserName(userUuid) {
  return new Promise(function(resolve, reject) {
    // get access token for the user
    var accessToken = userMap.get(userUuid)['access_token'];
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.getMe()
      .then(function(data){
        resolve(data.body['display_name'])
      }, function(err) {
        console.log("get me went wrong")
      });
  })
}


//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(8888, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
