var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var os = require('os');
var Firebase = require("firebase");
var myDataRef = new Firebase('https://flickering-torch-9611.firebaseio.com/');
var os = require('os');
const Raspistill = require('node-raspistill').Raspistill;
const camera = new Raspistill({
    verticalFlip: true,
    width: 680,
    height: 420,
    outputDir: './public',
    fileName: 'image',
    encoding: 'png'
});

var ON = 1
var OFF = 0
var lightState = OFF;

//Set server ip
myDataRef.child("server").set({
  server_ip: ip_address('wlan0')
});

function ip_address(interface) {
  var items = os.networkInterfaces()[interface] || [];

  return items
    .filter(function(item) {
      return item.family.toLowerCase() == 'ipv4';
    })
    .map(function(item) {
      return item.address;
    })
    .shift();
}

function UpdateLight(state)
{
   console.log("Update light:", state);
}

function StopCooking()
{
   console.log("Stop cooking")
}

function GetU16(data)
{
  return (data[0]<<8) | data[1];
}

io.on('connection', function(client) {

    setInterval(function(){
        io.emit('take_picture');
    }, 30000);
    client.on('take_picture', function(){
        console.log("io.on:Taking picture");
        UpdateLight(ON);

        camera.takePhoto().then(function(photo){
            io.emit('get_picture', photo);
            UpdateLight(OFF);
        });
    });

    client.on('take_timelapse', function(){
        const RaspistillInterruptError = require('node-raspistill').RaspistillInterruptError;
        const timelapse = new Raspistill({
            verticalFlip: true,
            width: 680,
            height: 420,
            outputDir: './public/timelapse/',
            encoding: 'png'
        });

        UpdateLight(ON);
        console.log("Taking timelapse photo");
        timelapse.timelapse('image%04d', 500, 10000, (image) => {
            console.log("Taking timelapse photo");
        }).then(() => {
            // timelapse ended
            console.log("Timelapse has ended");
            var GIFEncoder = require('gifencoder');
            var encoder = new GIFEncoder(680, 420);
            var pngFileStream = require('png-file-stream');
            var fs = require('fs');

            pngFileStream('public/timelapse/*.png')
              .pipe(encoder.createWriteStream({ repeat: -1, delay: 500, quality: 10 }))
              .pipe(fs.createWriteStream('myanimated.gif'));

            UpdateLight(OFF);
        }).catch((err) => {
            console.error(err);
            // something bad happened
            UpdateLight(OFF);
            console.log(err instanceof RaspistillInterruptError) // true, raspistill was interrupted;
        });
    });

    client.on('oven_light_toggle', function(){
        console.log("io.on:Oven Light Toggle");
        lightState = !lightState;
        UpdateLight(lightState);
    });

    client.on('oven_temp_off', function(){
        console.log("io.on:Oven Off");
        StopCooking();
    });

    client.on('get_oven_temperature', function(){
        console.log("io.on:Oven temperature");
    });

    client.on('get_oven_time_left', function(){
        console.log("io.on:Oven time left");
    });
});

// Serve Static Files
app.use( "/public/", express.static( __dirname + '/public/'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

server.listen(80, function() {
	console.log('listening on *:80');
});
