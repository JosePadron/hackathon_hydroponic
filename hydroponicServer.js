var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var os = require('os');
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
var currentLightState = OFF;
var waterState = OFF;
var fan1State = OFF;
var fan2State = OFF;

function UpdateWaterPump(state)
{
   console.log("Update water: ", state);
}

function UpdateFan1(state)
{
   console.log("Update fan1: ", state);
}

function UpdateFan2(state)
{
   console.log("Update fan2: ", state);
}

function UpdateLight(state)
{
   console.log("Update light: ", state);
}

function StopAll()
{
   console.log("Stop all")
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
        currentLightState = lightState;

        camera.takePhoto().then(function(photo){
            io.emit('get_picture', photo);
            UpdateLight(currentLightState);
        });
    });

    client.on('light_toggle', function(){
        console.log("io.on:Light Toggle");
        lightState = !lightState;
        UpdateLight(lightState);
    });

    client.on('water_toggle', function(){
        console.log("io.on:Water Toggle");
        waterState = !waterState;
        UpdateWaterPump(waterState);
    });

    client.on('fan1_toggle', function(){
        console.log("io.on:Fan1 Toggle");
        fan1State = !fan1State;
        UpdateFan1(fan1State);
    });

    client.on('fan2_toggle', function(){
        console.log("io.on:Fan2 Toggle");
        fan2State = !fan2State;
        UpdateFan2(fan2State);
    });

    client.on('all_off', function(){
        console.log("io.on:All Off");
        StopAll();
    });

    client.on('get_humidity', function(){
        console.log("io.on:Get humidity");
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
