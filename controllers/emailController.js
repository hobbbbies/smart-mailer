const nodemailer = require('nodemailer');

require('dotenv').config();

async function sendEmail(req, res) {
  try {
    const { senderName, sender, receiver, subject, body } = req.body
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: "OAuth2",
            user: "stefankvitanov@gmail.com",
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: req.refreshToken
        }
    });

    const mailOptions = {
        from: `${senderName} <${process.env.EMAIL_USER}>`,
        to: receiver,
        subject,
        text: body,
    };

    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId, });
  } catch(error) {
    res.status(500).json({ success: false, message: `Error sending email: ${error.message}` });
  }
}

module.exports = { sendEmail};
