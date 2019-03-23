const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const con = mysql.createConnection({
	host: "82.255.166.104",
	user: "OpenchainUser",
	password: "OpenchainUserPassword13?"});

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
exports.createUser = function(data, calback) {	
	con.query("INSERT INTO OpenchainUser.Client  (Login, Email, Password, Wallet, Address) VALUES (?,?,?,?,?)", [data.login, data.email, data.password, data.wallet, data.address], 
	function(err, result)
   { 
	   if(!err){
		let HeplerOptions = {
			from :'"NAODUDU  EDZEFZEF3"  ibeghouchene.nadir@gmail.com',
			to : data.email,
			subject :'Confirmation de vreation de compte',
			text: 'Bonjour, VOTRE COPTE A BIEN ETE CRRER',
		};
		transporter.sendMail(HeplerOptions,(error,info)=>{
		
		if(error){
		   return  console.log(error);
		}
		console.log("pihrf referf re erfergerg ");
		console.log(info);
		});
	   };
	   
		calback({ succes: !err});
	});
}

exports.demandeCartePortefeuille = function(data, calback) {	
	//data.monLogin
	//data.sonLogin
	////data.nom
	//data.prenom


	//if(!err){
		console.log("ouiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
	}
	//	calback({ succes: !err});
	
//}

exports.createCount = function(data, calback) {	
	con.query("INSERT INTO OpenchainUser.Contact  (ClientProprietaire, ClientContact, Nom, Prenom) VALUES (?,?,?,?)", [data.monLogin, data.sonLogin, data.nom, data.prenom], function(err, result){
		calback({ succes: !err});
	});
}

exports.login = function(data, calback) {
	con.query("SELECT * FROM OpenchainUser.Client WHERE Login=? AND Password LIKE BINARY ? ",[data.login, data.password], function(err, result){
		Response = {
			succes: !err && result.length != 0,
			data : !err && result.length == 0 ? "utiisateur non TROUVE" : result,
			access_token: !err ? jwt.sign({id:result.id}, 'secretkey') : ''}
		calback(Response);
	});
}

exports.deleteContact = function(data, calback) {
	con.query("DELETE FROM OpenchainUser.Contact WHERE ClientProprietaire=? AND ClientContact=? ",[data.login, data.contact], function(err, result){
		Response = {
			succes: !err && result.length != 0,
			data : !err && result.length == 0 ? "utiisateur non TROUVE" : result,
			access_token: !err ? jwt.sign({id:result.id}, 'secretkey') : ''}
		calback(Response);
	});
}

exports.compteList = function(data, calback) {
	con.query("SELECT * FROM OpenchainUser.Contact WHERE ClientProprietaire=?",[data.login], function(err, result){
		Response = {
			succes: !err && result.length != 0,
			data : !err && result.length == 0 ? "utiisateur non TROUVE" : result,
			access_token: !err ? jwt.sign({id:result.id}, 'secretkey') : ''}
		calback(Response);
	});
}


