// server.js
// where your node app starts

// init project
const http = require('http');
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

  var authorizeURL;
  const options = {
    hostname: process.env.BACKEND_HOST,
    port: 8080,
    path: '/authorize',
    method: 'GET'
  }
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      console.log(d.toString());
      authorizeURL = d.toString();
      response.send(authorizeURL);
    })
  })
  req.on('error', err => {
    console.error(err)
  })
  req.end()
 
});

// call backend /callback to exchange authorization code for an access token
app.get("/callback", function (request, response) {
  var authorizationCode = request.query.code;
  const options = {
    hostname: process.env.BACKEND_HOST,
    port: 8080,
    path: '/callback?code=' + authorizationCode,
    method: 'GET'
  }
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      var hash = d.toString();
      console.log(hash);
      response.redirect(hash);
    })
  })
  req.on('error', err => {
    console.error(err)
  })
  req.end()
  
});

app.get("/logout", function (request, response) {
  response.redirect('/'); 
});

app.get('/myendpoint', function (request, response) {

  const options = {
    hostname: process.env.BACKEND_HOST,
    port: 8080,
    path: '/myendpoint',
    method: 'GET'
  }
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      var json = d.toJSON();
      console.log(json);
      response.send(json);
    })
  })
  req.on('error', err => {
    console.error(err)
  })
  req.end()
  
});

app.get('/test', function (request, response) {
  const options = {
    hostname: process.env.BACKEND_HOST,
    port: 8080,
    path: '/test',
    method: 'GET'
  }
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      console.log(d.toString());
      response.send(d.toString())
    })
  })
  
  req.on('error', err => {
    console.error(err)
  })
  req.end()
});


//-------------------------------------------------------------//


// listen for requests :)
var listener = app.listen(8888, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
