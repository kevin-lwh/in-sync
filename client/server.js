// server.js
// where your node app starts

// init project
const http = require('http');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
var express = require('express');
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

 
//-------------------------------------------------------------//


// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');
const { env } = require('process');

// Replace with your redirect URI, required scopes, and show_dialog preference
var redirectUri = `http://localhost:8888/callback`;
var scopes = ['user-top-read', 'user-read-playback-state', 'user-modify-playback-state'];
var showDialog = true;

var accessToken; 

// The API object we'll use to interact with the API
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_CLIENT_ID, 
  clientSecret : process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri : redirectUri
});

// call backend /authorize to create an authorize url
app.get("/authorize", function (request, response) {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);
  console.log(authorizeURL)
  response.send(authorizeURL);
});

// call backend /callback to exchange authorization code for an access token
app.get("/callback", function (request, response) {
  var authorizationCode = request.query.code;
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then(function(data) {
    accessToken = data.body['access_token']
    var userUuid = uuidv4();
    console.log(userUuid);
    response.redirect(`/#access_token=${data.body['access_token']}&refresh_token=${data.body['refresh_token']}`)
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
  const queryObject = url.parse(request.url, true).query;
  console.log(queryObject);
  response.sendFile(__dirname + '/views/room.html')
});

app.get("/logout", function (request, response) {
  response.redirect('/'); 
});

app.get('/create-room', function (request, response) {
  var roomCode = Math.floor(100000 + Math.random() * 900000);
  response.send(roomCode.toString());
});

app.get('/myendpoint', function (request, response) {

  var loggedInSpotifyApi = new SpotifyWebApi();
  //console.log(request.headers['authorization'].split(' ')[1]);
  //loggedInSpotifyApi.setAccessToken(request.headers['authorization'].split(' ')[1]);
  loggedInSpotifyApi.setAccessToken(accessToken);
  // Search for a track!
  loggedInSpotifyApi.getMyTopTracks()
    .then(function(data) {
      console.log(data.body);
      response.send(data.body);
    }, function(err) {
      console.error(err);
    });
  
});

app.get('/test', function (request, response) {
  response.send("hello world");
});

app.get("/play", function(request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);
  loggedInSpotifyApi.play()
    .then(function() {
      console.log("playing")
    }, function(err) {
      console.log("playing went wrong")
    });
});

app.get("/pause", function(request, response) {
  var loggedInSpotifyApi = new SpotifyWebApi();
  loggedInSpotifyApi.setAccessToken(accessToken);
  loggedInSpotifyApi.pause()
    .then(function() {
      console.log("pausing")
    }, function(err) {
      console.log("pausing went wrong")
    });
});



//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(8888, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
