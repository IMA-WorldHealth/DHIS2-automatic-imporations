const nodemailer = require('nodemailer');
const credential = require('./credentials.json');


exports.sendMail = sendMail;

function sendMail(subject, descrition) {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: credential.GMAIL.user,
      pass: credential.GMAIL.pass
    }
  });

  var mailOptions = {
    from:  credential.GMAIL.user,
    to: credential.GMAIL.userTo,
    subject,
    text: descrition
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}
