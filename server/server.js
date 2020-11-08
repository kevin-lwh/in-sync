// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

//-------------------------------------------------------------//


// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');

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

app.get("/authorize", function (request, response) {
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, null, showDialog);
  console.log(authorizeURL)
  response.send(authorizeURL);
});

// Exchange Authorization Code for an Access Token
app.get("/callback", function (request, response) {
  var authorizationCode = request.query.code;
  spotifyApi.authorizationCodeGrant(authorizationCode)
  .then(function(data) {
    accessToken = data.body['access_token']
    response.send(`/#access_token=${data.body['access_token']}&refresh_token=${data.body['refresh_token']}`)
  }, function(err) {
    console.log('Something went wrong when retrieving the access token!', err.message);
  });
});

app.get("/logout", function (request, response) {
  response.redirect('/'); 
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


app.get('/test', function (req, res) {
    res.send("hello world.");
});


//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(8080, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
