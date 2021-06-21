const nodemailer = require('nodemailer');
const debug = require('debug')('dhis2-automatic-importations:mailer');

exports.sendMail = sendMail;

function sendMail(description, subject) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER_TO,
    subject,
    text: description,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      debug(error);
    } else {
      debug(`Email sent: ${info.response}`);
    }
  });
}
