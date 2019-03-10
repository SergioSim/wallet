const express  	= require('express');
const http   	= require('http');
const multer 	= require('multer'); // pour les formulaires multiparts
const bodyParser= require('body-parser');
const mysqlDB 	= require('./crud-mysql');

const app      	= express();
const server 	= http.Server(app);
const port     	= process.env.PORT || 8085;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
server.listen(port); // Lance le serveur avec express

console.log("Serveur lancé sur le port : " + port);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, application/x-www-form-urlencoded");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
});

app.post('/api/createUser', function(req, res) {
	console.log("/createUser: " + JSON.stringify(req.body));
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
