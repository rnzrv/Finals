const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Email_user,
    pass: process.env.Email_pass,
  },
});

module.exports = transporter;
