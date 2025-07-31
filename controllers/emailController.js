const nodemailer = require('nodemailer');

require('dotenv').config();

async function sendEmail(req, res) {
  try {
    const { sender, receiver, subject } = req.body
    const body = req.generatedEmail;
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `${sender} <${process.env.EMAIL_USER}>`,
        to: receiver,
        subject,
        text: body
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId });
  } catch(error) {
    res.status(500).json({ success: false, message: `Error sending email: ${error.message}` });
  }
}

module.exports = { sendEmail};
