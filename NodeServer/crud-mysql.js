const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const con = mysql.createConnection({
	host: "82.255.166.104",
	user: "OpenchainUser",
	password: "OpenchainUserPassword13?"});

exports.createUser = function(data, calback) {	
	con.query("INSERT INTO OpenchainUser.Client  (Login, Password, Wallet, Address) VALUES (?,?,?,?)", [data.login, data.password, data.wallet, data.address], function(err, result){
		calback({ succes: !err});
	});
}

exports.login = function(data, calback) {
	con.query("SELECT * FROM OpenchainUser.Client WHERE Login=? AND Password LIKE BINARY ? ",[data.login, data.password], function(err, result){
		console.log(data.login + "= data.login  "  + result+ "= result.login    ")
		Response = {
			succes: !err && result.length != 0,
			data : !err && result.length == 0 ? "utiisateur non TROUVE" : result,
			access_token: !err ? jwt.sign({id:result.id}, 'secretkey') : ''}
		calback(Response);
	});
}

