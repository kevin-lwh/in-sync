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
    
    const userUuid = window.location.hash.substring(1);
    window.localStorage.setItem("userUuid", userUuid);
    window.location.hash = '';
    
    if (userUuid != "") {
      window.location = '/home';
    }
  
  });
  