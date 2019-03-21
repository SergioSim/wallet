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

let HeplerOptions = {
    from :'"NAODUDU  EDZEFZEF3"  ibeghouchene.nadir@gmail.com',
    to : 'azertyalex4321@gmail.com',
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