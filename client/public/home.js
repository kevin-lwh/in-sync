// client-side js
// run by the browser each time your view template is loaded


// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {

    $('#test').click(function() {
        // Call the authorize endpoint, which will return an authorize URL, then redirect to that URL
        $.get('/test', function(data) {
            var title = $('<h3>calling backend /test: </h3>');
            title.prependTo('#data-container');
            var testData = $('<p></p>');
            testData.text(data);
            testData.appendTo('#data-container ol')
        });
    });

    $('#create').click(function() {
        var body = {"userUuid": window.localStorage.getItem("userUuid")}
        $.post({url: '/create-room', data: body}, function(data) {
            window.localStorage.setItem("roomCode", data);
            window.location="/room?code=" + data;
        });
      
    });

    $('#join').submit(function(event) {
        event.preventDefault();
        var roomCode = $("input").first().val();
        var body = {"userUuid": window.localStorage.getItem("userUuid"), "roomCode": roomCode}
        $.post({url: '/join-room', data: body}, function(data) {
            window.localStorage.setItem("roomCode", data);
            window.location = "/room?code=" + data;
        }).error(function() {
            alert("room does not exist")
        });
    });
  
  });