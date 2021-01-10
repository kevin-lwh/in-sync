// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {

    // add room code text
    $('#room-code').text('room code: ' + window.localStorage.getItem("roomCode"));

    // add users in room
    $.post({url: '/get-room-users', data: {"roomCode": window.localStorage.getItem("roomCode")}}, function(data) {
        var userNames = data['users'];
        for (var name of userNames) {
            var nameField = $('<li class="list-group-item"></li>');
            nameField.text(name);
            nameField.appendTo('#roomUsers ul')
        }
    }).error(function(){
        alert("get users list failed");
    });

    /*
    $('#syncPlay').click(function() {
        // Call the authorize endpoint, which will return an authorize URL, then redirect to that URL
        var body = {"userUuid": window.localStorage.getItem("userUuid"), "roomCode": window.localStorage.getItem("roomCode")}
        $.post('/sync-play', body, function(data){
            console.log(data);
            body = {"roomCode": window.localStorage.getItem("roomCode"), "positionMS": data}
            $.post('/seek-to', body, function(data) {}).error(function() {
                alert("seek failed")
            })
        }).error(function(){
            alert("playing failed")
        });
    });
    */

    $('#play').click(function() {
        var body = {"roomCode" : window.localStorage.getItem("roomCode")}
        $.post('/play', body, function(data){}).error(function(){
            alert("playing failed")
        });
    });

    $('#pause').click(function() {
        var body = {"roomCode" : window.localStorage.getItem("roomCode")}
        $.post('/pause', body, function(data){}).error(function(){
            alert("pausing failed")
        });
    });

    $('#previousTrack').click(function() {
        var body = {"roomCode" : window.localStorage.getItem("roomCode")}
        $.post('/previous-track', body, function(data){}).error(function(){
            alert("skip to previous track failed")
        });
    })

    $('#nextTrack').click(function() {
        var body = {"roomCode" : window.localStorage.getItem("roomCode")}
        $.post('/next-track', body, function(data){}).error(function(){
            alert("skip to next track failed")
        });
    })

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

    $('#refreshRoom').click(function() {
        $('#userList').empty();
        $.post({url: '/get-room-users', data: {"roomCode": window.localStorage.getItem("roomCode")}}, function(data) {
            var userNames = data['users'];
            for (var name of userNames) {
                var nameField = $('<li class="list-group-item"></li>');
                nameField.text(name);
                nameField.appendTo('#roomUsers ul')
            }
        }).error(function(){
            alert("get users list failed");
        });
    });
  
  });