// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {

    // add room code text
    $('#room-code').text('room code: ' + window.localStorage.getItem("roomCode"));

    $('#syncPlay').click(function() {
        // Call the authorize endpoint, which will return an authorize URL, then redirect to that URL
        $.get('/test', function(data) {
            var title = $('<h3>calling backend /test: </h3>');
            title.prependTo('#data-container');
            var testData = $('<p></p>');
            testData.text(data);
            testData.appendTo('#data-container ol')
        });
    });

    $('#play').click(function() {
        var body = {"userUuid": window.localStorage.getItem("userUuid")}
        $.post('/play', body, function(data){}).error(function(){
        alert("playing failed")
        });
    });

    $('#pause').click(function() {
        var body = {"userUuid": window.localStorage.getItem("userUuid")}
        $.post('/pause', body, function(data){}).error(function(){
            alert("pausing failed")
        });
    });

    $('#leaveRoom').click(function() {
        var body = {"userUuid": window.localStorage.getItem("userUuid"), "roomCode" : window.localStorage.getItem("roomCode")}
        $.post('/leave-room', body, function(data) {
            window.location="/home";
        }).error(function(){
            alert("leave room error")
        });
    });

    $('#logout').click(function() {
        var body = {"userUuid": window.localStorage.getItem("userUuid"), "roomCode": window.localStorage.getItem("roomCode")}
        $.post({url: '/logout', data: body}, function(data) {
            window.location = '/';
        }).error(function(){
            alert("logout failed");
        });
    });
  
  });