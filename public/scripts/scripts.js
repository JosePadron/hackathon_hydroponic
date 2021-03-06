// Facebook Initialization
(function (d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}js = d.createElement(s);js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js";fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));
window.fbAsyncInit = function () {
  FB.init({
    appId: '160231797891385',
    xfbml: true,
    version: 'v2.10'
  });
  FB.AppEvents.logPageView();
};

var conversions = {
  stringToBinaryArray: function (string) {
    return Array.prototype.map.call(string, function (c) {
      return c.charCodeAt(0) & 0xff;
    });
  },
  base64ToString: function (b64String) {
    return atob(b64String);
  }
};
var DEFAULT_CALL_OPTS = {
  url: 'https://graph.facebook.com/me/photos',
  type: 'POST',
  cache: false,
  success: function (response) {
    console.log(response);
  },
  error: function () {
    console.error(arguments);
  },
  // we compose the data manually, thus
  processData: false,
  /**
   *  Override the default send method to send the data in binary form
   */
  xhr: function () {
    var xhr = $.ajaxSettings.xhr();
    xhr.send = function (string) {
      var bytes = conversions.stringToBinaryArray(string);
      XMLHttpRequest.prototype.send.call(this, new Uint8Array(bytes).buffer);
    };
    return xhr;
  }
};
/**
 * It composes the multipart POST data, according to HTTP standards
 */
var composeMultipartData = function (fields, boundary) {
  var data = '';
  $.each(fields, function (key, value) {
    data += '--' + boundary + '\r\n';

    if (value.dataString) { // file upload
      data += 'Content-Disposition: form-data; name=\'' + key + '\'; ' +
        'filename=\'' + value.name + '\'\r\n';
      data += 'Content-Type: ' + value.type + '\r\n\r\n';
      data += value.dataString + '\r\n';
    } else {
      data += 'Content-Disposition: form-data; name=\'' + key + '\';' +
        '\r\n\r\n';
      data += value + '\r\n';
    }
  });
  data += '--' + boundary + '--';
  return data;
};

var setupData = function (callObj, opts) {
  var boundary = 'Awesome field separator ' + Math.random();
  callObj.data = composeMultipartData(opts.fb, boundary);
  callObj.contentType = 'multipart/form-data; boundary=' + boundary;
};

var postImage = function (opts) {
  var callObj = $.extend({}, DEFAULT_CALL_OPTS, opts.call);
  callObj.url += '?access_token=' + opts.fb.accessToken;
  setupData(callObj, opts);
  $.ajax(callObj);
};

function fileUpload(access_token) {
  var image = document.getElementById('view');
  var image_data = image.toDataURL("image/png");
  var encoded = conversions.base64ToString(image_data.replace(/^data:image\/(png|jpe?g);base64,/, ''));
  postImage({
    fb: {
      caption: 'Look what I\'m cookin\'! #firstbuild #hackthehome',
      /* place any other API params you wish to send. Ex: place / tags etc.*/
      accessToken: access_token,
      file: {
        name: 'upload.png',
        type: 'image/png', // or png
        dataString: encoded // the string containing the binary data
      }
    },
    call: { // options of the $.ajax call
      url: 'https://graph.facebook.com/me/photos', // or replace *me* with albumid
      success: function (s) {
        console.log("Success", s);
        app.successMessage();
      },
      error: function (e) {
        console.log("Error", e);
      }
    }
  });

}

  // console.log("connecting to: " + data.val().server_ip);
  var socket = io.connect('http://' + location.hostname  + ':80');
  //var socket = io.connect('http://10.203.18.34:80');

// Constructor
var App = function () {
    console.log("App Loaded");
  }

  App.prototype.submit_photo = function () {
    FB.login(function (response) {
      console.log(response);
      fileUpload(response.authResponse.accessToken);
    }, {
      scope: 'publish_actions'
    });
  }

  App.prototype.successMessage = function(){
    var modal_switch = document.getElementById('modal_1');
    modal_switch.checked = true;
  }

  App.prototype.notify = function(message){
    if(!("Notification" in window)){
      console.log("No Notifications are available");
    } else if( Notification.permission === 'granted'){
      var notification = new Notification(message);
    } else if(Notification.permission !== 'denied'){
      Notification.requestPermission(function(permission){
        if(permission === "granted"){
          var notification = new Notification(message);
        }
      });
    }
  };

  App.prototype.updateImage = function(){
    jQuery("#oven-image-container canvas, #oven-image-container h2").remove();
        var image = new Image(680, 420);
            image.src = '/public/image.png';
        var logo = new Image(75, 45);
            logo.src = '/public/images/logo.png';
        var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
        var ctx = canvas.getContext('2d');
            image.onload = function(){
                ctx.drawImage(image, 0, 0, image.width, image.height);
                ctx.drawImage(logo, 519, 326, logo.width, logo.height);
                ctx.fillStyle = "blue";
                ctx.font="30px sans-serif";
                ctx.fillText("#TeamHydroPi: RH " + app.rh + "% " + app.temp + " F", 20, 360);
            }

          setTimeout(function(){
            var canvas3 = document.createElement('canvas');
            var ctx3 = canvas3.getContext('2d');
              canvas3.width = 680;
              canvas3.height = 420;
              canvas3.id = "view";
              ctx3.drawImage(canvas, 0, 0);
              jQuery("#oven-image-container").append(canvas3);
          }, 400);
    }


  // START EVERYTHING UP!
  var app = new App();
      app.rh = 50;
      app.temp = 70;

  jQuery(document).on('ready', function () {
    socket.emit('get_humidity');
    socket.emit('take_picture');
    socket.emit('share');
    socket.emit('start_timer');

    jQuery("#btn-share").on('click', function () {
      console.log("Share");
      //app.submit_photo();
      socket.emit('share');
    });

    jQuery("#btn-capture").on('click', function(){
      console.log("Take Picture");
      socket.emit('get_humidity');
      socket.emit('take_picture');
    });

    jQuery("#btn-light-toggle").on('click', function(){
      console.log("Light Toggle");
      socket.emit('light_toggle');
    });

    jQuery("#btn-water-toggle").on('click', function(){
      console.log("Water Toggle");
      socket.emit('water_toggle');
    });

    jQuery("#btn-fan1-toggle").on('click', function(){
      console.log("Fan1 Toggle");
      socket.emit('fan1_toggle');
    });

    jQuery("#btn-fan2-toggle").on('click', function(){
      console.log("Fan2 Toggle");
      socket.emit('fan2_toggle');
    });

    jQuery("#btn-all-off").on('click', function(){
      console.log("All Off");
      socket.emit('all_off');
    });

    jQuery("#btn-humidity").on('click', function(){
      console.log("Get humidity");
      socket.emit('get_humidity');
    });

  });

  socket.on('get_picture', function(){
    console.log("Getting new photo");
    app.updateImage();
  });

  socket.on('humidity', function(data){
    console.log('Humidity: ' + data.rh + " " + data.temp);
    app.rh = data.rh;
    app.temp = data.temp;
  });

  socket.on('notify', function(message){
    if(message == 1){
      app.notify("Cycle Started!");
    } else {
      app.notify("Cycle has Stopped");
    }
  });

