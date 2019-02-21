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

function UpdateRelay(relay, state)
{
   options = {
       mode: 'text',
       pythonOptions: ['-u'], // get print results in real-time
       scriptPath: 'python',     
       args: [relay, (state ? 1:0)]
    };

  runPythonScript('relay.py', options)
}

function runPythonScript(name, options)
{
   let {PythonShell} = require('python-shell')

   PythonShell.run(name, options, function (err, results) {
       if (err) throw err;
       // results is an array consisting of messages collected during execution
       console.log('results: %j', results);
   });
}

function SendTweet()
{   
   console.log('Sending Tweet');
   options = {
     mode: 'text',
     pythonOptions: ['-u'], // get print results in real-time
     scriptPath: 'tweet',
    };

   runPythonScript('tweet.py', options);
}

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
   UpdateRelay(1, state);
}

function UpdateFan1(state)
{
   console.log("Update fan1: ", state);
   UpdateRelay(2, state);
}

function UpdateFan2(state)
{
   console.log("Update fan2: ", state);
   UpdateRelay(3, state);
}

function UpdateLight(state)
{
   console.log("Update light: ", state);
   UpdateRelay(4, state);
}

function StopAll()
{
   console.log("Stop all")
}

function GetU16(data)
{
  return (data[0]<<8) | data[1];
}

function PushHumidity()
{
   io.emit('humidity', { rh:getRandomInt(40,60), temp:getRandomInt(70,75) });  
}

function TakePhoto()
{
  console.log('Taking Photo');

  //UpdateLight(ON);
  currentLightState = lightState;

  camera.takePhoto().then(function(photo){
    io.emit('get_picture', photo);
    // UpdateLight(currentLightState);
  });
}

io.on('connection', function(client) {
     UpdateWaterPump(OFF);
     UpdateFan1(OFF);
     UpdateFan2(OFF)
     UpdateLight(OFF);

     interval = setInterval(function(){
       console.log("io.connection: Start periodic timer");
       PushHumidity();
       TakePhoto();
       SendTweet();
     }, 120000);

    client.on('take_picture', function(){
        console.log("io.on:Taking picture");
        TakePhoto();
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
        PushHumidity(); 
    });

    client.on('share', function(){
        console.log("io.on:Share");
        SendTweet();
    });
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Serve Static Files
app.use( "/public/", express.static( __dirname + '/public/'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

server.listen(80, function() {
	console.log('listening on *:80');
});
