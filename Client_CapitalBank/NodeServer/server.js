const express  	= require('express');
const http   	= require('http');
const multer 	= require('multer'); // pour les formulaires multiparts
const bodyParser= require('body-parser');
const mysqlDB 	= require('./crud-mysql');
const util 		= require('util')

const app      	= express();
const server 	= http.Server(app);
const port     	= process.env.PORT || 8085;

var fs =require('fs');
var path=require('path');
//var config=JSON.parse(fs.readFileSync("config.json"));
var nodemailer = require('nodemailer');

let transporter =nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port :25,
    auth: {
        user:'ibeghouchene.nadir@gmail.com' ,
        pass: 'N1a4D2i3R'
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
server.listen(port); // Lance le serveur avec express

console.log("Serveur lancé sur le port : " + port);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});

app.post('/api/createUser', function(req, res) {
	console.log("/createUser: " + util.inspect(req.body, {showHidden: false, depth: null}));
	mysqlDB.createUser(req.body, function(data) {
		res.send(JSON.stringify(data)); 
	});
});

app.post('/api/login', function(req, res) {
	console.log("/login: " + JSON.stringify(req.body));
	mysqlDB.login(req.body, function(data) {
		res.send(JSON.stringify(data)); 
	});
});


app.post('/api/createCount', function(req, res) {
  console.log("/createCount: " + util.inspect(req.body, {showHidden: false, depth: null}));
  mysqlDB.createCount(req.body, function(data) {
    res.send(JSON.stringify(data)); 
  });
});



app.get('/compteList',function(req,res){
	console.log("/compteList: " + util.inspect(req.query, {showHidden: false, depth: null}));
  mysqlDB.compteList(req.query, function(data) {
    res.send(JSON.stringify(data)); 
  }); 
});