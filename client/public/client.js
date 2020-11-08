// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  
    $('#login').click(function() {
      // Call the authorize endpoint, which will return an authorize URL, then redirect to that URL
      $.get('/authorize', function(data) {
        console.log(data)
        window.location = data;
      });
    });
    
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce(function (initial, item) {
        if (item) {
          var parts = item.split('=');
          initial[parts[0]] = decodeURIComponent(parts[1]);
        }
        return initial;
      }, {});

    window.location.hash = '';
    
    if (hash.access_token) {
      $.get({url: '/test', headers: {"Authorization": `Bearer ${hash.access_token}`}}, function(data) {
        // "Data" is the array of track objects we get from the API. See server.js for the function that returns it.
        console.log(data)
  
        var title = $('<h3>calling backend /test: </h3>');
        title.prependTo('#data-container');
        var testData = $('<p></p>');
        testData.text(data);
        testData.appendTo('#data-container ol')
  
  
      });
    }
  
  });
  