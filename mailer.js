const nodemailer = require('nodemailer');
const credential = require('./credentials/credentials.json');

exports.sendMail = sendMail;

function sendMail(descrition, subject) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: credential.GMAIL.user,
      pass: credential.GMAIL.pass,
    },
  });

  const mailOptions = {
    from: credential.GMAIL.user,
    to: credential.GMAIL.userTo,
    subject,
    text: descrition,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
}
