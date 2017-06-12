var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/core');

//var Client = require('node-rest-client').Client;
//var client = new Client();
//var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

var port = process.env.PORT || 5000;

var router = express.Router(); 
var cloverWebhookCtrl = require('./controller/cloverwebhook.js');


app.post('/webhook', function(request, response){
//console.log("request.body", request.body);
//console.log("response",response);
//response.send("success");
    cloverWebhookCtrl.cloverWebhookEvent(request,response);	
});

app.listen(port);

console.log('Server connected at ' , port);
