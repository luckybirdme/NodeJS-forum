var nodemailer = require('nodemailer');
var config = require("../config");

var transporter = nodemailer.createTransport({
		host: config.email.host,
	    port: config.email.port,
	    auth: {
	      user: config.email.user,
	      pass: config.email.pass
	    }
});

exports.sendMail = sendMail;

function sendMail(from,email,subject,html){

	var mailOptions = {
		from:from,
	    to: email,
	    subject: subject,
	    html: html
	};
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log("sendMail error: "+error);
	    }
	    console.log('sendMail success: ' + info.response);

	});
}

